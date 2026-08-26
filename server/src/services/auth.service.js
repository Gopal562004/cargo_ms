import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';

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
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

/**
 * Generate a refresh token (long-lived).
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

  return user;
}

/**
 * Login / Activate a user — accepts username, email, or License Key.
 */
export async function loginUser({ email, username, identifier, password, licenseKey }) {
  const rawId = (licenseKey || username || email || identifier || '').trim();
  if (!rawId) {
    throw new AppError('Please provide your Username, Email, or License Key', 400);
  }

  // 1. Check if user is logging in via License Key
  const isLicenseKeyInput = rawId.toUpperCase().startsWith('CRGO-');
  let user;

  if (isLicenseKeyInput) {
    user = await prisma.user.findFirst({
      where: {
        licenseKey: rawId.toUpperCase(),
      },
    });

    if (!user) {
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
    throw new AppError('This user account has been suspended or deactivated. Please contact your administrator to renew.', 403);
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
  return { user: userWithoutPassword, accessToken, refreshToken };
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

  return { accessToken: newAccessToken, refreshToken: newRefreshToken, user };
}
