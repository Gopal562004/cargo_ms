import prisma from '../config/database.js';
import { verifyAccessToken } from '../services/auth.service.js';
import { AppError } from './error.middleware.js';

/**
 * Authentication middleware — verifies JWT from Authorization header.
 * Attaches decoded user payload to req.user.
 */
export function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Invalid or expired token', 401));
  }
}

/**
 * Role-based access control middleware.
 * Must be used AFTER authenticate middleware.
 */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
}

/**
 * Active Subscription guard middleware.
 * Allows ADMIN unrestricted access; checks that non-admin operators have an active, non-expired subscription.
 */
export async function requireActiveSubscription(req, _res, next) {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Master ADMIN has unlimited bypass access
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        isActive: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        subscriptionPlan: true,
      },
    });

    if (!user || user.isActive === false) {
      return next(new AppError('Your account has been suspended or deactivated. Contact your administrator.', 403));
    }

    if (user.subscriptionStatus === 'CANCELLED' || user.subscriptionPlan === 'NO_ACTIVE_PLAN') {
      return next(new AppError('Your subscription plan has been cancelled. Please renew your plan to create or edit documents.', 403));
    }

    if (user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date()) {
      const expiryDate = new Date(user.subscriptionExpiresAt).toLocaleDateString('en-IN');
      return next(new AppError(`Your subscription expired on ${expiryDate}. Please contact your administrator to renew your license.`, 403));
    }

    next();
  } catch (error) {
    next(error);
  }
}

