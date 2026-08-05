// src/controllers/profileController.js
// Handles customer profile view, edit, avatar upload, password change, and settings.

import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadImage, replaceImage } from '../services/cloudinaryService.js';
import { updateCompletion } from '../services/profileCompletion.js';
import logger from '../utils/logger.js';

// ─── GET /api/profile ─────────────────────────────────────────────────────────

/**
 * Get the currently authenticated user's profile.
 * Returns all public fields; excludes password, otp, refreshToken.
 */
export const getProfile = asyncHandler(async (req, res) => {
  // req.user is already populated by authenticate middleware
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json({
    success: true,
    message: 'Profile fetched successfully',
    data: { user },
  });
});

// ─── PUT /api/profile ─────────────────────────────────────────────────────────

/**
 * Update editable profile fields: firstName, lastName, phone, dob, gender, bio.
 * Phone uniqueness is checked at the controller level.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, dob, gender, bio } = req.body;
  const userId = req.user._id;

  // Enforce phone uniqueness across users (skip self)
  if (phone) {
    const existing = await User.findOne({ phone: phone.trim(), role: req.user.role, _id: { $ne: userId } });
    if (existing) {
      throw new ApiError(409, 'This phone number is already associated with another account');
    }
  }

  // Build update payload (only include provided fields)
  const updates = {};
  if (firstName !== undefined) updates.firstName = firstName.trim();
  if (lastName !== undefined) updates.lastName = lastName.trim();
  if (phone !== undefined) updates.phone = phone.trim();
  if (dob !== undefined) updates.dob = new Date(dob);
  if (gender !== undefined) updates.gender = gender;
  if (bio !== undefined) updates.bio = bio.trim();

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No valid fields provided for update');
  }

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Recalculate profile completion
  await updateCompletion(user);

  logger.info(`Profile updated for user: ${user._id}`);

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

// ─── PATCH /api/profile/avatar ────────────────────────────────────────────────

/**
 * Upload or replace profile avatar image.
 * Accepts multipart/form-data with a single `avatar` file field.
 * Stores the image in Cloudinary under nexcart/avatars.
 */
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No image file provided. Please upload an image (JPEG, PNG, WEBP)');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Extract old public_id from current avatar URL if it's a Cloudinary URL
  let oldPublicId = null;
  if (user.avatarPublicId) {
    oldPublicId = user.avatarPublicId;
  }

  // Upload to Cloudinary (replaces old if exists)
  const result = await replaceImage(oldPublicId, req.file.buffer, 'nexcart/avatars', {
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  });

  user.avatar = result.secure_url;
  // Store public_id for future deletion (using a transient field — won't be saved unless in schema)
  // We store it directly in the avatar URL pattern or add avatarPublicId field
  await user.save();

  // Recalculate completion
  await updateCompletion(user);

  logger.info(`Avatar updated for user: ${user._id}`);

  return res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: { avatar: user.avatar },
  });
});

// ─── PATCH /api/profile/password ──────────────────────────────────────────────

/**
 * Change the authenticated user's password.
 * Verifies current password before applying the new one.
 * The pre-save hook re-hashes the new password automatically.
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Fetch user with password field (select: false by default)
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  // Set new password — pre-save hook will hash it
  user.password = newPassword;
  await user.save();

  logger.info(`Password changed for user: ${user._id}`);

  return res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

// ─── GET /api/profile/settings ────────────────────────────────────────────────

/**
 * Return the user's settings object.
 */
export const getSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('settings');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json({
    success: true,
    message: 'Settings fetched successfully',
    data: { settings: user.settings },
  });
});

// ─── PUT /api/profile/settings ────────────────────────────────────────────────

/**
 * Update user settings (partial merge — only provided fields are changed).
 * Allowed: notifications.*, privacy.*, language, theme.
 */
export const updateSettings = asyncHandler(async (req, res) => {
  const { notifications, privacy, language, theme } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Deep-merge settings — only update provided sub-keys
  if (notifications) {
    if (typeof notifications.email === 'boolean') user.settings.notifications.email = notifications.email;
    if (typeof notifications.sms === 'boolean') user.settings.notifications.sms = notifications.sms;
    if (typeof notifications.push === 'boolean') user.settings.notifications.push = notifications.push;
  }

  if (privacy) {
    if (typeof privacy.showEmail === 'boolean') user.settings.privacy.showEmail = privacy.showEmail;
    if (typeof privacy.showPhone === 'boolean') user.settings.privacy.showPhone = privacy.showPhone;
  }

  if (language !== undefined) user.settings.language = language;
  if (theme !== undefined) user.settings.theme = theme;

  // markModified is required when mutating nested paths manually
  user.markModified('settings');
  await user.save();

  logger.info(`Settings updated for user: ${user._id}`);

  return res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: { settings: user.settings },
  });
});
