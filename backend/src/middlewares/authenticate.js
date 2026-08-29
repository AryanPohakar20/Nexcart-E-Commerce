import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ─── Primary Authentication Middleware ───────────────────────────────────────
// Verifies the Bearer JWT, loads the user from DB, and checks account status.
// SECURITY: MOCK_DB bypass has been removed. Production always requires a valid JWT.

export const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized to access this route');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Session expired. Please log in again.');
    }
    throw new ApiError(401, 'Not authorized to access this route');
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'User associated with this token no longer exists');
  }

  // Check account status — must match both legacy isBlocked flag and newer status field
  if (user.isBlocked || user.status === 'Blocked' || user.status === 'blocked') {
    throw new ApiError(403, 'Your account has been blocked. Please contact support.');
  }

  if (user.status === 'Suspended' || user.status === 'suspended') {
    throw new ApiError(403, 'Your account has been suspended. Please contact support.');
  }

  if (user.isDeleted || user.status === 'Deleted' || user.status === 'deleted') {
    throw new ApiError(401, 'Account not found.');
  }

  req.user = user;
  next();
});

// ─── Optional Authentication Middleware ──────────────────────────────────────
// Does NOT throw on missing/invalid token — attaches user if valid, null otherwise.
// Use for public routes that optionally personalize for logged-in users.

export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    // Treat blocked/deleted users as unauthenticated for optional routes
    if (
      user &&
      !user.isBlocked &&
      !user.isDeleted &&
      user.status !== 'Blocked' &&
      user.status !== 'blocked' &&
      user.status !== 'Deleted' &&
      user.status !== 'deleted'
    ) {
      req.user = user;
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }
  next();
});
