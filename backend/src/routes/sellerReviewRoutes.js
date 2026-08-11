import express from 'express';
import {
  createSellerReview,
  updateSellerReview,
  deleteSellerReview
} from '../controllers/sellerReviewController.js';
import {
  validateCreateSellerReview,
  validateUpdateSellerReview
} from '../validations/sellerReviewValidation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { preProcessCreateSellerReview } from '../middlewares/sellerReviewMiddleware.js';

const router = express.Router();

// Create Seller Review
// Matches: POST /sellers/:sellerId/reviews
router.post('/:sellerId/reviews', authenticate, preProcessCreateSellerReview, validateCreateSellerReview, createSellerReview);

// Update Seller Review
// Matches: PATCH /seller-reviews/:id
router.patch('/:id', authenticate, validateUpdateSellerReview, updateSellerReview);

// Delete Seller Review
// Matches: DELETE /seller-reviews/:id
router.delete('/:id', authenticate, deleteSellerReview);

export default router;
