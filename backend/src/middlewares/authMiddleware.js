// src/middlewares/authMiddleware.js
// JWT authentication and role-based authorization middleware.

import { verifyAccessToken } from '../utils/generateTokens.js';
import * as userRepo from '../repositories/userRepository.js';
import { AppError } from './errorMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { STATUS } from '../constants/status.js';

/**
 * authenticateUser
 * ─────────────────
 * Protects routes by verifying the Bearer JWT in the Authorization header.
 * On success, attaches the full user document to req.user.
 * On failure, forwards an AppError to the error middleware.
 *
 * Usage: router.get('/me', authenticateUser, controller.getMe)
 */
export const authenticateUser = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Also support token in cookies (for SSR / cookie-based flows)
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new AppError('Access denied. No authentication token provided.', 401);
  }

  // Verify JWT signature + expiry
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Session expired. Please log in again.', 401);
    }
    throw new AppError('Invalid authentication token.', 401);
  }

  // Load user from DB (ensure account still exists and is active)
  const user = await userRepo.findById(decoded.id);

  if (!user) {
    throw new AppError('The account associated with this token no longer exists.', 401);
  }

  if (user.status === STATUS.BLOCKED) {
    throw new AppError('Your account has been suspended. Please contact support.', 403);
  }

  if (user.status === STATUS.DELETED) {
    throw new AppError('Account not found.', 401);
  }

  // Attach user to request — available in all subsequent middleware and controllers
  req.user = user;
  next();
});

/**
 * authorizeRoles
 * ──────────────
 * Factory function that returns a middleware guarding routes by user role.
 * Must be used AFTER authenticateUser (req.user must be populated).
 *
 * Usage: router.delete('/admin', authenticateUser, authorizeRoles('Admin'), controller.deleteUser)
 *
 * @param {...string} roles - Allowed role strings (use ROLES constants)
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. This resource requires one of: [${roles.join(', ')}].`,
          403
        )
      );
    }

    next();
  };
};
