import { body, param, query, validationResult } from 'express-validator';
import { ApiError } from '../../utils/ApiError.js';
import { NOTIFICATION_TYPE_VALUES } from '../constants/notificationTypes.js';
import {
  NOTIFICATION_CATEGORY_VALUES,
  NOTIFICATION_ENTITY_TYPE_VALUES,
  NOTIFICATION_PRIORITY_VALUES,
  NOTIFICATION_ROLE_VALUES,
} from '../constants/notificationEnums.js';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new ApiError(400, 'Validation failed', errorMessages);
  }
  next();
};

export const validateNotificationCreation = [
  body('receiver').notEmpty().withMessage('Receiver is required'),
  body('receiverRole')
    .optional()
    .isIn(NOTIFICATION_ROLE_VALUES)
    .withMessage('Invalid receiver role'),
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('message').notEmpty().withMessage('Message is required').trim(),
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(NOTIFICATION_TYPE_VALUES)
    .withMessage('Invalid notification type'),
  body('category')
    .optional()
    .isIn(NOTIFICATION_CATEGORY_VALUES)
    .withMessage('Invalid notification category'),
  body('priority')
    .optional()
    .isIn(NOTIFICATION_PRIORITY_VALUES)
    .withMessage('Invalid notification priority'),
  body('relatedEntityType')
    .optional()
    .isIn(NOTIFICATION_ENTITY_TYPE_VALUES)
    .withMessage('Invalid related entity type'),
  handleValidationErrors,
];

export const validateNotificationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['read', 'unread']).withMessage('Status must be read or unread'),
  query('category').optional().isIn(NOTIFICATION_CATEGORY_VALUES).withMessage('Invalid notification category'),
  query('type').optional().isIn(NOTIFICATION_TYPE_VALUES).withMessage('Invalid notification type'),
  query('priority').optional().isIn(NOTIFICATION_PRIORITY_VALUES).withMessage('Invalid notification priority'),
  query('sortBy').optional().isIn(['newest', 'oldest', 'priority']).withMessage('Sort must be newest, oldest, or priority'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  query('search').optional().isString().trim().isLength({ min: 1 }).withMessage('Search must not be empty'),
  query('startDate').optional().isISO8601().withMessage('startDate must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('endDate must be a valid ISO date'),
  handleValidationErrors,
];

export const validateNotificationIdParam = [
  param('notificationId').isMongoId().withMessage('notificationId must be a valid MongoDB ObjectId'),
  handleValidationErrors,
];
