import mongoose from 'mongoose';
import * as reviewReportRepository from '../repositories/reviewReportRepository.js';
import ProductReview from '../models/ProductReview.js';
import SellerReview from '../models/SellerReview.js';
import { ReviewType, ReviewStatus } from '../constants/reviewStatus.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Create a new report against a review (Product or Seller review).
 * @param {string} userId - User ID submitting the report (reportedBy)
 * @param {string} reviewId - Target review ID
 * @param {string} reviewType - Type of review ('PRODUCT' or 'SELLER')
 * @param {Object} reportData - { reason, description }
 * @returns {Promise<Object>} The saved report document
 */
export const createReviewReport = async (userId, reviewId, reviewType, reportData) => {
  if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, 'Invalid Review ID format.');
  }

  // 1. Retrieve the target review and check eligibility
  let review = null;
  if (reviewType === ReviewType.PRODUCT) {
    review = await ProductReview.findById(reviewId);
  } else if (reviewType === ReviewType.SELLER) {
    review = await SellerReview.findById(reviewId);
  } else {
    throw new ApiError(400, 'Invalid Review Type.');
  }

  // A review is eligible if it exists, is not soft-deleted, and has not been moderated/removed.
  if (!review || review.isDeleted === true || review.status === ReviewStatus.REMOVED) {
    throw new ApiError(404, 'Review not found.');
  }

  // 2. Persist the report record
  const savedReport = await reviewReportRepository.createReport({
    reviewId,
    reviewType,
    reportedBy: userId,
    reason: reportData.reason,
    description: reportData.description || '',
  });

  logger.info(
    `Review report created successfully. Report ID: ${savedReport._id}, Review: ${reviewId}, Type: ${reviewType}, Reported By: ${userId}`
  );

  return savedReport;
};
