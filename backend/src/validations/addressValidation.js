// src/validations/addressValidation.js
// Reusable express-validator chains for address CRUD endpoints.

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

// ─── Create / Update Address Validator ───────────────────────────────────────

export const validateAddress = [
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^\+?[\d\s\-]{7,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('addressLine1')
    .notEmpty()
    .withMessage('Address line 1 is required')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address line 1 must be between 5 and 200 characters'),

  body('addressLine2')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address line 2 cannot exceed 200 characters'),

  body('city')
    .notEmpty()
    .withMessage('City is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),

  body('state')
    .notEmpty()
    .withMessage('State is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),

  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),

  body('postalCode')
    .notEmpty()
    .withMessage('Postal code is required')
    .trim()
    .matches(/^[A-Z0-9\s\-]{3,10}$/i)
    .withMessage('Please provide a valid postal code (3–10 alphanumeric characters)'),

  body('landmark')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Landmark cannot exceed 200 characters'),

  body('type')
    .optional()
    .isIn(['Home', 'Office', 'Other'])
    .withMessage('Address type must be one of: Home, Office, Other'),

  handleValidationErrors,
];

// ─── Update Address Validator (all fields optional) ───────────────────────────

export const validateAddressUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-]{7,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('addressLine1')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address line 1 must be between 5 and 200 characters'),

  body('addressLine2')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address line 2 cannot exceed 200 characters'),

  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),

  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),

  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),

  body('postalCode')
    .optional()
    .trim()
    .matches(/^[A-Z0-9\s\-]{3,10}$/i)
    .withMessage('Please provide a valid postal code'),

  body('landmark')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Landmark cannot exceed 200 characters'),

  body('type')
    .optional()
    .isIn(['Home', 'Office', 'Other'])
    .withMessage('Address type must be one of: Home, Office, Other'),

  handleValidationErrors,
];
