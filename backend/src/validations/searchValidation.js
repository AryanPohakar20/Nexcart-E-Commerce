// src/validations/searchValidation.js
// Validation schemas for Search APIs in NexCart.

import { query, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new ApiError(400, 'Validation failed', errorMessages);
  }
  next();
};

export const validateSearchQuery = [
  query('keyword')
    .optional()
    .isString()
    .withMessage('Keyword must be a string')
    .trim(),
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string')
    .trim(),
  query('subcategory')
    .optional()
    .isString()
    .withMessage('Subcategory must be a string')
    .trim(),
  query('brand')
    .optional()
    .isString()
    .withMessage('Brand must be a string')
    .trim(),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minPrice must be a non-negative number')
    .toFloat(),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxPrice must be a non-negative number')
    .toFloat(),
  query('condition')
    .optional()
    .isIn(['new', 'refurbished', 'used'])
    .withMessage('Condition must be one of: new, refurbished, used'),
  query('location')
    .optional()
    .isString()
    .withMessage('Location must be a string')
    .trim(),
  query('sortBy')
    .optional()
    .isIn(['price-low-high', 'price-high-low', 'rating', 'newest', 'featured'])
    .withMessage('sortBy must be one of: price-low-high, price-high-low, rating, newest, featured'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100')
    .toInt(),
  checkValidationResult,
];

export const validateQueryText = [
  query('q')
    .notEmpty()
    .withMessage('Search query text (q) is required')
    .isString()
    .withMessage('Search query text (q) must be a string')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query text (q) must be at least 1 character long'),
  checkValidationResult,
];
