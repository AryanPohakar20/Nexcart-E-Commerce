// src/validations/profileValidation.js
// Reusable express-validator chains for profile & password endpoints.

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

// ─── Profile Update Validator ─────────────────────────────────────────────────

export const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-]{7,15}$/)
    .withMessage('Please provide a valid phone number (7–15 digits)'),

  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid ISO 8601 date (YYYY-MM-DD)')
    .custom((value) => {
      const dob = new Date(value);
      const now = new Date();
      if (dob >= now) throw new Error('Date of birth must be in the past');
      const age = (now - dob) / (1000 * 60 * 60 * 24 * 365.25);
      if (age > 120) throw new Error('Please provide a realistic date of birth');
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be one of: Male, Female, Other'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  handleValidationErrors,
];

// ─── Password Change Validator ────────────────────────────────────────────────

export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from the current password');
      }
      return true;
    }),

  handleValidationErrors,
];

// ─── Settings Update Validator ────────────────────────────────────────────────

export const validateSettingsUpdate = [
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('notifications.email must be a boolean'),

  body('notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('notifications.sms must be a boolean'),

  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('notifications.push must be a boolean'),

  body('privacy.showEmail')
    .optional()
    .isBoolean()
    .withMessage('privacy.showEmail must be a boolean'),

  body('privacy.showPhone')
    .optional()
    .isBoolean()
    .withMessage('privacy.showPhone must be a boolean'),

  body('language')
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Language must be a valid locale code (e.g. en, hi, ta)'),

  body('theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be one of: light, dark'),

  handleValidationErrors,
];
