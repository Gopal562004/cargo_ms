import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import { hydrateUser } from '../utils/sqlite-helpers.js';

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password.
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare plain-text password with a hash.
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate an access token (short-lived).
 */
export function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
}

/**
 * Generate a refresh token (long-lived 30 days).
 */
export function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
}

/**
 * Verify an access token.
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
}

/**
 * Verify a refresh token.
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
}

/**
 * Register a new user.
 */
export async function registerUser({ email, password, name, company }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, passwordHash, name, company },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      company: true,
      role: true,
      isActive: true,
      allowedServices: true,
      licenseKey: true,
      subscriptionPlan: true,
      subscriptionExpiresAt: true,
      createdAt: true,
    },
  });

  return hydrateUser(user);
}

/**
 * Resolve the Cloud Website API URL for desktop client synchronization
 */
export async function getCloudApiUrl() {
  if (process.env.CLOUD_API_URL) return process.env.CLOUD_API_URL;
  try {
    const config = await prisma.appConfig.findUnique({ where: { key: 'CLOUD_API_URL' } });
    if (config?.value) return config.value;
  } catch {}
  return 'http://localhost:5000/api';
}

/**
 * Login / Activate a user — accepts username, email, or License Key.
 * In desktop mode (ELECTRON_EMBEDDED=true), verifies against the Website Cloud API first!
 */
