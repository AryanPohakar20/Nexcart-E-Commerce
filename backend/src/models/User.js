import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const imageSchema = new mongoose.Schema(
  {
    public_id: { type: String, default: null },
    url: { type: String, default: null },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
    privacy: {
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
    },
    language: { type: String, default: 'en' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: null },
    line2: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    country: { type: String, default: null },
    pincode: { type: String, default: null },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    avatar: { type: String, default: null },
    dob: { type: Date, default: null },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', null],
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: null,
    },
  },
  { _id: false }
);

const verificationSchema = new mongoose.Schema(
  {
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
    },
    phone: {
      type: String,
      required: function() {
        return this.provider === 'email';
      },
      trim: true,
    },
    password: {
      type: String,
      required: function() {
        return this.provider === 'email';
      },
      minlength: 6,
      select: false,
    },
    provider: {
      type: String,
      enum: ['email', 'google', 'apple'],
      default: 'email',
    },
    providerId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['customer', 'seller', 'marketplace_seller', 'admin', 'super_admin', 'moderator', 'support_staff'],
      default: 'customer',
    },
    customPermissions: {
      type: Map,
      of: [String],
      default: () => new Map(),
    },
    aadhaar: {
      number: { type: String, default: null },
      frontImage: { type: imageSchema, default: null },
      backImage: { type: imageSchema, default: null },
    },
    avatar: {
      type: String,
      default: null,
    },
    dob: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: null,
    },
    profile: {
      type: profileSchema,
      default: () => ({}),
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Deleted', 'Blocked', 'active', 'suspended', 'deleted', 'blocked'],
      default: 'Active',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    profileCompletion: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
    verification: {
      type: verificationSchema,
      default: () => ({}),
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
      default: null,
    },
    otp: {
      code: { type: String, select: false, default: null },
      expiresAt: { type: Date, select: false, default: null },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1, role: 1 }, { unique: true });
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ isDeleted: 1 });
userSchema.index({ createdAt: -1 });

userSchema.pre('validate', function (next) {
  if (this.role && typeof this.role === 'string') {
    this.role = this.role.toLowerCase();
  }

  if (this.status && typeof this.status === 'string') {
    const lower = this.status.toLowerCase();
    if (lower === 'active') this.status = 'Active';
    else if (lower === 'suspended') this.status = 'Suspended';
    else if (lower === 'deleted') this.status = 'Deleted';
    else if (lower === 'blocked') this.status = 'Blocked';
  }

  if (this.settings && this.settings.theme && typeof this.settings.theme === 'string') {
    this.settings.theme = this.settings.theme.toLowerCase();
  }

  if ((!this.username || !this.username.trim()) && this.email) {
    this.username = `${this.email.split('@')[0]}${Math.floor(Math.random() * 1000)}`;
  }

  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateJWT = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);
export default User;
