import mongoose from 'mongoose';
import { SELLER_STATUS, ALL_SELLER_STATUSES } from '../constants/sellerStatus.js';

const SellerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 50,
      default: '',
    },
    profilePicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 300,
      default: '',
    },
    languagePreference: {
      type: String,
      default: 'English',
    },
    address: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      pickupAddress: { type: String, default: '' },
    },
    preferredCategories: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ALL_SELLER_STATUSES,
        message: `Status must be one of: ${ALL_SELLER_STATUSES.join(', ')}`,
      },
      default: SELLER_STATUS.DRAFT,
    },
    trustScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('SellerProfile', SellerProfileSchema);
