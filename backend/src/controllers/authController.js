// src/controllers/authController.js
// Authentication controller — registration, login, OAuth, password management.
// OTP / email-verification removed.

import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/authService.js';

const buildMockSeller = (email = 'srushtisalunke41@gmail.com') => ({
  _id: 'mock_seller_123',
  firstName: 'Srushti',
  lastName: 'Salunke',
  username: 'srushti',
  email,
  phone: '1234567890',
  role: 'seller',
  isVerified: true,
});

export const registerSeller = asyncHandler(async (req, res) => {
  if (process.env.MOCK_DB === 'true') {
    const user = buildMockSeller(req.body.email);
    return res.status(201).json({
      success: true,
      message: 'Seller registered successfully (Mock Mode)',
      token: 'mock_token_123',
      user,
      data: {
        accessToken: 'mock_token_123',
        refreshToken: 'mock_token_123',
        user,
      },
    });
  }

  const { user, token } = await authService.registerSellerService(req.body);

  res.status(201).json({
    success: true,
    message: 'Seller registered successfully',
    token,
    user,
    data: {
      accessToken: token,
      refreshToken: token,
      user,
    },
  });
});

export const loginSeller = asyncHandler(async (req, res) => {
  if (process.env.MOCK_DB === 'true') {
    const user = buildMockSeller(req.body.email);
    return res.status(200).json({
      success: true,
      message: 'Login successful (Mock Mode)',
      token: 'mock_token_123',
      user,
      data: {
        accessToken: 'mock_token_123',
        refreshToken: 'mock_token_123',
        user,
      },
    });
  }

  const { email, password } = req.body;
  const { user, token } = await authService.loginSellerService(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user,
    data: {
      accessToken: token,
      refreshToken: token,
      user,
    },
  });
});

export const getCurrentSeller = asyncHandler(async (req, res) => {
  if (process.env.MOCK_DB === 'true') {
    const user = buildMockSeller();
    return res.status(200).json({
      success: true,
      message: 'Seller details fetched successfully (Mock Mode)',
      user,
      data: { user },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Seller details fetched successfully',
    user: req.user,
    data: { user: req.user },
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const logoutSeller = logoutUser;

export const registerUser = asyncHandler(async (req, res) => {
  const { user, token } = await authService.registerUserService(req.body);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user,
    data: {
      accessToken: token,
      refreshToken: token,
      user,
    },
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUserService(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user,
    data: {
      accessToken: token,
      refreshToken: token,
      user,
    },
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User details fetched successfully',
    user: req.user,
    data: { user: req.user },
  });
});

export const loginWithGoogle = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ success: false, message: 'accessToken is required' });
  }

  const { user, token } = await authService.loginGoogleService(accessToken);

  res.status(200).json({
    success: true,
    message: 'Google Login successful',
    token,
    user,
    data: {
      accessToken: token,
      refreshToken: token,
      user,
    },
  });
});

export const loginWithApple = asyncHandler(async (req, res) => {
  const { identityToken, user: userPayload } = req.body;
  if (!identityToken) {
    return res.status(400).json({ success: false, message: 'identityToken is required' });
  }

  const { user, token } = await authService.loginAppleService(identityToken, userPayload);

  res.status(200).json({
    success: true,
    message: 'Apple Login successful',
    token,
    user,
    data: {
      accessToken: token,
      refreshToken: token,
      user,
    },
  });
});

/**
 * POST /auth/forgot-password
 * Stub endpoint — no email is sent. Returns success silently.
 * Password reset is handled via the in-app change-password flow (POST /auth/reset-password).
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  await authService.forgotPassword(email, role);

  res.status(200).json({
    success: true,
    message: 'If an account with this email exists, please use the Change Password option in your account profile. For further help, contact our support team.',
  });
});

/**
 * POST /auth/reset-password
 * Change password using current password for identity verification.
 * Body: { email, currentPassword, newPassword, role? }
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, currentPassword, newPassword, role } = req.body;
  await authService.resetPassword(email, currentPassword, newPassword, role);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please log in with your new password.',
  });
});
