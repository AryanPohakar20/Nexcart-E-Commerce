import { body, query, param, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new ApiError(400, 'Validation failed', errorMessages);
  }
  next();
};

export const validateReturnRequest = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order id.'),

  body('reason')
    .exists()
    .withMessage('Reason is required')
    .isString()
    .withMessage('Reason must be a string')
    .trim()
    .notEmpty()
    .withMessage('Reason cannot be empty or only whitespace'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim(),

  handleValidationErrors,
];

export const validateAdminReturnListing = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer (at least 1)'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer between 1 and 100'),

  query('status')
    .optional()
    .isString()
    .trim()
    .custom((val) => {
      const allowed = ['pending', 'approved', 'rejected'];
      if (!allowed.includes(val.toLowerCase())) {
        throw new Error('Status must be one of: Pending, Approved, Rejected');
      }
      return true;
    }),

  query('refundStatus')
    .optional()
    .isString()
    .trim()
    .custom((val) => {
      const allowed = ['pending', 'refund completed', 'refundcompleted'];
      if (!allowed.includes(val.toLowerCase())) {
        throw new Error('refundStatus must be one of: Pending, Refund Completed');
      }
      return true;
    }),

  query('customerId')
    .optional()
    .isMongoId()
    .withMessage('customerId must be a valid MongoDB ObjectId'),

  query('sellerId')
    .optional()
    .isMongoId()
    .withMessage('sellerId must be a valid MongoDB ObjectId'),

  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('dateFrom must be a valid ISO 8601 date (e.g. YYYY-MM-DD)'),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('dateTo must be a valid ISO 8601 date (e.g. YYYY-MM-DD)'),

  query('search')
    .optional()
    .isString()
    .trim(),

  handleValidationErrors,
];

export const validateReturnId = [
  param('returnId')
    .exists()
    .withMessage('Return ID is required')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Return ID cannot be empty'),

  handleValidationErrors,
];

export const validateReturnReview = [
  param('returnId')
    .exists()
    .withMessage('Return ID is required')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Return ID cannot be empty'),

  body('status')
    .optional()
    .isString()
    .trim()
    .isIn(['Approved', 'Rejected'])
    .withMessage('Status must be one of: Approved, Rejected'),

  body('refundStatus')
    .optional()
    .isString()
    .trim()
    .isIn(['Refund Completed'])
    .withMessage('refundStatus must be: Refund Completed'),

  body('rejectionReason')
    .optional()
    .isString()
    .trim()
    .custom((val, { req }) => {
      if (req.body.status === 'Rejected' && (!val || val.length === 0)) {
        throw new Error('Rejection reason is required when status is Rejected.');
      }
      return true;
    }),

  handleValidationErrors,
];
