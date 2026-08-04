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
 *
 * @param  {...string} roles - Allowed roles (e.g., 'ADMIN', 'OPERATOR').
 * @returns {Function} Express middleware.
 *
 * @example
 * router.delete('/users/:id', authenticate, requireRole('ADMIN'), controller.delete);
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
