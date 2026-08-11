import { asyncHandler } from '../utils/asyncHandler.js';
import * as reviewReportService from '../services/reviewReportService.js';
import { ReviewType } from '../constants/reviewStatus.js';

/**
 * Handle report creation request for Product reviews.
 * POST /reviews/:reviewId/report
 */
export const reportProductReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const report = await reviewReportService.createReviewReport(
    userId,
    reviewId,
    ReviewType.PRODUCT,
    req.body
  );

  res.status(201).json({
    success: true,
    message: 'Product review report submitted successfully.',
    data: { report },
  });
});

/**
 * Handle report creation request for Seller reviews.
 * POST /seller-reviews/:reviewId/report
 */
export const reportSellerReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const report = await reviewReportService.createReviewReport(
    userId,
    reviewId,
    ReviewType.SELLER,
    req.body
  );

  res.status(201).json({
    success: true,
    message: 'Seller review report submitted successfully.',
    data: { report },
  });
});
