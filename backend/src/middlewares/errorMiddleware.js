// src/middlewares/errorMiddleware.js
// Centralized Express error handler.
// Catches all errors forwarded via next(err) and formats them consistently.
// Must be registered as the LAST middleware in app.js.

import logger from '../utils/logger.js';

/**
 * Custom operational error class.
 * Throw this from services/controllers to signal a known, expected error.
 * Non-operational errors (bugs) will still be caught here but treated differently.
 */
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Mongoose CastError (invalid ObjectId format).
 */
const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

/**
 * Handle Mongoose duplicate key error (e.g., duplicate email/role or username).
 */
const handleDuplicateKeyError = (err) => {
  const fields = Object.keys(err.keyValue || {});
  if (fields.includes('email') && fields.includes('role')) {
    const roleName = err.keyValue['role'] === 'seller' ? 'seller' : 'user';
    return new AppError(`An account with email "${err.keyValue.email}" already exists for ${roleName}s.`, 409);
  }
  const field = fields[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : '';
  return new AppError(`"${value}" is already registered. Please use a different ${field}.`, 409);
};

/**
 * Handle Mongoose ValidationError (schema constraints failed).
 */
const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join('. ')}`, 422);
};

/**
 * Handle JWT signature mismatch.
 */
const handleJwtError = () =>
  new AppError('Invalid authentication token. Please log in again.', 401);

/**
 * Handle expired JWT.
 */
const handleJwtExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401);

// ─── Main Error Handler Middleware ────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  let error = { ...err, message: err.message };
  error.statusCode = err.statusCode || 500;

  // Translate Mongoose / JWT errors into operational AppErrors
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJwtError();
  if (err.name === 'TokenExpiredError') error = handleJwtExpiredError();

  // Log unexpected (non-operational) errors with full stack
  if (!error.isOperational) {
    logger.error(`UNHANDLED ERROR: ${err.message}`, { stack: err.stack, url: req.originalUrl });
  } else {
    logger.warn(`Operational error [${error.statusCode}]: ${error.message}`);
  }

  // In production, hide internal error details from the client
  const isProduction = process.env.NODE_ENV === 'production';
  const clientMessage =
    !error.isOperational && isProduction ? 'An unexpected error occurred.' : error.message;

  return res.status(error.statusCode).json({
    success: false,
    message: clientMessage,
    ...(error.errors && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && !error.isOperational && { stack: err.stack }),
  });
};

/**
 * 404 handler — catches requests to undefined routes.
 * Register this BEFORE the error handler in app.js.
 */
export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404));
};

export default errorMiddleware;
