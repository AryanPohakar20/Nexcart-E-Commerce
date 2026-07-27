// src/validations/attributeValidation.js
// Validation schemas for Attribute API.

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

export const validateCreateAttribute = [
  body('name')
    .notEmpty()
    .withMessage('Attribute name is required')
    .isString()
    .withMessage('Attribute name must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Attribute name must be between 2 and 50 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Parent category is required')
    .isMongoId()
    .withMessage('Invalid parent category ID format'),

  body('subcategory')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid subcategory ID format'),

  body('type')
    .notEmpty()
    .withMessage('Attribute type is required')
    .isIn(['text', 'number', 'select', 'boolean', 'multi-select'])
    .withMessage('Invalid attribute type. Must be one of text, number, select, boolean, multi-select'),

  body('options')
    .optional()
    .isArray()
    .withMessage('Options must be an array of strings')
    .custom((value, { req }) => {
      const type = req.body.type;
      if (type === 'select' || type === 'multi-select') {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Options array must be provided with at least one option for select/multi-select types');
        }
        if (value.some((opt) => typeof opt !== 'string' || opt.trim() === '')) {
          throw new Error('All options must be non-empty strings');
        }
      } else {
        if (value && value.length > 0) {
          throw new Error('Options should not be provided for this attribute type');
        }
      }
      return true;
    }),

  body('isRequired')
    .optional()
    .isBoolean()
    .withMessage('isRequired must be a boolean value'),

  body('defaultValue')
    .optional({ nullable: true })
    .custom((value, { req }) => {
      const type = req.body.type;
      const options = req.body.options || [];

      if (value === null || value === undefined) return true;

      if (type === 'boolean') {
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          throw new Error('Default value must be a boolean');
        }
      } else if (type === 'number') {
        if (isNaN(Number(value))) {
          throw new Error('Default value must be a number');
        }
      } else if (type === 'select') {
        if (!options.includes(value)) {
          throw new Error('Default value must be one of the specified options');
        }
      } else if (type === 'multi-select') {
        if (!Array.isArray(value)) {
          throw new Error('Default value for multi-select must be an array');
        }
        if (value.some((val) => !options.includes(val))) {
          throw new Error('All default values must be chosen from the specified options');
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

export const validateUpdateAttribute = [
  param('id')
    .isMongoId()
    .withMessage('Invalid attribute ID format'),

  body('name')
    .optional()
    .isString()
    .withMessage('Attribute name must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Attribute name must be between 2 and 50 characters'),

  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent category ID format'),

  body('subcategory')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid subcategory ID format'),

  body('type')
    .optional()
    .isIn(['text', 'number', 'select', 'boolean', 'multi-select'])
    .withMessage('Invalid attribute type. Must be one of text, number, select, boolean, multi-select'),

  body('options')
    .optional()
    .isArray()
    .withMessage('Options must be an array of strings'),

  body('isRequired')
    .optional()
    .isBoolean()
    .withMessage('isRequired must be a boolean value'),

  body('defaultValue')
    .optional({ nullable: true }),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  checkValidationResult,
];

export const validateAttributeId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid attribute ID format'),
  checkValidationResult,
];

export const validateCategoryId = [
  param('categoryId')
    .isMongoId()
    .withMessage('Invalid category ID format'),
  checkValidationResult,
];
