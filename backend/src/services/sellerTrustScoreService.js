import * as sellerRepository from '../repositories/sellerRepository.js';
import logger from '../utils/logger.js';

// Configurable normalization weights & thresholds (Private)
const WEIGHT_RATING = 40;
const WEIGHT_COMPLETED_ORDERS = 25;
const WEIGHT_CANCELLATION = 20;
const WEIGHT_REVIEW_COUNT = 10;

const MAX_RATING_VALUE = 5.0;
const TARGET_COMPLETED_ORDERS = 50;
const TARGET_REVIEW_COUNT = 100;

/**
 * Calculate the trust score for a seller based on persisted statistics.
 * Normalizes metrics, scales weights proportionally to exclude Response Rate, and clamps score.
 * @param {Object} seller - Seller document
 * @returns {number} Trust score (0 to 100)
 */
export const calculateTrustScore = (seller) => {
  if (!seller) return 0;

  const averageRating = seller.averageRating || 0;
  const totalReviews = seller.totalReviews || 0;
  const completedOrders = seller.statistics?.completedOrders || 0;
  const cancellationRate = seller.statistics?.cancellationRate || 0;

  // 1. Normalize each metric to 0-100 scale
  const normRating = (averageRating / MAX_RATING_VALUE) * 100;
  const normCompleted = Math.min(completedOrders / TARGET_COMPLETED_ORDERS, 1) * 100;
  const normCancellation = Math.max(0, 100 - cancellationRate);
  const normReviewCount = Math.min(totalReviews / TARGET_REVIEW_COUNT, 1) * 100;

  // 2. Compute weighted sum
  const weightedSum =
    (normRating * WEIGHT_RATING) +
    (normCompleted * WEIGHT_COMPLETED_ORDERS) +
    (normCancellation * WEIGHT_CANCELLATION) +
    (normReviewCount * WEIGHT_REVIEW_COUNT);

  // 3. Scale weights proportionally since responseRate is omitted (active sum = 95)
  const maxActiveWeight = WEIGHT_RATING + WEIGHT_COMPLETED_ORDERS + WEIGHT_CANCELLATION + WEIGHT_REVIEW_COUNT;

  const score = weightedSum / maxActiveWeight;

  // Clamp between 0 and 100, round to 1 decimal place
  return Math.min(100, Math.max(0, Math.round(score * 10) / 10));
};

/**
 * Recalculate and persist the trust score for a seller.
 * @param {string} sellerDocId - Seller document ID (Seller._id)
 */
export const recalculateSellerTrustScore = async (sellerDocId) => {
  if (!sellerDocId) return;

  try {
    const seller = await sellerRepository.findById(sellerDocId);
    if (!seller) {
      logger.warn(`Seller not found during trust score recalculation. Seller ID: ${sellerDocId}`);
      return;
    }

    const trustScore = calculateTrustScore(seller);
    const trustData = {
      trustScore,
      lastTrustScoreUpdatedAt: new Date(),
    };

    const updatedSeller = await sellerRepository.updateSellerTrustScore(sellerDocId, trustData);

    if (updatedSeller) {
      logger.info(
        `Seller trust score recalculated and persisted. Seller ID: ${sellerDocId}, Trust Score: ${trustScore}`
      );
    } else {
      logger.warn(`Failed to update trust score. Seller ID: ${sellerDocId}`);
    }
  } catch (error) {
    logger.error(`Trust score update failed. Seller ID: ${sellerDocId}`, error);
    throw error;
  }
};
