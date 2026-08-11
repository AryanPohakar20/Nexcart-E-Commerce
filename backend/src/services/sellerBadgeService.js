import * as sellerRepository from '../repositories/sellerRepository.js';
import { BADGE_RULES } from '../constants/sellerBadgeRules.js';
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

/**
 * Automatically evaluate and update badge states for a seller.
 * @param {string} sellerDocId - Seller document ID
 * @returns {Promise<Array>} The updated list of badge states
 */
export const evaluateSellerBadges = async (sellerDocId) => {
  if (!sellerDocId) return [];

  try {
    const seller = await sellerRepository.getSellerEvaluationFields(sellerDocId);
    if (!seller) {
      logger.warn(`Seller not found during badge evaluation. Seller ID: ${sellerDocId}`);
      return [];
    }

    const trustScore = seller.trustScore || 0;
    const averageRating = seller.averageRating || 0;
    const totalReviews = seller.totalReviews || 0;
    const completedOrders = seller.statistics?.completedOrders || 0;
    const cancellationRate = seller.statistics?.cancellationRate || 0;
    const existingBadges = seller.badges || [];

    // 1. Evaluate auto-badges
    const evaluatedActive = [];
    const autoBadges = ['TrustedSeller', 'TopRatedSeller'];

    // Trusted Seller Check
    const tr = BADGE_RULES.TrustedSeller;
    if (
      trustScore >= tr.MIN_TRUST_SCORE &&
      cancellationRate <= tr.MAX_CANCELLATION_RATE &&
      completedOrders >= tr.MIN_COMPLETED_ORDERS
    ) {
      evaluatedActive.push('TrustedSeller');
    }

    // Top Rated Seller Check
    const trs = BADGE_RULES.TopRatedSeller;
    if (
      averageRating >= trs.MIN_AVERAGE_RATING &&
      totalReviews >= trs.MIN_REVIEW_COUNT
    ) {
      evaluatedActive.push('TopRatedSeller');
    }

    // 2. Build the synchronized badges list (maintaining original awardedAt timestamps)
    const newBadges = [];
    let stateChanged = false;

    // Process existing badges
    for (const badge of existingBadges) {
      if (autoBadges.includes(badge.badgeType)) {
        const shouldBeActive = evaluatedActive.includes(badge.badgeType);
        if (badge.isActive !== shouldBeActive) {
          stateChanged = true;
          if (shouldBeActive) {
            logger.info(`Seller badge awarded: ${badge.badgeType}. Seller ID: ${sellerDocId}`);
          } else {
            logger.info(`Seller badge removed: ${badge.badgeType}. Seller ID: ${sellerDocId}`);
          }
        }
        newBadges.push({
          badgeType: badge.badgeType,
          awardedAt: badge.awardedAt || new Date(),
          isActive: shouldBeActive,
        });
      } else {
        // Retain other badge states (manually-assigned or other systems like IdentityVerified)
        newBadges.push(badge);
      }
    }

    // Process newly awarded badges that don't exist yet in the database
    for (const badgeType of evaluatedActive) {
      const exists = existingBadges.some((b) => b.badgeType === badgeType);
      if (!exists) {
        stateChanged = true;
        logger.info(`Seller badge awarded: ${badgeType}. Seller ID: ${sellerDocId}`);
        newBadges.push({
          badgeType,
          awardedAt: new Date(),
          isActive: true,
        });
      }
    }

    // 3. Persist ONLY if there's an actual state change
    if (stateChanged) {
      const updatedSeller = await sellerRepository.updateSellerBadges(sellerDocId, newBadges);
      logger.info(`Badge evaluation completed. Seller ID: ${sellerDocId}, Status: UPDATED`);
      return updatedSeller.badges || [];
    }

    logger.info(`Badge evaluation completed. Seller ID: ${sellerDocId}, Status: NO_CHANGE`);
    return existingBadges;
  } catch (error) {
    logger.error(`Failed to automatically evaluate seller badges. Seller ID: ${sellerDocId}`, error);
    throw error;
  }
};
