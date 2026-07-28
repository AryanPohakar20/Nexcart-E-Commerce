import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { calculateProfileCompletion } from '../utils/profileCompletion.js';

// Allowed editable customer profile fields
const editableFields = [
  'fullName',
  'firstName',
  'lastName',
  'phone',
  'mobile',
  'dob',
  'dateOfBirth',
  'gender',
  'bio',
  'settings',
];

/**
 * Service to fetch currently logged-in user profile.
 */
export const getProfileService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  return user;
};

/**
 * Service to update currently logged-in user profile.
 * Only modifies non-sensitive editable fields.
 */
export const updateProfileService = async (userId, updateData) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  const providedKeys = Object.keys(updateData || {});
  const hasEditableField = providedKeys.some((key) => editableFields.includes(key));

  if (!hasEditableField) {
    throw new ApiError(400, 'No valid editable profile fields provided');
  }

  // Handle Name Updates
  if (updateData.fullName) {
    const trimmedFullName = updateData.fullName.trim();
    user.fullName = trimmedFullName;
    const nameParts = trimmedFullName.split(/\s+/);
    user.firstName = nameParts[0] || user.firstName;
    user.lastName = nameParts.slice(1).join(' ').trim() || user.lastName;
  }
  if (updateData.firstName) user.firstName = updateData.firstName.trim();
  if (updateData.lastName) user.lastName = updateData.lastName.trim();

  // Handle Phone / Mobile Updates
  if (updateData.phone) {
    user.phone = updateData.phone.trim();
  }
  if (updateData.mobile) {
    user.mobile = updateData.mobile.trim();
  }

  // Handle Date of Birth Updates
  if (updateData.dob) {
    user.dob = new Date(updateData.dob);
    user.dateOfBirth = new Date(updateData.dob);
  }
  if (updateData.dateOfBirth) {
    user.dateOfBirth = new Date(updateData.dateOfBirth);
    user.dob = new Date(updateData.dateOfBirth);
  }

  // Handle Gender Update
  if (updateData.gender) {
    user.gender = updateData.gender;
  }

  // Handle Bio Update
  if (updateData.bio !== undefined) {
    user.bio = typeof updateData.bio === 'string' ? updateData.bio.trim() : '';
  }

  // Handle Settings Update
  if (updateData.settings && typeof updateData.settings === 'object') {
    user.settings = {
      ...user.settings,
      ...updateData.settings,
    };
  }

  // Calculate Profile Completion score
  user.profileCompletion = calculateProfileCompletion(user);
  if (user.profileCompletion >= 100) {
    user.profileCompleted = true;
  }

  await user.save();

  return user;
};

export default {
  getProfileService,
  updateProfileService,
};
