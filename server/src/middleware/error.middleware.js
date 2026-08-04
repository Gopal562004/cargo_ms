/**
 * Custom application error with HTTP status code.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found handler — catches requests that don't match any route.
 */
export function notFound(req, res, next) {
  const error = new AppError(`Not found: ${req.originalUrl}`, 404);
  next(error);
}

/**
 * Global error handler middleware.
 * Handles Zod validation errors, Prisma errors, JWT errors, and custom AppErrors.
 */
export function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // ─── Zod Validation Error ───────────────────────────
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));
  }

  // ─── Prisma Errors ─────────────────────────────────
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target?.[0] || 'field';
    message = `A record with this ${field} already exists`;
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Invalid reference: related record not found';
  }

  // ─── JWT Errors ────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // ─── Response ──────────────────────────────────────
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  };

  console.error(`[ERROR] ${statusCode} - ${message}`, process.env.NODE_ENV === 'development' ? err.stack : '');

  res.status(statusCode).json(response);
}
