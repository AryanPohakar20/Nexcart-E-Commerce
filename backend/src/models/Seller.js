import mongoose from 'mongoose';
import { ALL_SELLER_STATUSES, SELLER_STATUS, ALL_VERIFICATION_STATUSES, VERIFICATION_STATUS } from '../constants/sellerStatus.js';

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

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

// ─── Main Seller Schema ───────────────────────────────────────────────────────

const sellerSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

// Auto-generate sellerId before first save
sellerSchema.pre('save', function (next) {
  if (!this.sellerId) {
    this.sellerId = `SLR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
  next();
});

const Seller = mongoose.model('Seller', sellerSchema);
export default Seller;
