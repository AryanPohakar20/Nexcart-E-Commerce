import express from 'express';
import {
  createSellerReview,
  getSellerReviews,
  updateSellerReview,
  deleteSellerReview
} from '../controllers/sellerReviewController.js';
import {
  validateCreateSellerReview,
  validateUpdateSellerReview
} from '../validations/sellerReviewValidation.js';

const router = express.Router();

// Create review
router.post('/', validateCreateSellerReview, createSellerReview);

// Fetch reviews for a specific seller
router.get('/seller/:sellerId', getSellerReviews);

// Update review
router.patch('/:id', validateUpdateSellerReview, updateSellerReview);

// Delete review
router.delete('/:id', deleteSellerReview);

export default router;
