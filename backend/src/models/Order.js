// src/models/Order.js
// Complete Order schema with line items, tracking timeline, and payment statuses.

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
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
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
      default: 1,
    },
    sku: {
      type: String,
      default: '',
    },
    subtotal: {
      type: Number,
      min: 0,
    },
  },
  { _id: true }
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    street: { type: String, trim: true },
    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, trim: true },
    pincode: { type: String, default: '' },
    country: { type: String, default: 'India' },
  },
  { _id: false }
);

const billingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    addressLine1: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
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

const paymentInfoSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'COD'],
      default: 'UPI',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid',
    },
    transactionId: { type: String, default: '' },
    paidAt: { type: Date, default: null },
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
      required: false,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: String,
      default: 'Seller',
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

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { _id: false }
);

const legacyStatusHistorySchema = new mongoose.Schema(
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
      unique: true,
      trim: true,
    },
    orderId: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
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
        min: [0, 'Subtotal cannot be negative'],
      },
      tax: {
        type: Number,
        default: 0,
        min: [0, 'Tax cannot be negative'],
      },
      shippingCharges: {
        type: Number,
        default: 0,
        min: [0, 'Shipping charges cannot be negative'],
      },
      discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative'],
      },
      total: {
        type: Number,
        min: [0, 'Total price cannot be negative'],
      },
    },
    totalAmount: {
      type: Number,
      min: 0,
    },
    itemCount: {
      type: Number,
      default: 1,
    },
    shippingAddress: {
      type: deliveryAddressSchema,
      required: true,
    },
    billingAddress: {
      type: billingAddressSchema,
      default: null,
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
    },
    paymentInfo: {
      type: paymentInfoSchema,
    },
    orderStatus: {
      type: String,
      enum: [
        ...ALL_ORDER_STATUSES,
        'Confirmed',
        'Packed',
        'Out For Delivery',
        'pending',
        'confirmed',
        'processing',
        'packed',
        'shipped',
        'out for delivery',
        'delivered',
        'cancelled',
        'returned',
      ],
      default: 'processing',
    },
    statusHistory: [statusHistorySchema],
    legacyStatusHistory: [legacyStatusHistorySchema],
    timeline: [orderTimelineEventSchema],
    tracking: trackingInfoSchema,
    cancellation: cancellationInfoSchema,
    returnDetails: returnInfoSchema,
    returnRequested: {
      type: Boolean,
      default: false,
    },
    orderNotes: {
      type: String,
      trim: true,
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    shippingCarrier: {
      type: String,
      default: '',
    },
    deliveredDate: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      default: '',
    },
    refundInfo: {
      amount: { type: Number, default: 0 },
      status: { type: String, enum: ['none', 'pending', 'refunded'], default: 'none' },
      reason: { type: String, default: '' },
      processedAt: { type: Date, default: null },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Synchronize orderId and orderNumber
orderSchema.pre('validate', function (next) {
  if (this.orderNumber && !this.orderId) {
    this.orderId = this.orderNumber;
  } else if (this.orderId && !this.orderNumber) {
    this.orderNumber = this.orderId;
  }
  if (!this.orderId) {
    const id = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    this.orderId = id;
    this.orderNumber = id;
  }
  next();
});

// Synchronize flat fields, addresses, prices, and payments
orderSchema.pre('save', function (next) {
  // Sync items name/title/image/thumbnail/subtotal
  if (this.items && Array.isArray(this.items)) {
    this.items.forEach(item => {
      if (item.name && !item.title) {
        item.title = item.name;
      } else if (item.title && !item.name) {
        item.name = item.title;
      }
      if (item.image && !item.thumbnail) {
        item.thumbnail = item.image;
      } else if (item.thumbnail && !item.image) {
        item.image = item.thumbnail;
      }
      if (item.price !== undefined && item.quantity !== undefined && !item.subtotal) {
        item.subtotal = item.price * item.quantity;
      }
    });

    // Sync itemCount
    this.itemCount = this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  // Sync pricing.total and totalAmount
  if (this.pricing && this.pricing.total !== undefined) {
    this.totalAmount = this.pricing.total;
  } else if (this.totalAmount !== undefined) {
    if (!this.pricing) this.pricing = {};
    this.pricing.total = this.totalAmount;
    if (this.pricing.subtotal === undefined) this.pricing.subtotal = this.totalAmount;
  }

  // Sync address fields
  if (this.shippingAddress) {
    // Sync firstName/lastName to fullName
    if (this.shippingAddress.firstName || this.shippingAddress.lastName) {
      if (!this.shippingAddress.fullName) {
        this.shippingAddress.fullName = `${this.shippingAddress.firstName || ''} ${this.shippingAddress.lastName || ''}`.trim();
      }
    }
    // Sync street to addressLine1
    if (this.shippingAddress.street && !this.shippingAddress.addressLine1) {
      this.shippingAddress.addressLine1 = this.shippingAddress.street;
    }
    // Sync zipCode to pincode
    if (this.shippingAddress.zipCode && !this.shippingAddress.pincode) {
      this.shippingAddress.pincode = this.shippingAddress.zipCode;
    }

    // Sync back: fullName to firstName/lastName
    if (this.shippingAddress.fullName && (!this.shippingAddress.firstName && !this.shippingAddress.lastName)) {
      const parts = this.shippingAddress.fullName.split(' ');
      this.shippingAddress.firstName = parts[0] || '';
      this.shippingAddress.lastName = parts.slice(1).join(' ') || '';
    }
    // Sync back: addressLine1 to street
    if (this.shippingAddress.addressLine1 && !this.shippingAddress.street) {
      this.shippingAddress.street = this.shippingAddress.addressLine1;
    }
    // Sync back: pincode to zipCode
    if (this.shippingAddress.pincode && !this.shippingAddress.zipCode) {
      this.shippingAddress.zipCode = this.shippingAddress.pincode;
    }
  }

  // Sync payment and paymentInfo
  if (this.payment && this.payment.paymentMethod) {
    if (!this.paymentInfo) this.paymentInfo = {};
    this.paymentInfo.method = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'COD'].includes(this.payment.paymentMethod)
      ? this.payment.paymentMethod
      : 'UPI';
    this.paymentInfo.status = this.payment.paymentStatus === 'completed' ? 'paid' : this.payment.paymentStatus;
    this.paymentInfo.transactionId = this.payment.transactionId || '';
    this.paymentInfo.paidAt = this.payment.paidAt || null;
  } else if (this.paymentInfo && this.paymentInfo.method) {
    if (!this.payment) this.payment = {};
    this.payment.paymentMethod = this.paymentInfo.method === 'COD' ? 'Cash on Delivery' : this.paymentInfo.method;
    this.payment.paymentStatus = this.paymentInfo.status === 'paid' ? 'completed' : this.paymentInfo.status;
    this.payment.transactionId = this.paymentInfo.transactionId || '';
    this.payment.paidAt = this.paymentInfo.paidAt || null;
  }

  // Sync tracking properties
  if (this.tracking) {
    if (this.tracking.trackingNumber && !this.trackingNumber) {
      this.trackingNumber = this.tracking.trackingNumber;
    }
    if (this.tracking.carrier && !this.shippingCarrier) {
      this.shippingCarrier = this.tracking.carrier;
    }
  } else if (this.trackingNumber || this.shippingCarrier) {
    if (!this.tracking) this.tracking = {};
    this.tracking.trackingNumber = this.trackingNumber;
    this.tracking.carrier = this.shippingCarrier;
  }

  // Sync cancellation properties
  if (this.cancellation) {
    if (this.cancellation.cancelledAt && !this.cancelledAt) {
      this.cancelledAt = this.cancellation.cancelledAt;
    }
    if (this.cancellation.reason && !this.cancelReason) {
      this.cancelReason = this.cancellation.reason;
    }
  } else if (this.cancelledAt || this.cancelReason) {
    if (!this.cancellation) this.cancellation = {};
    this.cancellation.cancelledAt = this.cancelledAt;
    this.cancellation.reason = this.cancelReason;
  }

  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
orderSchema.index({ orderId: 1, isDeleted: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ customer: 1, orderStatus: 1 });
orderSchema.index({ seller: 1, orderStatus: 1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ 'paymentInfo.status': 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
