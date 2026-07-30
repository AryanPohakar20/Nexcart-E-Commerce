// src/services/profileCompletion.js
// Calculates customer profile completion percentage and updates the User document.

import Address from '../models/Address.js';

/**
 * Weight map for each profile field.
 * Total: 100%
 */
const WEIGHTS = {
  avatar: 10,
  phone: 15,
  dob: 10,
  gender: 10,
  bio: 10,
  address: 20,   // at least one saved address
  isVerified: 15, // email verified
  password: 10,   // password exists (always true for registered users, but good for future OAuth)
};

/**
 * Calculate profile completion for a given user.
 * Queries the Address collection to check if any address exists.
 *
 * @param {Object} user - Mongoose User document (or plain object with required fields)
 * @param {Boolean} hasAddress - Optional pre-fetched flag (avoids extra DB call when caller already knows)
 * @returns {Promise<{ completion: number, completed: boolean }>}
 */
export const calculateCompletion = async (user, hasAddress = null) => {
  // Resolve address check
  let addressExists = hasAddress;
  if (addressExists === null) {
    const count = await Address.countDocuments({ userId: user._id });
    addressExists = count > 0;
  }

  let total = 0;

  if (user.avatar) total += WEIGHTS.avatar;
  if (user.phone && user.phone.trim()) total += WEIGHTS.phone;
  if (user.dob) total += WEIGHTS.dob;
  if (user.gender) total += WEIGHTS.gender;
  if (user.bio && user.bio.trim()) total += WEIGHTS.bio;
  if (addressExists) total += WEIGHTS.address;
  if (user.isVerified) total += WEIGHTS.isVerified;
  // Password always exists for registered users — give full credit
  total += WEIGHTS.password;

  const completion = Math.min(total, 100);
  const completed = completion === 100;

  return { completion, completed };
};

/**
 * Recalculate and persist profile completion onto the User document.
 * Call this after any profile or address mutation.
 *
 * @param {Object} user - Mongoose User document (must have .save())
 * @param {Boolean} hasAddress - Optional pre-fetched flag
 * @returns {Promise<{ completion: number, completed: boolean }>}
 */
export const updateCompletion = async (user, hasAddress = null) => {
  const { completion, completed } = await calculateCompletion(user, hasAddress);
  user.profileCompletion = completion;
  user.profileCompleted = completed;
  await user.save();
  return { completion, completed };
};
