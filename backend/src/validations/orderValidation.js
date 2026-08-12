// src/validations/orderValidation.js
// Request validation middleware for all Order Management endpoints.
// Uses express-validator — the same library already in use throughout Main.

import { body, query, param, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';
import Order from '../models/Order.js';

// ─── Shared error handler ─────────────────────────────────────────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    throw new ApiError(400, 'Validation failed', errorMessages);
  }
  next();
};

// ─── Order Placement ──────────────────────────────────────────────────────────
export const validateOrderPlacement = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),

  body('items.*.product')
    .notEmpty().withMessage('Product ID is required for each item')
    .isMongoId().withMessage('Product ID must be a valid Mongo ID'),

  body('items.*.quantity')
    .notEmpty().withMessage('Quantity is required for each item')
    .isInt({ min: 1 }).withMessage('Quantity must be an integer of at least 1'),

  body('shippingAddress')
    .notEmpty().withMessage('Shipping address is required')
    .isObject().withMessage('Shipping address must be an object'),

  // Accept either firstName or fullName
  body('shippingAddress.firstName')
    .optional()
    .trim(),

  body('shippingAddress.fullName')
    .optional()
    .trim(),

  body('shippingAddress.phone')
    .notEmpty().withMessage('Phone number is required for shipping address')
    .trim(),

  body('shippingAddress.addressLine1')
    .optional()
    .trim(),

  body('shippingAddress.street')
    .optional()
    .trim(),

  body('shippingAddress.city')
    .notEmpty().withMessage('City is required for shipping address')
    .trim(),

  body('shippingAddress.state')
    .notEmpty().withMessage('State is required for shipping address')
    .trim(),

  body('couponCode')
    .optional()
    .isString().withMessage('Coupon code must be a string')
    .trim(),

  body('orderNotes')
    .optional()
    .isString().withMessage('Order notes must be a string')
    .trim(),

  handleValidationErrors,
];

// ─── Customer Order Listing ───────────────────────────────────────────────────
export const validateCustomerOrderListing = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'totalAmount', 'orderStatus'])
    .withMessage('Sort field must be one of: createdAt, totalAmount, orderStatus'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be one of: asc, desc'),

  query('dateFrom')
    .optional()
    .isISO8601().withMessage('dateFrom must be a valid ISO 8601 date'),

  query('dateTo')
    .optional()
    .isISO8601().withMessage('dateTo must be a valid ISO 8601 date'),

  query('orderStatus')
    .optional()
    .isString().trim().notEmpty().withMessage('orderStatus must be a non-empty string'),

  query('paymentStatus')
    .optional()
    .isString().trim().notEmpty().withMessage('paymentStatus must be a non-empty string'),

  query('search')
    .optional()
    .isString().trim(),

  handleValidationErrors,
];

// ─── Order ID param validation ────────────────────────────────────────────────
export const validateOrderId = [
  param('orderId')
    .isMongoId().withMessage('Invalid order id.'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Invalid order id.');
    }
    next();
  },
];

// ─── Order Cancellation ───────────────────────────────────────────────────────
export const validateOrderCancellation = [
  param('orderId')
    .isMongoId().withMessage('Invalid order id.'),

  body('cancellationReason')
    .exists().withMessage('Cancellation reason is required')
    .isString().withMessage('Cancellation reason must be a string')
    .trim()
    .notEmpty().withMessage('Cancellation reason cannot be empty')
    .isLength({ min: 10, max: 500 })
    .withMessage('Cancellation reason must be between 10 and 500 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const paramError = errors.array().find(e => e.path === 'orderId');
      if (paramError) throw new ApiError(400, 'Invalid order id.');
      const msgs = errors.array().map(e => e.msg);
      throw new ApiError(400, 'Validation failed', msgs);
    }
    next();
  },
];

// ─── Seller Order Listing ─────────────────────────────────────────────────────
export const validateSellerOrderListing = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'totalAmount', 'orderStatus'])
    .withMessage('Sort field must be one of: createdAt, totalAmount, orderStatus'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be one of: asc, desc'),

  query('dateFrom')
    .optional()
    .isISO8601().withMessage('dateFrom must be a valid ISO 8601 date'),

  query('dateTo')
    .optional()
    .isISO8601().withMessage('dateTo must be a valid ISO 8601 date'),

  query('orderStatus')
    .optional()
    .isString().trim().notEmpty().withMessage('orderStatus must be a non-empty string'),

  query('search')
    .optional()
    .isString().trim(),

  handleValidationErrors,
];

// ─── Seller Order Status Update ───────────────────────────────────────────────
export const validateSellerOrderStatusUpdate = [
  param('orderId')
    .isMongoId().withMessage('Invalid order id.'),

  body('status')
    .exists().withMessage('Status is required')
    .isString().withMessage('Status must be a string')
    .trim()
    .isIn(['Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered'])
    .withMessage('Status must be one of: Confirmed, Packed, Shipped, Out For Delivery, Delivered'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const paramError = errors.array().find(e => e.path === 'orderId');
      if (paramError) throw new ApiError(400, 'Invalid order id.');
      const msgs = errors.array().map(e => e.msg);
      throw new ApiError(400, 'Validation failed', msgs);
    }
    next();
  },
];

// ─── Order Analytics ──────────────────────────────────────────────────────────
export const validateOrderAnalytics = [
  query('dateFrom')
    .optional()
    .isISO8601().withMessage('dateFrom must be a valid ISO 8601 date'),

  query('dateTo')
    .optional()
    .isISO8601().withMessage('dateTo must be a valid ISO 8601 date'),

  query('sellerId')
    .optional()
    .isMongoId().withMessage('sellerId must be a valid MongoDB ObjectId'),

  query('trendType')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('trendType must be one of: daily, weekly, monthly'),

  handleValidationErrors,
];
