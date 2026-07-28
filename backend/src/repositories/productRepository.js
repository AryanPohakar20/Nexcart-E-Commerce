// src/repositories/productRepository.js
// Data-access layer for the Product model in NexCart.

import Product from '../models/Product.js';

/**
 * Find products matching a filter, with sorting and pagination.
 */
export const findProducts = async (query, sort = {}, skip = 0, limit = 20) => {
  return Product.find(query)
    .populate('category', 'name slug description image')
    .populate('subcategory', 'name slug category')
    .populate('brand', 'name slug description logo status')
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
  return Product.findById(id)
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .populate('brand', 'name slug logo');
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
