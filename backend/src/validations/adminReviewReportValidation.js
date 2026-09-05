import { query, param, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';
import { REPORT_REASONS, REPORT_STATUS } from '../constants/reviewReport.js';
import { ReviewType } from '../constants/reviewStatus.js';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new ApiError(400, 'Validation failed', errorMessages);
  }
  next();
};

export const validateAdminReviewReportsList = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer between 1 and 100'),
  query('status')
    .optional()
    .isIn(Object.values(REPORT_STATUS))
    .withMessage(`Status must be one of: ${Object.values(REPORT_STATUS).join(', ')}`),
  query('reviewType')
    .optional()
    .isIn(Object.values(ReviewType))
    .withMessage(`reviewType must be one of: ${Object.values(ReviewType).join(', ')}`),
  query('reason')
    .optional()
    .isIn(Object.values(REPORT_REASONS))
    .withMessage(`Reason must be one of: ${Object.values(REPORT_REASONS).join(', ')}`),
  query('sort')
    .optional()
    .isIn(['newest', 'oldest'])
    .withMessage('Sort criteria must be either "newest" or "oldest"'),
  handleValidationErrors,
];

export const validateAdminReviewReportId = [
  param('reportId')
    .notEmpty()
    .withMessage('Report ID is required')
    .isMongoId()
    .withMessage('Invalid Report ID format'),
  handleValidationErrors,
];
