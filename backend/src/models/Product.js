// src/models/Product.js
// Complete Product schema with full lifecycle moderation, inventory tracking, and search indexing.

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [250, 'Product name cannot exceed 250 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
      default: function () {
        return `SKU-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
      },
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    brand: {
      type: String,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Seller is required'],
      refPath: 'sellerModel',
    },
    sellerModel: {
      type: String,
      required: true,
      enum: ['User', 'Seller'],
      default: 'Seller',
    },
    sellerType: {
      type: String,
      enum: ['individual', 'business', 'seller', 'marketplace_seller'],
      default: 'seller',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare price cannot be negative'],
      default: null,
    },
    costPrice: {
      type: Number,
      min: [0, 'Cost price cannot be negative'],
      default: null,
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isOutOfStock: {
      type: Boolean,
      default: false,
    },
    condition: {
      type: String,
      enum: ['new', 'refurbished', 'used'],
      default: 'new',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Hidden', 'Inactive', 'Deleted', 'Active'],
      default: 'Approved',
    },
    approvalStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Approved',
    },
    moderation: {
      reason: { type: String, default: '' },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      reviewedAt: { type: Date, default: null },
      adminNotes: { type: String, default: '' },
    },
    images: [
      {
        public_id: { type: String, default: null },
        url: { type: String, required: true },
      },
    ],
    thumbnail: {
      type: String,
      default: null,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    attributes: [
      {
        name: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
    views: {
      type: Number,
      default: 0,
    },
    wishlistCount: {
      type: Number,
      default: 0,
    },
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Pre-validate Hook to Unify fields ───
productSchema.pre('validate', function (next) {
  if (this.name && !this.title) {
    this.title = this.name;
  } else if (this.title && !this.name) {
    this.name = this.title;
  }
  if (!this.id && this.slug) {
    this.id = this.slug;
  }
  if (this.images && Array.isArray(this.images)) {
    this.images = this.images.map(img => {
      if (typeof img === 'string') {
        return { public_id: null, url: img };
      }
      return img;
    });
  }
  next();
});

// ─── Pre-save Hook to Sync active status and stock status ───
productSchema.pre('save', function (next) {
  if (this.status) {
    this.isActive = ['Approved', 'Active'].includes(this.status);
  } else if (this.isActive !== undefined) {
    this.status = this.isActive ? 'Approved' : 'Inactive';
  }
  if (this.stock !== undefined) {
    this.isOutOfStock = this.stock <= 0;
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
productSchema.index({ seller: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ status: 1, isDeleted: 1 });
productSchema.index({ approvalStatus: 1, isDeleted: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ slug: 1, isDeleted: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ featured: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
