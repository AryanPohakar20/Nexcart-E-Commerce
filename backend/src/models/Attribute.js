// src/models/Attribute.js
// Schema definition for the Attribute model.

import mongoose from 'mongoose';

const attributeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Attribute name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Parent category is required'],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      default: null,
    },
    type: {
      type: String,
      enum: {
        values: ['text', 'number', 'select', 'boolean', 'multi-select'],
        message: '{VALUE} is not a supported attribute type',
      },
      required: [true, 'Attribute type is required'],
    },
    options: {
      type: [String],
      default: [],
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure attribute name and slug are unique within the same category and subcategory scope
attributeSchema.index({ category: 1, subcategory: 1, name: 1 }, { unique: true });
attributeSchema.index({ category: 1, subcategory: 1, slug: 1 }, { unique: true });

attributeSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Attribute = mongoose.model('Attribute', attributeSchema);
export default Attribute;
