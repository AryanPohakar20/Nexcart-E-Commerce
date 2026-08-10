// src/controllers/productController.js
// Controllers for Product search and listing APIs.

import { asyncHandler } from '../utils/asyncHandler.js';
import * as productService from '../services/productService.js';
import { successResponse } from '../utils/ApiResponse.js';

/**
 * Handle GET /api/products and GET /api/search
 * Search & filter products by keyword, category, brand, price, rating, stock with sorting & pagination.
 */
export const searchProducts = asyncHandler(async (req, res) => {
  const result = await productService.searchProducts(req.query);
  return successResponse(res, 'Products fetched successfully', result);
});

export const getAllProducts = searchProducts;

/**
 * Handle GET /api/products/:id
 * Fetch single product by MongoDB ID, custom ID (e.g. PROD-MOB-0001), or slug.
 */
export const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return successResponse(res, 'Product fetched successfully', { product });
});

/**
 * Handle GET /api/search/autocomplete
 * Returns autocomplete terms starting with the search prefix q.
 */
export const getAutocomplete = asyncHandler(async (req, res) => {
  const suggestions = await productService.getAutocomplete(req.query.q);
  return successResponse(res, 'Autocomplete suggestions fetched successfully', { suggestions });
});

/**
 * Handle GET /api/search/suggestions
 * Returns suggested categories, brands, and top matching products for q.
 */
export const getSuggestions = asyncHandler(async (req, res) => {
  const result = await productService.getSuggestions(req.query.q);
  return successResponse(res, 'Search suggestions fetched successfully', result);
});

/**
 * Handle GET /api/products/featured
 * Returns a paginated list of featured products.
 */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const result = await productService.getFeaturedProducts(req.query);
  return successResponse(res, 'Featured products fetched successfully', result);
});

/**
 * Handle GET /api/products/trending
 * Returns a paginated list of trending products.
 */
export const getTrendingProducts = asyncHandler(async (req, res) => {
  const result = await productService.getTrendingProducts(req.query);
  return successResponse(res, 'Trending products fetched successfully', result);
});

/**
 * Handle GET /api/products/newest
 * Returns a paginated list of newest products.
 */
export const getNewestProducts = asyncHandler(async (req, res) => {
  const result = await productService.getNewestProducts(req.query);
  return successResponse(res, 'Newest products fetched successfully', result);
});

/**
 * Handle GET /api/products/recommended
 * Returns a paginated list of recommended products.
 */
export const getRecommendedProducts = asyncHandler(async (req, res) => {
  const result = await productService.getRecommendedProducts(req.query);
  return successResponse(res, 'Recommended products fetched successfully', result);
});
