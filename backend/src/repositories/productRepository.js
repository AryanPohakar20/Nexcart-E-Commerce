// src/repositories/productRepository.js
// Data-access layer for the Product model in NexCart.
//
// NOTE: Main's Product schema stores `brand` and `category` as plain String fields
// (not ObjectId refs) and has no `subcategory` field at all.
// Populate calls are therefore omitted from all Product queries — they would
// throw a StrictPopulateError. The brand/category string values are returned
// as-is and are sufficient for the frontend's product card contract.
//
// ORDER MANAGEMENT ADDITIONS (from Manjusha):
// findProductById(id, session) — session-aware lookup for transactions
// decreaseProductStock(id, quantity, session) — atomic stock decrement

import Product from '../models/Product.js';

// ─── Order Management Helpers (Manjusha) ────────────────────────────────────

/**
 * Find a product by its MongoDB ID with optional transaction session.
 * Used by orderService.placeOrder() for stock validation inside transactions.
 */
export const findProductById = async (id, session = null) => {
  const query = Product.findById(id);
  if (session) query.session(session);
  return query;
};

/**
 * Atomically decrease product stock — only decrements when stock >= quantity and isActive.
 * Returns the updateOne write result (check .modifiedCount === 1 for success).
 */
export const decreaseProductStock = async (id, quantity, session = null) => {
  return Product.updateOne(
    { _id: id, stock: { $gte: quantity }, status: 'Active' },
    { $inc: { stock: -quantity } },
    { session }
  );
};

/**
 * Atomically restore product stock (e.g. on order cancellation).
 */
export const increaseProductStock = async (id, quantity, session = null) => {
  return Product.updateOne(
    { _id: id },
    { $inc: { stock: quantity } },
    { session }
  );
};


/**
 * Find products matching a filter, with sorting and pagination.
 */
export const findProducts = async (query, sort = {}, skip = 0, limit = 20) => {
  return Product.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

/**
 * Count total products matching a filter query.
 */
export const countProducts = async (query) => {
  return Product.countDocuments(query);
};

/**
 * Find a product by its Mongoose ID.
 */
export const findById = async (id) => {
  return Product.findById(id);
};

/**
 * Find matching product titles starting with or containing query string for autocomplete.
 */
export const findAutocomplete = async (q, limit = 10) => {
  return Product.find({
    title: { $regex: new RegExp(`^${escapeRegex(q)}`, 'i') },
  })
    .select('title id')
    .limit(limit);
};

/**
 * Helper to escape special regex characters.
 */
const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * Bulk insert products into the database.
 */
export const bulkInsert = async (products) => {
  return Product.insertMany(products);
};

/**
 * Find featured products with pagination, sorted by rating and creation time.
 */
export const findFeatured = async (limit = 10, skip = 0) => {
  return Product.find({ isFeatured: true })
    .sort({ rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Count total featured products in the database.
 */
export const countFeatured = async () => {
  return Product.countDocuments({ isFeatured: true });
};

/**
 * Find trending products with pagination, sorted by reviewCount, rating, and creation time.
 */
export const findTrending = async (limit = 10, skip = 0) => {
  return Product.find({ isTrending: true })
    .sort({ reviewsCount: -1, rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Count total trending products in the database.
 */
export const countTrending = async () => {
  return Product.countDocuments({ isTrending: true });
};

/**
 * Find newest products with pagination, sorted by creation time.
 */
export const findNewest = async (limit = 10, skip = 0) => {
  return Product.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Count total products for newest endpoint.
 */
export const countNewest = async () => {
  return Product.countDocuments({});
};

/**
 * Find recommended products with pagination, sorted by rating, review count, and creation time.
 */
export const findRecommended = async (limit = 10, skip = 0) => {
  return Product.find({})
    .sort({ rating: -1, reviewsCount: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Count total products for recommended endpoint.
 */
export const countRecommended = async () => {
  return Product.countDocuments({});
};
