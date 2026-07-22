// src/services/authService.js
// Business logic for authentication.
// No HTTP objects (req/res) here — only pure business operations.
// Throws AppError instances; the centralized error middleware catches them.

import * as userRepo from '../repositories/userRepository.js';
import { sendOtpEmail, sendWelcomeEmail } from './emailService.js';
import {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  getOtpExpiry,
  isOtpExpired,
} from '../helpers/otpHelper.js';
import { verifyRefreshToken } from '../utils/generateTokens.js';
import { ROLES } from '../constants/roles.js';
import { STATUS } from '../constants/status.js';
import logger from '../utils/logger.js';

// ─── Custom Error Class ───────────────────────────────────────────────────────

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Register a new Customer account.
 * Checks for duplicate email, creates user, sends OTP for email verification.
 * @param {Object} data - { firstName, lastName, email, password, phone? }
 */
export const registerUser = async ({ firstName, lastName, email, password, phone }) => {
  // Duplicate email check
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  // Create user (password hashed by pre-save hook in User model)
  const user = await userRepo.createUser({
    firstName,
    lastName,
    email,
    password,
    phone: phone || null,
    role: ROLES.CUSTOMER,
  });

  // Generate OTP for email verification
  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);
  const expiresAt = getOtpExpiry();

  await userRepo.saveOtp(user._id, hashedOtp, expiresAt);

  // Send verification OTP email (non-blocking, failure logged but doesn't fail registration)
  try {
    await sendOtpEmail(email, otp, 'Email Verification');
  } catch (err) {
    logger.error(`Registration OTP email failed for ${email}: ${err.message}`);
  }

  logger.info(`New user registered: ${email} (${user._id})`);
  return user;
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Authenticate a user with email + password.
 * Returns { user, accessToken, refreshToken }.
 */
export const loginUser = async (email, password) => {
  // Fetch user with password field (select: false by default)
  const user = await userRepo.findByEmail(email, true);

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Check account status
  if (user.status === STATUS.BLOCKED) {
    throw new AppError('Your account has been blocked. Please contact support.', 403);
  }

  if (user.status === STATUS.DELETED) {
    throw new AppError('No account found with this email.', 404);
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Store refresh token in DB
  await userRepo.saveRefreshToken(user._id, refreshToken);

  logger.info(`User logged in: ${email} (${user._id})`);

  // Return safe user (toJSON transform strips password/refreshToken/otp)
  return { user, accessToken, refreshToken };
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

/**
 * Validate a refresh token and issue a new access token.
 * Implements refresh token rotation.
 * @param {string} refreshToken
 */
export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token is required.', 400);
  }

  // Verify JWT signature and expiry
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  // Find user and check stored token matches
  const user = await userRepo.findById(decoded.id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // Fetch user with refreshToken field included for comparison
  const userWithToken = await userRepo.findByRefreshToken(refreshToken);
  if (!userWithToken) {
    throw new AppError('Refresh token has been revoked. Please log in again.', 401);
  }

  // Issue new access token (optionally rotate refresh token)
  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  // Rotate refresh token in DB
  await userRepo.saveRefreshToken(user._id, newRefreshToken);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Invalidate the user's session by clearing the refresh token in the database.
 * @param {string} userId
 */
export const logoutUser = async (userId) => {
  await userRepo.clearRefreshToken(userId);
  logger.info(`User logged out: ${userId}`);
};

// ─── Get Current User ─────────────────────────────────────────────────────────

/**
 * Fetch the authenticated user's public profile.
 * @param {string} userId
 */
export const getCurrentUser = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return user;
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

/**
 * Initiate password reset — generates OTP, stores hash, sends email.
 * Always returns success (even if email not found) to prevent user enumeration.
 * @param {string} email
 */
export const forgotPassword = async (email) => {
  const user = await userRepo.findByEmail(email);

  if (!user) {
    // Silent success — do not reveal whether the email exists
    logger.warn(`Forgot password attempted for non-existent email: ${email}`);
    return;
  }

  if (user.status !== STATUS.ACTIVE) {
    return; // Silently ignore blocked/deleted accounts
  }

  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);
  const expiresAt = getOtpExpiry();

  await userRepo.saveOtp(user._id, hashedOtp, expiresAt);

  try {
    await sendOtpEmail(email, otp, 'Password Reset');
    logger.info(`Password reset OTP sent to: ${email}`);
  } catch (err) {
    logger.error(`Failed to send password reset OTP to ${email}: ${err.message}`);
    throw new AppError('Could not send reset email. Please try again later.', 500);
  }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────

/**
 * Validate the OTP entered by the user for either email verification or password reset.
 * @param {string} email
 * @param {string} otpCode - Plain-text OTP from user input
 * @param {string} purpose - 'emailVerification' | 'passwordReset'
 */
export const verifyOtp = async (email, otpCode, purpose = 'passwordReset') => {
  const user = await userRepo.findByEmailWithOtp(email);

  if (!user) {
    throw new AppError('No account found with this email.', 404);
  }

  if (!user.otp?.code || !user.otp?.expiresAt) {
    throw new AppError('No OTP found. Please request a new one.', 400);
  }

  if (isOtpExpired(user.otp.expiresAt)) {
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  const isValid = await verifyOtpHash(otpCode, user.otp.code);
  if (!isValid) {
    throw new AppError('Invalid OTP. Please try again.', 400);
  }

  // If verifying email, mark user as verified and clear OTP
  if (purpose === 'emailVerification') {
    await userRepo.markVerified(user._id);
    await userRepo.clearOtp(user._id);

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.firstName);
    } catch (err) {
      logger.error(`Welcome email failed for ${user.email}: ${err.message}`);
    }
  }

  logger.info(`OTP verified for ${email} (purpose: ${purpose})`);
  return { userId: user._id };
};

// ─── Reset Password ───────────────────────────────────────────────────────────

/**
 * Reset user password after OTP has been verified.
 * Re-validates OTP before changing password as a security measure.
 * @param {string} email
 * @param {string} otpCode
 * @param {string} newPassword
 */
export const resetPassword = async (email, otpCode, newPassword) => {
  const user = await userRepo.findByEmailWithOtp(email);

  if (!user) {
    throw new AppError('No account found with this email.', 404);
  }

  if (!user.otp?.code || !user.otp?.expiresAt) {
    throw new AppError('No OTP found. Please request a new one.', 400);
  }

  if (isOtpExpired(user.otp.expiresAt)) {
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  const isValid = await verifyOtpHash(otpCode, user.otp.code);
  if (!isValid) {
    throw new AppError('Invalid OTP.', 400);
  }

  // Fetch full user to update (can't update on lean/projected doc)
  const fullUser = await userRepo.findByEmail(email, false);
  fullUser.password = newPassword; // Pre-save hook will re-hash
  await fullUser.save();

  // Clear OTP and revoke all sessions
  await userRepo.clearOtp(fullUser._id);
  await userRepo.clearRefreshToken(fullUser._id);

  logger.info(`Password reset successful for: ${email}`);
};
