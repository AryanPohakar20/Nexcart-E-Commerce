// src/services/sellerService.js

import * as sellerRepo from '../repositories/sellerRepository.js';
import { SELLER_STATUS, VERIFICATION_STATUS } from '../constants/sellerStatus.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadAadhaarImage, replaceImage, deleteImage } from './cloudinaryService.js';
import { buildDashboardProfile, buildPublicProfile } from '../helpers/sellerHelpers.js';
import { generateUniqueSlug } from '../helpers/slugGenerator.js';
import { calculateSellerCompletion } from './profileCompletion.js';
import User from '../models/User.js';
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

// ─── GET /api/seller/profile (onboarding) ─────────────────────────────────────

export const getSellerProfile = async (userId) => {
  return requireSeller(userId);
};

// ─── PUT /api/seller/onboarding/step-1 ───────────────────────────────────────

export const saveStep1 = async (userId, data) => {
  const { displayName, businessType, phone, email } = data;

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

export const saveStep2 = async (userId, data) => {
  const { shopName, description, address, city, state, pincode } = data;

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

export const saveStep3 = async (userId, data, frontFileBuffer, backFileBuffer) => {
  const { aadhaarNumber, pan, gst } = data;

  const frontUpload = await uploadAadhaarImage(frontFileBuffer, 'nexcart/identity');

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

  const seller = await sellerRepo.updateByUserId(userId, updates);
  if (!seller) throw new ApiError(404, 'Seller record not found.');
  logger.info(`Step 3 (identity) saved for userId: ${userId}`);
  return seller;
};

// ─── PUT /api/seller/onboarding/step-4 ───────────────────────────────────────

export const saveStep4 = async (userId, data) => {
  const { accountHolder, accountNumber, ifsc, upiId } = data;

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

export const saveStep5 = async (userId) => {
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

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 2B PART 1 — Dashboard / Profile / Settings / Public Profile
// ═══════════════════════════════════════════════════════════════════════════════

// ─── GET /api/seller/dashboard/profile ───────────────────────────────────────

/**
 * Get the full dashboard profile for the authenticated seller.
 * Generates slug lazily if missing. Updates profile completion.
 */
export const getDashboardProfile = async (userId) => {
  let seller = await requireSeller(userId);

  // Lazy slug generation — generate once if missing
  if (!seller.slug) {
    const slug = await generateUniqueSlug(seller);
    seller = await sellerRepo.updateByUserId(userId, { slug });
  }

  // Recalculate and persist profile completion
  const { completion } = calculateSellerCompletion(seller, seller.userId);
  if (seller.dashboard?.profileCompletion !== completion) {
    await sellerRepo.updateByUserId(userId, { 'dashboard.profileCompletion': completion });
    seller.dashboard = seller.dashboard || {};
    seller.dashboard.profileCompletion = completion;
  }

  return buildDashboardProfile(seller);
};

// ─── PUT /api/seller/dashboard/profile ───────────────────────────────────────

/**
 * Update seller profile fields (type-aware).
 * Individual → fullName, about
 * Business  → businessName, ownerName, businessDescription, businessCategory, website, gst
 * Shared    → phone, address fields
 */
export const updateSellerProfile = async (userId, data) => {
  let seller = await requireSeller(userId);
  const isBusiness = seller.sellerType === 'business';

  const updates = {};

  // ── Shared fields ────────────────────────────────────────────────────────────
  if (data.phone !== undefined) updates['accountInfo.phone'] = data.phone;
  if (data.address !== undefined) updates['address.address'] = data.address;
  if (data.city !== undefined) updates['address.city'] = data.city;
  if (data.state !== undefined) updates['address.state'] = data.state;
  if (data.country !== undefined) updates['address.country'] = data.country;
  if (data.pincode !== undefined) updates['address.pincode'] = data.pincode;

  // ── Type-specific fields ──────────────────────────────────────────────────────
  if (isBusiness) {
    if (data.businessName !== undefined) updates['business.businessName'] = data.businessName;
    if (data.ownerName !== undefined) updates['business.ownerName'] = data.ownerName;
    if (data.businessDescription !== undefined) updates['business.businessDescription'] = data.businessDescription;
    if (data.businessCategory !== undefined) updates['business.businessCategory'] = data.businessCategory;
    if (data.website !== undefined) updates['business.website'] = data.website;
    if (data.gst !== undefined) updates['business.gst'] = data.gst.toUpperCase();
  } else {
    if (data.fullName !== undefined) updates['individual.fullName'] = data.fullName;
    if (data.about !== undefined) updates['individual.about'] = data.about;
  }

  seller = await sellerRepo.updateByUserId(userId, updates);
  if (!seller) throw new ApiError(404, 'Seller record not found.');

  // Regenerate slug if primary name changed
  const nameChanged = isBusiness ? data.businessName !== undefined : data.fullName !== undefined;
  if (nameChanged) {
    const slug = await generateUniqueSlug(seller);
    seller = await sellerRepo.updateByUserId(userId, { slug });
  }

  // Recalculate profile completion
  const { completion } = calculateSellerCompletion(seller, seller.userId);
  await sellerRepo.updateByUserId(userId, { 'dashboard.profileCompletion': completion });

  logger.info(`Seller profile updated for userId: ${userId}`);
  return buildDashboardProfile(seller);
};

// ─── PATCH /api/seller/dashboard/profile/image ───────────────────────────────

/**
 * Upload/replace profile image.
 * Individual → profilePhoto
 * Business  → businessLogo
 */
export const updateProfileImage = async (userId, fileBuffer) => {
  const seller = await requireSeller(userId);
  const isBusiness = seller.sellerType === 'business';

  const folder = 'nexcart/sellers';
  let oldPublicId = null;
  let updateKey = '';

  if (isBusiness) {
    oldPublicId = seller.business?.businessLogo?.public_id || null;
    updateKey = 'business.businessLogo';
  } else {
    oldPublicId = seller.individual?.profilePhoto?.public_id || null;
    updateKey = 'individual.profilePhoto';
  }

  const uploaded = await replaceImage(oldPublicId, fileBuffer, folder, {
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  });

  const updated = await sellerRepo.updateByUserId(userId, {
    [`${updateKey}.public_id`]: uploaded.public_id,
    [`${updateKey}.url`]: uploaded.secure_url,
  });

  if (!updated) throw new ApiError(404, 'Seller record not found.');

  logger.info(`Profile image updated for userId: ${userId}`);
  return {
    url: uploaded.secure_url,
    public_id: uploaded.public_id,
  };
};

// ─── PATCH /api/seller/dashboard/profile/banner ──────────────────────────────

/**
 * Upload/replace business banner image.
 * Only available for business sellers.
 */
export const updateBanner = async (userId, fileBuffer) => {
  const seller = await requireSeller(userId);

  if (seller.sellerType !== 'business') {
    throw new ApiError(400, 'Banner images are only available for business sellers.');
  }

  const oldPublicId = seller.business?.businessBanner?.public_id || null;

  const uploaded = await replaceImage(oldPublicId, fileBuffer, 'nexcart/sellers/banners', {
    transformation: [{ width: 1200, height: 400, crop: 'fill' }],
  });

  const updated = await sellerRepo.updateByUserId(userId, {
    'business.businessBanner.public_id': uploaded.public_id,
    'business.businessBanner.url': uploaded.secure_url,
  });

  if (!updated) throw new ApiError(404, 'Seller record not found.');

  logger.info(`Business banner updated for userId: ${userId}`);
  return {
    url: uploaded.secure_url,
    public_id: uploaded.public_id,
  };
};

// ─── GET /api/seller/public/:slug ────────────────────────────────────────────

/**
 * Get public seller profile by slug.
 * No authentication required. Increments profile views atomically.
 */
export const getPublicSellerProfile = async (slug) => {
  const seller = await sellerRepo.findBySlug(slug);

  if (!seller) throw new ApiError(404, 'Seller not found.');
  if (!seller.isActive) throw new ApiError(404, 'This seller profile is not available.');

  // Increment profile views (fire-and-forget — don't await to keep response fast)
  sellerRepo.incrementBySlug(slug, { profileViews: 1, 'statistics.profileViews': 1 }).catch(() => {});

  return buildPublicProfile(seller);
};

// ─── GET /api/seller/dashboard/settings ──────────────────────────────────────

export const getSettings = async (userId) => {
  const seller = await requireSeller(userId);
  return seller.settings || {};
};

// ─── PUT /api/seller/dashboard/settings ──────────────────────────────────────

/**
 * Update seller settings. Merges only provided sub-sections — never overwrites
 * unrelated settings fields.
 */
export const updateSettings = async (userId, data) => {
  const updates = {};

  // Build dot-notation updates for only the provided fields
  // This ensures partial updates don't wipe out sibling settings
  const sections = ['notifications', 'privacy', 'shipping', 'returns'];

  for (const section of sections) {
    if (data[section] && typeof data[section] === 'object') {
      for (const [key, value] of Object.entries(data[section])) {
        updates[`settings.${section}.${key}`] = value;
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No valid settings fields provided.');
  }

  const seller = await sellerRepo.updateByUserId(userId, updates);
  if (!seller) throw new ApiError(404, 'Seller record not found.');

  logger.info(`Settings updated for userId: ${userId}`);
  return seller.settings;
};

// ─── PATCH /api/seller/dashboard/settings/password ───────────────────────────

/**
 * Change seller password. Verifies current password before updating.
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found.');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new ApiError(401, 'Current password is incorrect.');

  user.password = newPassword; // pre-save hook re-hashes
  await user.save();

  logger.info(`Password changed for seller userId: ${userId}`);
};

// ─── PATCH /api/seller/dashboard/settings/deactivate ─────────────────────────

/**
 * Deactivate the seller store (soft deactivation — keeps data).
 */
export const deactivateStore = async (userId) => {
  const seller = await sellerRepo.updateByUserId(userId, {
    isActive: false,
    sellerStatus: SELLER_STATUS.SUSPENDED,
  });

  if (!seller) throw new ApiError(404, 'Seller record not found.');

  logger.info(`Store deactivated for userId: ${userId}`);
  return { isActive: false };
};

// ─── DELETE /api/seller/dashboard/settings/delete ────────────────────────────

/**
 * Delete the seller store. Permanently removes the Seller document.
 * The User account is preserved.
 */
export const deleteStore = async (userId) => {
  const seller = await sellerRepo.findByUserId(userId);
  if (!seller) throw new ApiError(404, 'Seller record not found.');

  // Clean up Cloudinary images before deleting
  const cleanupTasks = [];

  if (seller.individual?.profilePhoto?.public_id) {
    cleanupTasks.push(deleteImage(seller.individual.profilePhoto.public_id));
  }
  if (seller.business?.businessLogo?.public_id) {
    cleanupTasks.push(deleteImage(seller.business.businessLogo.public_id));
  }
  if (seller.business?.businessBanner?.public_id) {
    cleanupTasks.push(deleteImage(seller.business.businessBanner.public_id));
  }

  // Run cleanups concurrently (non-blocking on failure)
  await Promise.allSettled(cleanupTasks);

  await sellerRepo.deleteByUserId(userId);

  logger.info(`Store deleted for userId: ${userId}`);
};

// ─── GET /api/seller/dashboard/summary ───────────────────────────────────────

/**
 * Get a summary object for the seller dashboard header.
 * Returns computed values needed by the dashboard overview.
 */
export const getDashboardSummary = async (userId) => {
  const seller = await requireSeller(userId);

  const trustScore = seller.trustScore || 0;
  const sellerLevel = seller.sellerLevel || 'bronze';
  const { completion } = calculateSellerCompletion(seller, seller.userId);

  return {
    sellerId: seller.sellerId,
    slug: seller.slug,
    sellerType: seller.sellerType,
    sellerStatus: seller.sellerStatus,
    verificationStatus: seller.verificationStatus,
    isActive: seller.isActive,
    trustScore,
    sellerLevel,
    profileCompletion: completion,
    rating: seller.rating || 0,
    totalReviews: seller.totalReviews || 0,
    followers: seller.followers || 0,
    statistics: seller.statistics || {},
    dashboard: seller.dashboard || {},
  };
};
