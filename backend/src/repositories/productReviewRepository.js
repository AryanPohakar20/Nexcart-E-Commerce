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
