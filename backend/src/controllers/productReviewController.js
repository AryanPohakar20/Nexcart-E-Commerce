import { asyncHandler } from '../utils/asyncHandler.js';
import * as productReviewService from '../services/productReviewService.js';
import { successResponse } from '../utils/ApiResponse.js';

/**
 * Handle POST /api/product-reviews
 * Create a new product review.
 */
export const createProductReview = asyncHandler(async (req, res) => {
  const result = await productReviewService.createReview(req.body);
  return successResponse(res, 'Product review created successfully.', result, 201);
});

/**
 * Handle GET /api/product-reviews/product/:productId
 * Fetch reviews for a product.
 */
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const result = await productReviewService.getProductReviews(productId, req.query);
  return successResponse(res, 'Product reviews fetched successfully.', result);
});

/**
 * Handle PATCH /api/product-reviews/:id
 * Update an existing product review.
 */
export const updateProductReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await productReviewService.updateReview(id, req.body);
  return successResponse(res, 'Product review updated successfully.', result);
});

/**
 * Handle DELETE /api/product-reviews/:id
 * Delete a product review.
 */
export const deleteProductReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await productReviewService.deleteReview(id);
  return successResponse(res, 'Product review deleted successfully.', result);
});
