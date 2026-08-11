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

const router = express.Router();

// Create review
router.post('/', validateCreateProductReview, createProductReview);

// Fetch reviews for a specific product
router.get('/product/:productId', getProductReviews);

// Update review
router.patch('/:id', validateUpdateProductReview, updateProductReview);

// Delete review
router.delete('/:id', deleteProductReview);

export default router;
