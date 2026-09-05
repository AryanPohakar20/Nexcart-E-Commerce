// src/validations/categoryValidation.js
// Validation schemas for Category API.

import { body, param, query, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new ApiError(400, 'Validation failed', errorMessages);
  }
  next();
};

export const validateCreateCategory = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isString()
    .withMessage('Category name must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim(),
  body('image')
    .optional()
    .custom((value) => {
      if (value !== null && value !== undefined) {
        if (typeof value !== 'object' || Array.isArray(value)) {
          throw new Error('Image must be an object');
        }
        if (!value.public_id || typeof value.public_id !== 'string' || value.public_id.trim() === '') {
          throw new Error('Image must contain a valid public_id string');
        }
        if (!value.url || typeof value.url !== 'string' || value.url.trim() === '') {
          throw new Error('Image must contain a valid url string');
        }
      }
      return true;
    }),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  checkValidationResult,
];

export const validateUpdateCategory = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID format'),
  body('name')
    .optional()
    .isString()
    .withMessage('Category name must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim(),
  body('image')
    .optional()
    .custom((value) => {
      if (value !== null && value !== undefined) {
        if (typeof value !== 'object' || Array.isArray(value)) {
          throw new Error('Image must be an object');
        }
        if (!value.public_id || typeof value.public_id !== 'string' || value.public_id.trim() === '') {
          throw new Error('Image must contain a valid public_id string');
        }
        if (!value.url || typeof value.url !== 'string' || value.url.trim() === '') {
          throw new Error('Image must contain a valid url string');
        }
      }
      return true;
    }),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  checkValidationResult,
];

export const validateCategoryId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID format'),
  checkValidationResult,
];

export const validateGetCategoryFilters = [
  param('categoryIdentifier')
    .notEmpty()
    .withMessage('Category identifier is required')
    .isString()
    .withMessage('Category identifier must be a string')
    .trim(),
  query('subcategory')
    .optional()
    .isString()
    .withMessage('Subcategory identifier must be a string')
    .trim(),
  checkValidationResult,
];

