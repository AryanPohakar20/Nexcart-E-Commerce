// src/models/Order.js
// Merged Order schema — preserves all Main fields while adding Manjusha's
// superior Order Management fields (timeline, pricing, tracking, return tracking).
// Pre-save hooks synchronize alias field pairs bidirectionally so existing data
// (using either naming convention) remains fully compatible.

import mongoose from 'mongoose';
import { ALL_ORDER_STATUSES_COMBINED } from '../constants/orderStatus.js';

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // Main field — display name snapshot
    name: {
      type: String,
      trim: true,
      default: '',
    },
    // Manjusha alias — same as name (synced in pre-save)
    title: {
      type: String,
      trim: true,
    },
    // Main field — product image URL snapshot
    image: {
      type: String,
      default: '',
    },
    // Manjusha alias — same as image (synced in pre-save)
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

// Main's original status history (used by admin service)
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

// Manjusha timeline events — richer than statusHistory
const orderTimelineEventSchema = new mongoose.Schema(
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
    // Human-readable actor label (e.g. 'Seller', 'Admin', 'Customer')
    updatedBy: {
      type: String,
      default: 'System',
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

// Main's shipping address schema — extended with Manjusha alias fields
const shippingAddressSchema = new mongoose.Schema(
  {
    // Manjusha split-name fields
    firstName: { type: String, trim: true },
    lastName:  { type: String, trim: true },
    // Main field (synced from firstName+lastName if absent)
    fullName:  { type: String, default: '' },
    phone:     { type: String, default: '' },
    // Manjusha alias for addressLine1
    street:       { type: String, trim: true },
    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    // Manjusha alias for pincode
    zipCode: { type: String, trim: true },
    pincode: { type: String, default: '' },
    country: { type: String, default: 'India' },
  },
  { _id: false }
);

// Main's billing address schema
const billingAddressSchema = new mongoose.Schema(
  {
    fullName:     { type: String, default: '' },
    phone:        { type: String, default: '' },
    addressLine1: { type: String, default: '' },
    city:         { type: String, default: '' },
    state:        { type: String, default: '' },
    pincode:      { type: String, default: '' },
  },
  { _id: false }
);

// Main's payment info schema (kept intact)
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
    paidAt:        { type: Date,   default: null },
  },
  { _id: false }
);

// Manjusha's richer payment summary schema (synced with paymentInfo in pre-save)
const paymentSummarySchema = new mongoose.Schema(
  {
    paymentMethod: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId:  { type: String, trim: true },
    paymentGateway: { type: String, trim: true },
    paidAt:         { type: Date },
  },
  { _id: false }
);

// Manjusha pricing breakdown schema
const pricingSchema = new mongoose.Schema(
  {
    subtotal:        { type: Number, default: 0, min: 0 },
    tax:             { type: Number, default: 0, min: 0 },
    shippingCharges: { type: Number, default: 0, min: 0 },
    discount:        { type: Number, default: 0, min: 0 },
    total:           { type: Number, min: 0 },
  },
  { _id: false }
);

// Manjusha tracking schema
const trackingInfoSchema = new mongoose.Schema(
  {
    trackingNumber:    { type: String, trim: true },
    carrier:           { type: String, trim: true },
    estimatedDelivery: { type: Date },
  },
  { _id: false }
);

// Manjusha cancellation schema (synced with flat cancelledAt/cancelReason)
const cancellationInfoSchema = new mongoose.Schema(
  {
    cancelledAt: { type: Date },
    reason:      { type: String, trim: true },
    cancelledBy: { type: String, default: 'Customer' },
  },
  { _id: false }
);

// Manjusha return details embedded in the Order document
const returnInfoSchema = new mongoose.Schema(
  {
    status:      { type: String, enum: ['requested', 'approved', 'rejected', 'completed'] },
    reason:      { type: String, trim: true },
    requestedAt: { type: Date },
    actionedAt:  { type: Date },
  },
  { _id: false }
);

// ─── Main Order Schema ────────────────────────────────────────────────────────

