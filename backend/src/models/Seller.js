import mongoose from 'mongoose';
import {
  ALL_SELLER_STATUSES,
  SELLER_STATUS,
  ALL_VERIFICATION_STATUSES,
  VERIFICATION_STATUS,
} from '../constants/sellerStatus.js';

// ─── Existing Sub-schemas (unchanged — backward compatible) ───────────────────

const imageSchema = new mongoose.Schema(
  {
    public_id: { type: String, default: null },
    url: { type: String, default: null },
  },
  { _id: false }
);

const accountInfoSchema = new mongoose.Schema(
  {
    displayName: { type: String, trim: true, default: '' },
    businessType: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    shopName: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
    logo: { type: imageSchema, default: () => ({}) },
    banner: { type: imageSchema, default: () => ({}) },
  },
  { _id: false }
);

const aadhaarSchema = new mongoose.Schema(
  {
    number: { type: String, trim: true, default: '' },
    frontImage: { type: imageSchema, default: () => ({}) },
    backImage: { type: imageSchema, default: () => ({}) },
  },
  { _id: false }
);

const identitySchema = new mongoose.Schema(
  {
    aadhaar: { type: aadhaarSchema, default: () => ({}) },
    pan: { type: String, trim: true, default: '' },
    gst: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    accountHolder: { type: String, trim: true, default: '' },
    accountNumber: { type: String, trim: true, default: '' },
    ifsc: { type: String, trim: true, uppercase: true, default: '' },
    upiId: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const agreementSchema = new mongoose.Schema(
  {
    accepted: { type: Boolean, default: false },
    acceptedAt: { type: Date, default: null },
  },
  { _id: false }
);

// ─── New Sub-schemas ──────────────────────────────────────────────────────────

// Individual seller identity fields
const individualSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, default: '' },
    profilePhoto: { type: imageSchema, default: () => ({}) },
    about: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { _id: false }
);

// Business seller identity fields
export const BUSINESS_CATEGORIES = [
  'Fashion & Apparel',
  'Electronics & Gadgets',
  'Home & Furniture',
  'Beauty & Personal Care',
  'Sports & Fitness',
  'Books & Education',
  'Food & Grocery',
  'Toys & Games',
  'Automotive',
  'Art & Crafts',
  'Health & Wellness',
  'Jewelry & Accessories',
  'Pet Supplies',
  'Office & Stationery',
  'Other',
];

const businessSchema = new mongoose.Schema(
  {
    businessName: { type: String, trim: true, default: '' },
    businessLogo: { type: imageSchema, default: () => ({}) },
    businessBanner: { type: imageSchema, default: () => ({}) },
    ownerName: { type: String, trim: true, default: '' },
    businessDescription: { type: String, trim: true, maxlength: 2000, default: '' },
    businessCategory: {
      type: String,
      enum: [...BUSINESS_CATEGORIES, ''],
      default: '',
    },
    website: { type: String, trim: true, default: '' },
    gst: { type: String, trim: true, uppercase: true, default: '' },
  },
  { _id: false }
);

// Seller address (used by dashboard; profile.* fields kept for onboarding backward compat)
const sellerAddressSchema = new mongoose.Schema(
  {
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'India' },
    pincode: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

// ─── Settings Sub-schemas ─────────────────────────────────────────────────────

const notificationSettingsSchema = new mongoose.Schema(
  {
    orders: { type: Boolean, default: true },
    reviews: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false },
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
  },
  { _id: false }
);

const privacySettingsSchema = new mongoose.Schema(
  {
    showPhone: { type: Boolean, default: false },
    showEmail: { type: Boolean, default: false },
    publicProfile: { type: Boolean, default: true },
  },
  { _id: false }
);

