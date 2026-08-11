import express from 'express';
import {
  createProductReview,
  getProductReviews,
  updateProductReview,
  deleteProductReview
} from '../controllers/productReviewController.js';
import {
  validateCreateProductReview,
  validateUpdateProductReview
} from '../validations/productReviewValidation.js';

import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

// Create review
router.post('/', validateCreateProductReview, createProductReview);

// Fetch reviews for a specific product
router.get('/product/:productId', getProductReviews);

// Update review
router.patch('/:id', authenticate, validateUpdateProductReview, updateProductReview);

// Delete review
router.delete('/:id', authenticate, deleteProductReview);

export default router;
