// src/services/sellerService.js

import * as userRepo from '../repositories/userRepository.js';
import * as sellerRepo from '../repositories/sellerRepository.js';
import { ROLES } from '../constants/roles.js';
import { SELLER_STATUS } from '../constants/sellerStatus.js';
import { AppError } from './authService.js';
import { sendOtpEmail } from './emailService.js';
import { generateOtp, hashOtp, getOtpExpiry } from '../helpers/otpHelper.js';
import logger from '../utils/logger.js';

export const registerSeller = async ({ firstName, lastName, email, password, phone, username }) => {
  let user = await userRepo.findByEmail(email);
  let profile;

  if (user) {
    profile = await sellerRepo.findProfileByUserId(user._id);
    if (!profile) {
      profile = await sellerRepo.createSellerProfile({
        user: user._id,
        status: SELLER_STATUS.DRAFT,
      });
      await sellerRepo.createStatistics(profile._id);
      await sellerRepo.createSettings(profile._id);
    }
  } else {
    user = await userRepo.createUser({
      firstName,
      lastName,
      email,
      password,
      phone: phone || null,
      role: ROLES.CUSTOMER, 
    });

    profile = await sellerRepo.createSellerProfile({
      user: user._id,
      status: SELLER_STATUS.DRAFT,
    });

    await sellerRepo.createStatistics(profile._id);
    await sellerRepo.createSettings(profile._id);
  }

  // Send Email OTP
  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);
  const expiresAt = getOtpExpiry();

  await userRepo.saveOtp(user._id, hashedOtp, expiresAt);

  try {
    await sendOtpEmail(email, otp, 'Seller Email Verification');
  } catch (err) {
    logger.error(`Registration OTP email failed for ${email}: ${err.message}`);
  }

  logger.info(`New Seller Draft created: ${email} (${user._id})`);
  return { user, profile };
};

export const saveProfile = async (userId, data) => {
  let profile = await sellerRepo.findProfileByUserId(userId);
  if (!profile) {
    throw new AppError('Seller profile not found.', 404);
  }

  profile = await sellerRepo.updateSellerProfile(userId, {
    ...data,
    status: SELLER_STATUS.PROFILE_COMPLETED,
  });

  return profile;
};

export const submitIdentity = async (userId, data) => {
  const profile = await sellerRepo.findProfileByUserId(userId);
  if (!profile) throw new AppError('Seller profile not found.', 404);

  const docs = await sellerRepo.saveVerificationDocuments(profile._id, data);
  await sellerRepo.updateSellerProfile(userId, { status: SELLER_STATUS.IDENTITY_SUBMITTED });

  return docs;
};

export const submitPayment = async (userId, data) => {
  const profile = await sellerRepo.findProfileByUserId(userId);
  if (!profile) throw new AppError('Seller profile not found.', 404);

  const payment = await sellerRepo.savePaymentDetails(profile._id, data);
  // Status transitions to VERIFICATION_PENDING after this
  await sellerRepo.updateSellerProfile(userId, { status: SELLER_STATUS.VERIFICATION_PENDING });

  return payment;
};

export const getFullProfile = async (userId) => {
  const profile = await sellerRepo.findProfileByUserId(userId);
  if (!profile) throw new AppError('Seller profile not found.', 404);

  const docs = await sellerRepo.getVerificationDocuments(profile._id);
  const payment = await sellerRepo.getPaymentDetails(profile._id);
  const stats = await sellerRepo.getStatistics(profile._id);
  const settings = await sellerRepo.getSettings(profile._id);

  // Calculate mock trust score
  let trustScore = 0;
  if (profile.status !== SELLER_STATUS.DRAFT) trustScore += 20;
  if (profile.status === SELLER_STATUS.EMAIL_VERIFIED || profile.status === SELLER_STATUS.MOBILE_VERIFIED) trustScore += 20;
  if (profile.status === SELLER_STATUS.IDENTITY_SUBMITTED) trustScore += 20;
  if (profile.status === SELLER_STATUS.VERIFICATION_PENDING) trustScore += 20;
  if (profile.status === SELLER_STATUS.MARKETPLACE_SELLER) trustScore += 20;

  profile.trustScore = trustScore;
  await profile.save();

  return {
    profile,
    documents: docs,
    payment,
    statistics: stats,
    settings,
  };
};

export const agreeToTerms = async (userId) => {
  const profile = await sellerRepo.updateSellerProfile(userId, { status: SELLER_STATUS.VERIFICATION_PENDING });
  return profile;
};

// Simulated admin approval
export const approveSeller = async (userId) => {
  const profile = await sellerRepo.updateSellerProfile(userId, { status: SELLER_STATUS.MARKETPLACE_SELLER });
  await userRepo.updateUser(userId, { role: ROLES.MARKETPLACE_SELLER });
  return profile;
};
