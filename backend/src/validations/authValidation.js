import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export const validateRegistration = [
  body('ownerName')
    .if(body('ownerName').exists())
    .notEmpty()
    .withMessage('Owner name is required'),
  body('firstName')
    .if(body('ownerName').not().exists())
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .if(body('ownerName').not().exists())
    .notEmpty()
    .withMessage('Last name is required'),
  body('username')
    .if(body('ownerName').not().exists())
    .notEmpty()
    .withMessage('Username is required'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('businessName')
    .if(body('ownerName').exists())
    .notEmpty()
    .withMessage('Business name is required'),
  body('businessType')
    .if(body('ownerName').exists())
    .notEmpty()
    .withMessage('Business type is required'),
  body('gstNumber')
    .if(body('ownerName').exists())
    .notEmpty()
    .withMessage('GST number is required'),
  body('address')
    .if(body('ownerName').exists())
    .notEmpty()
    .withMessage('Address is required'),
  body('city')
    .if(body('ownerName').exists())
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .if(body('ownerName').exists())
    .notEmpty()
    .withMessage('State is required'),
  body('country')
    .if(body('ownerName').exists())
    .notEmpty()
    .withMessage('Country is required'),
  body('pincode')
    .if(body('ownerName').exists())
    .notEmpty()
    .withMessage('Pincode is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      throw new ApiError(400, 'Validation failed', errorMessages);
    }
    next();
  },
];

export const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      throw new ApiError(400, 'Validation failed', errorMessages);
    }
    next();
  },
];

export const validateSellerRegistration = [
  body('ownerName')
    .notEmpty()
    .withMessage('Owner name is required'),
  body('businessName')
    .notEmpty()
    .withMessage('Business name is required'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('businessType')
    .notEmpty()
    .withMessage('Business type is required'),
  body('gstNumber')
    .notEmpty()
    .withMessage('GST number is required'),
  body('address')
    .notEmpty()
    .withMessage('Address is required'),
  body('city')
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .notEmpty()
    .withMessage('State is required'),
  body('country')
    .notEmpty()
    .withMessage('Country is required'),
  body('pincode')
    .notEmpty()
    .withMessage('Pincode is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      throw new ApiError(400, 'Validation failed', errorMessages);
    }
    next();
  },
];