const orderSchema = new mongoose.Schema(
  {
    // ── Identifiers ──────────────────────────────────────────────────────────
    // Main primary identifier
    orderId: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    // Manjusha alias (synced with orderId in pre-validate)
    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },

    // ── Parties ───────────────────────────────────────────────────────────────
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: [true, 'Seller is required'],
    },

    // ── Items ─────────────────────────────────────────────────────────────────
    items: [orderItemSchema],
    itemCount: {
      type: Number,
      default: 1,
    },

    // ── Pricing ───────────────────────────────────────────────────────────────
    // Main flat total
    totalAmount: {
      type: Number,
      min: 0,
    },
    // Manjusha breakdown (synced with totalAmount)
    pricing: {
      type: pricingSchema,
      default: null,
    },
    // Coupon info (Manjusha)
    coupon: {
      code:           { type: String, trim: true },
      discountAmount: { type: Number, default: 0, min: 0 },
    },

    // ── Addresses ─────────────────────────────────────────────────────────────
    shippingAddress: {
      type: shippingAddressSchema,
    },
    billingAddress: {
      type: billingAddressSchema,
      default: null,
    },

    // ── Payment ───────────────────────────────────────────────────────────────
    // Main payment fields (kept intact)
    paymentInfo: {
      type: paymentInfoSchema,
    },
    // Manjusha payment summary (synced with paymentInfo)
    payment: {
      type: paymentSummarySchema,
      default: null,
    },

    // ── Status ────────────────────────────────────────────────────────────────
    orderStatus: {
      type: String,
      enum: ALL_ORDER_STATUSES_COMBINED,
      default: 'processing',
    },
    // Main status history (used by admin service for audit trail)
    statusHistory: [statusHistorySchema],
    // Manjusha timeline (richer, used by seller/customer views)
    timeline: {
      type: [orderTimelineEventSchema],
      default: [],
    },

    // ── Shipping / Tracking ───────────────────────────────────────────────────
    // Main flat fields
    trackingNumber:  { type: String, default: '' },
    shippingCarrier: { type: String, default: '' },
    deliveredDate:   { type: Date,   default: null },
    // Manjusha tracking object (synced with flat fields)
    tracking: {
      type: trackingInfoSchema,
      default: null,
    },

    // ── Cancellation ──────────────────────────────────────────────────────────
    // Main flat fields
    cancelledAt:  { type: Date,   default: null },
    cancelReason: { type: String, default: ''   },
    // Manjusha cancellation object (synced with flat fields)
    cancellation: {
      type: cancellationInfoSchema,
      default: null,
    },

    // ── Refund ────────────────────────────────────────────────────────────────
    // Main refund info (kept intact)
    refundInfo: {
      amount:      { type: Number, default: 0 },
      status:      { type: String, enum: ['none', 'pending', 'refunded'], default: 'none' },
      reason:      { type: String, default: '' },
      processedAt: { type: Date,   default: null },
    },

    // ── Return ────────────────────────────────────────────────────────────────
    // Manjusha return tracking embedded in order
    returnRequested: {
      type: Boolean,
      default: false,
    },
    returnDetails: {
      type: returnInfoSchema,
      default: null,
    },

    // ── Miscellaneous ─────────────────────────────────────────────────────────
    // Manjusha optional order notes
    orderNotes: {
      type: String,
      trim: true,
    },

    // Main soft-delete flag
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

// ─── Pre-validate: Generate and sync orderId ↔ orderNumber ────────────────────
orderSchema.pre('validate', function (next) {
  // Generate IDs if both are missing
  if (!this.orderId && !this.orderNumber) {
    const id = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    this.orderId    = id;
    this.orderNumber = id;
  } else if (this.orderNumber && !this.orderId) {
    this.orderId = this.orderNumber;
  } else if (this.orderId && !this.orderNumber) {
    this.orderNumber = this.orderId;
  }
  next();
});

