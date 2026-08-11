// src/routes/productRoutes.js
// Routes for Product listings, search, and individual product details.

import express from 'express';
import {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getTrendingProducts,
  getNewestProducts,
  getRecommendedProducts,
} from '../controllers/productController.js';
import { validateHomepageQuery } from '../validations/productValidation.js';

// Review-related imports
import { authenticate } from '../middlewares/authenticate.js';
import { preProcessCreateReview } from '../middlewares/productReviewMiddleware.js';
import { validateCreateProductReview } from '../validations/productReviewValidation.js';
import {
  createProductReview,
  getProductReviews,
} from '../controllers/productReviewController.js';

const router = express.Router();

// GET /api/products - Retrieve paginated & filtered products list
router.get('/', getAllProducts);

// GET /api/products/featured - Retrieve paginated featured products list
router.get('/featured', validateHomepageQuery, getFeaturedProducts);

// GET /api/products/trending - Retrieve paginated trending products list
router.get('/trending', validateHomepageQuery, getTrendingProducts);

// GET /api/products/newest - Retrieve paginated newest products list
router.get('/newest', validateHomepageQuery, getNewestProducts);

// GET /api/products/recommended - Retrieve paginated recommended products list
router.get('/recommended', validateHomepageQuery, getRecommendedProducts);

// POST /api/products/:productId/reviews - Create a product review (authenticated)
router.post(
  '/:productId/reviews',
  authenticate,
  preProcessCreateReview,
  validateCreateProductReview,
  createProductReview
);

// GET /api/products/:productId/reviews - Get reviews for a product (authenticated)
router.get(
  '/:productId/reviews',
  authenticate,
  getProductReviews
);

// GET /api/products/:id - Retrieve single product details by ID or Slug
router.get('/:id', getProductById);

export default router;
