import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/ApiResponse.js';
import * as profileService from '../services/profileService.js';

/**
 * GET /api/profile
 * Retrieves logged-in user profile details.
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await profileService.getProfileService(req.user._id);
  return successResponse(res, 'Customer profile retrieved successfully', { user }, 200);
});

/**
 * PATCH /api/profile or PUT /api/profile
 * Updates logged-in user editable profile details.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await profileService.updateProfileService(req.user._id, req.body);
  return successResponse(res, 'Customer profile updated successfully', { user }, 200);
});

export default {
  getProfile,
  updateProfile,
};
