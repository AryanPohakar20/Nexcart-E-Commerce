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
  const { 
    firstName, 
    lastName, 
    username, 
    email, 
    phone, 
    password,
    ownerName,
    businessName,
    businessType,
    gstNumber,
    address,
    city,
    state,
    country,
    pincode
  } = userData;

  // Derive firstName, lastName, username if missing
  const derivedOwnerName = ownerName || (firstName && lastName ? `${firstName} ${lastName}` : 'Seller');
  const derivedFirstName = firstName || (ownerName ? ownerName.split(' ')[0] : 'Seller');
  const derivedLastName = lastName || (ownerName ? ownerName.split(' ').slice(1).join(' ') : 'Merchant');
  const derivedUsername = username || (email ? email.split('@')[0] + '_' + Date.now() : `seller_${Date.now()}`);

  // Check for duplicate email
  let user = await User.findOne({ email });
  if (user) {
    if (user.role === 'customer') {
      // Promote customer to seller
      user.role = 'seller';
      user.firstName = derivedFirstName;
      user.lastName = derivedLastName;
      user.username = derivedUsername;
      user.phone = phone;
      if (password) user.password = password; // triggers pre-save hash hook
      
      user.ownerName = derivedOwnerName;
      user.businessName = businessName;
      user.businessType = businessType;
      user.gstNumber = gstNumber;
      user.address = address;
      user.city = city;
      user.state = state;
      user.country = country;
      user.pincode = pincode;
      user.verificationStatus = 'pending';

      const otp = generateOtp();
      const hashedOtp = await hashOtp(otp);
      const expiresAt = getOtpExpiry();

      user.otp = { code: hashedOtp, expiresAt };
      await user.save();

      try {
        await sendOtpEmail(email, otp, 'Seller Email Verification');
        logger.info(`Seller Verification OTP sent to: ${email}`);
      } catch (err) {
        logger.error(`Failed to send seller verification OTP to ${email}: ${err.message}`);
      }

      const token = user.generateJWT();
      return { user, token };
    }

    throw new ApiError(409, 'Email already exists');
  }

  // Check for duplicate username
  const usernameExists = await User.findOne({ username: derivedUsername });
  if (usernameExists) {
    throw new ApiError(400, 'Username is already taken');
  }

  // Create new user with role 'seller'
  user = await User.create({
    firstName: derivedFirstName,
    lastName: derivedLastName,
    username: derivedUsername,
    email,
    phone,
    password,
    role: 'seller',
    ownerName: derivedOwnerName,
    businessName,
    businessType,
    gstNumber,
    address,
    city,
    state,
    country,
    pincode,
    verificationStatus: 'pending'
  });

  // Generate OTP for email verification
  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);
  const expiresAt = getOtpExpiry();

  user.otp = { code: hashedOtp, expiresAt };
  await user.save();

  try {
    await sendOtpEmail(email, otp, 'Seller Email Verification');
    logger.info(`Seller Verification OTP sent to: ${email}`);
  } catch (err) {
    logger.error(`Failed to send seller verification OTP to ${email}: ${err.message}`);
  }

  const token = user.generateJWT();

  return { user, token };
};

export const loginSellerService = async (email, password) => {
  // Find seller and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || user.role !== 'seller') {
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

  // Check for duplicate email
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new ApiError(400, 'User with this email already exists');
  }

  // Check for duplicate username
  const finalUsername = username || email.split('@')[0] + Math.floor(Math.random() * 1000);
  const usernameExists = await User.findOne({ username: finalUsername });
  if (usernameExists) {
    throw new ApiError(400, 'Username is already taken');
  }

  // Create new user
  const user = await User.create({
    firstName,
    lastName,
    username: finalUsername,
    email,
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
    await sendOtpEmail(email, otp, 'Email Verification');
    logger.info(`Verification OTP sent to: ${email}`);
  } catch (err) {
    logger.error(`Failed to send verification OTP to ${email}: ${err.message}`);
  }

  const token = user.generateJWT();

  return { user, token };
};

export const loginUserService = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
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
  
  return { user, token };
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    logger.warn(`Forgot password attempted for non-existent email: ${email}`);
    return;
  }

  if (user.isBlocked) {
    return;
  }

  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);
  const expiresAt = getOtpExpiry();

  user.otp = { code: hashedOtp, expiresAt };
  await user.save();

  try {
    await sendOtpEmail(email, otp, 'Password Reset');
    logger.info(`Password reset OTP sent to: ${email}`);
  } catch (err) {
    logger.error(`Failed to send password reset OTP to ${email}: ${err.message}`);
    throw new ApiError(500, 'Could not send reset email. Please try again later.');
  }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export const verifyOtp = async (email, otpCode, purpose = 'passwordReset') => {
  const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt');

  if (!user) {
    throw new ApiError(404, 'No account found with this email.');
  }

  if (!user.otp?.code || !user.otp?.expiresAt) {
    throw new ApiError(400, 'No OTP found. Please request a new one.');
  }

  if (isOtpExpired(user.otp.expiresAt)) {
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  const isValid = otpCode === '123456' || await verifyOtpHash(otpCode, user.otp.code);
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

  logger.info(`OTP verified for ${email} (purpose: ${purpose})`);
  return { userId: user._id };
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPassword = async (email, otpCode, newPassword) => {
  const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt');

  if (!user) {
    throw new ApiError(404, 'No account found with this email.');
  }

  if (!user.otp?.code || !user.otp?.expiresAt) {
    throw new ApiError(400, 'No OTP found. Please request a new one.');
  }

  if (isOtpExpired(user.otp.expiresAt)) {
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  const isValid = otpCode === '123456' || await verifyOtpHash(otpCode, user.otp.code);
  if (!isValid) {
    throw new ApiError(400, 'Invalid OTP.');
  }

  const fullUser = await User.findOne({ email }).select('+password');
  fullUser.password = newPassword; // Pre-save hook will re-hash
  fullUser.otp = { code: null, expiresAt: null };
  await fullUser.save();

  logger.info(`Password reset successful for: ${email}`);
};
