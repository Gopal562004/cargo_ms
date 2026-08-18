import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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
    { id: user.id, email: user.email, role: user.role },
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
    select: { id: true, email: true, name: true, company: true, role: true, isActive: true, allowedServices: true, createdAt: true },
  });

  return user;
}

/**
 * Login a user — accepts either email or username + password.
 */
export async function loginUser({ email, username, identifier, password }) {
  const loginId = (username || email || identifier || '').trim().toLowerCase();
  if (!loginId || !password) {
    throw new AppError('Please provide your username or email and password', 400);
  }

  const user = await prisma.user.findFirst({
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

  if (user.isActive === false) {
    throw new AppError('This user account has been deactivated. Please contact your system administrator.', 403);
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid username/email or password', 401);
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
    select: { id: true, email: true, name: true, company: true, role: true, isActive: true, allowedServices: true, phone: true, department: true },
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
