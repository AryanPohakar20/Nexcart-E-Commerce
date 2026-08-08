// src/validations/subcategoryValidation.js
// Validation schemas for Subcategory API.

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

export const validateCreateSubcategory = [
  body('name')
    .notEmpty()
    .withMessage('Subcategory name is required')
    .isString()
    .withMessage('Subcategory name must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Subcategory name must be between 2 and 50 characters'),
  body('category')
    .notEmpty()
    .withMessage('Parent category is required')
    .isMongoId()
    .withMessage('Invalid parent category ID format'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  checkValidationResult,
];

export const validateUpdateSubcategory = [
  param('id')
    .isMongoId()
    .withMessage('Invalid subcategory ID format'),
  body('name')
    .optional()
    .isString()
    .withMessage('Subcategory name must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Subcategory name must be between 2 and 50 characters'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent category ID format'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  checkValidationResult,
];

export const validateSubcategoryId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid subcategory ID format'),
  checkValidationResult,
];

export const validateCategoryId = [
  param('categoryId')
    .isMongoId()
    .withMessage('Invalid category ID format'),
  checkValidationResult,
];
