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

/**
 * Retrieve a paginated list of reports matching filters.
 * @param {Object} queryParams - { page, limit, status, reviewType, reason, sort }
 * @returns {Promise<Object>} { reports, total }
 */
export const getReportedReviewsList = async ({ page = 1, limit = 10, status, reviewType, reason, sort }) => {
  const query = {};
  if (status) query.status = status;
  if (reviewType) query.reviewType = reviewType;
  if (reason) query.reason = reason;

  let sortCriteria = { createdAt: -1 };
  if (sort === 'oldest') {
    sortCriteria = { createdAt: 1 };
  } else if (sort === 'newest') {
    sortCriteria = { createdAt: -1 };
  }

  const total = await ReviewReport.countDocuments(query);
  const reports = await ReviewReport.find(query)
    .populate('reportedBy', 'firstName lastName username')
    .sort(sortCriteria)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return { reports, total };
};

/**
 * Reusable bulk helper to query multiple reviews by ID and populate author details.
 * @param {Array} reviewIds - Array of review document IDs
 * @param {string} reviewType - 'PRODUCT' or 'SELLER'
 * @returns {Promise<Array>} List of populated reviews
 */
export const findReviewsForReporting = async (reviewIds, reviewType) => {
  if (reviewType === ReviewType.PRODUCT) {
    return await ProductReview.find({ _id: { $in: reviewIds } })
      .select('customerId status isDeleted rating comment productId')
      .populate('customerId', 'firstName lastName username')
      .lean();
  } else if (reviewType === ReviewType.SELLER) {
    return await SellerReview.find({ _id: { $in: reviewIds } })
      .select('customerId status isDeleted rating comment sellerId')
      .populate('customerId', 'firstName lastName username')
      .lean();
  }
  return [];
};

/**
 * Find single review with full details for reporting DTO.
 * @param {string} reviewId - Review ID
 * @param {string} reviewType - 'PRODUCT' or 'SELLER'
 * @returns {Promise<Object>} Populated review details
 */
export const findReviewWithDetailsForReporting = async (reviewId, reviewType) => {
  if (reviewType === ReviewType.PRODUCT) {
    return await ProductReview.findById(reviewId)
      .select('customerId status isDeleted rating comment productId')
      .populate('customerId', 'firstName lastName username')
      .lean();
  } else if (reviewType === ReviewType.SELLER) {
    return await SellerReview.findById(reviewId)
      .select('customerId status isDeleted rating comment sellerId')
      .populate('customerId', 'firstName lastName username')
      .lean();
  }
  return null;
};
