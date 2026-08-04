import { body, validationResult } from 'express-validator';
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
