import { body, param, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';
import { REPORT_REASONS } from '../constants/reviewReport.js';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new ApiError(400, 'Validation failed', errorMessages);
  }
  next();
};

export const validateReviewReport = [
  param('reviewId')
    .notEmpty()
    .withMessage('Review ID is required')
    .isMongoId()
    .withMessage('Invalid Review ID format'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isIn(Object.values(REPORT_REASONS))
    .withMessage(`Invalid report reason. Supported values: ${Object.values(REPORT_REASONS).join(', ')}`),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  handleValidationErrors,
];
