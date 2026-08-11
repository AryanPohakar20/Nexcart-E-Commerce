import * as sellerRepository from '../repositories/sellerRepository.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Retrieve the badges array for a seller by their Document ID.
 * @param {string} sellerDocId - Seller document ID
 * @returns {Promise<Array>} Array of database badge states
 */
export const getSellerBadges = async (sellerDocId) => {
  if (!sellerDocId) return [];

  const seller = await sellerRepository.findById(sellerDocId);
  if (!seller) {
    throw new ApiError(404, 'Seller not found.');
  }

  return seller.badges || [];
};

/**
 * Synchronize and replace the badges array for a seller.
 * @param {string} sellerDocId - Seller document ID
 * @param {Array} badgesList - Array of badge states to set
 * @returns {Promise<Array>} The updated badges list
 */
export const syncSellerBadges = async (sellerDocId, badgesList) => {
  if (!sellerDocId) return [];

  try {
    const updatedSeller = await sellerRepository.updateSellerBadges(sellerDocId, badgesList);
    if (!updatedSeller) {
      throw new ApiError(404, 'Seller not found during badge synchronization.');
    }

    logger.info(`Seller badges synchronized. Seller ID: ${sellerDocId}, Badge Count: ${badgesList.length}`);
    return updatedSeller.badges || [];
  } catch (error) {
    logger.error(`Failed to synchronize seller badges. Seller ID: ${sellerDocId}`, error);
    throw error;
  }
};
