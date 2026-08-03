// src/routes/productRoutes.js
// Routes for Product listings (Featured, Trending).

import express from 'express';
import {
  getFeaturedProducts,
  getTrendingProducts,
} from '../controllers/productController.js';
import { validateHomepageQuery } from '../validations/productValidation.js';

const router = express.Router();

// GET /api/products/featured - Retrieve paginated featured products list
router.get('/featured', validateHomepageQuery, getFeaturedProducts);

// GET /api/products/trending - Retrieve paginated trending products list
router.get('/trending', validateHomepageQuery, getTrendingProducts);

export default router;
