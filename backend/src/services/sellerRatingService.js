import * as sellerReviewRepository from '../repositories/sellerReviewRepository.js';
import * as sellerRepository from '../repositories/sellerRepository.js';
import logger from '../utils/logger.js';

/**
 * Recalculates and updates the rating statistics for a seller.
 * Invoked when seller reviews are created, updated, or soft-deleted.
 */
export const recalculateSellerRating = async (sellerUserId) => {
  if (!sellerUserId) return;

  try {
    // 1. Calculate stats using a single optimized MongoDB aggregation pipeline
    const stats = await sellerReviewRepository.aggregateSellerRating(sellerUserId);

    const ratingData = {
      rating: stats.averageRating, // Sync legacy rating
      totalReviews: stats.totalReviews,
      averageRating: stats.averageRating,
      ratingDistribution: stats.ratingDistribution,
      lastRatingUpdatedAt: new Date(),
    };

    // 2. Persist the updated statistics to the Seller document
    const updatedSeller = await sellerRepository.updateSellerRatingStatistics(sellerUserId, ratingData);

    if (updatedSeller) {
      logger.info(
        `Seller rating statistics recalculated. Seller User ID: ${sellerUserId}, Avg: ${stats.averageRating}, Total: ${stats.totalReviews}`
      );
    } else {
      logger.warn(`Seller not found during rating recalculation. Seller User ID: ${sellerUserId}`);
    }
  } catch (error) {
    logger.error(`Failed to recalculate seller rating. Seller User ID: ${sellerUserId}`, error);
    throw error;
  }
};
