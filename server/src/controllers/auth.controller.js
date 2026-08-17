import {
  registerUser,
  loginUser,
  refreshTokens,
} from '../services/auth.service.js';
import { AppError } from '../middleware/error.middleware.js';

// Cookie options for refresh token
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

    // Set refresh token as httpOnly cookie
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
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        role: true,
        isActive: true,
        allowedServices: true,
        phone: true,
        department: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isActive === false) {
      throw new AppError('This user account has been deactivated', 403);
    }

    res.json({ success: true, data: { user } });
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

    // Update cookie
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
      success: true,
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
}
