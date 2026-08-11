import mongoose from 'mongoose';
import * as reviewReportRepository from '../repositories/reviewReportRepository.js';
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

  // 1. Retrieve the target review using optimized shared lookup helper
  const review = await reviewReportRepository.findReviewForReporting(reviewId, reviewType);

  // Check if review exists and is not soft-deleted
  if (!review || review.isDeleted === true) {
    logger.warn(`Review report attempt failed. Review not found or soft-deleted. Review ID: ${reviewId}, Type: ${reviewType}`);
    throw new ApiError(404, 'Review not found.');
  }

  // Check if review is in a reportable state (only Published reviews can be reported)
  if (review.status !== ReviewStatus.PUBLISHED) {
    logger.warn(`Review report attempt failed. Review has invalid state for reporting. Review ID: ${reviewId}, Status: ${review.status}`);
    throw new ApiError(400, 'Only published reviews can be reported.');
  }

  // 2. Prevent self-reporting (users cannot report their own reviews)
  if (review.customerId && review.customerId.toString() === userId.toString()) {
    logger.warn(`Review report attempt failed. User attempted to report their own review. User: ${userId}, Review ID: ${reviewId}`);
    throw new ApiError(400, 'You cannot report your own review.');
  }

  // 3. Prevent duplicate reports (service-level validation)
  const existingReport = await reviewReportRepository.findDuplicateReport(userId, reviewId, reviewType);
  if (existingReport) {
    logger.warn(`Review report attempt failed. Duplicate report submitted. User: ${userId}, Review ID: ${reviewId}`);
    throw new ApiError(400, 'You have already reported this review.');
  }

  // 4. Save report atomically with database-level uniqueness fallback for concurrency protection
  try {
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
  } catch (error) {
    if (error.code === 11000) {
      logger.warn(`Review report attempt failed. Concurrent duplicate report blocked by index. User: ${userId}, Review ID: ${reviewId}`);
      throw new ApiError(400, 'You have already reported this review.');
    }
    throw error;
  }
};
