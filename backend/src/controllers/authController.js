import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/authService.js';

export const registerSeller = asyncHandler(async (req, res) => {
  if (process.env.MOCK_DB === 'true') {
    const mockUser = {
      _id: 'mock_seller_123',
      firstName: req.body.firstName || 'Srushti',
      lastName: req.body.lastName || 'Salunke',
      username: req.body.username || 'srushti',
      email: req.body.email || 'srushtisalunke41@gmail.com',
      phone: req.body.phone || '1234567890',
      role: 'seller',
      isVerified: false,
    };
    return res.status(201).json({
      success: true,
      message: 'Seller registered successfully (Mock Mode)',
      token: 'mock_token_123',
      user: mockUser,
      data: {
        accessToken: 'mock_token_123',
        refreshToken: 'mock_token_123',
        user: mockUser,
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
    const mockUser = {
      _id: 'mock_seller_123',
      firstName: 'Srushti',
      lastName: 'Salunke',
      username: 'srushti',
      email: req.body.email || 'srushtisalunke41@gmail.com',
      phone: '1234567890',
      role: 'seller',
      isVerified: false,
    };
    return res.status(200).json({
      success: true,
      message: 'Login successful (Mock Mode)',
      token: 'mock_token_123',
      user: mockUser,
      data: {
        accessToken: 'mock_token_123',
        refreshToken: 'mock_token_123',
        user: mockUser,
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
    const mockUser = {
      _id: 'mock_seller_123',
      firstName: 'Srushti',
      lastName: 'Salunke',
      username: 'srushti',
      email: 'srushtisalunke41@gmail.com',
      phone: '1234567890',
      role: 'seller',
      isVerified: false,
    };
    return res.status(200).json({
      success: true,
      message: 'Seller details fetched successfully (Mock Mode)',
      user: mockUser,
      data: {
        user: mockUser,
      },
    });
  }

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
  if (process.env.MOCK_DB === 'true') {
    const mockUser = {
      _id: 'mock_user_123',
      firstName: req.body.firstName || 'Demo',
      lastName: req.body.lastName || 'User',
      username: req.body.username || 'demouser',
      email: req.body.email || 'user@example.com',
      phone: req.body.phone || '1234567890',
      role: req.body.role || 'customer',
      isVerified: true,
    };
    return res.status(201).json({
      success: true,
      message: 'User registered successfully (Mock Mode)',
      token: 'mock_token_123',
      user: mockUser,
      data: {
        accessToken: 'mock_token_123',
        refreshToken: 'mock_token_123',
        user: mockUser,
      },
    });
  }

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
  if (process.env.MOCK_DB === 'true') {
    const mockUser = {
      _id: 'mock_user_123',
      firstName: 'Demo',
      lastName: 'User',
      username: 'demouser',
      email: req.body.email || 'user@example.com',
      phone: '1234567890',
      role: 'customer',
      isVerified: true,
    };
    return res.status(200).json({
      success: true,
      message: 'Login successful (Mock Mode)',
      token: 'mock_token_123',
      user: mockUser,
      data: {
        accessToken: 'mock_token_123',
        refreshToken: 'mock_token_123',
        user: mockUser,
      },
    });
  }

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
  if (process.env.MOCK_DB === 'true') {
    const mockUser = req.user || {
      _id: 'mock_user_123',
      firstName: 'Demo',
      lastName: 'User',
      username: 'demouser',
      email: 'user@example.com',
      phone: '1234567890',
      role: 'customer',
      isVerified: true,
    };
    return res.status(200).json({
      success: true,
      message: 'User details fetched successfully (Mock Mode)',
      user: mockUser,
      data: {
        user: mockUser,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: 'User details fetched successfully',
    user: req.user,
    data: {
      user: req.user,
    },
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

export const forgotPassword = asyncHandler(async (req, res) => {
  if (process.env.MOCK_DB === 'true') {
    return res.status(200).json({
      success: true,
      message: 'If an account exists, a 6-digit OTP has been sent. (Mock Mode: Use OTP 123456)',
    });
  }

  const { email } = req.body;
  await authService.forgotPassword(email);
  res.status(200).json({
    success: true,
    message: 'If an account exists, a 6-digit OTP has been sent.',
  });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  if (process.env.MOCK_DB === 'true') {
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully. (Mock Mode)',
      data: { userId: 'mock_user_123' },
    });
  }

  const { email, otp, purpose } = req.body;
  const result = await authService.verifyOtp(email, otp, purpose);
  res.status(200).json({
    success: true,
    message: 'OTP verified successfully.',
    data: result,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  if (process.env.MOCK_DB === 'true') {
    return res.status(200).json({
      success: true,
      message: 'Password reset successful. Please log in with your new password. (Mock Mode)',
    });
  }

  const { email, otp, newPassword } = req.body;
  await authService.resetPassword(email, otp, newPassword);
  res.status(200).json({
    success: true,
    message: 'Password reset successful. Please log in with your new password.',
  });
});
