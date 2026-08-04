import { body, query, param, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export const validateOrderPlacement = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  
  body('items.*.product')
    .notEmpty()
    .withMessage('Product ID is required for each item')
    .isMongoId()
    .withMessage('Product ID must be a valid Mongo ID'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required for each item')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer of at least 1'),

  body('shippingAddress')
    .notEmpty()
    .withMessage('Shipping address is required')
    .isObject()
    .withMessage('Shipping address must be an object'),

  body('shippingAddress.firstName')
    .notEmpty()
    .withMessage('First name is required for shipping address')
    .trim(),

  body('shippingAddress.lastName')
    .notEmpty()
    .withMessage('Last name is required for shipping address')
    .trim(),

  body('shippingAddress.phone')
    .notEmpty()
    .withMessage('Phone number is required for shipping address')
    .trim(),

  body('shippingAddress.street')
    .notEmpty()
    .withMessage('Street address is required for shipping address')
    .trim(),

  body('shippingAddress.city')
    .notEmpty()
    .withMessage('City is required for shipping address')
    .trim(),

  body('shippingAddress.state')
    .notEmpty()
    .withMessage('State is required for shipping address')
    .trim(),

  body('shippingAddress.zipCode')
    .notEmpty()
    .withMessage('Zip/Postal code is required for shipping address')
    .trim(),

  body('couponCode')
    .optional()
    .isString()
    .withMessage('Coupon code must be a string')
    .trim(),

  body('orderNotes')
    .optional()
    .isString()
    .withMessage('Order notes must be a string')
    .trim(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      throw new ApiError(400, 'Validation failed', errorMessages);
    }
    next();
  },
];

export const validateCustomerOrderListing = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer (at least 1)'),
  
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit must be a positive integer (at least 1)'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'grandTotal', 'orderStatus'])
    .withMessage('Sort field must be one of: createdAt, grandTotal, orderStatus'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be one of: asc, desc'),
  
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('dateFrom must be a valid ISO 8601 date (e.g. YYYY-MM-DD)'),
  
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('dateTo must be a valid ISO 8601 date (e.g. YYYY-MM-DD)'),
  
  query('orderStatus')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('orderStatus must be a non-empty string'),
  
  query('paymentStatus')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('paymentStatus must be a non-empty string'),
  
  query('paymentMethod')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('paymentMethod must be a non-empty string'),
  
  query('search')
    .optional()
    .isString()
    .trim(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      throw new ApiError(400, 'Validation failed', errorMessages);
    }
    next();
  },
];

export const validateOrderId = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order id.'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Invalid order id.');
    }
    next();
  },
];

export const validateOrderCancellation = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order id.'),

  body('cancellationReason')
    .exists()
    .withMessage('Cancellation reason is required')
    .isString()
    .withMessage('Cancellation reason must be a string')
    .trim()
    .notEmpty()
    .withMessage('Cancellation reason cannot be empty or only whitespace')
    .isLength({ min: 10, max: 500 })
    .withMessage('Cancellation reason must be between 10 and 500 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const paramError = errors.array().find((err) => err.path === 'orderId');
      if (paramError) {
        throw new ApiError(400, 'Invalid order id.');
      }

      const errorMessages = errors.array().map((err) => err.msg);
      throw new ApiError(400, 'Validation failed', errorMessages);
    }
    next();
  },
];

export const validateSellerOrderListing = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer (at least 1)'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be a positive integer between 1 and 50'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'grandTotal', 'orderStatus'])
    .withMessage('Sort field must be one of: createdAt, grandTotal, orderStatus'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be one of: asc, desc'),

  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('dateFrom must be a valid ISO 8601 date (e.g. YYYY-MM-DD)'),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('dateTo must be a valid ISO 8601 date (e.g. YYYY-MM-DD)'),

  query('orderStatus')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('orderStatus must be a non-empty string'),

  query('paymentStatus')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('paymentStatus must be a non-empty string'),

  query('paymentMethod')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('paymentMethod must be a non-empty string'),

  query('search')
    .optional()
    .isString()
    .trim(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      throw new ApiError(400, 'Validation failed', errorMessages);
    }
    next();
  },
];
