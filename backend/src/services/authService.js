import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { sendOtpEmail, sendWelcomeEmail } from './emailService.js';
import {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  getOtpExpiry,
  isOtpExpired,
} from '../helpers/otpHelper.js';
import logger from '../utils/logger.js';

export const registerSellerService = async (userData) => {
  const { firstName, lastName, username, email, phone, password } = userData;
  const normalizedEmail = email ? email.toLowerCase().trim() : '';

  // Check for duplicate seller email
  const emailExists = await User.findOne({
    email: normalizedEmail,
    role: { $in: ['seller', 'marketplace_seller'] },
  });
  if (emailExists) {
    throw new ApiError(400, 'Seller account with this email already exists');
  }

  // Check for duplicate username
  const finalUsername = username || normalizedEmail.split('@')[0] + '_seller_' + Math.floor(Math.random() * 1000);
  const usernameExists = await User.findOne({ username: finalUsername });
  if (usernameExists) {
    throw new ApiError(400, 'Username is already taken');
  }

  // Create new user with role 'seller'
  const user = await User.create({
    firstName,
    lastName,
    username: finalUsername,
    email: normalizedEmail,
    phone,
    password,
    role: 'seller',
  });

  // Generate OTP for email verification
  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);
  const expiresAt = getOtpExpiry();

  user.otp = { code: hashedOtp, expiresAt };
  await user.save();

  try {
    await sendOtpEmail(normalizedEmail, otp, 'Seller Email Verification');
    logger.info(`Seller Verification OTP sent to: ${normalizedEmail}`);
  } catch (err) {
    logger.error(`Failed to send seller verification OTP to ${normalizedEmail}: ${err.message}`);
  }

  const token = user.generateJWT();

  return { user, token };
};

export const loginSellerService = async (email, password) => {
  const normalizedEmail = email ? email.toLowerCase().trim() : '';
  // Find seller by email and seller role
  const user = await User.findOne({
    email: normalizedEmail,
    role: { $in: ['seller', 'marketplace_seller'] },
  }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials or user is not a seller');
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check if blocked
  if (user.isBlocked) {
    throw new ApiError(403, 'Your account has been blocked');
  }

  const token = user.generateJWT();

  // Return user without password (handled by toJSON transform in schema)
  return { user, token };
};

export const registerUserService = async (userData) => {
  const { firstName, lastName, username, email, phone, password, role = 'customer' } = userData;
  const normalizedEmail = email ? email.toLowerCase().trim() : '';

  // Check for duplicate user email for user/customer role
  const emailExists = await User.findOne({ email: normalizedEmail, role: role || 'customer' });
  if (emailExists) {
    throw new ApiError(400, 'User with this email already exists');
  }

  // Check for duplicate username
  const finalUsername = username || normalizedEmail.split('@')[0] + Math.floor(Math.random() * 1000);
  const usernameExists = await User.findOne({ username: finalUsername });
  if (usernameExists) {
    throw new ApiError(400, 'Username is already taken');
  }

  // Create new user
  const user = await User.create({
    firstName,
    lastName,
    username: finalUsername,
    email: normalizedEmail,
    phone,
    password,
    role,
  });

  // Generate OTP for email verification
  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);
  const expiresAt = getOtpExpiry();

  user.otp = { code: hashedOtp, expiresAt };
  await user.save();

  try {
    await sendOtpEmail(normalizedEmail, otp, 'Email Verification');
    logger.info(`Verification OTP sent to: ${normalizedEmail}`);
  } catch (err) {
    logger.error(`Failed to send verification OTP to ${normalizedEmail}: ${err.message}`);
  }

  const token = user.generateJWT();

  return { user, token };
};

