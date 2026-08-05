import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { sendOtpEmail, sendWelcomeEmail } from './emailService.js';
import { generateOtp, hashOtp, verifyOtpHash, getOtpExpiry, isOtpExpired } from '../helpers/otpHelper.js';
import logger from '../utils/logger.js';

const normalizeEmail = (email) => (email ? email.toLowerCase().trim() : '');
const SELLER_ROLES = ['seller', 'marketplace_seller'];
const USER_ROLES = ['customer', 'admin', 'super_admin', 'moderator', 'support_staff'];

const sendOtpSafely = async (email, otp, subject, failureMessage) => {
  try {
    await sendOtpEmail(email, otp, subject);
    logger.info(`${subject} sent to: ${email}`);
  } catch (err) {
    logger.error(`${failureMessage} ${email}: ${err.message}`);
    if (subject === 'Password Reset') {
      throw new ApiError(500, 'Could not send reset email. Please try again later.');
    }
  }
};

const prepareOtp = async (user) => {
  const otp = generateOtp();
  user.otp = {
    code: await hashOtp(otp),
    expiresAt: getOtpExpiry(),
  };
  await user.save();
  return otp;
};

export const registerSellerService = async (userData) => {
  const { firstName, lastName, username, email, phone, password } = userData;
  const normalizedEmail = normalizeEmail(email);

  const existingSeller = await User.findOne({
    email: normalizedEmail,
    role: { $in: SELLER_ROLES },
  });
  if (existingSeller) {
    throw new ApiError(400, 'Seller account with this email already exists');
  }

  const finalUsername =
    username || `${normalizedEmail.split('@')[0]}_seller_${Math.floor(Math.random() * 1000)}`;
  const usernameExists = await User.findOne({ username: finalUsername.toLowerCase() });
  if (usernameExists) {
    throw new ApiError(400, 'Username is already taken');
  }

  const user = await User.create({
    firstName,
    lastName,
    username: finalUsername,
    email: normalizedEmail,
    phone,
    password,
    role: 'seller',
  });

  const otp = await prepareOtp(user);
  await sendOtpSafely(normalizedEmail, otp, 'Seller Email Verification', 'Failed to send seller verification OTP to');

  return { user, token: user.generateJWT() };
};

export const loginSellerService = async (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({
    email: normalizedEmail,
    role: { $in: SELLER_ROLES },
  }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials or user is not a seller');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'Your account has been blocked');
  }

  user.lastLogin = new Date();
  await user.save();

  return { user, token: user.generateJWT() };
};

export const registerUserService = async (userData) => {
  const { firstName, lastName, username, email, phone, password, role = 'customer' } = userData;
  const normalizedEmail = normalizeEmail(email);
  const normalizedRole = String(role || 'customer').toLowerCase();

  const emailExists = await User.findOne({
    email: normalizedEmail,
    role: normalizedRole,
  });
  if (emailExists) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const finalUsername = username || `${normalizedEmail.split('@')[0]}${Math.floor(Math.random() * 1000)}`;
  const usernameExists = await User.findOne({ username: finalUsername.toLowerCase() });
  if (usernameExists) {
    throw new ApiError(400, 'Username is already taken');
  }

  const user = await User.create({
    firstName,
    lastName,
    username: finalUsername,
    email: normalizedEmail,
    phone,
    password,
    role: normalizedRole,
  });

  const otp = await prepareOtp(user);
  await sendOtpSafely(normalizedEmail, otp, 'Email Verification', 'Failed to send verification OTP to');

  return { user, token: user.generateJWT() };
};

export const loginUserService = async (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  const users = await User.find({
    email: normalizedEmail,
    role: { $in: USER_ROLES },
  }).select('+password');

  if (!users.length) {
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

  if (matchedUser.isBlocked) {
    throw new ApiError(403, 'Your account has been blocked');
  }

  matchedUser.lastLogin = new Date();
  await matchedUser.save();

  return { user: matchedUser, token: matchedUser.generateJWT() };
};

export const forgotPassword = async (email, role = null) => {
  const normalizedEmail = normalizeEmail(email);
  const query = { email: normalizedEmail };

  if (role) {
    query.role = Array.isArray(role) ? { $in: role.map((item) => String(item).toLowerCase()) } : String(role).toLowerCase();
  }

  const users = await User.find(query);
  if (!users.length) {
    logger.warn(`Forgot password attempted for non-existent email: ${normalizedEmail}`);
    return;
  }

  for (const user of users) {
    if (user.isBlocked) {
      continue;
    }

    const otp = await prepareOtp(user);
    await sendOtpSafely(normalizedEmail, otp, 'Password Reset', 'Failed to send password reset OTP to');
  }
};

export const verifyOtp = async (email, otpCode, purpose = 'passwordReset', role = null) => {
  const normalizedEmail = normalizeEmail(email);
  const query = { email: normalizedEmail };

  if (role) {
    query.role = Array.isArray(role) ? { $in: role.map((item) => String(item).toLowerCase()) } : String(role).toLowerCase();
  } else if (purpose === 'sellerVerification') {
    query.role = { $in: SELLER_ROLES };
  } else if (purpose === 'emailVerification') {
    query.role = { $in: USER_ROLES };
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
  }

  user.otp = { code: null, expiresAt: null };
  await user.save();

  if (purpose === 'emailVerification' || purpose === 'sellerVerification') {
    try {
      await sendWelcomeEmail(user.email, user.firstName);
    } catch (err) {
      logger.error(`Welcome email failed for ${user.email}: ${err.message}`);
    }
  }

  logger.info(`OTP verified for ${normalizedEmail} (purpose: ${purpose})`);
  return { userId: user._id };
};

export const resetPassword = async (email, otpCode, newPassword, role = null) => {
  const normalizedEmail = normalizeEmail(email);
  const query = { email: normalizedEmail };

  if (role) {
    query.role = Array.isArray(role) ? { $in: role.map((item) => String(item).toLowerCase()) } : String(role).toLowerCase();
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
  fullUser.password = newPassword;
  fullUser.otp = { code: null, expiresAt: null };
  await fullUser.save();

  logger.info(`Password reset successful for: ${normalizedEmail}`);
};
