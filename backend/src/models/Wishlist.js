import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    productId: {
      type: String, // String ID matching custom Product ID
      ref: 'Product',
      required: true
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    productInformation: {
      title: { type: String, required: true },
      price: { type: Number, required: true },
      discountPrice: { type: Number },
      brand: { type: String },
      imageUrl: { type: String },
      stockStatus: { type: String }
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Ensure a user cannot add the same product to their wishlist multiple times
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
