// src/utils/generateTokens.js
// Pure utility functions for signing JWTs.
// These are also used as instance methods on the User model.

import jwt from 'jsonwebtoken';

/**
 * Generate a short-lived access token.
 * @param {string} userId   - MongoDB _id as string
 * @param {string} role     - User role (Customer | Seller | Admin …)
 * @returns {string} Signed JWT
 */
export const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m' }
  );
};

/**
 * Generate a long-lived refresh token.
 * @param {string} userId - MongoDB _id as string
 * @returns {string} Signed JWT
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' }
  );
};

/**
 * Verify an access token and return its decoded payload.
 * @param {string} token
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify a refresh token and return its decoded payload.
 * @param {string} token
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};
