import { ApiError } from '../utils/ApiError.js';
import * as sellerReviewRepository from '../repositories/sellerReviewRepository.js'; // imported for future use

/**
 * Create a new seller review.
 */
export const createReview = async (reviewData) => {
  throw new ApiError(501, 'sellerReviewService.createReview method is not implemented.');
};

/**
 * Update an existing seller review.
 */
export const updateReview = async (id, updateData) => {
  throw new ApiError(501, 'sellerReviewService.updateReview method is not implemented.');
};

/**
 * Delete (soft-delete) a seller review.
 */
export const deleteReview = async (id) => {
  throw new ApiError(501, 'sellerReviewService.deleteReview method is not implemented.');
};

/**
 * Fetch reviews for a specific seller.
 */
export const getSellerReviews = async (sellerId, queryParams = {}) => {
  throw new ApiError(501, 'sellerReviewService.getSellerReviews method is not implemented.');
};
