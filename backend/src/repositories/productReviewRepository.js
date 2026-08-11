import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import ProductReview from '../models/ProductReview.js'; // imported for future use

/**
 * Create a new product review.
 */
export const create = async (reviewData) => {
  const review = new ProductReview(reviewData);
  return await review.save();
};

/**
 * Find a product review by ID.
 */
export const findById = async (id) => {
  return await ProductReview.findOne({ _id: id, isDeleted: false });
};

/**
 * Find reviews for a product.
 */
export const findByProduct = async (productId, filters = {}) => {
  const { page = 1, limit = 10, sortBy = 'newest' } = filters;

  const query = {
    productId,
    status: 'Published',
    isDeleted: false,
  };

  let sort = { createdAt: -1 };
  if (sortBy === 'highest_rating' || sortBy === 'rating_desc') {
    sort = { rating: -1, createdAt: -1 };
  } else if (sortBy === 'lowest_rating' || sortBy === 'rating_asc') {
    sort = { rating: 1, createdAt: -1 };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    ProductReview.find(query)
      .populate('customerId', 'firstName lastName avatar username')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    ProductReview.countDocuments(query),
  ]);

  const pages = Math.ceil(total / limitNum) || 1;

  return {
    reviews,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages,
    },
    total,
  };
};

/**
 * Update a product review by ID.
 */
export const update = async (id, updateData) => {
  return await ProductReview.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

/**
 * Soft delete a product review by ID.
 */
export const softDelete = async (id) => {
  return await ProductReview.findOneAndUpdate(
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

/**
 * Find all published, non-deleted reviews for a product.
 */
export const findPublishedReviewsByProduct = async (productId) => {
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) return [];
  return await ProductReview.find({
    productId: new mongoose.Types.ObjectId(productId),
    status: 'Published',
    isDeleted: false,
  }).lean();
};

/**
 * Aggregate rating distribution counts by star for a product.
 */
export const countRatingsByStar = async (productId) => {
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return { oneStar: 0, twoStar: 0, threeStar: 0, fourStar: 0, fiveStar: 0 };
  }

  const prodId = new mongoose.Types.ObjectId(productId);
  const stats = await ProductReview.aggregate([
    {
      $match: {
        productId: prodId,
        status: 'Published',
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
  ]);

  const distribution = {
    oneStar: 0,
    twoStar: 0,
    threeStar: 0,
    fourStar: 0,
    fiveStar: 0,
  };

  stats.forEach((item) => {
    if (item._id === 1) distribution.oneStar = item.count;
    if (item._id === 2) distribution.twoStar = item.count;
    if (item._id === 3) distribution.threeStar = item.count;
    if (item._id === 4) distribution.fourStar = item.count;
    if (item._id === 5) distribution.fiveStar = item.count;
  });

  return distribution;
};

/**
 * Calculate the average rating and total reviews count using aggregation.
 */
export const calculateAverageRating = async (productId) => {
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return { averageRating: 0, totalReviews: 0 };
  }

  const prodId = new mongoose.Types.ObjectId(productId);
  const stats = await ProductReview.aggregate([
    {
      $match: {
        productId: prodId,
        status: 'Published',
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length === 0) {
    return { averageRating: 0, totalReviews: 0 };
  }

  return {
    averageRating: Math.round(stats[0].averageRating * 10) / 10,
    totalReviews: stats[0].totalReviews,
  };
};
