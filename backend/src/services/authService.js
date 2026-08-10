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

// ─── OAuth Logins ──────────────────────────────────────────────────────────────

export const loginGoogleService = async (accessToken) => {
  let payload = null;

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
    const parts = identityToken ? identityToken.split('.') : [];
    if (parts.length === 3) {
      const payloadBuf = Buffer.from(parts[1], 'base64').toString('utf-8');
      appleIdTokenClaims = JSON.parse(payloadBuf);
    } else {
      throw new ApiError(400, 'Invalid Apple Identity Token');
    }
  } catch (err) {
    throw new ApiError(400, 'Invalid Apple Identity Token');
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
