// src/controllers/authController.js
// Thin HTTP layer for authentication.
// Delegates all business logic to authService.
// Only responsible for: reading req, calling service, formatting response.

import * as authService from '../services/authService.js';
import { successResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { handleValidation } from '../validators/authValidators.js';

// ─── POST /api/auth/register ──────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  if (handleValidation(req, res)) return;

  const { firstName, lastName, email, password, phone } = req.body;

  const user = await authService.registerUser({ firstName, lastName, email, password, phone });

  return successResponse(
    res,
    'Registration successful! Please check your email for a 6-digit verification code.',
    { userId: user._id, email: user.email },
    201
  );
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  if (handleValidation(req, res)) return;

  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

  // Set refresh token in httpOnly cookie for enhanced security
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });

  return successResponse(res, 'Login successful.', {
    accessToken,
    refreshToken, // Also returned in body for clients that use localStorage
    user,
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// Protected route — requires authenticateUser middleware
export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id.toString());

  // Clear the refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return successResponse(res, 'Logged out successfully.');
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res) => {
  // Accept token from request body or from cookie
  const token = req.body.refreshToken || req.cookies?.refreshToken;

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(token);

  // Rotate cookie
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return successResponse(res, 'Token refreshed.', {
    accessToken,
    refreshToken: newRefreshToken,
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Protected route — requires authenticateUser middleware
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id.toString());
  return successResponse(res, 'User profile retrieved.', { user });
});

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
  if (handleValidation(req, res)) return;

  const { email } = req.body;
  await authService.forgotPassword(email);

  // Always return success to prevent user enumeration
  return successResponse(
    res,
    'If an account with that email exists, a 6-digit reset code has been sent.'
  );
});

// ─── POST /api/auth/verify-otp ───────────────────────────────────────────────
export const verifyOtp = asyncHandler(async (req, res) => {
  if (handleValidation(req, res)) return;

  const { email, otp, purpose = 'passwordReset' } = req.body;

  const result = await authService.verifyOtp(email, otp, purpose);

  return successResponse(res, 'OTP verified successfully.', result);
});

// ─── POST /api/auth/reset-password ───────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
  if (handleValidation(req, res)) return;

  const { email, otp, newPassword } = req.body;

  await authService.resetPassword(email, otp, newPassword);

  // Clear session cookies after password reset
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return successResponse(
    res,
    'Password reset successful. Please log in with your new password.'
  );
});
