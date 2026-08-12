// src/services/authService.js
// Authentication service — registration, login, OAuth, and password management.
// OTP / email-verification removed. Accounts are immediately active after registration.

import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

const normalizeEmail = (email) => (email ? email.toLowerCase().trim() : '');
const SELLER_ROLES = ['seller', 'marketplace_seller'];
const USER_ROLES = ['customer', 'admin', 'super_admin', 'moderator', 'support_staff'];

// ─── Seller Registration ──────────────────────────────────────────────────────

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
    isVerified: true,
  });

  logger.info(`Seller registered: ${normalizedEmail}`);
  return { user, token: user.generateJWT() };
};

// ─── Seller Login ─────────────────────────────────────────────────────────────

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

// ─── User Registration ────────────────────────────────────────────────────────

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
    isVerified: true,
  });

  logger.info(`User registered: ${normalizedEmail}`);
  return { user, token: user.generateJWT() };
};

// ─── User Login ───────────────────────────────────────────────────────────────

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

// ─── Password Reset (change password using current password) ──────────────────
// SMTP / OTP removed. Password reset now requires the user's current password
// for identity verification — no email delivery needed.

export const forgotPassword = async (email, role = null) => {
  // Stub — no email delivery in this deployment.
  // Returns silently so callers don't reveal whether an account exists.
  logger.info(`Forgot-password stub called for: ${normalizeEmail(email)} (no email sent — SMTP removed)`);
};

export const resetPassword = async (email, currentPassword, newPassword, role = null) => {
  const normalizedEmail = normalizeEmail(email);
  const query = { email: normalizedEmail };

  if (role) {
    query.role = Array.isArray(role)
      ? { $in: role.map((r) => String(r).toLowerCase()) }
      : String(role).toLowerCase();
  }

  const user = await User.findOne(query).select('+password');
  if (!user) {
    throw new ApiError(404, 'No account found with this email.');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'Your account has been blocked.');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect.');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters.');
  }

  user.password = newPassword;
  await user.save();

  logger.info(`Password changed for: ${normalizedEmail}`);
};