export const loginUserService = async (email, password) => {
  const normalizedEmail = email ? email.toLowerCase().trim() : '';
  const users = await User.find({
    email: normalizedEmail,
    role: { $in: ['customer', 'admin'] },
  }).select('+password');

  if (!users || users.length === 0) {
    throw new ApiError(401, 'Invalid credentials');
  }

  let matchedUser = null;
  for (const user of users) {
    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      matchedUser = user;
      break;
    }
  }

  if (!matchedUser) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check if blocked
  if (matchedUser.isBlocked) {
    throw new ApiError(403, 'Your account has been blocked');
  }

  const token = matchedUser.generateJWT();

  return { user: matchedUser, token };
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const forgotPassword = async (email, role = null) => {
  const normalizedEmail = email ? email.toLowerCase().trim() : '';
  const query = { email: normalizedEmail };
  if (role) {
    query.role = Array.isArray(role) ? { $in: role } : role;
  }
  const users = await User.find(query);

  if (!users || users.length === 0) {
    logger.warn(`Forgot password attempted for non-existent email: ${email}`);
    return;
  }

  for (const user of users) {
    if (user.isBlocked) continue;

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);
    const expiresAt = getOtpExpiry();

    user.otp = { code: hashedOtp, expiresAt };
    await user.save();

    try {
      await sendOtpEmail(normalizedEmail, otp, 'Password Reset');
      logger.info(`Password reset OTP sent to: ${normalizedEmail}`);
    } catch (err) {
      logger.error(`Failed to send password reset OTP to ${normalizedEmail}: ${err.message}`);
      throw new ApiError(500, 'Could not send reset email. Please try again later.');
    }
  }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export const verifyOtp = async (email, otpCode, purpose = 'passwordReset', role = null) => {
  const normalizedEmail = email ? email.toLowerCase().trim() : '';
  const query = { email: normalizedEmail };
  if (role) {
    query.role = Array.isArray(role) ? { $in: role } : role;
  } else if (purpose === 'sellerVerification') {
    query.role = { $in: ['seller', 'marketplace_seller'] };
  } else if (purpose === 'emailVerification') {
    query.role = { $in: ['customer', 'admin'] };
  }

  const user = await User.findOne(query).select('+otp.code +otp.expiresAt');

  if (!user) {
    throw new ApiError(404, 'No account found with this email.');
  }

  if (!user.otp?.code || !user.otp?.expiresAt) {
    throw new ApiError(400, 'No OTP found. Please request a new one.');
  }

  if (isOtpExpired(user.otp.expiresAt)) {
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  const isValid = await verifyOtpHash(otpCode, user.otp.code);
  if (!isValid) {
    throw new ApiError(400, 'Invalid OTP. Please try again.');
  }

  if (purpose === 'emailVerification' || purpose === 'sellerVerification') {
    user.isVerified = true;
    user.otp = { code: null, expiresAt: null };
    await user.save();

    try {
      await sendWelcomeEmail(user.email, user.firstName);
    } catch (err) {
      logger.error(`Welcome email failed for ${user.email}: ${err.message}`);
    }
  }

  logger.info(`OTP verified for ${normalizedEmail} (purpose: ${purpose})`);
  return { userId: user._id };
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPassword = async (email, otpCode, newPassword, role = null) => {
  const normalizedEmail = email ? email.toLowerCase().trim() : '';
  const query = { email: normalizedEmail };
  if (role) {
    query.role = Array.isArray(role) ? { $in: role } : role;
  }

  const user = await User.findOne(query).select('+otp.code +otp.expiresAt');

  if (!user) {
    throw new ApiError(404, 'No account found with this email.');
  }

  if (!user.otp?.code || !user.otp?.expiresAt) {
    throw new ApiError(400, 'No OTP found. Please request a new one.');
  }

  if (isOtpExpired(user.otp.expiresAt)) {
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  const isValid = await verifyOtpHash(otpCode, user.otp.code);
  if (!isValid) {
    throw new ApiError(400, 'Invalid OTP.');
  }

  const fullUser = await User.findById(user._id).select('+password');
  fullUser.password = newPassword; // Pre-save hook will re-hash
  fullUser.otp = { code: null, expiresAt: null };
  await fullUser.save();

  logger.info(`Password reset successful for: ${normalizedEmail}`);
};
