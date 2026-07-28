// src/services/productService.js
// Service implementation for the Product search features in NexCart.

import * as productRepository from '../repositories/productRepository.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import { ApiError } from '../utils/ApiError.js';
import mongoose from 'mongoose';

const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * Perform product search with advanced filters, sorting, and pagination.
 */
export const searchProducts = async (filters) => {
  const {
    keyword,
    category,
    brand,
    minPrice,
    maxPrice,
    condition,
    location,
    sortBy,
    page = 1,
    limit = 20,
  } = filters;

  const query = {};

  // 1. Resolve Category Slug/Name/ID to ObjectId
  if (category) {
    let categoryDoc = null;
    if (mongoose.isValidObjectId(category)) {
      categoryDoc = await Category.findById(category);
    }
    if (!categoryDoc) {
      categoryDoc = await Category.findOne({
        $or: [
          { slug: category.toLowerCase().trim() },
          { name: { $regex: new RegExp(`^${escapeRegex(category.trim())}$`, 'i') } },
        ],
      });
    }
    if (!categoryDoc) {
      throw new ApiError(404, `Category '${category}' not found`);
    }
    query.category = categoryDoc._id;
  }

  // 2. Resolve Brand Slug/Name/ID to ObjectId
  if (brand) {
    let brandDoc = null;
    if (mongoose.isValidObjectId(brand)) {
      brandDoc = await Brand.findById(brand);
    }
    if (!brandDoc) {
      brandDoc = await Brand.findOne({
        $or: [
          { slug: brand.toLowerCase().trim() },
          { name: { $regex: new RegExp(`^${escapeRegex(brand.trim())}$`, 'i') } },
        ],
      });
    }
    if (!brandDoc) {
      throw new ApiError(404, `Brand '${brand}' not found`);
    }
    query.brand = brandDoc._id;
  }

  // 3. Keyword Search (matches title, description, tags)
  if (keyword) {
    const escapedKeyword = escapeRegex(keyword.trim());
    query.$or = [
      { title: { $regex: escapedKeyword, $options: 'i' } },
      { description: { $regex: escapedKeyword, $options: 'i' } },
      { tags: { $regex: escapedKeyword, $options: 'i' } },
    ];
  }

  // 4. Price Range Filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) {
      query.price.$gte = minPrice;
    }
    if (maxPrice !== undefined) {
      query.price.$lte = maxPrice;
    }
  }

  // 5. Condition Filter
  if (condition) {
    query.condition = condition;
  }

  // 6. Location Filter (Case-insensitive matching)
  if (location) {
    query.location = { $regex: new RegExp(escapeRegex(location.trim()), 'i') };
  }

  // 7. Determine Sort Rules
  const sort = {};
  if (sortBy === 'price-low-high') {
    sort.price = 1;
  } else if (sortBy === 'price-high-low') {
    sort.price = -1;
  } else if (sortBy === 'rating') {
    sort.rating = -1;
  } else if (sortBy === 'newest') {
    sort.createdAt = -1;
  } else {
    sort.createdAt = -1; // Default featured/newest sorting
  }

  // 8. Handle Pagination Skip & Limit
  const skip = (page - 1) * limit;

  // 9. Execute DB queries
  const products = await productRepository.findProducts(query, sort, skip, limit);
  const total = await productRepository.countProducts(query);
  const pages = Math.ceil(total / limit);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      pages,
    },
  };
};

/**
 * Fetch matching product titles for search autocompletion.
 */
export const getAutocomplete = async (q) => {
  const matches = await productRepository.findAutocomplete(q, 10);
  return matches.map((m) => m.title);
};

/**
 * Fetch search suggestions mapping to categories, brands, and top products.
 */
export const getSuggestions = async (q) => {
  const cleanQuery = escapeRegex(q.trim());
  const regex = new RegExp(cleanQuery, 'i');

  const [categories, brands, products] = await Promise.all([
    Category.find({ name: regex }).select('name slug').limit(5),
    Brand.find({ name: regex }).select('name slug').limit(5),
    productRepository.findProducts(
      { title: regex },
      { rating: -1 },
      0,
      5
    ),
  ]);

  return {
    categories,
    brands,
    products: products.map((p) => ({
      _id: p._id,
      id: p.id,
      title: p.title,
      price: p.price,
      thumbnail: p.thumbnail,
    })),
  };
};
