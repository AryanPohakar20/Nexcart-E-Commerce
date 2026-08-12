import { body, param, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';
import { BUSINESS_CATEGORIES } from '../models/Seller.js';

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

// ─── Dashboard: Profile Update ────────────────────────────────────────────────

export const validateProfileUpdate = [
  // Shared fields
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^\+?[\d\s\-]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('address')
    .optional({ checkFalsy: true })
    .isLength({ max: 300 })
    .withMessage('Address cannot exceed 300 characters'),
  body('city')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('state')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('country')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('pincode')
    .optional({ checkFalsy: true })
    .matches(/^\d{4,10}$/)
    .withMessage('Please provide a valid pincode'),

  // Individual seller fields
  body('fullName')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('about')
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('About cannot exceed 1000 characters'),

  // Business seller fields
  body('businessName')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 150 })
    .withMessage('Business name must be between 2 and 150 characters'),
  body('ownerName')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('Owner name must be between 2 and 100 characters'),
  body('businessDescription')
    .optional({ checkFalsy: true })
    .isLength({ max: 2000 })
    .withMessage('Business description cannot exceed 2000 characters'),
  body('businessCategory')
    .optional({ checkFalsy: true })
    .isIn([...BUSINESS_CATEGORIES, ''])
    .withMessage(`Business category must be one of: ${BUSINESS_CATEGORIES.join(', ')}`),
  body('website')
    .optional({ checkFalsy: true })
    .isURL({ require_protocol: false })
    .withMessage('Please provide a valid website URL'),
  body('gst')
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Please provide a valid GST number (e.g. 29ABCDE1234F1Z5)'),

  handleValidationErrors,
];

// ─── Dashboard: Settings Update ───────────────────────────────────────────────

export const validateSettingsUpdate = [
  // Notifications
  body('notifications.orders').optional().isBoolean().withMessage('notifications.orders must be a boolean'),
  body('notifications.reviews').optional().isBoolean().withMessage('notifications.reviews must be a boolean'),
  body('notifications.promotions').optional().isBoolean().withMessage('notifications.promotions must be a boolean'),
  body('notifications.email').optional().isBoolean().withMessage('notifications.email must be a boolean'),
  body('notifications.sms').optional().isBoolean().withMessage('notifications.sms must be a boolean'),

  // Privacy
  body('privacy.showPhone').optional().isBoolean().withMessage('privacy.showPhone must be a boolean'),
  body('privacy.showEmail').optional().isBoolean().withMessage('privacy.showEmail must be a boolean'),
  body('privacy.publicProfile').optional().isBoolean().withMessage('privacy.publicProfile must be a boolean'),

  // Shipping
  body('shipping.pickupAvailable').optional().isBoolean().withMessage('shipping.pickupAvailable must be a boolean'),
  body('shipping.shippingEnabled').optional().isBoolean().withMessage('shipping.shippingEnabled must be a boolean'),
  body('shipping.deliveryCharges')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('shipping.deliveryCharges must be a non-negative number'),

  // Returns
  body('returns.acceptsReturns').optional().isBoolean().withMessage('returns.acceptsReturns must be a boolean'),
  body('returns.returnWindow')
    .optional()
    .isInt({ min: 0, max: 90 })
    .withMessage('returns.returnWindow must be between 0 and 90 days'),

  handleValidationErrors,
];

// ─── Dashboard: Password Change ───────────────────────────────────────────────

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

export const validateGetSellerReputation = [
  param('sellerId')
    .notEmpty()
    .withMessage('Seller ID is required')
    .isMongoId()
    .withMessage('Invalid Seller User ID format'),
  handleValidationErrors,
];
