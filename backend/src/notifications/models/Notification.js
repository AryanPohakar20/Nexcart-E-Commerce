import mongoose from 'mongoose';
import {
  NOTIFICATION_CATEGORY_VALUES,
  NOTIFICATION_ENTITY_TYPE_VALUES,
  NOTIFICATION_PRIORITY_VALUES,
  NOTIFICATION_ROLE_VALUES,
} from '../constants/notificationEnums.js';
import { NOTIFICATION_TYPE_VALUES } from '../constants/notificationTypes.js';

const notificationSchema = new mongoose.Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required'],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    receiverRole: {
      type: String,
      enum: NOTIFICATION_ROLE_VALUES,
      required: [true, 'Receiver role is required'],
      default: 'customer',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: 160,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPE_VALUES,
      required: [true, 'Notification type is required'],
      index: true,
    },
    category: {
      type: String,
      enum: NOTIFICATION_CATEGORY_VALUES,
      default: 'general',
      index: true,
    },
    priority: {
      type: String,
      enum: NOTIFICATION_PRIORITY_VALUES,
      default: 'medium',
      index: true,
    },
    relatedEntityRef: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    relatedEntityType: {
      type: String,
      enum: NOTIFICATION_ENTITY_TYPE_VALUES,
      default: null,
    },
    metadata: {
      type: Object,
      default: {},
    },
    actionUrl: {
      type: String,
      trim: true,
      default: null,
    },
    icon: {
      type: String,
      trim: true,
      default: 'bell',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ receiver: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ receiver: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ category: 1, createdAt: -1 });
notificationSchema.index({ receiverRole: 1, createdAt: -1 });
notificationSchema.index({ isDeleted: 1, createdAt: -1 });

notificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
