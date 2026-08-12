// src/models/Return.js
// Return request model — from Manjusha branch, adapted to reference Main's
// User, Order, and established naming conventions.

import mongoose from 'mongoose';

const returnTimelineEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Human-readable actor label ('Admin', 'Customer', 'Seller', 'System')
    updatedBy: {
      type: String,
      default: 'Admin',
    },
    message: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const returnSchema = new mongoose.Schema(
  {
    // Auto-generated unique return identifier (e.g. RET-123456)
    returnId: {
      type: String,
      unique: true,
      trim: true,
    },

    // References Main's Order model
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
    },

    // References Main's User model (the customer who requested the return)
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
    },

    // Customer-provided reason for return
    reason: {
      type: String,
      required: [true, 'Return reason is required'],
      trim: true,
    },

    // Optional extended description
    description: {
      type: String,
      trim: true,
      default: '',
    },

    // When the return was requested
    requestedAt: {
      type: Date,
      default: Date.now,
    },

    // Admin approval workflow status
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },

    // Refund completion status (separate from approval)
    refundStatus: {
      type: String,
      enum: ['Pending', 'Refund Completed'],
      default: 'Pending',
    },

    // Admin-provided reason when rejecting
    rejectionReason: {
      type: String,
      trim: true,
    },

    // When the physical item was returned / refund was completed
    returnedAt: {
      type: Date,
      default: null,
    },

    // Timeline history for this return request
    timeline: {
      type: [returnTimelineEventSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Pre-validate: Generate returnId ─────────────────────────────────────────
returnSchema.pre('validate', function (next) {
  if (!this.returnId) {
    this.returnId = `RET-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
returnSchema.index({ orderId: 1 });
returnSchema.index({ customerId: 1 });
returnSchema.index({ status: 1 });
returnSchema.index({ refundStatus: 1 });
returnSchema.index({ createdAt: -1 });

const Return = mongoose.model('Return', returnSchema);
export default Return;
