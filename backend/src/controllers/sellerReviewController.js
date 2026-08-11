import { asyncHandler } from '../utils/asyncHandler.js';
import * as sellerReviewService from '../services/sellerReviewService.js';
import { successResponse } from '../utils/ApiResponse.js';

/**
 * Handle POST /sellers/:sellerId/reviews
 * Create a new seller review.
 */
export const createSellerReview = asyncHandler(async (req, res) => {
  const result = await sellerReviewService.createReview(req.body);
  return successResponse(res, 'Seller review created successfully.', result, 201);
});

/**
 * Handle PATCH /seller-reviews/:id
 * Update an existing seller review.
 */
export const updateSellerReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await sellerReviewService.updateReview(id, req.user._id, req.body);
  return successResponse(res, 'Seller review updated successfully.', result);
});

/**
 * Handle DELETE /seller-reviews/:id
 * Delete a seller review.
 */
export const deleteSellerReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await sellerReviewService.deleteReview(id, req.user._id);
  return successResponse(res, 'Seller review deleted successfully.', result);
});

