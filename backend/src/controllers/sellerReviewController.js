import { asyncHandler } from '../utils/asyncHandler.js';
import * as sellerReviewService from '../services/sellerReviewService.js';
import { successResponse } from '../utils/ApiResponse.js';

/**
 * Handle POST /api/seller-reviews
 * Create a new seller review.
 */
export const createSellerReview = asyncHandler(async (req, res) => {
  const result = await sellerReviewService.createReview(req.body);
  return successResponse(res, 'Seller review created successfully.', result, 201);
});

/**
 * Handle GET /api/seller-reviews/seller/:sellerId
 * Fetch reviews for a seller.
 */
export const getSellerReviews = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const result = await sellerReviewService.getSellerReviews(sellerId, req.query);
  return successResponse(res, 'Seller reviews fetched successfully.', result);
});

/**
 * Handle PATCH /api/seller-reviews/:id
 * Update an existing seller review.
 */
export const updateSellerReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await sellerReviewService.updateReview(id, req.body);
  return successResponse(res, 'Seller review updated successfully.', result);
});

/**
 * Handle DELETE /api/seller-reviews/:id
 * Delete a seller review.
 */
export const deleteSellerReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await sellerReviewService.deleteReview(id);
  return successResponse(res, 'Seller review deleted successfully.', result);
});
