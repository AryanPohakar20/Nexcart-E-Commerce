// src/validations/searchHistoryValidation.js
// Validation schemas for Search History APIs in NexCart.

import { body, param, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new ApiError(400, 'Validation failed', errorMessages);
  }
  next();
};

export const validateSaveSearch = [
  body('keyword')
    .optional()
    .isString()
    .withMessage('Keyword must be a string')
    .trim(),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId'),
  body('brand')
    .optional()
    .isMongoId()
    .withMessage('Brand must be a valid MongoDB ObjectId'),
  body()
    .custom((value) => {
      const { keyword, category, brand } = value;
      const hasKeyword = keyword !== undefined && keyword !== null && keyword.trim() !== '';
      const hasCategory = category !== undefined && category !== null && category.trim() !== '';
      const hasBrand = brand !== undefined && brand !== null && brand.trim() !== '';

      if (!hasKeyword && !hasCategory && !hasBrand) {
        throw new Error('At least one search field (keyword, category, or brand) must be provided');
      }
      return true;
    }),
  checkValidationResult,
];

export const validateSearchHistoryId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid search history ID format'),
  checkValidationResult,
];
