import mongoose from 'mongoose';
import * as reviewReportRepository from '../repositories/reviewReportRepository.js';
import * as reviewRepository from '../repositories/reviewRepository.js';
import * as reviewModerationLogRepository from '../repositories/reviewModerationLogRepository.js';
import { REPORT_STATUS } from '../constants/reviewReport.js';
import { ReviewType, ReviewStatus } from '../constants/reviewStatus.js';
import { toAdminReviewReportDTO, toAdminReviewReportsDTOList } from '../mappers/adminReviewReportMapper.js';
import { toModerationResultDTO } from '../mappers/adminReviewModerationMapper.js';
import { recalculateProductRating } from './productRatingService.js';
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

/**
 * Retrieve a paginated list of all review reports for administrators.
 * @param {Object} queryParams - { page, limit, status, reviewType, reason, sort }
 * @returns {Promise<Object>} { reports, pagination }
 */
export const getReportedReviews = async (queryParams) => {
  const page = Math.max(1, parseInt(queryParams.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(queryParams.limit) || 10));

  const { reports, total } = await reviewReportRepository.getReportedReviewsList({
    page,
    limit,
    status: queryParams.status,
    reviewType: queryParams.reviewType,
    reason: queryParams.reason,
    sort: queryParams.sort,
  });

  // Group and bulk load reviews to avoid N+1 queries
  const productReviewIds = reports
    .filter((r) => r.reviewType === 'PRODUCT')
    .map((r) => r.reviewId);
  const sellerReviewIds = reports
    .filter((r) => r.reviewType === 'SELLER')
    .map((r) => r.reviewId);

  const [productReviews, sellerReviews] = await Promise.all([
    reviewReportRepository.findReviewsForReporting(productReviewIds, 'PRODUCT'),
    reviewReportRepository.findReviewsForReporting(sellerReviewIds, 'SELLER'),
  ]);

  const reviewMap = new Map();
  productReviews.forEach((r) => reviewMap.set(r._id.toString(), r));
  sellerReviews.forEach((r) => reviewMap.set(r._id.toString(), r));

  const mappedReports = toAdminReviewReportsDTOList(reports, reviewMap);
  const totalPages = Math.ceil(total / limit);

  return {
    reports: mappedReports,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * Retrieve detailed report by ID for administrators.
 * @param {string} reportId - Review report ID
 * @returns {Promise<Object>} Detailed admin DTO
 */
export const getReportDetails = async (reportId) => {
  if (!reportId || !mongoose.Types.ObjectId.isValid(reportId)) {
    throw new ApiError(400, 'Invalid Report ID format.');
  }

  const report = await reviewReportRepository.findReportById(reportId);
  if (!report) {
    throw new ApiError(404, 'Report not found.');
  }

  await report.populate('reportedBy', 'firstName lastName username');

  const review = await reviewReportRepository.findReviewWithDetailsForReporting(report.reviewId, report.reviewType);

  return toAdminReviewReportDTO(report.toObject ? report.toObject() : report, review);
};

/**
 * Moderate a review report (hide, remove, restore, reject).
 * Performs validation, status transitions, audit log creation, and returns DTO.
 * @param {string} adminId - Admin user ID performing moderation
 * @param {string} reportId - ReviewReport ID
 * @param {string} action - one of 'hide', 'remove', 'restore', 'reject'
 * @param {string} [reason] - optional moderation reason (required for remove/reject)
 * @returns {Promise<Object>} Moderation result DTO
 */
export const moderateReview = async (adminId, reportId, action, reason) => {
  // 1. Validate report existence and status
  if (!reportId || !mongoose.Types.ObjectId.isValid(reportId)) {
    throw new ApiError(400, 'Invalid Report ID format.');
  }
  const report = await reviewReportRepository.findReportForModeration(reportId);
  if (!report) {
    throw new ApiError(404, 'Report not found.');
  }
  // Ensure report is in a modifiable state
  if (report.status !== REPORT_STATUS.PENDING && report.status !== REPORT_STATUS.UNDER_REVIEW) {
    throw new ApiError(400, 'Report cannot be moderated in its current state.');
  }

  // 2. Fetch the associated review
  const review = await reviewRepository.findReviewForModeration(report.reviewId, report.reviewType);
  if (!review) {
    throw new ApiError(404, 'Associated review not found.');
  }

  // 3. Determine allowed transitions
  const transitionMap = {
    hide: { from: [ReviewStatus.PUBLISHED], to: ReviewStatus.HIDDEN },
    remove: { from: [ReviewStatus.PUBLISHED, ReviewStatus.HIDDEN], to: ReviewStatus.REMOVED },
    restore: { from: [ReviewStatus.HIDDEN, ReviewStatus.REMOVED], to: ReviewStatus.PUBLISHED },
    reject: { from: [], to: null },
  };

  const allowed = transitionMap[action];
  if (!allowed) {
    throw new ApiError(400, 'Invalid moderation action.');
  }
  if ((action === 'remove' || action === 'reject') && (!reason || reason.length === 0)) {
    throw new ApiError(400, 'Moderation reason is required for remove or reject actions.');
  }

  // Verify current status allows transition (except reject)
  if (action !== 'reject' && !allowed.from.includes(review.status)) {
    throw new ApiError(400, `Cannot perform '${action}' on review with status '${review.status}'.`);
  }

  // 4. Update review status if applicable
  let updatedReview = review;
  if (action !== 'reject') {
    updatedReview = await reviewRepository.updateReviewStatus(review._id, report.reviewType, allowed.to);
  }

  // 5. Update report status and moderation metadata
  const newReportStatus = action === 'reject' ? REPORT_STATUS.REJECTED : REPORT_STATUS.RESOLVED;
  const updatedReport = await reviewReportRepository.updateReportStatus(reportId, {
    status: newReportStatus,
    moderatedBy: adminId,
    moderatedAt: new Date(),
    moderationReason: reason,
  });

  // 6. Create audit log entry
  await reviewModerationLogRepository.createLog({
    reportId,
    reviewId: review._id,
    reviewType: report.reviewType,
    adminId,
    action,
    previousReviewStatus: review.status,
    newReviewStatus: allowed.to || review.status,
    previousReportStatus: report.status,
    newReportStatus,
    reason,
  });

  // 7. Trigger Product Rating recalculation if applicable
  if (report.reviewType === ReviewType.PRODUCT && action !== 'reject') {
    try {
      // review.productId is available because findReviewForModeration returns the full document
      await recalculateProductRating(review.productId);
    } catch (error) {
      logger.error(
        `Product rating recalculation failed during review moderation. Review ID: ${review._id}, Product ID: ${review.productId}`,
        error
      );
    }
  }

  // 8. Return DTO
  return toModerationResultDTO(updatedReport, updatedReview, {
    action,
    previousReviewStatus: review.status,
    newReviewStatus: allowed.to || review.status,
    previousReportStatus: report.status,
    newReportStatus,
    adminId,
    createdAt: new Date(),
    reason,
  });
};
