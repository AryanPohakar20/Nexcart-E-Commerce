import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyerName: {
      type: String,
      trim: true,
      default: 'Verified Buyer',
    },
    buyerAvatar: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    productTitle: {
      type: String,
      trim: true,
      default: 'Marketplace Order',
    },
    orderType: {
      type: String,
      trim: true,
      default: 'Verified Purchase',
    },
  },
  { timestamps: true }
);

reviewSchema.index({ seller: 1, createdAt: -1 });
reviewSchema.index({ buyer: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
