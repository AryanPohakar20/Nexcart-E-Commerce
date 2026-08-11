import { body, param, query, validationResult } from 'express-validator';
import { AppError } from '../middlewares/errorMiddleware.js';

// Middleware to check validation result and throw AppError if validation fails
export const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => `${err.path}: ${err.msg}`).join(', ');
    throw new AppError(`Validation failed: ${errorMessages}`, 400);
  }
  next();
};

export const createConversationValidation = [
  body('participantId')
    .notEmpty()
    .withMessage('participantId is required')
    .isMongoId()
    .withMessage('participantId must be a valid MongoId'),
  body('productId')
    .optional()
    .isMongoId()
    .withMessage('productId must be a valid MongoId'),
  body('listingId')
    .optional()
    .isMongoId()
    .withMessage('listingId must be a valid MongoId'),
  validateResult,
];

export const sendMessageValidation = [
  body('conversationId')
    .notEmpty()
    .withMessage('conversationId is required')
    .isMongoId()
    .withMessage('conversationId must be a valid MongoId'),
  body('receiverId')
    .notEmpty()
    .withMessage('receiverId is required')
    .isMongoId()
    .withMessage('receiverId must be a valid MongoId'),
  body('message')
    .optional()
    .isString()
    .trim()
    .escape(),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'location', 'offer', 'meetup', 'system'])
    .withMessage('Invalid messageType'),
  validateResult,
];

export const offerValidation = [
  body('conversationId')
    .notEmpty()
    .withMessage('conversationId is required')
    .isMongoId(),
  body('sellerId')
    .notEmpty()
    .withMessage('sellerId is required')
    .isMongoId(),
  body('offerPrice')
    .notEmpty()
    .withMessage('offerPrice is required')
    .isFloat({ min: 0.01 })
    .withMessage('offerPrice must be a positive number'),
  body('originalPrice')
    .optional()
    .isFloat({ min: 0 }),
  validateResult,
];

export const reportUserValidation = [
  body('reportedUserId')
    .notEmpty()
    .withMessage('reportedUserId is required')
    .isMongoId(),
  body('reason')
    .notEmpty()
    .withMessage('reason is required')
    .isString()
    .trim()
    .escape(),
  body('description')
    .optional()
    .isString()
    .trim()
    .escape(),
  validateResult,
];
