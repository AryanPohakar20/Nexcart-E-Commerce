import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import * as sellerReviewRepository from '../repositories/sellerReviewRepository.js';
import * as reviewEligibilityService from './reviewEligibilityService.js';
import { toSellerReviewDTO, toSellerReviewDTOList } from '../mappers/sellerReviewMapper.js';
import logger from '../utils/logger.js';
import SellerReview from '../models/SellerReview.js';

/**
 * Create a new seller review.
 */
export const createReview = async (reviewData) => {
  const { customerId, sellerId, orderId } = reviewData;

  // 1. Validate eligibility
  const { eligible } = await reviewEligibilityService.canReviewSeller({
    customerId,
    sellerId,
    orderId,
  });

  if (!eligible) {
    throw new ApiError(400, 'User is not eligible to review this seller.');
  }

  // 2. Create the review
  const newReview = await sellerReviewRepository.create({
    sellerId,
    customerId,
    orderId,
    rating: reviewData.rating,
    comment: reviewData.comment || '',
    images: reviewData.images || [],
    status: 'Published', // default status
  });

  logger.info(`Seller review created successfully. Review ID: ${newReview._id}, Customer: ${customerId}, Seller: ${sellerId}`);

  // TODO: Trigger Seller Rating Aggregation
  // TODO: Publish Review Created Event
  // TODO: Recalculate Seller Reputation

  // Populate reviewer details to return complete DTO
  const populatedReview = await SellerReview.findById(newReview._id)
    .populate('customerId', 'firstName lastName avatar username')
    .lean();

  return toSellerReviewDTO(populatedReview);
};

/**
 * Update an existing seller review.
 */
export const updateReview = async (id, customerId, updateData) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Review ID format.');
  }

  const review = await sellerReviewRepository.findById(id);
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

  const updatedReview = await sellerReviewRepository.update(id, sanitizedUpdate);

  logger.info(`Seller review updated successfully. Review ID: ${id}, Customer: ${customerId}`);

  // TODO: Trigger Seller Rating Aggregation
  // TODO: Publish Review Updated Event

  const populatedReview = await SellerReview.findById(updatedReview._id)
    .populate('customerId', 'firstName lastName avatar username')
    .lean();

  return toSellerReviewDTO(populatedReview);
};

/**
 * Delete (soft-delete) a seller review.
 */
export const deleteReview = async (id, customerId) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Review ID format.');
  }

  const review = await sellerReviewRepository.findById(id);
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }

  // Verify ownership
  if (review.customerId.toString() !== customerId.toString()) {
    throw new ApiError(403, 'Forbidden: You are not authorized to delete this review.');
  }

  await sellerReviewRepository.softDelete(id);

  logger.info(`Seller review soft-deleted successfully. Review ID: ${id}, Customer: ${customerId}`);

  // TODO: Trigger Seller Rating Aggregation
  // TODO: Publish Review Deleted Event

  return { id, isDeleted: true };
};

/**
 * Fetch reviews for a specific seller.
 */
export const getSellerReviews = async (sellerId, queryParams = {}) => {
  if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
    throw new ApiError(400, 'Invalid Seller User ID format.');
  }

  // Safe defaults
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 10));
  const sort = ['newest', 'highest', 'lowest'].includes(queryParams.sort) ? queryParams.sort : 'newest';
  const rating = queryParams.rating ? parseInt(queryParams.rating, 10) : undefined;

  // Retrieve matching public reviews and count
  const { reviews, total } = await sellerReviewRepository.findBySeller(sellerId, {
    page,
    limit,
    sort,
    rating,
  });

  // Map database documents to public DTO layout
  const mappedReviews = toSellerReviewDTOList(reviews);

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    reviews: mappedReviews,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
  };
};
