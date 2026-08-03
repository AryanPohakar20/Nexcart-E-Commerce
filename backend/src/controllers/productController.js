// src/controllers/productController.js
// Controllers for Product search and listing APIs.

import { asyncHandler } from '../utils/asyncHandler.js';
import * as productService from '../services/productService.js';
import { successResponse } from '../utils/ApiResponse.js';

/**
 * Handle GET /api/search
 * Search products by keyword, category, brand, price, condition, location with sorting & pagination.
 */
export const searchProducts = asyncHandler(async (req, res) => {
  const result = await productService.searchProducts(req.query);
  return successResponse(res, 'Search results fetched successfully', result);
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
