// src/services/sellerService.js

import * as sellerRepo from '../repositories/sellerRepository.js';
import { SELLER_STATUS, VERIFICATION_STATUS } from '../constants/sellerStatus.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadAadhaarImage } from './cloudinaryService.js';
import logger from '../utils/logger.js';

// ─── Helper: ensure Seller document exists ───────────────────────────────────

const requireSeller = async (userId) => {
  const seller = await sellerRepo.findByUserId(userId);
  if (!seller) throw new ApiError(404, 'Seller record not found. Please create your seller account first.');
  return seller;
};

// ─── POST /api/seller/create ─────────────────────────────────────────────────

export const createSellerEntry = async (userId) => {
  // Idempotent: return existing document if one already exists
  const existing = await sellerRepo.findByUserId(userId);
  if (existing) return existing;

  const seller = await sellerRepo.createSeller({
    userId,
    sellerStatus: SELLER_STATUS.DRAFT,
    verificationStatus: VERIFICATION_STATUS.NOT_STARTED,
    onboardingStep: 0,
  });

  logger.info(`Seller document created for userId: ${userId}`);
  return seller;
};

// ─── GET /api/seller/profile ──────────────────────────────────────────────────

export const getSellerProfile = async (userId) => {
  return requireSeller(userId);
};

// ─── PUT /api/seller/onboarding/step-1 ───────────────────────────────────────
// accountInfo: { displayName, businessType, phone, email }

export const saveStep1 = async (userId, data) => {
  const { displayName, businessType, phone, email } = data;

  console.log("Service: Updating Seller Collection");
  const seller = await sellerRepo.updateByUserId(userId, {
    'accountInfo.displayName': displayName,
    'accountInfo.businessType': businessType,
    'accountInfo.phone': phone,
    'accountInfo.email': email,
    onboardingStep: 1,
  });

  if (!seller) throw new ApiError(404, 'Seller record not found.');
  logger.info(`Step 1 saved for userId: ${userId}`);
  return seller;
};

// ─── PUT /api/seller/onboarding/step-2 ───────────────────────────────────────
// profile: { shopName, description, address, city, state, pincode }

export const saveStep2 = async (userId, data) => {
  const { shopName, description, address, city, state, pincode } = data;

  console.log("Service: Updating Seller Collection");
  const seller = await sellerRepo.updateByUserId(userId, {
    'profile.shopName': shopName,
    'profile.description': description,
    'profile.address': address,
    'profile.city': city,
    'profile.state': state,
    'profile.pincode': pincode,
    onboardingStep: 2,
  });

  if (!seller) throw new ApiError(404, 'Seller record not found.');
  logger.info(`Step 2 saved for userId: ${userId}`);
  return seller;
};

// ─── PUT /api/seller/onboarding/step-3 ───────────────────────────────────────
// identity: Aadhaar front+back images (Cloudinary), pan, gst
// files are already Buffer objects passed from controller

export const saveStep3 = async (userId, data, frontFileBuffer, backFileBuffer) => {
  const { aadhaarNumber, pan, gst } = data;

  // Upload front image (required)
  const frontUpload = await uploadAadhaarImage(frontFileBuffer, 'nexcart/identity');

  // Upload back image (optional)
  let backUpload = null;
  if (backFileBuffer) {
    backUpload = await uploadAadhaarImage(backFileBuffer, 'nexcart/identity');
  }

  const updates = {
    'identity.aadhaar.number': aadhaarNumber || '',
    'identity.aadhaar.frontImage.public_id': frontUpload.public_id,
    'identity.aadhaar.frontImage.url': frontUpload.secure_url,
    'identity.pan': pan || '',
    'identity.gst': gst || '',
    verificationStatus: VERIFICATION_STATUS.IN_PROGRESS,
    onboardingStep: 3,
  };

  if (backUpload) {
    updates['identity.aadhaar.backImage.public_id'] = backUpload.public_id;
    updates['identity.aadhaar.backImage.url'] = backUpload.secure_url;
  }

  console.log("Service: Updating Seller Collection");
  const seller = await sellerRepo.updateByUserId(userId, updates);
  if (!seller) throw new ApiError(404, 'Seller record not found.');
  logger.info(`Step 3 (identity) saved for userId: ${userId}`);
  return seller;
};

// ─── PUT /api/seller/onboarding/step-4 ───────────────────────────────────────
// payment: { accountHolder, accountNumber, ifsc, upiId }

export const saveStep4 = async (userId, data) => {
  const { accountHolder, accountNumber, ifsc, upiId } = data;

  console.log("Service: Updating Seller Collection");
  const seller = await sellerRepo.updateByUserId(userId, {
    'payment.accountHolder': accountHolder || '',
    'payment.accountNumber': accountNumber || '',
    'payment.ifsc': ifsc || '',
    'payment.upiId': upiId || '',
    onboardingStep: 4,
  });

  if (!seller) throw new ApiError(404, 'Seller record not found.');
  logger.info(`Step 4 (payment) saved for userId: ${userId}`);
  return seller;
};

// ─── PUT /api/seller/onboarding/step-5 ───────────────────────────────────────
// agreement: accept terms and submit for review

export const saveStep5 = async (userId) => {
  console.log("Service: Updating Seller Collection");
  const seller = await sellerRepo.updateByUserId(userId, {
    'agreement.accepted': true,
    'agreement.acceptedAt': new Date(),
    sellerStatus: SELLER_STATUS.PENDING,
    onboardingStep: 5,
  });

  if (!seller) throw new ApiError(404, 'Seller record not found.');
  logger.info(`Step 5 (agreement) accepted for userId: ${userId}`);
  return seller;
};

// ─── GET /api/seller/status ───────────────────────────────────────────────────

export const getSellerStatus = async (userId) => {
  const seller = await requireSeller(userId);
  return {
    sellerId: seller.sellerId,
    sellerStatus: seller.sellerStatus,
    verificationStatus: seller.verificationStatus,
    onboardingStep: seller.onboardingStep,
  };
};
