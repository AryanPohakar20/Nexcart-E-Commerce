// src/repositories/userRepository.js
// Data-access layer for the User entity.
// All direct Mongoose calls live here. Services call this — never query the model directly.
// OTP-specific functions removed (saveOtp, clearOtp, findByEmailWithOtp).

import User from '../models/User.js';

/**
 * Find a user by email address and optional role filter.
 * By default does NOT include password. Pass `includePassword: true` for auth flows.
 */
export const findByEmail = async (email, role = null, includePassword = false) => {
  const filter = { email: email.toLowerCase().trim() };
  if (role) {
    filter.role = Array.isArray(role) ? { $in: role } : role;
  }
  const query = User.findOne(filter);
  if (includePassword) query.select('+password');
  return query.lean(false); // Keep Mongoose document (needed for instance methods)
};

/**
 * Find a user by their MongoDB _id.
 */
export const findById = async (id) => {
  return User.findById(id);
};

/**
 * Find a user by their stored (hashed) refresh token.
 * Used during token rotation.
 */
export const findByRefreshToken = async (token) => {
  return User.findOne({ refreshToken: token }).select('+refreshToken');
};

/**
 * Create a new user document.
 * @param {Object} data - User fields (password will be hashed by the pre-save hook)
 */
export const createUser = async (data) => {
  const user = new User(data);
  return user.save();
};

/**
 * Update a user document by ID.
 * Returns the updated document.
 */
export const updateUser = async (id, updates) => {
  return User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
};

/**
 * Clear the refresh token stored on a user (logout).
 */
export const clearRefreshToken = async (id) => {
  return User.findByIdAndUpdate(id, { refreshToken: null });
};

/**
 * Store a hashed refresh token on the user document.
 */
export const saveRefreshToken = async (id, token) => {
  return User.findByIdAndUpdate(id, { refreshToken: token });
};

/**
 * Mark a user as verified.
 */
export const markVerified = async (id) => {
  return User.findByIdAndUpdate(id, { isVerified: true });
};
