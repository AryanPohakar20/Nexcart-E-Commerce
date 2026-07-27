// src/routes/brandRoutes.js
// Routes for Brand management.

import express from 'express';
import {
  createBrand,
  getBrandById,
  getBrandBySlug,
  getAllBrands,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController.js';
import {
  validateCreateBrand,
  validateUpdateBrand,
  validateBrandId,
} from '../validations/brandValidation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

// Public routes
router.get('/', getAllBrands);
router.get('/:id', validateBrandId, getBrandById);
router.get('/slug/:slug', getBrandBySlug);

// Admin-only write routes
router.post('/', authenticate, authorize('admin'), validateCreateBrand, createBrand);
router.put('/:id', authenticate, authorize('admin'), validateUpdateBrand, updateBrand);
router.delete('/:id', authenticate, authorize('admin'), validateBrandId, deleteBrand);

export default router;
