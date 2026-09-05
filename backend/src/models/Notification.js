// src/models/Notification.js
// Stores administrative and platform notifications/alerts.

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['verification', 'report', 'order', 'inventory', 'alert', 'import', 'system', 'platform'],
      default: 'platform',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    notificationType: {
      type: String,
      enum: [
        'Success',
        'Warning',
        'Error',
        'Information',
        'Announcement',
        'Promotion',
        'Offer',
        'Discount',
        'Recommendation',
        'Order Update',
        'Seller Update',
        'Product Update',
        'Account Alert',
        'Security Alert',
        'Maintenance',
        'System Alert',
        'System Update',
        'Custom',
      ],
      default: 'Announcement',
      index: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'general',
    },
    actionText: {
      type: String,
      trim: true,
      default: '',
    },
    icon: {
      type: String,
      trim: true,
      default: '',
    },
    targetAudience: {
      type: String,
      trim: true,
      default: 'all',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'critical'],
      default: 'normal',
      index: true,
    },
    publishStatus: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'unpublished'],
      default: 'published',
      index: true,
    },
    scheduledAt: {
      type: Date,
      default: null,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    actionUrl: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    recipientRole: {
      type: String,
      enum: ['admin', 'super_admin', 'moderator', 'support_staff', 'seller', 'customer', 'all'],
      default: 'admin',
      index: true,
    },
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    link: {
      type: String,
      trim: true,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipientRole: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipientUser: 1, read: 1, createdAt: -1 });
notificationSchema.index({ publishStatus: 1, createdAt: -1 });
notificationSchema.index({ notificationType: 1, createdAt: -1 });
notificationSchema.index({ createdBy: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
