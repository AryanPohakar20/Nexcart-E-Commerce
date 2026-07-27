import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

// ─── Shared: collect and throw validation errors ──────────────────────────────

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new ApiError(400, 'Validation failed', errorMessages);
  }
  next();
};

// ─── Step 1: Account Info ─────────────────────────────────────────────────────

export const validateStep1 = [
  body('displayName')
    .notEmpty()
    .withMessage('Display name is required')
    .isLength({ min: 2, max: 80 })
    .withMessage('Display name must be between 2 and 80 characters'),
  body('businessType')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Business type cannot exceed 100 characters'),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[\d\s\-]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors,
];

// ─── Step 2: Shop Profile ─────────────────────────────────────────────────────

export const validateStep2 = [
  body('shopName')
    .notEmpty()
    .withMessage('Shop name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Shop name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('city')
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .notEmpty()
    .withMessage('State is required'),
  body('pincode')
    .notEmpty()
    .withMessage('Pincode is required')
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be a valid 6-digit number'),
  handleValidationErrors,
];

// ─── Step 4: Payment Details ──────────────────────────────────────────────────

export const validateStep4 = [
  body('upiId')
    .optional({ checkFalsy: true })
    .matches(/^[\w.\-]+@[\w.\-]+$/)
    .withMessage('Please provide a valid UPI ID (e.g. username@upi)'),
  body('accountHolder')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('Account holder name must be between 2 and 100 characters'),
  body('accountNumber')
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage('Account number must contain only digits'),
  body('ifsc')
    .optional({ checkFalsy: true })
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .withMessage('Please provide a valid IFSC code (e.g. SBIN0001234)'),
  handleValidationErrors,
];