const shippingSettingsSchema = new mongoose.Schema(
  {
    pickupAvailable: { type: Boolean, default: false },
    shippingEnabled: { type: Boolean, default: true },
    deliveryCharges: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const returnsSettingsSchema = new mongoose.Schema(
  {
    acceptsReturns: { type: Boolean, default: true },
    returnWindow: { type: Number, default: 7, min: 0 }, // days
  },
  { _id: false }
);

const sellerSettingsSchema = new mongoose.Schema(
  {
    notifications: { type: notificationSettingsSchema, default: () => ({}) },
    privacy: { type: privacySettingsSchema, default: () => ({}) },
    shipping: { type: shippingSettingsSchema, default: () => ({}) },
    returns: { type: returnsSettingsSchema, default: () => ({}) },
  },
  { _id: false }
);

// ─── Statistics Sub-schema (storage only — no calculations in this phase) ─────

const statisticsSchema = new mongoose.Schema(
  {
    totalProducts: { type: Number, default: 0, min: 0 },
    activeProducts: { type: Number, default: 0, min: 0 },
    soldProducts: { type: Number, default: 0, min: 0 },
    totalOrders: { type: Number, default: 0, min: 0 },
    completedOrders: { type: Number, default: 0, min: 0 },
    cancelledOrders: { type: Number, default: 0, min: 0 },
    cancellationRate: { type: Number, default: 0, min: 0, max: 100 },
    responseRate: { type: Number, default: 0, min: 0, max: 100 },
    revenue: { type: Number, default: 0, min: 0 },
    followers: { type: Number, default: 0, min: 0 },
    wishlistCount: { type: Number, default: 0, min: 0 },
    profileViews: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

// ─── Dashboard Metadata Sub-schema ────────────────────────────────────────────

const dashboardSchema = new mongoose.Schema(
  {
    onboardingCompleted: { type: Boolean, default: false },
    profileCompletion: { type: Number, min: 0, max: 100, default: 0 },
    lastActive: { type: Date, default: null },
    lastProductPosted: { type: Date, default: null },
    lastLogin: { type: Date, default: null },
  },
  { _id: false }
);

// ─── Main Seller Schema ───────────────────────────────────────────────────────

const sellerSchema = new mongoose.Schema(
  {
    // ── Core Identity ──────────────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    sellerId: {
      type: String,
      unique: true,
      sparse: true,
    },
    sellerType: {
      type: String,
      enum: ['individual', 'business'],
      default: 'individual',
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    // ── Onboarding State ───────────────────────────────────────────────────────
    onboardingStep: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    sellerStatus: {
      type: String,
      enum: ALL_SELLER_STATUSES,
      default: SELLER_STATUS.DRAFT,
    },
    verificationStatus: {
      type: String,
      enum: ALL_VERIFICATION_STATUSES,
      default: VERIFICATION_STATUS.NOT_STARTED,
    },
    verifiedAt: { type: Date, default: null },

    // ── Existing Onboarding Sub-schemas (unchanged) ────────────────────────────
    accountInfo: {
      type: accountInfoSchema,
      default: () => ({}),
    },
    profile: {
      type: profileSchema,
      default: () => ({}),
    },
    identity: {
      type: identitySchema,
      default: () => ({}),
    },
    payment: {
      type: paymentSchema,
      default: () => ({}),
    },
    agreement: {
      type: agreementSchema,
      default: () => ({}),
    },

    // ── New: Type-Specific Identity ────────────────────────────────────────────
    individual: {
      type: individualSchema,
      default: () => ({}),
    },
    business: {
      type: businessSchema,
      default: () => ({}),
    },

    // ── New: Seller Address (dashboard layer) ──────────────────────────────────
    address: {
      type: sellerAddressSchema,
      default: () => ({}),
    },

    // ── New: Trust & Reputation ────────────────────────────────────────────────
    trustScore: { type: Number, default: 0, min: 0, max: 100 },
    sellerLevel: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },

    // ── New: Public Metrics ────────────────────────────────────────────────────
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    ratingDistribution: {
      type: {
        oneStar: { type: Number, default: 0 },
        twoStar: { type: Number, default: 0 },
        threeStar: { type: Number, default: 0 },
        fourStar: { type: Number, default: 0 },
        fiveStar: { type: Number, default: 0 },
      },
      default: () => ({
        oneStar: 0,
        twoStar: 0,
        threeStar: 0,
        fourStar: 0,
        fiveStar: 0,
      }),
    },
    lastRatingUpdatedAt: { type: Date, default: null },
    followers: { type: Number, default: 0, min: 0 },
    profileViews: { type: Number, default: 0, min: 0 },

    // ── New: Account Status ────────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    suspendedReason: { type: String, default: null },
    isBlocked: { type: Boolean, default: false },
    blockedReason: { type: String, default: null },

    // ── Soft Delete ──────────────────────────────────────────────────
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // ── New: Seller Settings ───────────────────────────────────────────────────
    settings: {
      type: sellerSettingsSchema,
      default: () => ({}),
    },

    // ── New: Statistics (storage only — calculations in Part 2) ───────────────
    statistics: {
      type: statisticsSchema,
      default: () => ({}),
    },

    // ── New: Dashboard Metadata ────────────────────────────────────────────────
    dashboard: {
      type: dashboardSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Note: userId and slug already have unique: true which auto-creates indexes.
// Additional compound/single indexes for common query patterns:
sellerSchema.index({ sellerType: 1 });
sellerSchema.index({ verificationStatus: 1 });
sellerSchema.index({ rating: -1 });
sellerSchema.index({ isActive: 1, sellerStatus: 1 });
sellerSchema.index({ 'business.businessCategory': 1 });
sellerSchema.index({ isDeleted: 1 });
sellerSchema.index({ isBlocked: 1 });
sellerSchema.index({ createdAt: -1 });

// ─── Pre-save: Auto-generate sellerId ─────────────────────────────────────────
// Slug is generated in the service layer (requires async DB lookups for uniqueness)
sellerSchema.pre('save', function (next) {
  if (!this.sellerId) {
    this.sellerId = `SLR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
  next();
});

const Seller = mongoose.model('Seller', sellerSchema);
export default Seller;
