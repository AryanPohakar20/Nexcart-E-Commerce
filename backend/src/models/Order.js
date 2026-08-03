import mongoose from 'mongoose';
import { ORDER_STATUS, ALL_ORDER_STATUSES } from '../constants/orderStatus.js';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // Snapshots to preserve historical data
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Item price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const deliveryAddressSnapshotSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      default: 'India',
      trim: true,
    },
  },
  { _id: false }
);

const paymentSummarySchema = new mongoose.Schema(
  {
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paymentGateway: {
      type: String,
      trim: true,
    },
    paidAt: {
      type: Date,
    },
  },
  { _id: false }
);

const orderTimelineEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
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

const cancellationInfoSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: {
      type: Date,
    },
  },
  { _id: false }
);

const returnInfoSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'completed'],
    },
    requestedAt: {
      type: Date,
    },
    actionedAt: {
      type: Date,
    },
  },
  { _id: false }
);

const trackingInfoSchema = new mongoose.Schema(
  {
    carrier: {
      type: String,
      trim: true,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    estimatedDelivery: {
      type: Date,
    },
    trackingUrl: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [
        (val) => val && val.length > 0,
        'Order must contain at least one item',
      ],
    },
    pricing: {
      subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative'],
      },
      tax: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Tax cannot be negative'],
      },
      shippingCharges: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Shipping charges cannot be negative'],
      },
      discount: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Discount cannot be negative'],
      },
      total: {
        type: Number,
        required: true,
        min: [0, 'Total price cannot be negative'],
      },
    },
    shippingAddress: {
      type: deliveryAddressSnapshotSchema,
      required: true,
    },
    coupon: {
      code: {
        type: String,
        trim: true,
      },
      discountAmount: {
        type: Number,
        default: 0,
        min: [0, 'Coupon discount amount cannot be negative'],
      },
    },
    payment: {
      type: paymentSummarySchema,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ALL_ORDER_STATUSES,
      default: ORDER_STATUS.PENDING,
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
          enum: ALL_ORDER_STATUSES,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        comment: {
          type: String,
          trim: true,
        },
      },
    ],
    timeline: [orderTimelineEventSchema],
    tracking: trackingInfoSchema,
    cancellation: cancellationInfoSchema,
    returnDetails: returnInfoSchema,
    orderNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound and individual indexes for frequent queries
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
