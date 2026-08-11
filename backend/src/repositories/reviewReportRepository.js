import ReviewReport from '../models/ReviewReport.js';
import ProductReview from '../models/ProductReview.js';
import SellerReview from '../models/SellerReview.js';
import { ReviewType } from '../constants/reviewStatus.js';

/**
 * Save a new ReviewReport document to the database.
 * @param {Object} reportData - Review report data object
 * @returns {Promise<Object>} The saved report document
 */
export const createReport = async (reportData) => {
  const report = new ReviewReport(reportData);
  return await report.save();
};

/**
 * Find a ReviewReport by its ID.
 * @param {string} id - ReviewReport document ID
 * @returns {Promise<Object>} The report document (or null)
 */
export const findReportById = async (id) => {
  return await ReviewReport.findById(id);
};

/**
 * Reusable helper to find any review type by ID and return fields needed for reporting.
 * @param {string} reviewId - Review document ID
 * @param {string} reviewType - 'PRODUCT' or 'SELLER'
 */
export const findReviewForReporting = async (reviewId, reviewType) => {
  if (reviewType === ReviewType.PRODUCT) {
    return await ProductReview.findById(reviewId)
      .select('customerId status isDeleted')
      .lean();
  } else if (reviewType === ReviewType.SELLER) {
    return await SellerReview.findById(reviewId)
      .select('customerId status isDeleted')
      .lean();
  }
  return null;
};

/**
 * Check if a report for a specific review by a reporter already exists.
 * @param {string} reportedBy - Reporter User ID
 * @param {string} reviewId - Review ID
 * @param {string} reviewType - 'PRODUCT' or 'SELLER'
 */
export const findDuplicateReport = async (reportedBy, reviewId, reviewType) => {
  return await ReviewReport.findOne({ reportedBy, reviewId, reviewType }).lean();
};
