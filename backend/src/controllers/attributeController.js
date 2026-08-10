// src/controllers/attributeController.js
// Controllers for Attribute module.

import { asyncHandler } from '../utils/asyncHandler.js';
import * as attributeService from '../services/attributeService.js';
import { successResponse } from '../utils/ApiResponse.js';

export const createAttribute = asyncHandler(async (req, res) => {
  const attribute = await attributeService.createAttribute(req.body);
  return successResponse(res, 'Attribute created successfully', { attribute }, 201);
});

export const getAttributeById = asyncHandler(async (req, res) => {
  const attribute = await attributeService.getAttributeById(req.params.id);
  return successResponse(res, 'Attribute fetched successfully', { attribute });
});

export const getAllAttributes = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }
  if (req.query.category !== undefined) {
    filter.category = req.query.category;
  }
  if (req.query.subcategory !== undefined) {
    // Enable filtering attributes specifically defined with no subcategory (null)
    filter.subcategory = req.query.subcategory === 'null' ? null : req.query.subcategory;
  }
  if (req.query.type !== undefined) {
    filter.type = req.query.type;
  }

  const attributes = await attributeService.getAllAttributes(filter);
  return successResponse(res, 'Attributes fetched successfully', { attributes });
});

export const getAttributesByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const subcategoryFilter = req.query.subcategory;

  const attributes = await attributeService.getAttributesByCategory(categoryId, subcategoryFilter);
  return successResponse(res, 'Attributes fetched successfully for category', { attributes });
});

export const updateAttribute = asyncHandler(async (req, res) => {
  const attribute = await attributeService.updateAttribute(req.params.id, req.body);
  return successResponse(res, 'Attribute updated successfully', { attribute });
});

export const deleteAttribute = asyncHandler(async (req, res) => {
  await attributeService.deleteAttribute(req.params.id);
  return successResponse(res, 'Attribute deleted successfully');
});
