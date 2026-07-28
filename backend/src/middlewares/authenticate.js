import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader) {
    const parts = authHeader.split(' ');

    if (parts[0]?.toLowerCase() === 'bearer' && parts[1]) {
      token = parts.slice(1).join(' ');
    } else if (parts.length === 1) {
      token = parts[0];
    }
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError(401, 'Authentication token is missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      throw new ApiError(401, 'Invalid authentication token');
    }

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      throw new ApiError(401, 'User associated with this token no longer exists');
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid authentication token');
    }

    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired, please login again');
    }

    throw new ApiError(401, 'Not authorized to access this route');
  }
});
