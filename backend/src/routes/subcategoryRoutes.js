// src/routes/subcategoryRoutes.js
// Routes for Subcategory management.

import express from 'express';
import {
  createSubcategory,
  getSubcategoryById,
  getSubcategoryBySlug,
  getAllSubcategories,
  getSubcategoriesByCategory,
  updateSubcategory,
  deleteSubcategory,
} from '../controllers/subcategoryController.js';
import {
  validateCreateSubcategory,
  validateUpdateSubcategory,
  validateSubcategoryId,
  validateCategoryId,
} from '../validations/subcategoryValidation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

// Public routes
router.get('/', getAllSubcategories);
router.get('/:id', validateSubcategoryId, getSubcategoryById);
router.get('/slug/:slug', getSubcategoryBySlug);
router.get('/category/:categoryId', validateCategoryId, getSubcategoriesByCategory);

// Admin-only write routes
router.post('/', authenticate, authorize('admin'), validateCreateSubcategory, createSubcategory);
router.patch('/:id', authenticate, authorize('admin'), validateUpdateSubcategory, updateSubcategory);
router.delete('/:id', authenticate, authorize('admin'), validateSubcategoryId, deleteSubcategory);

export default router;
