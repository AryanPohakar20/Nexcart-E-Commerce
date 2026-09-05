// src/services/authService.js
// Authentication service — registration, login, OAuth, and password management.
// SECURITY: Apple Sign-In now verifies JWT signature using Apple's JWKS endpoint.
// SECURITY: Login services check both isBlocked (legacy) and status (current) fields.

import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import appleSignin from 'apple-signin-auth';
import { OAuth2Client } from 'google-auth-library';

const normalizeEmail = (email) => (email ? email.toLowerCase().trim() : '');
const SELLER_ROLES = ['seller', 'marketplace_seller'];
const USER_ROLES   = ['customer', 'admin', 'super_admin', 'moderator', 'support_staff'];

// ─── Account Status Check ─────────────────────────────────────────────────────
// Checks both the legacy isBlocked flag and the newer status field for full consistency.

const assertAccountActive = (user) => {
  if (user.isBlocked || user.status === 'Blocked' || user.status === 'blocked') {
    throw new ApiError(403, 'Your account has been blocked. Please contact support.');
  }
  if (user.status === 'Suspended' || user.status === 'suspended') {
    throw new ApiError(403, 'Your account has been suspended. Please contact support.');
  }
  if (user.isDeleted || user.status === 'Deleted' || user.status === 'deleted') {
    throw new ApiError(401, 'Account not found.');
  }
};

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
    role: 'seller',    // Always 'seller' — never from user input
    isVerified: true,
  });

  logger.info(`Seller registered: ${normalizedEmail}`);
  return { user };
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

  assertAccountActive(user);

  user.lastLogin = new Date();
  await user.save();

  return { user };
};

// ─── User Registration ────────────────────────────────────────────────────────
//
// SECURITY: `role` is intentionally NOT read from `userData` (i.e. req.body).
// Public registration always creates a `customer` account. Privileged roles
// (admin, super_admin, moderator, support_staff) may only be assigned by an
// authenticated admin via PUT /admin/users/:id — never through this endpoint.

export const registerUserService = async (userData) => {
  // Destructure only the fields the client is allowed to supply.
  // `role` is explicitly excluded — any role sent by the client is ignored.
  const { firstName, lastName, username, email, phone, password } = userData;
  const normalizedEmail = normalizeEmail(email);

  // Scope the duplicate-check to 'customer' — the only role this path creates.
  const emailExists = await User.findOne({
    email: normalizedEmail,
    role: 'customer',
  });
  if (emailExists) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const finalUsername = username || `${normalizedEmail.split('@')[0]}${Math.floor(Math.random() * 1000)}`;
  const usernameExists = await User.findOne({ username: finalUsername.toLowerCase() });
  if (usernameExists) {
    throw new ApiError(400, 'Username is already taken');
  }

  // `role` is hard-coded — the client can never influence this value.
  const user = await User.create({
    firstName,
    lastName,
    username: finalUsername,
    email: normalizedEmail,
    phone,
    password,
    role: 'customer',   // Always 'customer' — never from user input
    isVerified: true,
  });

  logger.info(`User registered: ${normalizedEmail}`);
  return { user };
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

  assertAccountActive(matchedUser);

  matchedUser.lastLogin = new Date();
  await matchedUser.save();

  return { user: matchedUser };
};

// ─── Google OAuth ──────────────────────────────────────────────────────────────
// Verifies the Google access token against Google's API.
// Uses google-auth-library for proper audience/issuer validation when an ID token is provided.

export const loginGoogleService = async (accessToken) => {
  let payload = null;

  // Attempt 1: Use google-auth-library to verify ID token (preferred — validates audience)
  if (process.env.GOOGLE_CLIENT_ID) {
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: accessToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const p = ticket.getPayload();
      if (p) {
        payload = {
          sub: p.sub,
          email: p.email,
          given_name: p.given_name,
          family_name: p.family_name,
          picture: p.picture,
          name: p.name,
        };
      }
    } catch (err) {
      logger.warn(`Google ID token verification failed, trying userinfo: ${err.message}`);
    }
  }

  // Attempt 2: Treat as an access token and call the userinfo endpoint
  if (!payload) {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        payload = {
          sub: data.sub,
          email: data.email,
          given_name: data.given_name,
          family_name: data.family_name,
          picture: data.picture,
          name: data.name,
        };
      }
    } catch (err) {
      logger.warn(`Google userinfo fetch failed: ${err.message}`);
    }
  }

  if (!payload) {
    throw new ApiError(400, 'Invalid Google token or unable to reach Google API');
  }

  const { sub, email, given_name, family_name, picture, name } = payload;

  if (!email) {
    throw new ApiError(400, 'Email not provided by Google account');
  }

  let user = await User.findOne({ $or: [{ email }, { providerId: sub }] });

  if (!user) {
    const finalUsername = (email.split('@')[0] + Math.floor(Math.random() * 1000))
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');
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

  return { user };
};

// ─── Apple Sign-In ─────────────────────────────────────────────────────────────
// SECURITY: Uses apple-signin-auth to cryptographically verify the identity token
// against Apple's JWKS public keys. Validates issuer, audience, expiration, and subject.
// Never trusts email/sub before the signature verification succeeds.

export const loginAppleService = async (identityToken, userObj) => {
  if (!identityToken) {
    throw new ApiError(400, 'Apple identityToken is required');
  }

  const appleClientId = process.env.APPLE_CLIENT_ID;
  if (!appleClientId) {
    throw new ApiError(500, 'Apple Sign-In is not configured on this server (APPLE_CLIENT_ID missing).');
  }

  let appleIdTokenClaims;
  try {
    // verifyIdToken fetches Apple's JWKS, verifies the signature, iss, aud, and exp
    appleIdTokenClaims = await appleSignin.verifyIdToken(identityToken, {
      audience: appleClientId,
      ignoreExpiration: false,
    });
  } catch (err) {
    logger.warn(`Apple identity token verification failed: ${err.message}`);
    throw new ApiError(401, 'Apple identity token is invalid, expired, or forged. Login rejected.');
  }

  // At this point the token has been cryptographically verified
  const email     = appleIdTokenClaims.email || userObj?.email;
  const providerId = appleIdTokenClaims.sub;

  if (!providerId) {
    throw new ApiError(400, 'Subject (sub) not present in verified Apple token');
  }

  let user = await User.findOne({
    $or: [
      ...(email ? [{ email }] : []),
      { providerId },
    ],
  });

  if (!user) {
    const userEmail = email || `apple_${providerId}@nexcart.com`;
    const nameParts = userObj?.name || {};
    const firstName = nameParts.firstName || 'Apple';
    const lastName  = nameParts.lastName  || 'User';
    const finalUsername = (userEmail.split('@')[0] + Math.floor(Math.random() * 1000))
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');

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

  return { user };
};

// ─── Password Reset (change password using current password) ──────────────────

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

  assertAccountActive(user);

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
