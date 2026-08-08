// src/validations/brandValidation.js
// Validation schemas for Brand API.

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

export const validateCreateBrand = [
  body('name')
    .notEmpty()
    .withMessage('Brand name is required')
    .isString()
    .withMessage('Brand name must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Brand name must be between 2 and 50 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim(),

  body('logo')
    .optional({ nullable: true })
    .isObject()
    .withMessage('Logo must be an object')
    .custom((logoObj) => {
      if (!logoObj.public_id || typeof logoObj.public_id !== 'string' || logoObj.public_id.trim() === '') {
        throw new Error('Logo public_id is required and must be a non-empty string');
      }
      if (!logoObj.url || typeof logoObj.url !== 'string' || logoObj.url.trim() === '') {
        throw new Error('Logo url is required and must be a non-empty string');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),

  checkValidationResult,
];

export const validateUpdateBrand = [
  param('id')
    .isMongoId()
    .withMessage('Invalid brand ID format'),

  body('name')
    .optional()
    .isString()
    .withMessage('Brand name must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Brand name must be between 2 and 50 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim(),

  body('logo')
    .optional({ nullable: true })
    .isObject()
    .withMessage('Logo must be an object')
    .custom((logoObj) => {
      if (logoObj === null) return true;
      if (!logoObj.public_id || typeof logoObj.public_id !== 'string' || logoObj.public_id.trim() === '') {
        throw new Error('Logo public_id is required and must be a non-empty string');
      }
      if (!logoObj.url || typeof logoObj.url !== 'string' || logoObj.url.trim() === '') {
        throw new Error('Logo url is required and must be a non-empty string');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),

  checkValidationResult,
];

export const validateBrandId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid brand ID format'),
  checkValidationResult,
];
