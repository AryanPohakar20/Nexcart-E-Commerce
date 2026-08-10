// src/services/productService.js
// Service implementation for the Product search and catalog features in NexCart.

import * as productRepository from '../repositories/productRepository.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Subcategory from '../models/Subcategory.js';
import Attribute from '../models/Attribute.js';
import { ApiError } from '../utils/ApiError.js';
import mongoose from 'mongoose';
import { toProductDTO, toProductDTOList } from '../mappers/productMapper.js';

const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

const getPossibleKeys = (name, slug) => {
  const keys = new Set([name, slug, name.toLowerCase(), slug.toLowerCase()]);

  if (slug.includes('ram') || name.toLowerCase().includes('ram')) {
    keys.add('RAM Memory Installed Size');
    keys.add('RAM Memory');
    keys.add('RAM');
    keys.add('ram');
  }
  if (slug.includes('screen') || name.toLowerCase().includes('screen')) {
    keys.add('Screen Size');
    keys.add('Screen Size (Inches)');
  }
  if (
    slug.includes('graphics') ||
    name.toLowerCase().includes('graphics') ||
    slug.includes('gpu') ||
    name.toLowerCase().includes('gpu')
  ) {
    keys.add('Graphics Card Description');
    keys.add('Graphics Coprocessor');
    keys.add('Graphics Card');
    keys.add('GPU');
  }
  if (
    slug.includes('storage') ||
    name.toLowerCase().includes('storage') ||
    slug.includes('memory') ||
    name.toLowerCase().includes('memory')
  ) {
    keys.add('Memory Storage Capacity');
    keys.add('Storage Capacity');
  }

  return Array.from(keys);
};

/**
 * Perform product search with advanced filters, sorting, and pagination.
 */
