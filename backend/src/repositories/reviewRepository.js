import ProductReview from '../models/ProductReview.js';
import SellerReview from '../models/SellerReview.js';
import { ReviewType, ReviewStatus } from '../constants/reviewStatus.js';

/**
 * Find a review document for moderation workflow.
 * Returns the full document (lean) with fields needed for status transition.
 * @param {string} reviewId
 * @param {string} reviewType - 'PRODUCT' or 'SELLER'
 * @returns {Promise<Object|null>}
 */
export const findReviewForModeration = async (reviewId, reviewType) => {
  if (reviewType === ReviewType.PRODUCT) {
    return await ProductReview.findById(reviewId).lean();
  } else if (reviewType === ReviewType.SELLER) {
    return await SellerReview.findById(reviewId).lean();
  }
  return null;
};

/**
 * Update the status of a review document.
 * @param {string} reviewId
 * @param {string} reviewType - 'PRODUCT' or 'SELLER'
 * @param {string} newStatus - one of ReviewStatus enum values
 * @returns {Promise<Object>} Updated review document (lean)
 */
export const updateReviewStatus = async (reviewId, reviewType, newStatus) => {
  const update = { status: newStatus };
  if (reviewType === ReviewType.PRODUCT) {
    return await ProductReview.findByIdAndUpdate(reviewId, { $set: update }, { new: true }).lean();
  } else if (reviewType === ReviewType.SELLER) {
    return await SellerReview.findByIdAndUpdate(reviewId, { $set: update }, { new: true }).lean();
  }
  return null;
};
