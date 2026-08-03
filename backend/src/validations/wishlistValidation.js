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

export const validateAddToWishlist = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isString()
    .withMessage('Product ID must be a string'),
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('userEmail')
    .notEmpty()
    .withMessage('User email is required')
    .isEmail()
    .withMessage('Must be a valid email address'),
  body('productInformation')
    .notEmpty()
    .withMessage('Product information is required')
    .isObject()
    .withMessage('Product information must be an object'),
  body('productInformation.title')
    .notEmpty()
    .withMessage('Product title is required'),
  body('productInformation.price')
    .notEmpty()
    .withMessage('Product price is required')
    .isNumeric()
    .withMessage('Price must be a number'),
  validateResult
];

export const validateWishlistParamProductId = [
  param('productId')
    .notEmpty()
    .withMessage('Product ID parameter is required'),
  validateResult
];
