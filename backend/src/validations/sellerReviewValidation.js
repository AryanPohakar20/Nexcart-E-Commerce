import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new ApiError(400, 'Validation failed', errorMessages);
  }
  next();
};

export const validateCreateSellerReview = [
  body('sellerId')
    .notEmpty()
    .withMessage('Seller ID is required')
    .isMongoId()
    .withMessage('Seller ID must be a valid Mongo ID'),

  body('customerId')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isMongoId()
    .withMessage('Customer ID must be a valid Mongo ID'),

  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Order ID must be a valid Mongo ID'),

  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5')
    .toInt(),

  body('comment')
    .optional()
    .isString()
    .withMessage('Comment must be a string')
    .trim(),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array of strings')
    .custom((arr) => {
      if (arr && !arr.every(item => typeof item === 'string')) {
        throw new Error('All images must be strings');
      }
      return true;
    }),

  checkValidationResult,
];

export const validateUpdateSellerReview = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5')
    .toInt(),

  body('comment')
    .optional()
    .isString()
    .withMessage('Comment must be a string')
    .trim(),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array of strings')
    .custom((arr) => {
      if (arr && !arr.every(item => typeof item === 'string')) {
        throw new Error('All images must be strings');
      }
      return true;
    }),

  checkValidationResult,
];