// ─── Pre-save: Sync all alias field pairs ─────────────────────────────────────
orderSchema.pre('save', function (next) {
  // 1. Sync item name ↔ title and image ↔ thumbnail
  if (this.items && Array.isArray(this.items)) {
    this.items.forEach(item => {
      if (item.name && !item.title)  item.title = item.name;
      else if (item.title && !item.name) item.name = item.title;

      if (item.image && !item.thumbnail)  item.thumbnail = item.image;
      else if (item.thumbnail && !item.image) item.image = item.thumbnail;

      // Auto-compute subtotal if missing
      if (item.price !== undefined && item.quantity !== undefined && !item.subtotal) {
        item.subtotal = item.price * item.quantity;
      }
    });
    // Sync itemCount
    this.itemCount = this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  // 2. Sync pricing.total ↔ totalAmount
  if (this.pricing && this.pricing.total !== undefined) {
    this.totalAmount = this.pricing.total;
  } else if (this.totalAmount !== undefined) {
    if (!this.pricing) this.pricing = {};
    this.pricing.total = this.totalAmount;
    if (this.pricing.subtotal === undefined) this.pricing.subtotal = this.totalAmount;
  }

  // 3. Sync shippingAddress alias fields
  if (this.shippingAddress) {
    const addr = this.shippingAddress;
    // firstName + lastName → fullName
    if ((addr.firstName || addr.lastName) && !addr.fullName) {
      addr.fullName = `${addr.firstName || ''} ${addr.lastName || ''}`.trim();
    }
    // fullName → firstName + lastName (split)
    if (addr.fullName && !addr.firstName && !addr.lastName) {
      const parts = addr.fullName.split(' ');
      addr.firstName = parts[0] || '';
      addr.lastName  = parts.slice(1).join(' ') || '';
    }
    // street ↔ addressLine1
    if (addr.street && !addr.addressLine1) addr.addressLine1 = addr.street;
    if (addr.addressLine1 && !addr.street) addr.street = addr.addressLine1;
    // zipCode ↔ pincode
    if (addr.zipCode && !addr.pincode) addr.pincode = addr.zipCode;
    if (addr.pincode && !addr.zipCode)  addr.zipCode = addr.pincode;
  }

  // 4. Sync payment ↔ paymentInfo
  if (this.payment && this.payment.paymentMethod) {
    if (!this.paymentInfo) this.paymentInfo = {};
    const methodMap = { 'Cash on Delivery': 'COD' };
    this.paymentInfo.method = methodMap[this.payment.paymentMethod] ||
      (['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'COD'].includes(this.payment.paymentMethod)
        ? this.payment.paymentMethod : 'UPI');
    this.paymentInfo.status = this.payment.paymentStatus === 'completed' ? 'paid' : (this.payment.paymentStatus || 'pending');
    this.paymentInfo.transactionId = this.payment.transactionId || '';
    this.paymentInfo.paidAt = this.payment.paidAt || null;
  } else if (this.paymentInfo && this.paymentInfo.method) {
    if (!this.payment) this.payment = {};
    const reverseMap = { COD: 'Cash on Delivery' };
    this.payment.paymentMethod = reverseMap[this.paymentInfo.method] || this.paymentInfo.method;
    this.payment.paymentStatus = this.paymentInfo.status === 'paid' ? 'completed' : (this.paymentInfo.status || 'pending');
    this.payment.transactionId = this.paymentInfo.transactionId || '';
    this.payment.paidAt = this.paymentInfo.paidAt || null;
  }

  // 5. Sync tracking flat ↔ tracking object
  if (this.tracking) {
    if (this.tracking.trackingNumber && !this.trackingNumber)
      this.trackingNumber = this.tracking.trackingNumber;
    if (this.tracking.carrier && !this.shippingCarrier)
      this.shippingCarrier = this.tracking.carrier;
  } else if (this.trackingNumber || this.shippingCarrier) {
    if (!this.tracking) this.tracking = {};
    this.tracking.trackingNumber = this.trackingNumber;
    this.tracking.carrier        = this.shippingCarrier;
  }

  // 6. Sync cancellation flat ↔ cancellation object
  if (this.cancellation) {
    if (this.cancellation.cancelledAt && !this.cancelledAt)
      this.cancelledAt = this.cancellation.cancelledAt;
    if (this.cancellation.reason && !this.cancelReason)
      this.cancelReason = this.cancellation.reason;
  } else if (this.cancelledAt || this.cancelReason) {
    if (!this.cancellation) this.cancellation = {};
    this.cancellation.cancelledAt = this.cancelledAt;
    this.cancellation.reason      = this.cancelReason;
  }

  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
orderSchema.index({ orderId: 1,    isDeleted: 1 });
orderSchema.index({ orderNumber: 1, isDeleted: 1 });
orderSchema.index({ customer: 1,   createdAt: -1 });
orderSchema.index({ seller: 1,     createdAt: -1 });
orderSchema.index({ customer: 1,   orderStatus: 1 });
orderSchema.index({ seller: 1,     orderStatus: 1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ 'paymentInfo.status': 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
