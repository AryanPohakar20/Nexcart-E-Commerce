import { body, param } from 'express-validator';
import { REPORT_STATUS } from '../constants/reviewReport.js';

/**
 * Validation middleware for admin moderation of review reports.
 * - reportId must be a valid MongoDB ObjectId.
 * - action must be one of: hide, remove, restore, reject.
 * - reason is optional for hide/restore, required for remove/reject, max 500 chars.
 */
export const validateAdminReviewModeration = [
  param('reportId')
    .isMongoId()
    .withMessage('Invalid report ID'),
  body('action')
    .isIn(['hide', 'remove', 'restore', 'reject', 'under_review'])
    .withMessage('Action must be hide, remove, restore, reject, or under_review'),
  body('reason')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 500 })
    .withMessage('Reason must be at most 500 characters'),
];