export async function loginUser({ email, username, identifier, password, licenseKey }) {
  const rawId = (licenseKey || username || email || identifier || '').trim();
  if (!rawId) {
    throw new AppError('Please provide your Username, Email, or License Key', 400);
  }

  const isLicenseKeyInput = rawId.toUpperCase().startsWith('CRGO-');

  // ─── DESKTOP MODE: Authenticate & Sync with Cloud Website API ──────────────
  if (process.env.ELECTRON_EMBEDDED === 'true') {
    const cloudApiUrl = await getCloudApiUrl();
    const cleanCloudUrl = cloudApiUrl.replace(/\/+$/, '');
    let cloudResult = null;

    try {
      const response = await fetch(`${cleanCloudUrl}/auth/desktop-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: rawId,
          password,
          licenseKey: isLicenseKeyInput ? rawId.toUpperCase() : undefined,
          machineName: process.env.COMPUTERNAME || process.env.HOSTNAME || 'Desktop-Client',
        }),
        signal: AbortSignal.timeout(6000),
      });

      const json = await response.json();
      cloudResult = { ok: response.ok, status: response.status, data: json };
    } catch (netErr) {
      console.log('[Desktop Auth] Cloud website server unreachable, attempting offline local validation:', netErr.message);
      cloudResult = null; // offline fallback
    }

    if (cloudResult) {
      if (!cloudResult.ok) {
        // Website cloud actively rejected: account not found, wrong password, or inactive/expired subscription
        throw new AppError(
          cloudResult.data?.message || 'Access denied by website. Please verify your account and subscription plan.',
          cloudResult.status || 401
        );
      }

      // Website confirmed valid user with an active subscription plan!
      const cloudPayload = cloudResult.data.data;
      const cloudUser = cloudPayload.user;
      const allowedServicesStr = Array.isArray(cloudUser.allowedServices)
        ? JSON.stringify(cloudUser.allowedServices)
        : (cloudUser.allowedServices || '[]');

      // Sync user profile & permissions into local SQLite database
      const userPasswordHash = cloudPayload.passwordHash || (password ? await hashPassword(password) : 'synced-hash');

      // Find if this user already exists locally by id, username, email, or licenseKey
      const existingLocal = await prisma.user.findFirst({
        where: {
          OR: [
            { id: cloudUser.id },
            ...(cloudUser.username ? [{ username: cloudUser.username }] : []),
            ...(cloudUser.email ? [{ email: cloudUser.email }] : []),
            ...(cloudUser.licenseKey ? [{ licenseKey: cloudUser.licenseKey }] : []),
          ],
        },
      });

      let localUser;
      if (existingLocal) {
        localUser = await prisma.user.update({
          where: { id: existingLocal.id },
          data: {
            username: cloudUser.username,
            email: cloudUser.email,
            name: cloudUser.name,
            company: cloudUser.company,
            role: cloudUser.role,
            isActive: cloudUser.isActive,
            allowedServices: allowedServicesStr,
            phone: cloudUser.phone,
            department: cloudUser.department,
            licenseKey: cloudUser.licenseKey,
            subscriptionPlan: cloudUser.subscriptionPlan,
            subscriptionStatus: cloudUser.subscriptionStatus,
            subscriptionExpiresAt: cloudUser.subscriptionExpiresAt ? new Date(cloudUser.subscriptionExpiresAt) : null,
            passwordHash: userPasswordHash,
            updatedAt: new Date(),
          },
        });
      } else {
        localUser = await prisma.user.create({
          data: {
            id: cloudUser.id,
            username: cloudUser.username,
            email: cloudUser.email,
            passwordHash: userPasswordHash,
            name: cloudUser.name,
            company: cloudUser.company,
            role: cloudUser.role,
            isActive: cloudUser.isActive,
            allowedServices: allowedServicesStr,
            phone: cloudUser.phone,
            department: cloudUser.department,
            licenseKey: cloudUser.licenseKey,
            subscriptionPlan: cloudUser.subscriptionPlan,
            subscriptionStatus: cloudUser.subscriptionStatus,
            subscriptionExpiresAt: cloudUser.subscriptionExpiresAt ? new Date(cloudUser.subscriptionExpiresAt) : null,
          },
        });
      }

      // Save offline lease expiry
      if (cloudPayload.leaseExpiresAt) {
        try {
          await prisma.appConfig.upsert({
            where: { key: 'OFFLINE_LEASE_EXPIRES' },
            update: { value: cloudPayload.leaseExpiresAt },
            create: { key: 'OFFLINE_LEASE_EXPIRES', value: cloudPayload.leaseExpiresAt },
          });
        } catch {}
      }

      const accessToken = generateAccessToken(localUser);
      const refreshToken = generateRefreshToken(localUser);
      const { passwordHash: _, ...cleanUser } = localUser;

      return { user: hydrateUser(cleanUser), accessToken, refreshToken };
    }

    // If offline (cloudResult === null), continue to local SQLite check below
  }

  // ─── LOCAL / WEB VALIDATION ───────────────────────────────────────────────
  let user;

  if (isLicenseKeyInput) {
    user = await prisma.user.findFirst({
      where: {
        licenseKey: rawId.toUpperCase(),
      },
    });

    if (!user) {
      if (process.env.ELECTRON_EMBEDDED === 'true') {
        throw new AppError('Unable to connect to website. First-time license activation requires an internet connection.', 503);
      }
      throw new AppError('Invalid License Key. Please check the code provided by your administrator.', 401);
    }
  } else {
    // Standard Username or Email login
    const loginId = rawId.toLowerCase();
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: loginId },
          { email: loginId },
        ],
      },
    });

    if (!user) {
      if (process.env.ELECTRON_EMBEDDED === 'true') {
        throw new AppError('Unable to connect to website. An internet connection is required on your first sign-in to verify your subscription.', 503);
      }
      throw new AppError('Invalid username/email or password', 401);
    }

    if (!password) {
      throw new AppError('Please enter your password', 400);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid username/email or password', 401);
    }
  }

  if (user.isActive === false || user.subscriptionStatus === 'INACTIVE' || user.subscriptionStatus === 'SUSPENDED') {
    throw new AppError('This user account has been suspended or deactivated on the website. Please contact your administrator to renew.', 403);
  }

  // Check if subscription has expired (Admins are exempt)
  if (
    user.role !== 'ADMIN' &&
    user.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt).getTime() < Date.now()
  ) {
    const expiredDateStr = new Date(user.subscriptionExpiresAt).toLocaleDateString('en-IN');
    throw new AppError(
      `Your subscription expired on ${expiredDateStr}. Please renew your subscription on the website to sign in.`,
      403
    );
  }

  // Update last login timestamp and increment login counter
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    });

    // Record login in activity logs
    await prisma.userActivityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        description: `Signed in via ${isLicenseKeyInput ? 'License Key' : 'Credentials'}`,
        performedBy: user.name || user.username || 'User',
      },
    });
  } catch (err) {
    console.error('Error logging user login event:', err.message);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const { passwordHash, ...userWithoutPassword } = user;
  return { user: hydrateUser(userWithoutPassword), accessToken, refreshToken };
}

/**
 * Verify credentials and active subscription for desktop client authorization.
 * Called by Desktop instances connecting to the Cloud Website server.
 */
export async function desktopVerifyUser({ identifier, password, licenseKey, machineName }) {
  const rawId = (licenseKey || identifier || '').trim();
  if (!rawId) {
    throw new AppError('Please provide your Username, Email, or License Key', 400);
  }

  const isLicenseKey = rawId.toUpperCase().startsWith('CRGO-');
  let user;

  if (isLicenseKey) {
    user = await prisma.user.findFirst({
      where: { licenseKey: rawId.toUpperCase() },
    });
    if (!user) {
      throw new AppError('Invalid License Key. No matching subscription found on the website.', 401);
    }
  } else {
    const loginId = rawId.toLowerCase();
    user = await prisma.user.findFirst({
      where: {
        OR: [{ username: loginId }, { email: loginId }],
      },
    });
    if (!user) {
      throw new AppError('User not found on website. Please make sure the account was created by the administrator.', 401);
    }
    if (!password) {
      throw new AppError('Password is required', 400);
    }
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid password. Please check your credentials.', 401);
    }
  }

  // Subscription & status checks
  if (user.isActive === false || user.subscriptionStatus === 'INACTIVE' || user.subscriptionStatus === 'SUSPENDED') {
    throw new AppError('This user account has been deactivated or suspended on the website.', 403);
  }

  if (user.role !== 'ADMIN' && user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt).getTime() < Date.now()) {
    const expDate = new Date(user.subscriptionExpiresAt).toLocaleDateString('en-IN');
    throw new AppError(`Your subscription expired on ${expDate}. Please renew your subscription plan on the website.`, 403);
  }

  const { passwordHash, ...userWithoutPassword } = user;
  return {
    user: hydrateUser(userWithoutPassword),
    passwordHash,
    offlineLeaseDays: 30,
    leaseExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Refresh tokens — returns new access token.
 */
export async function refreshTokens(refreshToken) {
  const payload = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      company: true,
      role: true,
      isActive: true,
      allowedServices: true,
      phone: true,
      department: true,
      licenseKey: true,
      subscriptionPlan: true,
      subscriptionExpiresAt: true,
      subscriptionStatus: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isActive === false) {
    throw new AppError('This user account has been deactivated', 403);
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: hydrateUser(user) };
}

/**
 * Cloud endpoint handler: Syncs live user profile & subscription state
 * Returns current plan, expiry, and allowed modules from Cloud Database.
 */
export async function desktopSyncUser({ userId, licenseKey, email, username }) {
  const matchers = [];
  if (userId) matchers.push({ id: userId });
  if (licenseKey) matchers.push({ licenseKey: licenseKey.trim().toUpperCase() });
  if (email) matchers.push({ email: email.toLowerCase() });
  if (username) matchers.push({ username: username.toLowerCase() });

  if (matchers.length === 0) {
    throw new AppError('Missing user identity for subscription sync', 400);
  }

  const user = await prisma.user.findFirst({
    where: { OR: matchers },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      company: true,
      role: true,
      isActive: true,
      allowedServices: true,
      phone: true,
      department: true,
      licenseKey: true,
      subscriptionPlan: true,
      subscriptionExpiresAt: true,
      subscriptionStatus: true,
    },
  });

  if (!user) {
    throw new AppError('User subscription record not found on cloud website', 404);
  }

  return {
    user: hydrateUser(user),
    leaseExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    offlineLeaseDays: 30,
  };
}

/**
 * Desktop client helper: Connects to Cloud Website API to synchronize local SQLite
 * with the latest plan, services, and expiry updated by admin on the website.
 */
export async function syncSubscriptionWithCloud(localUser) {
  if (process.env.ELECTRON_EMBEDDED !== 'true') {
    return { user: hydrateUser(localUser), synced: false, reason: 'Not in desktop mode' };
  }

  const cloudApiUrl = await getCloudApiUrl();
  const cleanCloudUrl = cloudApiUrl.replace(/\/+$/, '');

  try {
    const response = await fetch(`${cleanCloudUrl}/auth/desktop-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: localUser.id,
        licenseKey: localUser.licenseKey,
        email: localUser.email,
        username: localUser.username,
      }),
      signal: AbortSignal.timeout(4000), // Fast 4s timeout
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      return { user: hydrateUser(localUser), synced: false, message: errJson.message || 'Cloud sync rejected' };
    }

    const { data } = await response.json();
    const cloudUser = data.user;

    const allowedServicesStr = Array.isArray(cloudUser.allowedServices)
      ? JSON.stringify(cloudUser.allowedServices)
      : (cloudUser.allowedServices || '[]');

    // Update local SQLite user with fresh plan, permissions and expiry from Cloud
    const updatedLocalUser = await prisma.user.update({
      where: { id: localUser.id },
      data: {
        subscriptionPlan: cloudUser.subscriptionPlan,
        subscriptionStatus: cloudUser.subscriptionStatus,
        subscriptionExpiresAt: cloudUser.subscriptionExpiresAt ? new Date(cloudUser.subscriptionExpiresAt) : null,
        allowedServices: allowedServicesStr,
        role: cloudUser.role,
        isActive: cloudUser.isActive,
        name: cloudUser.name || localUser.name,
        company: cloudUser.company || localUser.company,
        phone: cloudUser.phone || localUser.phone,
        department: cloudUser.department || localUser.department,
        updatedAt: new Date(),
      },
    });

    // Extend 30-day offline lease
    if (data.leaseExpiresAt) {
      try {
        await prisma.appConfig.upsert({
          where: { key: 'OFFLINE_LEASE_EXPIRES' },
          update: { value: data.leaseExpiresAt },
          create: { key: 'OFFLINE_LEASE_EXPIRES', value: data.leaseExpiresAt },
        });
      } catch {}
    }

    return { user: hydrateUser(updatedLocalUser), synced: true, leaseExpiresAt: data.leaseExpiresAt };
  } catch (err) {
    // Cloud unreachable — fallback cleanly to cached local user (offline lease active)
    return { user: hydrateUser(localUser), synced: false, offline: true, error: err.message };
  }
}

