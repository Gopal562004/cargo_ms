import {
  registerUser,
  loginUser,
  refreshTokens,
  desktopVerifyUser,
  desktopSyncUser,
  syncSubscriptionWithCloud,
} from '../services/auth.service.js';
import prisma from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import { hydrateUser } from '../utils/sqlite-helpers.js';

// Cookie options for refresh token (30-day persistent session)
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/',
};

/**
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await loginUser(req.body);

    // Set refresh token as httpOnly cookie (30 days)
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  res.clearCookie('refreshToken', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
}

/**
 * GET /api/auth/me
 */
export async function getMe(req, res, next) {
  try {
    let user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        maxSeats: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // In Desktop mode, trigger subscription sync in background without blocking local response
    if (process.env.ELECTRON_EMBEDDED === 'true') {
      syncSubscriptionWithCloud(user).catch(() => {});
    }

    if (user.isActive === false) {
      throw new AppError('This user account has been deactivated on the website', 403);
    }

    res.json({ success: true, data: { user: hydrateUser(user) } });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/refresh
 */
export async function refresh(req, res, next) {
  try {
    // Get refresh token from cookie or body
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      throw new AppError('Refresh token not provided', 401);
    }

    const { accessToken, refreshToken, user } = await refreshTokens(token);

    // Update cookie (30 days)
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
      success: true,
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/desktop-verify
 * Verifies credentials and active subscription for desktop client authorization.
 */
export async function desktopVerify(req, res, next) {
  try {
    const data = await desktopVerifyUser(req.body);
    res.json({
      success: true,
      message: 'Desktop authorization verified successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/desktop-sync
 * Cloud endpoint: Syncs live subscription, plan, and module permissions to desktop client.
 */
export async function desktopSync(req, res, next) {
  try {
    const data = await desktopSyncUser(req.body);
    res.json({
      success: true,
      message: 'Subscription data synchronized successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/sync-subscription
 * Desktop local endpoint: Triggered by desktop client to manually or periodically refresh plan from website.
 */
export async function syncSubscription(req, res, next) {
  try {
    const localUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    if (!localUser) {
      throw new AppError('User not found', 404);
    }

    const result = await syncSubscriptionWithCloud(localUser);
    res.json({
      success: true,
      message: result.synced ? 'Subscription synchronized with website' : 'Running in offline cached mode',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

