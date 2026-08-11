import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import * as productReviewRepository from '../repositories/productReviewRepository.js';
import * as reviewEligibilityService from './reviewEligibilityService.js';
import { toReviewDTO } from '../mappers/productReviewMapper.js';
import logger from '../utils/logger.js';
import ProductReview from '../models/ProductReview.js';

/**
 * Create a new product review.
 */
export const createReview = async (reviewData) => {
  const { customerId, productId, orderId, orderItemId } = reviewData;

  // 1. Validate eligibility
  const { eligible, product } = await reviewEligibilityService.canReviewProduct({
    customerId,
    productId,
    orderId,
    orderItemId,
  });

  if (!eligible) {
    throw new ApiError(400, 'User is not eligible to review this product.');
  }

  // 2. Create the review
  const newReview = await productReviewRepository.create({
    productId,
    sellerId: product.sellerId,
    customerId,
    orderId,
    orderItemId,
    rating: reviewData.rating,
    comment: reviewData.comment || '',
    images: reviewData.images || [],
    status: 'Published', // default status
  });

  logger.info(`Product review created successfully. Review ID: ${newReview._id}, Customer: ${customerId}, Product: ${productId}`);

  // Populate reviewer details to return complete DTO
  const populatedReview = await ProductReview.findById(newReview._id)
    .populate('customerId', 'firstName lastName avatar username')
    .lean();

  return toReviewDTO(populatedReview);
};

/**
 * Update an existing product review.
 */
export const updateReview = async (id, customerId, updateData) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Review ID format.');
  }

  const review = await productReviewRepository.findById(id);
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }

  // Verify ownership
  if (review.customerId.toString() !== customerId.toString()) {
    throw new ApiError(403, 'Forbidden: You are not authorized to update this review.');
  }

  // Extract only editable fields
  const sanitizedUpdate = {};
  if (updateData.rating !== undefined) sanitizedUpdate.rating = updateData.rating;
  if (updateData.comment !== undefined) sanitizedUpdate.comment = updateData.comment;
  if (updateData.images !== undefined) sanitizedUpdate.images = updateData.images;

  const updatedReview = await productReviewRepository.update(id, sanitizedUpdate);

  logger.info(`Product review updated successfully. Review ID: ${id}, Customer: ${customerId}`);

  const populatedReview = await ProductReview.findById(updatedReview._id)
    .populate('customerId', 'firstName lastName avatar username')
    .lean();

  return toReviewDTO(populatedReview);
};

/**
 * Delete (soft-delete) a product review.
 */
export const deleteReview = async (id, customerId) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Review ID format.');
  }

  const review = await productReviewRepository.findById(id);
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }

  // Verify ownership
  if (review.customerId.toString() !== customerId.toString()) {
    throw new ApiError(403, 'Forbidden: You are not authorized to delete this review.');
  }

  await productReviewRepository.softDelete(id);

  logger.info(`Product review soft-deleted successfully. Review ID: ${id}, Customer: ${customerId}`);

  return { id, isDeleted: true };
};

/**
 * Fetch reviews for a specific product.
 */
export const getProductReviews = async (productId, queryParams = {}) => {
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, 'Invalid Product ID format.');
  }

  const result = await productReviewRepository.findByProduct(productId, queryParams);

  return {
    reviews: result.reviews.map(toReviewDTO).filter(Boolean),
    pagination: result.pagination,
    total: result.total,
  };
};