export const searchProducts = async (filters = {}) => {
  const {
    keyword,
    q,
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    condition,
    location,
    rating,
    minRating,
    inStock,
    sortBy,
    page = 1,
    limit = 20,
  } = filters;

  const query = { isDeleted: { $ne: true } };
  let categoryDoc = null;

  // 1. Resolve Category Slug/Name/ID to ObjectId or regex
  if (category && category !== 'all' && category !== 'All') {
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

    if (categoryDoc) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { category: categoryDoc._id },
          { category: categoryDoc.name },
          { category: categoryDoc.slug },
        ],
      });
    } else {
      // Direct string matching if no category doc found
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { category: { $regex: new RegExp(escapeRegex(category.trim()), 'i') } },
        ],
      });
    }
  }

  // 1b. Resolve Subcategory Slug/Name/ID to ObjectId if provided
  let subcategoryDoc = null;
  const subcategory = filters.subcategory;
  if (subcategory && subcategory !== 'all') {
    if (mongoose.isValidObjectId(subcategory)) {
      subcategoryDoc = await Subcategory.findById(subcategory);
    }
    if (!subcategoryDoc) {
      subcategoryDoc = await Subcategory.findOne({
        $or: [
          { slug: subcategory.toLowerCase().trim() },
          { name: { $regex: new RegExp(`^${escapeRegex(subcategory.trim())}$`, 'i') } },
        ],
      });
    }
    if (subcategoryDoc) {
      query.subcategory = subcategoryDoc._id;
    }
  }

  // 2. Resolve Brand Slug/Name/ID
  if (brand && brand !== 'all' && brand !== 'All') {
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

    const brandRegex = new RegExp(escapeRegex(brand.trim()), 'i');
    query.$and = query.$and || [];
    if (brandDoc) {
      query.$and.push({
        $or: [
          { brand: brandDoc._id },
          { brand: brandDoc.name },
          { 'specifications.Brand': { $regex: brandRegex } },
        ],
      });
    } else {
      query.$and.push({
        $or: [
          { brand: { $regex: brandRegex } },
          { 'specifications.Brand': { $regex: brandRegex } },
        ],
      });
    }
  }

  // 3. Keyword Search (matches title, name, description, tags, brand)
  const rawSearch = keyword || q || search;
  if (rawSearch && rawSearch.trim()) {
    const escapedKeyword = escapeRegex(rawSearch.trim());
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { title: { $regex: escapedKeyword, $options: 'i' } },
        { name: { $regex: escapedKeyword, $options: 'i' } },
        { description: { $regex: escapedKeyword, $options: 'i' } },
        { tags: { $regex: escapedKeyword, $options: 'i' } },
        { 'specifications.Brand': { $regex: escapedKeyword, $options: 'i' } },
        { sku: { $regex: escapedKeyword, $options: 'i' } },
      ],
    });
  }

  // 4. Price Range Filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined && minPrice !== '') {
      query.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      query.price.$lte = Number(maxPrice);
    }
  }

  // 5. Rating Filter
  const targetRating = rating || minRating;
  if (targetRating !== undefined && targetRating !== '') {
    query.$or = [
      { rating: { $gte: Number(targetRating) } },
      { averageRating: { $gte: Number(targetRating) } },
      { 'ratings.average': { $gte: Number(targetRating) } },
    ];
  }

  // 6. In Stock Filter
  if (inStock === 'true' || inStock === true) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { stockQuantity: { $gt: 0 } },
        { stock: { $gt: 0 } },
        { inStock: true },
      ],
    });
  }

  // 7. Condition Filter
  if (condition && condition !== 'all') {
    query.condition = { $regex: new RegExp(`^${escapeRegex(condition)}$`, 'i') };
  }

  // 8. Location Filter
  if (location) {
    query.location = { $regex: new RegExp(escapeRegex(location.trim()), 'i') };
  }

  // 9. Determine Sort Rules
  let sort = { createdAt: -1 };
  if (sortBy === 'price-low-high' || sortBy === 'price_asc') {
    sort = { price: 1 };
  } else if (sortBy === 'price-high-low' || sortBy === 'price_desc') {
    sort = { price: -1 };
  } else if (sortBy === 'rating' || sortBy === 'rating_desc') {
    sort = { rating: -1, 'ratings.average': -1 };
  } else if (sortBy === 'popular' || sortBy === 'trending') {
    sort = { isTrending: -1, reviewCount: -1, 'ratings.count': -1 };
  } else if (sortBy === 'discount') {
    sort = { discountPercentage: -1 };
  } else if (sortBy === 'newest') {
    sort = { createdAt: -1 };
  }

  // 10. Handle Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  // 11. Execute DB queries
  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(query),
  ]);

  const pages = Math.ceil(total / limitNum) || 1;

  return {
    products: toProductDTOList(products),
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
 * Get product by ID (supports MongoDB _id, custom string id like PROD-MOB-0001, or slug).
 */
export const getProductById = async (idOrSlug) => {
  if (!idOrSlug) {
    throw new ApiError(400, 'Product identifier is required');
  }

  let product = null;

  // 1. Try finding by MongoDB _id if valid ObjectId
  if (mongoose.isValidObjectId(idOrSlug)) {
    product = await Product.findById(idOrSlug).lean();
  }

  // 2. Try finding by custom 'id' field (e.g. PROD-MOB-0001)
  if (!product) {
    product = await Product.findOne({ id: idOrSlug }).lean();
  }

  // 3. Try finding by 'slug' or 'sku'
  if (!product) {
    product = await Product.findOne({
      $or: [{ slug: idOrSlug }, { sku: idOrSlug }],
    }).lean();
  }

  if (!product) {
    throw new ApiError(404, `Product '${idOrSlug}' not found`);
  }

  return toProductDTO(product);
};

/**
 * Fetch matching product titles for search autocompletion.
 */
export const getAutocomplete = async (q) => {
  if (!q) return [];
  const matches = await productRepository.findAutocomplete(q, 10);
  return matches.map((m) => m.title || m.name).filter(Boolean);
};

/**
 * Fetch search suggestions mapping to categories, brands, and top products.
 */
export const getSuggestions = async (q) => {
  if (!q) return { categories: [], brands: [], products: [] };
  const cleanQuery = escapeRegex(q.trim());
  const regex = new RegExp(cleanQuery, 'i');

  const [categories, brands, products] = await Promise.all([
    Category.find({ name: regex }).select('name slug').limit(5).lean(),
    Brand.find({ name: regex }).select('name slug').limit(5).lean(),
    Product.find({
      $or: [{ title: regex }, { name: regex }],
    })
      .sort({ rating: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    categories,
    brands,
    products: toProductDTOList(products),
  };
};

/**
 * Internal helper to ensure some products are flagged as featured if none are.
 */
const checkAndSeedFeatured = async () => {
  const count = await Product.countDocuments({
    $or: [{ isFeatured: true }, { featured: true }],
  });
  if (count === 0) {
    const topRated = await Product.find({}).sort({ rating: -1 }).limit(15);
    if (topRated.length > 0) {
      const ids = topRated.map((p) => p._id);
      await Product.updateMany({ _id: { $in: ids } }, { $set: { isFeatured: true, featured: true } });
    }
  }
};

/**
 * Internal helper to ensure some products are flagged as trending if none are.
 */
const checkAndSeedTrending = async () => {
  const count = await Product.countDocuments({
    $or: [{ isTrending: true }, { trending: true }],
  });
  if (count === 0) {
    const topReviewed = await Product.find({}).sort({ reviewCount: -1, 'ratings.count': -1 }).limit(15);
    if (topReviewed.length > 0) {
      const ids = topReviewed.map((p) => p._id);
      await Product.updateMany({ _id: { $in: ids } }, { $set: { isTrending: true, trending: true } });
    }
  }
};

/**
 * Fetch featured products with pagination.
 */
export const getFeaturedProducts = async (queryParams = {}) => {
  const { page = 1, limit = 10 } = queryParams;
  await checkAndSeedFeatured();

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find({
      isDeleted: { $ne: true },
      $or: [{ isFeatured: true }, { featured: true }],
    })
      .sort({ rating: -1, 'ratings.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments({
      isDeleted: { $ne: true },
      $or: [{ isFeatured: true }, { featured: true }],
    }),
  ]);

  return {
    products: toProductDTOList(products),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Fetch trending products with pagination.
 */
export const getTrendingProducts = async (queryParams = {}) => {
  const { page = 1, limit = 10 } = queryParams;
  await checkAndSeedTrending();

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find({
      isDeleted: { $ne: true },
      $or: [{ isTrending: true }, { trending: true }],
    })
      .sort({ reviewCount: -1, 'ratings.count': -1, rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments({
      isDeleted: { $ne: true },
      $or: [{ isTrending: true }, { trending: true }],
    }),
  ]);

  return {
    products: toProductDTOList(products),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Fetch newest products with pagination.
 */
export const getNewestProducts = async (queryParams = {}) => {
  const { page = 1, limit = 10 } = queryParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments({ isDeleted: { $ne: true } }),
  ]);

  return {
    products: toProductDTOList(products),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Fetch recommended products with pagination.
 */
export const getRecommendedProducts = async (queryParams = {}) => {
  const { page = 1, limit = 10 } = queryParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find({ isDeleted: { $ne: true } })
      .sort({ rating: -1, 'ratings.average': -1, reviewCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments({ isDeleted: { $ne: true } }),
  ]);

  return {
    products: toProductDTOList(products),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};
