import ReviewReport from '../models/ReviewReport.js';
import ProductReview from '../models/ProductReview.js';
import SellerReview from '../models/SellerReview.js';
import ReviewModerationLog from '../models/ReviewModerationLog.js';
import { ReviewStatus, ReviewType } from '../constants/reviewStatus.js';

/**
 * Convert moderation result into a DTO for admin API response.
 * Exposes relevant fields while keeping internal IDs hidden where appropriate.
 */
export const toModerationResultDTO = (report, review, log) => {
  return {
    reportId: report._id,
    reviewId: review._id,
    reviewType: review.reviewType || report.reviewType,
    action: log.action,
    previousReviewStatus: log.previousReviewStatus,
    newReviewStatus: log.newReviewStatus,
    previousReportStatus: log.previousReportStatus,
    newReportStatus: log.newReportStatus,
    moderatedBy: log.adminId,
    moderatedAt: log.createdAt,
    reason: log.reason || null,
    // Include minimal report info for client
    reportStatus: report.status,
    reportReason: report.reason,
    description: report.description,
  };
};
