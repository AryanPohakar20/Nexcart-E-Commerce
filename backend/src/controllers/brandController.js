// src/controllers/brandController.js
// Controllers for Brand module.

import { asyncHandler } from '../utils/asyncHandler.js';
import * as brandService from '../services/brandService.js';
import { successResponse } from '../utils/ApiResponse.js';

export const createBrand = asyncHandler(async (req, res) => {
  const brand = await brandService.createBrand(req.body);
  return successResponse(res, 'Brand created successfully', { brand }, 201);
});

export const getBrandById = asyncHandler(async (req, res) => {
  const brand = await brandService.getBrandById(req.params.id);
  return successResponse(res, 'Brand fetched successfully', { brand });
});

export const getBrandBySlug = asyncHandler(async (req, res) => {
  const brand = await brandService.getBrandBySlug(req.params.slug);
  return successResponse(res, 'Brand fetched successfully', { brand });
});

export const getAllBrands = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status !== undefined) {
    filter.status = req.query.status;
  }
  const brands = await brandService.getAllBrands(filter);
  return successResponse(res, 'Brands fetched successfully', { brands });
});

export const updateBrand = asyncHandler(async (req, res) => {
  const brand = await brandService.updateBrand(req.params.id, req.body);
  return successResponse(res, 'Brand updated successfully', { brand });
});

export const deleteBrand = asyncHandler(async (req, res) => {
  await brandService.deleteBrand(req.params.id);
  return successResponse(res, 'Brand deleted successfully');
});

/**
 * Handle GET /api/brands/popular
 * Returns a list of popular brands.
 */
export const getPopularBrands = asyncHandler(async (req, res) => {
  const result = await brandService.getPopularBrands(req.query);
  return successResponse(res, 'Popular brands fetched successfully', result);
});
