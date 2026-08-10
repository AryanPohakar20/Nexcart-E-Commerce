import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=300&q=80',
    },
    images: [{ type: String }],
    category: {
      type: String,
      required: true,
      default: 'General',
    },
    condition: {
      type: String,
      default: 'Like New',
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'paused'],
      default: 'available',
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Engagement metrics for Seller & Admin
    viewsCount: { type: Number, default: 0 },
    clicksCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    messagesCount: { type: Number, default: 0 },
    offersCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    revenueGenerated: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ sellerId: 1, createdAt: -1 });
productSchema.index({ category: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
