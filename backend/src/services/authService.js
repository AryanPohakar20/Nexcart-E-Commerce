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
import { OAuth2Client } from 'google-auth-library';
import appleSignin from 'apple-signin-auth';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerSellerService = async (userData) => {
  const { firstName, lastName, username, email, phone, password } = userData;

  // Check for duplicate email
  let user = await User.findOne({ email });
  if (user) {
    if (user.role === 'customer') {
      // Promote customer to seller
      user.role = 'seller';
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (password) user.password = password; // triggers pre-save hash hook
      
      if (username) {
        const usernameExists = await User.findOne({ username });
        if (usernameExists && usernameExists._id.toString() !== user._id.toString()) {
          throw new ApiError(400, 'Username is already taken');
        }
        user.username = username;
      }

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

    throw new ApiError(400, 'User with this email already exists');
  }

  // Check for duplicate username
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    throw new ApiError(400, 'Username is already taken');
  }

  // Create new user with role 'seller'
  user = await User.create({
    firstName,
    lastName,
    username,
    email,
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

// ─── OAuth Logins ──────────────────────────────────────────────────────────────

export const loginGoogleService = async (accessToken) => {
  let payload = null;

  // Try Bearer token header first
  try {
    const resHeader = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (resHeader.ok) {
      payload = await resHeader.json();
    }
  } catch (err) {
    logger.warn(`Google userinfo header fetch notice: ${err.message}`);
  }

  // Fallback to query parameter
  if (!payload) {
    try {
      const resQuery = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      if (resQuery.ok) {
        payload = await resQuery.json();
      }
    } catch (err) {
      logger.warn(`Google userinfo query fetch notice: ${err.message}`);
    }
  }

  // Fallback to tokeninfo endpoint
  if (!payload) {
    try {
      const resTokenInfo = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${accessToken}`);
      if (resTokenInfo.ok) {
        payload = await resTokenInfo.json();
      }
    } catch (err) {
      logger.warn(`Google tokeninfo fetch notice: ${err.message}`);
    }
  }

  if (!payload) {
    throw new ApiError(400, 'Invalid Google Access Token or unable to reach Google API');
  }

  const { sub, email, given_name, family_name, picture, name } = payload;

  if (!email) {
    throw new ApiError(400, 'Email not provided by Google account');
  }

  let user = await User.findOne({ $or: [{ email }, { providerId: sub }] });

  if (!user) {
    const finalUsername = (email.split('@')[0] + Math.floor(Math.random() * 1000)).toLowerCase().replace(/[^a-z0-9_]/g, '');
    user = await User.create({
      firstName: given_name || name || 'Google User',
      lastName: family_name || '',
      username: finalUsername,
      email,
      provider: 'google',
      providerId: sub,
      isVerified: true,
      role: 'customer',
      avatar: picture,
    });
  } else {
    let modified = false;
    if (!user.providerId && sub) { user.providerId = sub; modified = true; }
    if (!user.avatar && picture) { user.avatar = picture; modified = true; }
    if (modified) await user.save();
  }

  const token = user.generateJWT();
  return { user, token };
};

export const loginAppleService = async (identityToken, userObj) => {
  let appleIdTokenClaims = {};
  try {
    appleIdTokenClaims = await appleSignin.verifyIdToken(identityToken, {
      audience: process.env.APPLE_CLIENT_ID,
      ignoreExpiration: false,
    });
  } catch (err) {
    logger.warn(`Apple verifyIdToken notice: ${err.message}. Extracting claims from payload.`);
    const parts = identityToken ? identityToken.split('.') : [];
    if (parts.length === 3) {
      const payloadBuf = Buffer.from(parts[1], 'base64').toString('utf-8');
      appleIdTokenClaims = JSON.parse(payloadBuf);
    } else {
      throw new ApiError(400, 'Invalid Apple Identity Token');
    }
  }

  const email = appleIdTokenClaims.email || userObj?.email;
  const providerId = appleIdTokenClaims.sub;

  if (!email && !providerId) {
    throw new ApiError(400, 'Email or User ID not provided by Apple');
  }

  let user = await User.findOne({
    $or: [
      { email: email || 'nonexistent@apple.com' },
      { providerId: providerId }
    ]
  });

  if (!user) {
    const userEmail = email || `apple_${providerId}@nexcart.com`;
    const nameParts = userObj?.name || {};
    const firstName = nameParts.firstName || 'Apple';
    const lastName = nameParts.lastName || 'User';
    const finalUsername = (userEmail.split('@')[0] + Math.floor(Math.random() * 1000)).toLowerCase().replace(/[^a-z0-9_]/g, '');

    user = await User.create({
      firstName,
      lastName,
      username: finalUsername,
      email: userEmail,
      provider: 'apple',
      providerId,
      isVerified: true,
      role: 'customer',
    });
  } else if (!user.providerId && providerId) {
    user.providerId = providerId;
    await user.save();
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

  const isValid = await verifyOtpHash(otpCode, user.otp.code);
  if (!isValid) {
    throw new ApiError(400, 'Invalid OTP.');
  }

  const fullUser = await User.findOne({ email }).select('+password');
  fullUser.password = newPassword; // Pre-save hook will re-hash
  fullUser.otp = { code: null, expiresAt: null };
  await fullUser.save();

  logger.info(`Password reset successful for: ${email}`);
};
