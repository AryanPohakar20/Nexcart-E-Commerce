// src/services/productService.js
// Service implementation for the Product search features in NexCart.

import * as productRepository from '../repositories/productRepository.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Subcategory from '../models/Subcategory.js';
import Attribute from '../models/Attribute.js';
import { ApiError } from '../utils/ApiError.js';
import mongoose from 'mongoose';

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
  if (slug.includes('graphics') || name.toLowerCase().includes('graphics') || slug.includes('gpu') || name.toLowerCase().includes('gpu')) {
    keys.add('Graphics Card Description');
    keys.add('Graphics Coprocessor');
    keys.add('Graphics Card');
    keys.add('GPU');
  }
  if (slug.includes('storage') || name.toLowerCase().includes('storage') || slug.includes('memory') || name.toLowerCase().includes('memory')) {
    keys.add('Memory Storage Capacity');
    keys.add('Storage Capacity');
  }
  
  return Array.from(keys);
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
  let categoryDoc = null;

  // 1. Resolve Category Slug/Name/ID to ObjectId
  if (category) {
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

  // 1b. Resolve Subcategory Slug/Name/ID to ObjectId if provided
  let subcategoryDoc = null;
  const subcategory = filters.subcategory;
  if (subcategory) {
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
    if (!subcategoryDoc) {
      throw new ApiError(404, `Subcategory '${subcategory}' not found`);
    }
    query.subcategory = subcategoryDoc._id;

    // Verify subcategory belongs to category (if category was also specified)
    if (categoryDoc) {
      const subcatCategoryId = subcategoryDoc.category?._id || subcategoryDoc.category;
      if (subcatCategoryId.toString() !== categoryDoc._id.toString()) {
        throw new ApiError(400, 'The specified subcategory does not belong to the category');
      }
    } else {
      // Resolve categoryDoc from subcategory to support dynamic filtering when only subcategory is passed
      const parentCatId = subcategoryDoc.category?._id || subcategoryDoc.category;
      categoryDoc = await Category.findById(parentCatId);
    }
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

  // 2b. Dynamic Product Attribute Filtering
  if (categoryDoc) {
    const attrQuery = {
      category: categoryDoc._id,
      isActive: true,
    };
    if (subcategoryDoc) {
      attrQuery.subcategory = { $in: [null, subcategoryDoc._id] };
    } else {
      attrQuery.subcategory = null;
    }

    const activeAttributes = await Attribute.find(attrQuery);

    const specQueries = [];
    for (const attr of activeAttributes) {
      const val = filters[attr.slug] || filters[attr.name] || 
                  filters[attr.slug.toLowerCase()] || filters[attr.name.toLowerCase()];

      if (val !== undefined && val !== '') {
        const cleanVal = String(val).trim();
        const escapedVal = escapeRegex(cleanVal);
        const regexStr = escapedVal
          .replace(/\s+/g, '')
          .replace(/([0-9]+)([a-zA-Z]+)/g, '$1\\s*$2')
          .replace(/([a-zA-Z]+)([0-9]+)/g, '$1\\s*$2');
        const valRegex = new RegExp(`^${regexStr}$`, 'i');

        const possibleKeys = getPossibleKeys(attr.name, attr.slug);
        
        // Adapt to main's Product schema: specs is [{key, val}] not a flat object.
        // Use $elemMatch to match any spec entry whose key is one of the possibleKeys
        // and whose val matches the regex.
        specQueries.push({
          specs: {
            $elemMatch: {
              key: { $in: possibleKeys },
              val: valRegex,
            },
          },
        });
      }
    }

    if (specQueries.length > 0) {
      query.$and = query.$and || [];
      query.$and.push(...specQueries);
    }
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

/**
 * Internal helper to ensure some products are flagged as featured if none are.
 */
const checkAndSeedFeatured = async () => {
  const count = await Product.countDocuments({ isFeatured: true });
  if (count === 0) {
    // Flag the top 15 highest-rated products as featured
    const topRated = await Product.find({}).sort({ rating: -1 }).limit(15);
    if (topRated.length > 0) {
      const ids = topRated.map((p) => p._id);
      await Product.updateMany({ _id: { $in: ids } }, { $set: { isFeatured: true } });
    }
  }
};

/**
 * Internal helper to ensure some products are flagged as trending if none are.
 */
const checkAndSeedTrending = async () => {
  const count = await Product.countDocuments({ isTrending: true });
  if (count === 0) {
    // Flag the top 15 highest-reviewed products as trending
    const topReviewed = await Product.find({}).sort({ reviewCount: -1 }).limit(15);
    if (topReviewed.length > 0) {
      const ids = topReviewed.map((p) => p._id);
      await Product.updateMany({ _id: { $in: ids } }, { $set: { isTrending: true } });
    }
  }
};

/**
 * Fetch featured products with pagination and safety auto-seeding.
 */
export const getFeaturedProducts = async (queryParams) => {
  const { page = 1, limit = 10 } = queryParams;
  
  // Safety check: Auto-flag products if none exist
  await checkAndSeedFeatured();
  
  const skip = (page - 1) * limit;
  const products = await productRepository.findFeatured(limit, skip);
  const total = await productRepository.countFeatured();
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
 * Fetch trending products with pagination and safety auto-seeding.
 */
export const getTrendingProducts = async (queryParams) => {
  const { page = 1, limit = 10 } = queryParams;
  
  // Safety check: Auto-flag products if none exist
  await checkAndSeedTrending();
  
  const skip = (page - 1) * limit;
  const products = await productRepository.findTrending(limit, skip);
  const total = await productRepository.countTrending();
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
 * Fetch newest products with pagination.
 */
export const getNewestProducts = async (queryParams) => {
  const { page = 1, limit = 10 } = queryParams;
  const skip = (page - 1) * limit;

  const products = await productRepository.findNewest(limit, skip);
  const total = await productRepository.countNewest();
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
 * Fetch recommended products with pagination.
 */
export const getRecommendedProducts = async (queryParams) => {
  const { page = 1, limit = 10 } = queryParams;
  const skip = (page - 1) * limit;

  const products = await productRepository.findRecommended(limit, skip);
  const total = await productRepository.countRecommended();
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
