// src/models/Report.js
// Dispute & Incident model for the Marketplace Trust & Safety Center.

import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['counterfeit', 'payment', 'abuse', 'fraud', 'other'],
      default: 'other',
      index: true,
    },
    target: {
      type: String,
      required: true,
      trim: true,
    },
    targetType: {
      type: String,
      enum: ['Seller', 'Product', 'User', 'Order'],
      default: 'Seller',
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    reporter: {
      type: String,
      required: true,
      trim: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'resolved', 'dismissed'],
      default: 'open',
      index: true,
    },
    resolutionAction: {
      type: String,
      enum: ['dismiss', 'resolve', 'ban_entity', 'none'],
      default: 'none',
    },
    adminRemarks: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ status: 1, priority: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
