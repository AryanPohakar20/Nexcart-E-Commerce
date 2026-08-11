import { ApiError } from '../utils/ApiError.js';
import * as productReviewRepository from '../repositories/productReviewRepository.js'; // imported for future use

/**
 * Create a new product review.
 */
export const createReview = async (reviewData) => {
  throw new ApiError(501, 'productReviewService.createReview method is not implemented.');
};

/**
 * Update an existing product review.
 */
export const updateReview = async (id, updateData) => {
  throw new ApiError(501, 'productReviewService.updateReview method is not implemented.');
};

/**
 * Delete (soft-delete) a product review.
 */
export const deleteReview = async (id) => {
  throw new ApiError(501, 'productReviewService.deleteReview method is not implemented.');
};

/**
 * Fetch reviews for a specific product.
 */
export const getProductReviews = async (productId, queryParams = {}) => {
  throw new ApiError(501, 'productReviewService.getProductReviews method is not implemented.');
};
