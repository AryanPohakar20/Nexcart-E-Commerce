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
  createProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { validateHomepageQuery } from '../validations/productValidation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { upload } from '../middlewares/upload.js';

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

// GET /api/products/seller - Retrieve seller's own products
router.get('/seller', authenticate, authorize('seller', 'marketplace_seller'), getSellerProducts);

// GET /api/products/:id - Retrieve single product details by ID or Slug
router.get('/:id', getProductById);

// POST /api/products - Create a new product
router.post('/', authenticate, authorize('seller', 'marketplace_seller'), upload.array('images', 5), createProduct);

// PUT /api/products/:id - Update an existing product
router.put('/:id', authenticate, authorize('seller', 'marketplace_seller'), upload.array('images', 5), updateProduct);

// DELETE /api/products/:id - Delete a product
router.delete('/:id', authenticate, authorize('seller', 'marketplace_seller'), deleteProduct);

export default router;
