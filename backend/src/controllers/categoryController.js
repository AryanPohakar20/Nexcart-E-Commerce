// src/controllers/categoryController.js
// Controllers for Category module.

import { asyncHandler } from '../utils/asyncHandler.js';
import * as categoryService from '../services/categoryService.js';
import { successResponse } from '../utils/ApiResponse.js';

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  return successResponse(res, 'Category created successfully', { category }, 201);
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  return successResponse(res, 'Category fetched successfully', { category });
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  return successResponse(res, 'Category fetched successfully', { category });
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.isActive !== undefined) {
    // Handle parsing of isActive as a boolean from string query param
    filter.isActive = req.query.isActive === 'true';
  }
  const categories = await categoryService.getAllCategories(filter);
  return successResponse(res, 'Categories fetched successfully', { categories });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  return successResponse(res, 'Category updated successfully', { category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  return successResponse(res, 'Category deleted successfully');
});
