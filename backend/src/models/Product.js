// src/models/Product.js
// Complete Product schema with full lifecycle moderation, inventory tracking, and search indexing.

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    // CORE PRODUCT INFORMATION
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [250, 'Product title cannot exceed 250 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: [true, 'Seller is required'],
    },
    sellerType: {
      type: String,
      enum: ['individual', 'business', 'seller', 'marketplace_seller'],
      default: 'seller',
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
      default: function () {
        return `SKU-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
      },
    },
    barcode: {
      type: String,
      trim: true,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },

    // PRICING
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    mrp: {
      type: Number,
      min: [0, 'MRP cannot be negative'],
      default: null,
    },
    discountPercentage: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    taxIncluded: {
      type: Boolean,
      default: true,
    },
    taxPercentage: {
      type: Number,
      min: 0,
      default: 0,
    },
    allowNegotiation: {
      type: Boolean,
      default: false,
    },
    priceHistory: [
      {
        price: Number,
        date: { type: Date, default: Date.now },
      },
    ],

    // INVENTORY
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    reservedStock: {
      type: Number,
      min: 0,
      default: 0,
    },
    soldQuantity: {
      type: Number,
      min: 0,
      default: 0,
    },
    minimumStock: {
      type: Number,
      min: 0,
      default: 5,
    },
    inventoryStatus: {
      type: String,
      enum: ['Available', 'Out Of Stock', 'Reserved', 'Sold', 'Expired'],
      default: 'Available',
    },

    // MEDIA
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: null },
        alt: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
        displayOrder: { type: Number, default: 0 },
      },
    ],

    // SPECIFICATIONS
    specifications: [
      {
        name: { type: String, trim: true, required: true },
        value: { type: String, trim: true, required: true },
        unit: { type: String, trim: true, default: '' },
        group: { type: String, trim: true, default: 'General' },
      },
    ],

    // DELIVERY
    delivery: {
      shippingType: { type: String, default: 'Standard' },
      deliveryCharge: { type: Number, min: 0, default: 0 },
      estimatedDays: { type: Number, min: 1, default: 5 },
      freeDelivery: { type: Boolean, default: false },
      cashOnDelivery: { type: Boolean, default: false },
      returnAvailable: { type: Boolean, default: false },
      returnWindow: { type: Number, min: 0, default: 0 },
    },

    // PRODUCT CONDITION
    condition: {
      type: String,
      enum: ['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Refurbished', 'Used'],
      default: 'New',
    },
    purchaseYear: { type: Number, default: null },
    usageDuration: { type: String, default: '' },
    originalBillAvailable: { type: Boolean, default: false },
    warrantyAvailable: { type: Boolean, default: false },
    warrantyRemaining: { type: String, default: '' },

    // MARKETPLACE INFORMATION
    sellerDisplayName: { type: String, default: '' },
    sellerVerified: { type: Boolean, default: false },
    trustScoreSnapshot: { type: Number, default: 0 },

    // STATISTICS
    views: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    cartCount: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },

    // STATUS
    status: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Active', 'Hidden', 'Sold', 'Expired', 'Rejected', 'Deleted'],
      default: 'Active',
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

    // SEO
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    searchKeywords: { type: [String], default: [] },

    // FEATURE FLAGS
    featured: { type: Boolean, default: false },
    recommended: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    boosted: { type: Boolean, default: false },
    flashSale: { type: Boolean, default: false },

    // AUDIT
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
productSchema.index({ slug: 1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ status: 1, isDeleted: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
