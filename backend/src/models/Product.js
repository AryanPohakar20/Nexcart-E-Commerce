// src/models/Product.js
// Schema definition for the Product model in NexCart.

import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
  {
    variantName: {
      type: String,
      required: [true, 'Variant name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Variant price is required'],
      min: [0, 'Price must be non-negative'],
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, 'Product SKU ID is required'],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Brand reference is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: [true, 'Subcategory reference is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative'],
    },
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      min: [0, 'Original price must be non-negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage must be non-negative'],
      max: [100, 'Discount percentage cannot exceed 100'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count must be non-negative'],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity must be non-negative'],
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    colorOptions: {
      type: [String],
      default: [],
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    topHighlights: {
      type: [String],
      default: [],
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    images: {
      type: [String],
      default: [],
    },
    thumbnail: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    seller: {
      type: String,
      trim: true,
      default: '',
    },
    warranty: {
      type: String,
      trim: true,
      default: '',
    },
    condition: {
      type: String,
      enum: {
        values: ['new', 'refurbished', 'used'],
        message: '{VALUE} is not a valid product condition',
      },
      default: 'new',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Search optimization: Indexes on critical fields
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ condition: 1 });
productSchema.index({ location: 1 });
productSchema.index({ rating: 1 });
productSchema.index({ createdAt: -1 });

// Text index for keyword search across title, description, and tags
productSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
});

productSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Product = mongoose.model('Product', productSchema);
export default Product;
