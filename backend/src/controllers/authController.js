// src/controllers/authController.js
// Authentication controller — registration, login, OAuth, password management.
// SECURITY: All MOCK_DB bypass branches have been removed.
// Separate access and refresh tokens are now issued.

import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/authService.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateTokens.js';
import * as userRepo from '../repositories/userRepository.js';
import { ApiError } from '../utils/ApiError.js';

// ─── Refresh token cookie options ─────────────────────────────────────────────
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,          // Not accessible via document.cookie
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/',
};

// ─── Helper: send auth response ───────────────────────────────────────────────
// Sets refresh token in HttpOnly cookie; returns access token in body.
const sendAuthResponse = (res, statusCode, message, user, accessToken, refreshToken) => {
  // Store refresh token in HttpOnly cookie (not accessible to JS)
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(statusCode).json({
    success: true,
    message,
    token: accessToken,       // Legacy field — kept for backwards compatibility
    user,
    data: {
      accessToken,
      // refreshToken intentionally NOT in body — it is in the HttpOnly cookie
      user,
    },
  });
};

// ─── Seller Registration ───────────────────────────────────────────────────────

export const registerSeller = asyncHandler(async (req, res) => {
  const { user } = await authService.registerSellerService(req.body);
  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  await userRepo.saveRefreshToken(user._id, refreshToken);

  return sendAuthResponse(res, 201, 'Seller registered successfully', user, accessToken, refreshToken);
});

// ─── Seller Login ──────────────────────────────────────────────────────────────

export const loginSeller = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user } = await authService.loginSellerService(email, password);
  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  await userRepo.saveRefreshToken(user._id, refreshToken);

  return sendAuthResponse(res, 200, 'Login successful', user, accessToken, refreshToken);
});

// ─── Get Current Seller ────────────────────────────────────────────────────────

export const getCurrentSeller = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Seller details fetched successfully',
    user: req.user,
    data: { user: req.user },
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logoutUser = asyncHandler(async (req, res) => {
  // Clear refresh token from DB if user is authenticated
  if (req.user?._id) {
    await userRepo.clearRefreshToken(req.user._id);
  }

  res.clearCookie('token');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/' });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const logoutSeller = logoutUser;

// ─── User Registration ─────────────────────────────────────────────────────────

export const registerUser = asyncHandler(async (req, res) => {
  const { user } = await authService.registerUserService(req.body);
  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  await userRepo.saveRefreshToken(user._id, refreshToken);

  return sendAuthResponse(res, 201, 'User registered successfully', user, accessToken, refreshToken);
});

// ─── User Login ────────────────────────────────────────────────────────────────

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user } = await authService.loginUserService(email, password);
  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  await userRepo.saveRefreshToken(user._id, refreshToken);

  return sendAuthResponse(res, 200, 'Login successful', user, accessToken, refreshToken);
});

// ─── Get Current User ──────────────────────────────────────────────────────────

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User details fetched successfully',
    user: req.user,
    data: { user: req.user },
  });
});

// ─── Google OAuth ──────────────────────────────────────────────────────────────

export const loginWithGoogle = asyncHandler(async (req, res) => {
  const { accessToken: googleToken } = req.body;
  if (!googleToken) {
    return res.status(400).json({ success: false, message: 'accessToken is required' });
  }

  const { user } = await authService.loginGoogleService(googleToken);
  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  await userRepo.saveRefreshToken(user._id, refreshToken);

  return sendAuthResponse(res, 200, 'Google Login successful', user, accessToken, refreshToken);
});

// ─── Apple OAuth ───────────────────────────────────────────────────────────────

export const loginWithApple = asyncHandler(async (req, res) => {
  const { identityToken, user: userPayload } = req.body;
  if (!identityToken) {
    return res.status(400).json({ success: false, message: 'identityToken is required' });
  }

  const { user } = await authService.loginAppleService(identityToken, userPayload);
  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  await userRepo.saveRefreshToken(user._id, refreshToken);

  return sendAuthResponse(res, 200, 'Apple Login successful', user, accessToken, refreshToken);
});

// ─── Token Refresh ─────────────────────────────────────────────────────────────
// POST /auth/refresh
// Consumes the refresh token from the HttpOnly cookie.
// Issues a new access token + rotates the refresh token.

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new ApiError(401, 'Refresh token missing. Please log in again.');
  }

  // Verify the refresh token signature
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    res.clearCookie('refreshToken', { path: '/' });
    throw new ApiError(401, 'Invalid or expired refresh token. Please log in again.');
  }

  // Load user and verify the stored refresh token matches
  const user = await userRepo.findByRefreshToken(token);

  if (!user || user._id.toString() !== decoded.id) {
    res.clearCookie('refreshToken', { path: '/' });
    throw new ApiError(401, 'Refresh token is no longer valid. Please log in again.');
  }

  // Check account status
  if (user.isBlocked || user.status === 'Blocked' || user.status === 'blocked') {
    throw new ApiError(403, 'Your account has been blocked.');
  }
  if (user.isDeleted || user.status === 'Deleted' || user.status === 'deleted') {
    throw new ApiError(401, 'Account not found.');
  }

  // Rotate: issue new access token + new refresh token
  const newAccessToken  = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);
  await userRepo.saveRefreshToken(user._id, newRefreshToken);

  res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    token: newAccessToken,
    data: { accessToken: newAccessToken },
  });
});

// ─── Forgot Password ───────────────────────────────────────────────────────────
// Stub endpoint — no email/OTP is sent. Returns success silently to avoid
// revealing whether an email exists.

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  await authService.forgotPassword(email, role);

  res.status(200).json({
    success: true,
    message: 'If an account with this email exists, please use the Change Password option in your account profile. For further help, contact our support team.',
  });
});

// ─── Reset Password ────────────────────────────────────────────────────────────
// Change password using current password for identity verification.
// Body: { email, currentPassword, newPassword, role? }

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, currentPassword, newPassword, role } = req.body;
  await authService.resetPassword(email, currentPassword, newPassword, role);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please log in with your new password.',
  });
});
