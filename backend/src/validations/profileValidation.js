import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export const validateProfileUpdate = [
  body('fullName')
    .optional({ nullable: true })
    .isString()
    .withMessage('Full name must be a string')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('username')
    .optional({ nullable: true })
    .isString()
    .withMessage('Username must be a string')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-z0-9_]+$/)
    .withMessage('Username can only contain lowercase letters, numbers, and underscores'),
  body('mobile')
    .optional({ nullable: true })
    .isString()
    .withMessage('Mobile number must be a string')
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please add a valid mobile number'),
  body('profilePicture')
    .optional({ nullable: true })
    .isString()
    .withMessage('Profile picture must be a string')
    .trim()
    .matches(/^(https?:\/\/|\/)/i)
    .withMessage('Profile picture must be a valid URL or a local path'),
  body('dateOfBirth')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gender is invalid'),
  body('bio')
    .optional({ nullable: true })
    .isString()
    .withMessage('Bio must be a string')
    .trim()
    .isLength({ max: 250 })
    .withMessage('Bio cannot exceed 250 characters'),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      throw new ApiError(400, 'Validation failed', errorMessages);
    }

    next();
  },
];
