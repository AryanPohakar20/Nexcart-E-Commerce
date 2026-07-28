import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';

/**
 * Validator middleware for Profile Updates.
 * Enforces validation on editable fields (fullName, phone/mobile, dob/dateOfBirth, gender, bio)
 * and restricts sensitive fields from being updated.
 */
export const validateProfileUpdate = [
  // Reject updates to sensitive or protected fields
  (req, res, next) => {
    const sensitiveFields = [
      'password',
      'email',
      'role',
      'isVerified',
      'isBlocked',
      'status',
      'refreshToken',
      'otp',
      'aadhaar',
    ];

    const attemptedSensitiveFields = sensitiveFields.filter(
      (field) => Object.prototype.hasOwnProperty.call(req.body, field)
    );

    if (attemptedSensitiveFields.length > 0) {
      throw new ApiError(
        400,
        `Updating sensitive field(s) '${attemptedSensitiveFields.join(', ')}' is not allowed`
      );
    }

    next();
  },

  // Validate Full Name
  body('fullName')
    .optional({ nullable: true })
    .isString()
    .withMessage('Full name must be a string')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  // Validate Phone / Mobile format & uniqueness
  body('phone')
    .optional({ nullable: true })
    .isString()
    .withMessage('Phone number must be a string')
    .trim()
    .matches(/^\+?[\d\s\-]{7,15}$/)
    .withMessage('Please provide a valid phone number (7 to 15 digits)')
    .custom(async (value, { req }) => {
      if (!value) return true;
      const existingUser = await User.findOne({
        $or: [{ phone: value }, { mobile: value }],
        _id: { $ne: req.user?._id },
      });
      if (existingUser) {
        throw new Error('Phone number is already in use by another account');
      }
      return true;
    }),

  body('mobile')
    .optional({ nullable: true })
    .isString()
    .withMessage('Mobile number must be a string')
    .trim()
    .matches(/^\+?[\d\s\-]{7,15}$/)
    .withMessage('Please provide a valid mobile number (7 to 15 digits)')
    .custom(async (value, { req }) => {
      if (!value) return true;
      const existingUser = await User.findOne({
        $or: [{ phone: value }, { mobile: value }],
        _id: { $ne: req.user?._id },
      });
      if (existingUser) {
        throw new Error('Mobile number is already in use by another account');
      }
      return true;
    }),

  // Validate Date of Birth (dob & dateOfBirth)
  body('dob')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Date of birth must be a valid ISO 8601 date (YYYY-MM-DD)')
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),

  body('dateOfBirth')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Date of birth must be a valid ISO 8601 date (YYYY-MM-DD)')
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),

  // Validate Gender
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gender must be one of: male, female, other, prefer_not_to_say'),

  // Validate Biography
  body('bio')
    .optional({ nullable: true })
    .isString()
    .withMessage('Biography must be a string')
    .trim()
    .isLength({ max: 250 })
    .withMessage('Biography cannot exceed 250 characters'),

  // Final check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      throw new ApiError(400, 'Validation failed', errorMessages);
    }

    next();
  },
];

export default {
  validateProfileUpdate,
};
