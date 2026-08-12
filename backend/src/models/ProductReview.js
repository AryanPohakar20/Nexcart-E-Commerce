import mongoose from 'mongoose';
import { ReviewStatus } from '../constants/reviewStatus.js';

const productReviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
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
    orderItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Order Item ID is required'],
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
productReviewSchema.index({ productId: 1 });
productReviewSchema.index({ sellerId: 1 });
productReviewSchema.index({ customerId: 1 });
productReviewSchema.index({ orderId: 1 });
productReviewSchema.index({ orderItemId: 1 });
productReviewSchema.index({ status: 1 });

// Compound Indexes
productReviewSchema.index({ productId: 1, status: 1 });
productReviewSchema.index({ customerId: 1, productId: 1 });
productReviewSchema.index({ orderId: 1, orderItemId: 1 });
productReviewSchema.index({ sellerId: 1, status: 1 });

const ProductReview = mongoose.model('ProductReview', productReviewSchema);
export default ProductReview;
