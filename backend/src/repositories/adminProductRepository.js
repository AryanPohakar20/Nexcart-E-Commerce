// src/repositories/adminProductRepository.js
// Data access layer for Product entity in the admin panel.

import Product from '../models/Product.js';
import mongoose from 'mongoose';

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
 * Get product by ID (supports MongoDB _id or custom id like PROD-MOB-0001).
 */
export const getProductById = async (id) => {
  let doc = null;
  if (mongoose.isValidObjectId(id)) {
    doc = await Product.findById(id)
      .populate({ path: 'category', select: 'name slug parent status description' })
      .populate({
        path: 'seller',
        select: 'business individual accountInfo sellerType slug trustScore rating verificationStatus sellerStatus status isActive',
      })
      .populate({ path: 'moderation.reviewedBy', select: 'firstName lastName email avatar' })
      .lean();
  }

  if (!doc) {
    doc = await Product.findOne({ $or: [{ id }, { sku: id }, { slug: id }] })
      .populate({ path: 'category', select: 'name slug parent status description' })
      .populate({
        path: 'seller',
        select: 'business individual accountInfo sellerType slug trustScore rating verificationStatus sellerStatus status isActive',
      })
      .populate({ path: 'moderation.reviewedBy', select: 'firstName lastName email avatar' })
      .lean();
  }

  return doc;
};

/**
 * Find raw Mongoose document for mutation.
 */
export const findProductDocument = async (id) => {
  if (mongoose.isValidObjectId(id)) {
    const doc = await Product.findById(id);
    if (doc) return doc;
  }
  return Product.findOne({ $or: [{ id }, { sku: id }, { slug: id }] });
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
  const updatePayload = { ...data };

  // Synchronize stock and inStock fields across schemas
  if (updatePayload.stock !== undefined || updatePayload.stockQuantity !== undefined) {
    const stockVal = Number(
      updatePayload.stock !== undefined ? updatePayload.stock : updatePayload.stockQuantity
    ) || 0;
    updatePayload.stock = stockVal;
    updatePayload.stockQuantity = stockVal;
    updatePayload.inStock = stockVal > 0;
  }

  let filter = { _id: id };
  if (!mongoose.isValidObjectId(id)) {
    filter = { $or: [{ id }, { sku: id }] };
  }

  return Product.findOneAndUpdate(filter, updatePayload, { new: true, runValidators: false })
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
          {
            $match: {
              isDeleted: { $ne: true },
              status: { $in: ['Approved', 'Active', 'active'] },
              $or: [{ stock: { $gt: 0 } }, { stockQuantity: { $gt: 0 } }, { inStock: true }],
            },
          },
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
          {
            $match: {
              isDeleted: { $ne: true },
              $or: [{ stock: { $lte: 0 } }, { stockQuantity: { $lte: 0 } }, { inStock: false }],
            },
          },
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
