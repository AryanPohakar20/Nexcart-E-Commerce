import { ApiError } from '../utils/ApiError.js';
import ProductReview from '../models/ProductReview.js'; // imported for future use

/**
 * Create a new product review.
 */
export const create = async (reviewData) => {
  throw new ApiError(501, 'productReviewRepository.create method is not implemented.');
};

/**
 * Find a product review by ID.
 */
export const findById = async (id) => {
  throw new ApiError(501, 'productReviewRepository.findById method is not implemented.');
};

/**
 * Find reviews for a product.
 */
export const findByProduct = async (productId, filters = {}) => {
  throw new ApiError(501, 'productReviewRepository.findByProduct method is not implemented.');
};

/**
 * Update a product review by ID.
 */
export const update = async (id, updateData) => {
  throw new ApiError(501, 'productReviewRepository.update method is not implemented.');
};

/**
 * Soft delete a product review by ID.
 */
export const softDelete = async (id) => {
  throw new ApiError(501, 'productReviewRepository.softDelete method is not implemented.');
};
