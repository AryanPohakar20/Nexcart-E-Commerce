// src/models/User.js
// Mongoose User schema — the central entity for the entire Nexcart platform.
// Includes pre-save password hashing, instance methods for token generation
// and password comparison, and a toJSON transform that strips sensitive fields.

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, ALL_ROLES } from '../constants/roles.js';
import { STATUS, ALL_STATUSES } from '../constants/status.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';

const BCRYPT_ROUNDS = 12;

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned in queries by default
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-]{7,15}$/, 'Please provide a valid phone number'],
      default: null,
    },

    profileImage: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: {
        values: ALL_ROLES,
        message: `Role must be one of: ${ALL_ROLES.join(', ')}`,
      },
      default: ROLES.CUSTOMER,
    },

    status: {
      type: String,
      enum: {
        values: ALL_STATUSES,
        message: `Status must be one of: ${ALL_STATUSES.join(', ')}`,
      },
      default: STATUS.ACTIVE,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // Stored hashed refresh token for server-side invalidation
    refreshToken: {
      type: String,
      select: false,
      default: null,
    },

    // OTP for password reset / email verification
    otp: {
      code: { type: String, select: false, default: null },      // bcrypt-hashed
      expiresAt: { type: Date, select: false, default: null },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    versionKey: false,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
UserSchema.index({ role: 1 });

// ─── Pre-save Hook: Hash Password ─────────────────────────────────────────────
// Only re-hash when the password field has actually been modified.
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * Compare a plain-text password against the stored bcrypt hash.
 * The `password` field uses `select: false`, so it must be explicitly
 * selected when fetching the user: User.findOne({...}).select('+password')
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generate a short-lived JWT access token for this user.
 */
UserSchema.methods.generateAccessToken = function () {
  return generateAccessToken(this._id.toString(), this.role);
};

/**
 * Generate a long-lived JWT refresh token for this user.
 */
UserSchema.methods.generateRefreshToken = function () {
  return generateRefreshToken(this._id.toString());
};

// ─── toJSON Transform: Strip Sensitive Fields ─────────────────────────────────
// Removes password, refreshToken, and otp from any JSON serialization.
// This means req.user or returned user objects are always safe to send.
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.otp;
    delete ret.__v;
    return ret;
  },
});

// ─── Virtual: fullName ────────────────────────────────────────────────────────
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model('User', UserSchema);

export default User;
