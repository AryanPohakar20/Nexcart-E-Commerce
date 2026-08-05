import { body, param, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new ApiError(400, 'Validation failed', errorMessages);
  }
  next();
};

const notificationTypeValues = ['Promotion', 'Offer', 'Discount', 'Recommendation', 'Announcement', 'Order Update', 'System Alert', 'Custom'];
const publishStatusValues = ['draft', 'scheduled', 'published', 'unpublished'];

const validateScheduleWindow = (value, { req }) => {
  if (req.body.scheduledAt && req.body.expiresAt) {
    const scheduledAt = new Date(req.body.scheduledAt);
    const expiresAt = new Date(req.body.expiresAt);

    if (Number.isNaN(scheduledAt.getTime()) || Number.isNaN(expiresAt.getTime())) {
      throw new Error('scheduledAt and expiresAt must be valid dates');
    }

    if (expiresAt <= scheduledAt) {
      throw new Error('expiresAt must be later than scheduledAt');
    }
  }

  return true;
};

export const validateNotificationId = [
  param('id').isMongoId().withMessage('Notification id must be a valid MongoDB ObjectId'),
  handleValidationErrors,
];

export const validateNotificationCreate = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 120 })
    .withMessage('Title must be between 3 and 120 characters'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 5, max: 5000 })
    .withMessage('Message must be between 5 and 5000 characters'),
  body('notificationType')
    .notEmpty()
    .withMessage('Notification type is required')
    .isIn(notificationTypeValues)
    .withMessage('Invalid notification type'),
  body('targetAudience')
    .notEmpty()
    .withMessage('Target audience is required')
    .isString()
    .withMessage('Target audience must be a string')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Target audience must be between 1 and 200 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'critical'])
    .withMessage('Priority must be one of: low, normal, high, critical'),
  body('publishStatus')
    .optional()
    .isIn(publishStatusValues)
    .withMessage('Invalid publish status'),
  body('scheduledAt')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('scheduledAt must be a valid ISO 8601 date'),
  body('expiresAt')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('expiresAt must be a valid ISO 8601 date')
    .custom(validateScheduleWindow),
  body('image')
    .optional({ nullable: true })
    .isString()
    .withMessage('Image must be a string')
    .trim()
    .isLength({ max: 2048 })
    .withMessage('Image must not exceed 2048 characters'),
  body('actionUrl')
    .optional({ nullable: true })
    .isString()
    .withMessage('Action URL must be a string')
    .trim()
    .isLength({ max: 2048 })
    .withMessage('Action URL must not exceed 2048 characters'),
  body('metadata').optional({ nullable: true }).isObject().withMessage('metadata must be an object'),
  handleValidationErrors,
];

export const validateNotificationUpdate = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 120 })
    .withMessage('Title must be between 3 and 120 characters'),
  body('message')
    .optional()
    .isLength({ min: 5, max: 5000 })
    .withMessage('Message must be between 5 and 5000 characters'),
  body('notificationType')
    .optional()
    .isIn(notificationTypeValues)
    .withMessage('Invalid notification type'),
  body('targetAudience')
    .optional()
    .isString()
    .withMessage('Target audience must be a string')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Target audience must be between 1 and 200 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'critical'])
    .withMessage('Priority must be one of: low, normal, high, critical'),
  body('scheduledAt')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('scheduledAt must be a valid ISO 8601 date'),
  body('expiresAt')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('expiresAt must be a valid ISO 8601 date')
    .custom(validateScheduleWindow),
  body('image')
    .optional({ nullable: true })
    .isString()
    .withMessage('Image must be a string')
    .trim()
    .isLength({ max: 2048 })
    .withMessage('Image must not exceed 2048 characters'),
  body('actionUrl')
    .optional({ nullable: true })
    .isString()
    .withMessage('Action URL must be a string')
    .trim()
    .isLength({ max: 2048 })
    .withMessage('Action URL must not exceed 2048 characters'),
  body('metadata').optional({ nullable: true }).isObject().withMessage('metadata must be an object'),
  handleValidationErrors,
];