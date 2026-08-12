import mongoose from 'mongoose';
import * as sellerRepository from '../repositories/sellerRepository.js';
import { toSellerReputationDTO } from '../mappers/sellerReputationMapper.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Fetch public reputation details for a specific seller.
 * @param {string} sellerUserId - Seller User ID (User._id)
 * @returns {Object} Public Reputation DTO
 */
export const getSellerReputation = async (sellerUserId) => {
  if (!sellerUserId || !mongoose.Types.ObjectId.isValid(sellerUserId)) {
    throw new ApiError(400, 'Invalid Seller User ID format.');
  }

  // Find seller document linked to this User ID
  const seller = await sellerRepository.findByUserId(sellerUserId);
  if (!seller) {
    throw new ApiError(404, 'Seller not found.');
  }

  // Return formatted public DTO
  return toSellerReputationDTO(seller);
};
