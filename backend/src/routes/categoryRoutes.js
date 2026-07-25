// src/routes/categoryRoutes.js
// Routes for Category management.

import express from 'express';
import {
  createCategory,
  getCategoryById,
  getCategoryBySlug,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
} from '../validations/categoryValidation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', validateCategoryId, getCategoryById);
router.get('/slug/:slug', getCategoryBySlug);

// Admin-only write routes
router.post('/', authenticate, authorize('admin'), validateCreateCategory, createCategory);
router.patch('/:id', authenticate, authorize('admin'), validateUpdateCategory, updateCategory);
router.delete('/:id', authenticate, authorize('admin'), validateCategoryId, deleteCategory);

export default router;
