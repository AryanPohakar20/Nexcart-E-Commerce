import express from 'express';
import {
  createSellerReview,
  getSellerReviews,
  updateSellerReview,
  deleteSellerReview
} from '../controllers/sellerReviewController.js';
import {
  reportSellerReview
} from '../controllers/reviewReportController.js';
import {
  validateCreateSellerReview,
  validateUpdateSellerReview,
  validateGetSellerReviews
} from '../validations/sellerReviewValidation.js';
import {
  validateReviewReport
} from '../validations/reviewReportValidation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { preProcessCreateSellerReview } from '../middlewares/sellerReviewMiddleware.js';

const router = express.Router();

// Create Seller Review
// Matches: POST /sellers/:sellerId/reviews
router.post('/:sellerId/reviews', authenticate, preProcessCreateSellerReview, validateCreateSellerReview, createSellerReview);

// Fetch Seller Reviews
// Matches: GET /sellers/:sellerId/reviews
router.get('/:sellerId/reviews', validateGetSellerReviews, getSellerReviews);

// Update Seller Review
// Matches: PATCH /seller-reviews/:id
router.patch('/:id', authenticate, validateUpdateSellerReview, updateSellerReview);

// Delete Seller Review
// Matches: DELETE /seller-reviews/:id
router.delete('/:id', authenticate, deleteSellerReview);

// Report Seller Review
// Matches: POST /seller-reviews/:reviewId/report
router.post('/:reviewId/report', authenticate, validateReviewReport, reportSellerReview);

export default router;
