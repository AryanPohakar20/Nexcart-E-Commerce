import * as productReviewRepository from '../repositories/productReviewRepository.js';
import * as productRepository from '../repositories/productRepository.js';
import logger from '../utils/logger.js';

/**
 * Recalculates and updates the rating statistics for a product.
 * Invoked when reviews are created, updated, or soft-deleted.
 */
export const recalculateProductRating = async (productId) => {
  if (!productId) return;

  try {
    // 1. Calculate average rating and total count of published reviews
    const { averageRating, totalReviews } = await productReviewRepository.calculateAverageRating(productId);

    // 2. Count reviews by star rating distribution
    const ratingDistribution = await productReviewRepository.countRatingsByStar(productId);

    const ratingData = {
      rating: averageRating,
      reviewsCount: totalReviews,
      averageRating,
      totalReviews,
      ratingDistribution,
      lastRatingUpdatedAt: new Date(),
    };

    // 3. Persist the aggregated values to the Product document
    const updatedProduct = await productRepository.updateProductRatingStatistics(productId, ratingData);

    if (updatedProduct) {
      logger.info(
        `Product rating statistics recalculated. Product ID: ${productId}, Avg: ${averageRating}, Total Reviews: ${totalReviews}`
      );
    } else {
      logger.warn(`Product not found during rating recalculation. Product ID: ${productId}`);
    }
  } catch (error) {
    logger.error(`Failed to recalculate product rating. Product ID: ${productId}`, error);
    throw error;
  }
};
