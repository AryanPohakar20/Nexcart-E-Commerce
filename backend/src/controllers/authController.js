import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/authService.js';

export const registerSeller = asyncHandler(async (req, res) => {
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
  res.status(200).json({
    success: true,
    message: 'Seller details fetched successfully',
    user: req.user,
    data: {
      user: req.user,
    },
  });
});

export const logoutSeller = asyncHandler(async (req, res) => {
  res.clearCookie('token');

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

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
    data: {
      user: req.user,
    },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res.status(200).json({
    success: true,
    message: 'If an account exists, a 6-digit OTP has been sent.',
  });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp, purpose } = req.body;
  const result = await authService.verifyOtp(email, otp, purpose);
  res.status(200).json({
    success: true,
    message: 'OTP verified successfully.',
    data: result,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await authService.resetPassword(email, otp, newPassword);
  res.status(200).json({
    success: true,
    message: 'Password reset successful. Please log in with your new password.',
  });
});
