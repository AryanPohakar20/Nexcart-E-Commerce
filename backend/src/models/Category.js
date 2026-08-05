// src/models/Category.js
// Category schema with hierarchical tree structure, slug indexing, and soft-delete.

import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    level: {
      type: Number,
      default: 0, // 0 = Root, 1 = Subcategory, 2 = Leaf
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    order: {
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

// ─── Indexes ──────────────────────────────────────────────────────────────────
categorySchema.index({ slug: 1, isDeleted: 1 });
categorySchema.index({ parent: 1, status: 1 });
categorySchema.index({ isDeleted: 1, status: 1 });
categorySchema.index({ name: 'text', description: 'text' });

const Category = mongoose.model('Category', categorySchema);
export default Category;
