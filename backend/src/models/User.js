import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const aadhaarImageSchema = new mongoose.Schema({
  public_id: { type: String, required: true },
  url: { type: String, required: true },
}, { _id: false });

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
    fullName: {
      type: String,
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
      default: null,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please add a valid mobile number'],
    },
    profilePicture: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: (value) => value === null || /^(https?:\/\/|\/)/i.test(value),
        message: 'Profile picture must be a valid URL or a local path',
      },
    },
    avatar: {
      type: String,
      trim: true,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
      validate: {
        validator: (value) => value === null || value <= new Date(),
        message: 'Date of birth cannot be in the future',
      },
    },
    dob: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other', 'prefer_not_to_say'],
        message: '{VALUE} is not supported',
      },
      default: 'prefer_not_to_say',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [250, 'Bio cannot exceed 250 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'seller', 'admin'],
      default: 'customer',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    profileCompletion: {
      type: Number,
      min: [0, 'Profile completion cannot be less than 0'],
      max: [100, 'Profile completion cannot exceed 100'],
      default: 0,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    settings: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
      privacy: {
        profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
      },
      language: {
        type: String,
        default: 'en',
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
    },
    aadhaar: {
      number: { type: String, default: null },
      frontImage: { type: aadhaarImageSchema, default: null },
      backImage: { type: aadhaarImageSchema, default: null },
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
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// toJSON Transform: Strip Sensitive Fields
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);
export default User;
