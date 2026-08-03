import { body, param, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new ApiError(400, 'Validation failed', errorMessages);
  }
  next();
};

export const validateAddToCart = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isString()
    .withMessage('Product ID must be a string'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer and at least 1'),
  body('selectedColor')
    .optional()
    .isString()
    .withMessage('Selected color must be a string'),
  body('selectedSize')
    .optional()
    .isString()
    .withMessage('Selected size must be a string'),
  body('selectedVariant')
    .optional()
    .isString()
    .withMessage('Selected variant must be a string'),
  body('priceAtAddition')
    .notEmpty()
    .withMessage('Price at addition is required')
    .isNumeric()
    .withMessage('Price at addition must be a number'),
  validateResult
];

export const validateUpdateCart = [
  param('productId')
    .notEmpty()
    .withMessage('Product ID parameter is required'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer and at least 1'),
  validateResult
];

export const validateApplyCoupon = [
  body('code')
    .notEmpty()
    .withMessage('Coupon code is required')
    .isString()
    .withMessage('Coupon code must be a string'),
  validateResult
];

export const validateProductIdOnly = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isString()
    .withMessage('Product ID must be a string'),
  validateResult
];
