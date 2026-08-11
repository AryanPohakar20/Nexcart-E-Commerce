import { ApiError } from '../utils/ApiError.js';
import SellerReview from '../models/SellerReview.js'; // imported for future use

/**
 * Create a new seller review.
 */
export const create = async (reviewData) => {
  throw new ApiError(501, 'sellerReviewRepository.create method is not implemented.');
};

/**
 * Find a seller review by ID.
 */
export const findById = async (id) => {
  throw new ApiError(501, 'sellerReviewRepository.findById method is not implemented.');
};

/**
 * Find reviews for a seller.
 */
export const findBySeller = async (sellerId, filters = {}) => {
  throw new ApiError(501, 'sellerReviewRepository.findBySeller method is not implemented.');
};

/**
 * Update a seller review by ID.
 */
export const update = async (id, updateData) => {
  throw new ApiError(501, 'sellerReviewRepository.update method is not implemented.');
};

/**
 * Soft delete a seller review by ID.
 */
export const softDelete = async (id) => {
  throw new ApiError(501, 'sellerReviewRepository.softDelete method is not implemented.');
};
