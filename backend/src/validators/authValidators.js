// src/validators/authValidators.js
// express-validator chains for all authentication endpoints.
// Each validator is an array of check() rules to be spread into route definitions.
// The validationResult() check is handled in the controller via handleValidation().

import { body, validationResult } from 'express-validator';
import { errorResponse } from '../utils/ApiResponse.js';

/**
 * Run validationResult and send error response if there are failures.
 * Call at the top of each controller that uses a validator.
 * @returns {boolean} true if there are errors (controller should return early)
 */
export const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    errorResponse(res, 'Validation failed.', formatted, 422);
    return true; // Signal: errors exist
  }
  return false;
};

// ─── Register Validator ───────────────────────────────────────────────────────
export const registerValidator = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2–50 characters.'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2–50 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),

  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-]{7,15}$/).withMessage('Please enter a valid phone number.'),
];

// ─── Login Validator ──────────────────────────────────────────────────────────
export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

// ─── Forgot Password Validator ────────────────────────────────────────────────
export const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
];

// ─── Verify OTP Validator ─────────────────────────────────────────────────────
export const verifyOtpValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required.')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits.')
    .isNumeric().withMessage('OTP must contain only digits.'),

  body('purpose')
    .optional()
    .isIn(['emailVerification', 'passwordReset'])
    .withMessage('Purpose must be emailVerification or passwordReset.'),
];

// ─── Reset Password Validator ─────────────────────────────────────────────────
export const resetPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required.')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits.')
    .isNumeric().withMessage('OTP must contain only digits.'),

  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
];
