import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import SellerReview from '../models/SellerReview.js'; // imported for future use

/**
 * Create a new seller review.
 */
export const create = async (reviewData) => {
  const review = new SellerReview(reviewData);
  return await review.save();
};

/**
 * Find a seller review by ID.
 */
export const findById = async (id) => {
  return await SellerReview.findOne({ _id: id, isDeleted: false });
};

/**
 * Find reviews for a seller.
 */
export const findBySeller = async (sellerId, filters = {}) => {
  const { page = 1, limit = 10, sort = 'newest', rating } = filters;

  const query = {
    sellerId: new mongoose.Types.ObjectId(sellerId),
    status: 'Published',
    isDeleted: false,
  };

  if (rating !== undefined && rating !== null) {
    query.rating = parseInt(rating, 10);
  }

  let dbSort = { createdAt: -1 };
  if (sort === 'highest') {
    dbSort = { rating: -1, createdAt: -1 };
  } else if (sort === 'lowest') {
    dbSort = { rating: 1, createdAt: -1 };
  }

  // Deterministic tie-breaker
  dbSort._id = -1;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    SellerReview.find(query)
      .populate('customerId', 'firstName lastName avatar username')
      .sort(dbSort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    SellerReview.countDocuments(query),
  ]);

  return {
    reviews,
    total,
  };
};

/**
 * Update a seller review by ID.
 */
export const update = async (id, updateData) => {
  return await SellerReview.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

/**
 * Soft delete a seller review by ID.
 */
export const softDelete = async (id) => {
  return await SellerReview.findOneAndUpdate(
    { _id: id, isDeleted: false },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    },
    { new: true }
  );
};

/**
 * Check if a non-deleted review exists for a specific order.
 */
export const existsByOrder = async (orderId) => {
  const count = await SellerReview.countDocuments({ orderId, isDeleted: false });
  return count > 0;
};

/**
 * Find an existing review by customer, order, and seller.
 */
export const findExistingSellerReview = async ({ customerId, orderId, sellerId }) => {
  return SellerReview.findOne({ customerId, orderId, sellerId, isDeleted: false }).lean();
};

/**
 * Find a review by customer and order.
 */
export const findByCustomerAndOrder = async (customerId, orderId) => {
  return await SellerReview.findOne({ customerId, orderId, isDeleted: false }).lean();
};

/**
 * Check if a non-deleted review exists for a specific order and seller.
 */
export const existsByOrderAndSeller = async (orderId, sellerId) => {
  const count = await SellerReview.countDocuments({ orderId, sellerId, isDeleted: false });
  return count > 0;
};
