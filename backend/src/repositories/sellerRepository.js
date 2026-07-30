// src/repositories/sellerRepository.js
// Data-access layer for the Seller entity.
// All direct Mongoose calls live here. Services call this — never query the model directly.

import Seller from '../models/Seller.js';

/**
 * Create a new Seller document linked to a User.
 * @param {Object} data - { userId, ...any initial fields }
 */
export const createSeller = async (data) => {
  console.log("Updating Seller Collection");
  const seller = new Seller(data);
  return seller.save();
};

/**
 * Find a Seller document by the owner's User._id.
 */
export const findByUserId = async (userId) => {
  return Seller.findOne({ userId }).populate('userId', 'firstName lastName email phone isVerified role');
};

/**
 * Update a Seller document by the owner's User._id.
 * Returns the updated document.
 */
export const updateByUserId = async (userId, updates) => {
  console.log("Updating Seller Collection");
  return Seller.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true, runValidators: true }
  );
};
