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

/**
 * Check if a non-deleted review exists for a specific order item.
 */
export const existsByOrderItem = async (orderItemId) => {
  const count = await ProductReview.countDocuments({ orderItemId, isDeleted: false });
  return count > 0;
};

/**
 * Find an existing review by customer, order item, and product.
 */
export const findExistingReview = async ({ customerId, orderItemId, productId }) => {
  return ProductReview.findOne({ customerId, orderItemId, productId, isDeleted: false }).lean();
};

/**
 * Find a review by customer and order item.
 */
export const findByCustomerAndOrderItem = async (customerId, orderItemId) => {
  return ProductReview.findOne({ customerId, orderItemId, isDeleted: false }).lean();
};
