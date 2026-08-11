import mongoose from 'mongoose';
import { ReviewStatus } from '../constants/reviewStatus.js';

const sellerReviewSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller ID is required'],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(ReviewStatus),
      default: ReviewStatus.PUBLISHED,
    },
    // Soft Delete Fields
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Single Field Indexes
sellerReviewSchema.index({ sellerId: 1 });
sellerReviewSchema.index({ customerId: 1 });
sellerReviewSchema.index({ orderId: 1 });
sellerReviewSchema.index({ status: 1 });

// Compound Indexes
sellerReviewSchema.index({ sellerId: 1, status: 1 });
sellerReviewSchema.index({ customerId: 1, sellerId: 1 });
sellerReviewSchema.index({ orderId: 1, sellerId: 1 });

const SellerReview = mongoose.model('SellerReview', sellerReviewSchema);
export default SellerReview;
