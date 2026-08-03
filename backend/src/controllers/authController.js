import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/authService.js';

export const registerSeller = asyncHandler(async (req, res) => {
  console.log('[DEBUG] Incoming Seller Registration Request Body:', req.body);

  if (process.env.MOCK_DB === 'true') {
    console.log('[DEBUG] MOCK_DB is active, performing mock seller registration.');
    const mockUser = {
      _id: 'mock_seller_123',
      firstName: req.body.firstName || (req.body.ownerName ? req.body.ownerName.split(' ')[0] : 'Srushti'),
      lastName: req.body.lastName || (req.body.ownerName ? req.body.ownerName.split(' ').slice(1).join(' ') : 'Salunke'),
      username: req.body.username || (req.body.email ? req.body.email.split('@')[0] : 'srushti'),
      email: req.body.email || 'srushtisalunke41@gmail.com',
      phone: req.body.phone || '1234567890',
      role: 'seller',
      ownerName: req.body.ownerName || 'Srushti Salunke',
      businessName: req.body.businessName || 'NexCart Store',
      businessType: req.body.businessType || 'Retailer',
      gstNumber: req.body.gstNumber || '27AAAAA1111A1Z1',
      address: req.body.address || 'Penthouse B, Skyview Heights, Hitec City',
      city: req.body.city || 'Hyderabad',
      state: req.body.state || 'Telangana',
      country: req.body.country || 'India',
      pincode: req.body.pincode || '500081',
      verificationStatus: 'pending',
      isVerified: false,
    };
    
    console.log('[DEBUG] Mock Seller Registration successful:', mockUser);
    
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

  try {
    const { user, token } = await authService.registerSellerService(req.body);
    console.log('[DEBUG] Seller successfully registered and saved to MongoDB:', user.email);

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
  } catch (error) {
    console.error('[ERROR] Seller registration failed in controller:', error.message || error);
    throw error;
  }
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
      firstName: req.body.firstName || 'John',
      lastName: req.body.lastName || 'Doe',
      username: req.body.username || 'johndoe',
      email: req.body.email || 'johndoe@example.com',
      phone: req.body.phone || '1234567890',
      role: 'user',
      isVerified: true,
    };
    return res.status(201).json({
      success: true,
      message: 'User registered successfully (Mock Mode)',
      token: 'mock_token_user',
      user: mockUser,
      data: {
        accessToken: 'mock_token_user',
        refreshToken: 'mock_token_user',
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
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: req.body.email || 'johndoe@example.com',
      phone: '1234567890',
      role: 'user',
      isVerified: true,
    };
    return res.status(200).json({
      success: true,
      message: 'Login successful (Mock Mode)',
      token: 'mock_token_user',
      user: mockUser,
      data: {
        accessToken: 'mock_token_user',
        refreshToken: 'mock_token_user',
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
    const mockUser = {
      _id: 'mock_user_123',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
      phone: '1234567890',
      role: 'user',
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

export const forgotPassword = asyncHandler(async (req, res) => {
  if (process.env.MOCK_DB === 'true') {
    return res.status(200).json({
      success: true,
      message: 'If an account exists, a 6-digit OTP has been sent. (Mock Mode)',
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
      data: {
        email: req.body.email,
        otp: req.body.otp,
        purpose: req.body.purpose,
      },
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
