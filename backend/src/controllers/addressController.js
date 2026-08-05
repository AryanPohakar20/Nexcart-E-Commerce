// src/controllers/addressController.js
// Handles CRUD operations for user delivery addresses.

import Address from '../models/Address.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { updateCompletion } from '../services/profileCompletion.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

// ─── Helper: validate address ownership ──────────────────────────────────────

const findOwnAddress = async (addressId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(400, 'Invalid address ID format');
  }
  const address = await Address.findOne({ _id: addressId, userId });
  if (!address) {
    throw new ApiError(404, 'Address not found or access denied');
  }
  return address;
};

// ─── GET /api/address ─────────────────────────────────────────────────────────

/**
 * Return all addresses for the authenticated user.
 * Default address appears first.
 */
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ userId: req.user._id })
    .sort({ isDefault: -1, createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: 'Addresses fetched successfully',
    data: { addresses, count: addresses.length },
  });
});

// ─── POST /api/address ────────────────────────────────────────────────────────

/**
 * Create a new address for the authenticated user.
 * If `isDefault: true` is set, any previous default is cleared first.
 * If this is the user's first address, it is automatically set as default.
 */
export const createAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { fullName, phone, addressLine1, addressLine2, city, state, country, postalCode, landmark, type, isDefault } = req.body;

  // Check if user already has addresses
  const existingCount = await Address.countDocuments({ userId });
  const shouldBeDefault = isDefault || existingCount === 0;

  // Clear existing default if needed
  if (shouldBeDefault && existingCount > 0) {
    await Address.updateMany({ userId, isDefault: true }, { $set: { isDefault: false } });
  }

  const address = await Address.create({
    userId,
    fullName,
    phone,
    addressLine1,
    addressLine2: addressLine2 || '',
    city,
    state,
    country: country || 'India',
    postalCode,
    landmark: landmark || '',
    type: type || 'Home',
    isDefault: shouldBeDefault,
  });

  // Recalculate profile completion (first address unlocks 20%)
  const user = await User.findById(userId);
  if (user) {
    await updateCompletion(user, true);
  }

  logger.info(`Address created for user: ${userId}`);

  return res.status(201).json({
    success: true,
    message: 'Address saved successfully',
    data: { address },
  });
});

// ─── PUT /api/address/:id ─────────────────────────────────────────────────────

/**
 * Update an existing address. Only the address owner can modify it.
 */
export const updateAddress = asyncHandler(async (req, res) => {
  const address = await findOwnAddress(req.params.id, req.user._id);

  const { fullName, phone, addressLine1, addressLine2, city, state, country, postalCode, landmark, type } = req.body;

  if (fullName !== undefined) address.fullName = fullName.trim();
  if (phone !== undefined) address.phone = phone.trim();
  if (addressLine1 !== undefined) address.addressLine1 = addressLine1.trim();
  if (addressLine2 !== undefined) address.addressLine2 = addressLine2.trim();
  if (city !== undefined) address.city = city.trim();
  if (state !== undefined) address.state = state.trim();
  if (country !== undefined) address.country = country.trim();
  if (postalCode !== undefined) address.postalCode = postalCode.trim();
  if (landmark !== undefined) address.landmark = landmark.trim();
  if (type !== undefined) address.type = type;

  await address.save();

  logger.info(`Address ${address._id} updated by user: ${req.user._id}`);

  return res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: { address },
  });
});

// ─── DELETE /api/address/:id ──────────────────────────────────────────────────

/**
 * Delete an address. If the deleted address was the default,
 * the most recently created remaining address becomes the new default.
 */
export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await findOwnAddress(req.params.id, req.user._id);
  const wasDefault = address.isDefault;
  const userId = req.user._id;

  await address.deleteOne();

  // If it was the default, promote the next address
  if (wasDefault) {
    const nextAddress = await Address.findOne({ userId }).sort({ createdAt: -1 });
    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  // Recalculate completion (losing last address removes 20%)
  const remainingCount = await Address.countDocuments({ userId });
  const user = await User.findById(userId);
  if (user) {
    await updateCompletion(user, remainingCount > 0);
  }

  logger.info(`Address ${req.params.id} deleted by user: ${userId}`);

  return res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
  });
});

// ─── PATCH /api/address/default/:id ──────────────────────────────────────────

/**
 * Set an address as the default for the authenticated user.
 * Previous default is cleared atomically.
 */
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const addressId = req.params.id;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(400, 'Invalid address ID format');
  }

  // Ensure address belongs to this user
  const address = await Address.findOne({ _id: addressId, userId });
  if (!address) {
    throw new ApiError(404, 'Address not found or access denied');
  }

  if (address.isDefault) {
    return res.status(200).json({
      success: true,
      message: 'This address is already the default',
      data: { address },
    });
  }

  // Atomic: clear all defaults then set the new one
  await Address.updateMany({ userId, isDefault: true }, { $set: { isDefault: false } });
  address.isDefault = true;
  await address.save();

  logger.info(`Default address set to ${addressId} for user: ${userId}`);

  return res.status(200).json({
    success: true,
    message: 'Default address updated successfully',
    data: { address },
  });
});
