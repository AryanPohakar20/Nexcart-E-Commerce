import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/ApiResponse.js';
import * as profileService from '../services/profileService.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await profileService.getProfileService(req.user._id);

  return successResponse(res, 'Profile fetched successfully', { user }, 200);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await profileService.updateProfileService(req.user._id, req.body);

  return successResponse(res, 'Profile updated successfully', { user }, 200);
});
