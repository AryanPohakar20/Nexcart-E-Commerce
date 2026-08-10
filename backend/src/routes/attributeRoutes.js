// src/routes/attributeRoutes.js
// Routes for Dynamic Product Attributes management.

import express from 'express';
import {
  createAttribute,
  getAttributeById,
  getAllAttributes,
  getAttributesByCategory,
  updateAttribute,
  deleteAttribute,
} from '../controllers/attributeController.js';
import {
  validateCreateAttribute,
  validateUpdateAttribute,
  validateAttributeId,
  validateCategoryId,
} from '../validations/attributeValidation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

// Public routes
router.get('/', getAllAttributes);
router.get('/:id', validateAttributeId, getAttributeById);
router.get('/category/:categoryId', validateCategoryId, getAttributesByCategory);

// Admin-only write routes
router.post('/', authenticate, authorize('admin'), validateCreateAttribute, createAttribute);
router.patch('/:id', authenticate, authorize('admin'), validateUpdateAttribute, updateAttribute);
router.delete('/:id', authenticate, authorize('admin'), validateAttributeId, deleteAttribute);

export default router;
