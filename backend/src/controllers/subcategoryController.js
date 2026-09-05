// src/controllers/subcategoryController.js
// Controllers for Subcategory module.

import { asyncHandler } from '../utils/asyncHandler.js';
import * as subcategoryService from '../services/subcategoryService.js';
import { successResponse } from '../utils/ApiResponse.js';

export const createSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await subcategoryService.createSubcategory(req.body);
  return successResponse(res, 'Subcategory created successfully', { subcategory }, 201);
});

export const getSubcategoryById = asyncHandler(async (req, res) => {
  const subcategory = await subcategoryService.getSubcategoryById(req.params.id);
  return successResponse(res, 'Subcategory fetched successfully', { subcategory });
});

export const getSubcategoryBySlug = asyncHandler(async (req, res) => {
  const subcategory = await subcategoryService.getSubcategoryBySlug(req.params.slug);
  return successResponse(res, 'Subcategory fetched successfully', { subcategory });
});

export const getAllSubcategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }
  if (req.query.category !== undefined) {
    filter.category = req.query.category;
  }
  const subcategories = await subcategoryService.getAllSubcategories(filter);
  return successResponse(res, 'Subcategories fetched successfully', { subcategories });
});

export const getSubcategoriesByCategory = asyncHandler(async (req, res) => {
  const subcategories = await subcategoryService.getSubcategoriesByCategory(req.params.categoryId);
  return successResponse(res, 'Subcategories fetched successfully for category', { subcategories });
});

export const updateSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await subcategoryService.updateSubcategory(req.params.id, req.body);
  return successResponse(res, 'Subcategory updated successfully', { subcategory });
});

export const deleteSubcategory = asyncHandler(async (req, res) => {
  await subcategoryService.deleteSubcategory(req.params.id);
  return successResponse(res, 'Subcategory deleted successfully');
});
