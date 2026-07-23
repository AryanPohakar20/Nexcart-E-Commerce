// src/controllers/sellerController.js

import asyncHandler from '../utils/asyncHandler.js';
import * as sellerService from '../services/sellerService.js';
import { loginUser } from '../services/authService.js';
import { successResponse } from '../utils/ApiResponse.js';

export const register = asyncHandler(async (req, res) => {
  const { user, profile } = await sellerService.registerSeller(req.body);
  return successResponse(res, 'Seller draft created. Please verify your email.', { user, profile }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await loginUser(email, password);

  // Check if they are actually a seller
  const profile = await sellerService.getFullProfile(user._id).catch(() => null);
  if (!profile && user.role !== 'MarketplaceSeller' && user.role !== 'Seller') {
    return res.status(403).json({
      success: false,
      message: 'You are not registered as a Marketplace Seller. Please register first.',
    });
  }

  return successResponse(res, 'Seller login successful.', {
    accessToken,
    refreshToken,
    user,
    profile: profile ? profile.profile : null,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await sellerService.saveProfile(req.user._id, req.body);
  return successResponse(res, 'Profile updated successfully.', { profile });
});

export const getProfile = asyncHandler(async (req, res) => {
  const fullProfile = await sellerService.getFullProfile(req.user._id);
  return successResponse(res, 'Profile fetched successfully.', fullProfile);
});

export const uploadIdentity = asyncHandler(async (req, res) => {
  // Mock document upload using the body since we don't have multer setup
  const docs = await sellerService.submitIdentity(req.user._id, req.body);
  return successResponse(res, 'Identity documents submitted successfully.', { docs });
});

export const submitPayment = asyncHandler(async (req, res) => {
  const payment = await sellerService.submitPayment(req.user._id, req.body);
  return successResponse(res, 'Payment details submitted successfully.', { payment });
});

export const agreeTerms = asyncHandler(async (req, res) => {
  const profile = await sellerService.agreeToTerms(req.user._id);
  return successResponse(res, 'Terms agreed. Verification is pending.', { profile });
});

export const getStatus = asyncHandler(async (req, res) => {
  const fullProfile = await sellerService.getFullProfile(req.user._id);
  return successResponse(res, 'Status fetched successfully.', { 
    status: fullProfile.profile.status,
    trustScore: fullProfile.profile.trustScore
  });
});
