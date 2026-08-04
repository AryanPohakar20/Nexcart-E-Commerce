import { body, validationResult } from 'express-validator';
import { ApiError } from '../../utils/ApiError.js';
import { NOTIFICATION_TYPE_VALUES } from '../constants/notificationTypes.js';
import {
  NOTIFICATION_CATEGORY_VALUES,
  NOTIFICATION_ENTITY_TYPE_VALUES,
  NOTIFICATION_PRIORITY_VALUES,
  NOTIFICATION_ROLE_VALUES,
} from '../constants/notificationEnums.js';

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
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      throw new ApiError(400, 'Validation failed', errorMessages);
    }
    next();
  },
];

export const validateNotificationRead = [
  body('notificationId').notEmpty().withMessage('notificationId is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      throw new ApiError(400, 'Validation failed', errorMessages);
    }
    next();
  },
];
