// src/helpers/otpHelper.js
// Cryptographically secure OTP generation and verification helpers.
// OTPs are bcrypt-hashed before being stored in the database.

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const OTP_DIGITS = 6;
const OTP_BCRYPT_ROUNDS = 10;
const OTP_EXPIRY_MINUTES = 10;

/**
 * Generate a random 6-digit numeric OTP string.
 * Uses crypto.randomInt for uniform distribution (not Math.random).
 * @returns {string} e.g. "483920"
 */
export const generateOtp = () => {
  const min = Math.pow(10, OTP_DIGITS - 1); // 100000
  const max = Math.pow(10, OTP_DIGITS) - 1; // 999999
  return crypto.randomInt(min, max + 1).toString();
};

/**
 * Hash an OTP with bcrypt for safe storage in MongoDB.
 * @param {string} otp - Plain-text OTP
 * @returns {Promise<string>} bcrypt hash
 */
export const hashOtp = async (otp) => {
  return bcrypt.hash(otp, OTP_BCRYPT_ROUNDS);
};

/**
 * Compare a plain-text OTP against its stored bcrypt hash.
 * @param {string} plainOtp  - The OTP entered by the user
 * @param {string} hashedOtp - The bcrypt hash stored in DB
 * @returns {Promise<boolean>}
 */
export const verifyOtpHash = async (plainOtp, hashedOtp) => {
  return bcrypt.compare(plainOtp, hashedOtp);
};

/**
 * Calculate the OTP expiry date (now + OTP_EXPIRY_MINUTES).
 * @returns {Date}
 */
export const getOtpExpiry = () => {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};

/**
 * Check whether an OTP expiry date has already passed.
 * @param {Date} expiresAt
 * @returns {boolean}
 */
export const isOtpExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};
