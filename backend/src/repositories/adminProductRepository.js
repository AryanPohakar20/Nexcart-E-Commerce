// src/repositories/adminProductRepository.js
// Data access layer for Product entity in the admin panel.

import Product from '../models/Product.js';

/**
 * List products with filtering, sorting, pagination, and population.
 */
export const listProducts = async ({
  filter = {},
  page = 1,
  limit = 10,
  sort = { createdAt: -1 },
} = {}) => {
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate({ path: 'category', select: 'name slug parent status' })
      .populate({
        path: 'seller',
        select: 'business individual accountInfo sellerType slug trustScore rating verificationStatus sellerStatus status isActive',
      })
      .populate({ path: 'moderation.reviewedBy', select: 'firstName lastName email' })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { products, total };
};

/**
 * Get product by ID with full populated associations.
 */
export const getProductById = async (id) => {
  return Product.findById(id)
    .populate({ path: 'category', select: 'name slug parent status description' })
    .populate({
      path: 'seller',
      select: 'business individual accountInfo sellerType slug trustScore rating verificationStatus sellerStatus status isActive',
    })
    .populate({ path: 'moderation.reviewedBy', select: 'firstName lastName email avatar' })
    .lean();
};

/**
 * Find raw Mongoose document for mutation.
 */
export const findProductDocument = async (id) => {
  return Product.findById(id);
};

/**
 * Create a new product.
 */
export const createProduct = async (data) => {
  const product = new Product(data);
  return product.save();
};

/**
 * Update product by ID.
 */
export const updateProduct = async (id, data) => {
  return Product.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate({ path: 'category', select: 'name slug parent status' })
    .populate({
      path: 'seller',
      select: 'business individual accountInfo sellerType slug trustScore rating verificationStatus sellerStatus status isActive',
    })
    .lean();
};

/**
 * Bulk write operations for products.
 */
export const bulkWriteProducts = async (operations) => {
  return Product.bulkWrite(operations);
};

/**
 * Aggregated product statistics for dashboard & counters.
 */
export const getProductStats = async () => {
  const [stats] = await Product.aggregate([
    {
      $facet: {
        total: [{ $match: { isDeleted: { $ne: true } } }, { $count: 'count' }],
        active: [
          { $match: { isDeleted: { $ne: true }, status: { $in: ['Approved', 'Active'] }, stock: { $gt: 0 } } },
          { $count: 'count' },
        ],
        pending: [
          { $match: { isDeleted: { $ne: true }, status: 'Pending' } },
          { $count: 'count' },
        ],
        rejected: [
          { $match: { isDeleted: { $ne: true }, status: 'Rejected' } },
          { $count: 'count' },
        ],
        outOfStock: [
          { $match: { isDeleted: { $ne: true }, stock: { $lte: 0 } } },
          { $count: 'count' },
        ],
        deleted: [{ $match: { isDeleted: true } }, { $count: 'count' }],
      },
    },
  ]);

  return {
    total: stats?.total?.[0]?.count || 0,
    active: stats?.active?.[0]?.count || 0,
    pending: stats?.pending?.[0]?.count || 0,
    rejected: stats?.rejected?.[0]?.count || 0,
    outOfStock: stats?.outOfStock?.[0]?.count || 0,
    deleted: stats?.deleted?.[0]?.count || 0,
  };
};
