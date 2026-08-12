// src/services/sellerService.js

import mongoose from 'mongoose';
import * as sellerRepo from '../repositories/sellerRepository.js';
import { SELLER_STATUS, VERIFICATION_STATUS } from '../constants/sellerStatus.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadPrivateDocument, replaceImage, deleteImage, getSignedUrl } from './supabaseStorageService.js';
import { buildDashboardProfile, buildPublicProfile } from '../helpers/sellerHelpers.js';
import { generateUniqueSlug } from '../helpers/slugGenerator.js';
import { calculateSellerCompletion } from './profileCompletion.js';
import { calculateTrustScore, getTrustLevel } from './trustScore.js';
import User from '../models/User.js';
import Seller from '../models/Seller.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Follow from '../models/Follow.js';
import Review from '../models/Review.js';
import MarketplaceListing from '../models/MarketplaceListing.js';
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

export const saveStep3 = async (userId, data, frontFile, backFile) => {
  const { aadhaarNumber, pan, gst } = data;

  const frontBuffer = Buffer.isBuffer(frontFile) ? frontFile : frontFile?.buffer;
  const frontName = frontFile?.originalname || 'aadhaar_front.jpg';

  const backBuffer = Buffer.isBuffer(backFile) ? backFile : backFile?.buffer;
  const backName = backFile?.originalname || 'aadhaar_back.jpg';

  const frontUpload = await uploadPrivateDocument(frontBuffer, `verification/${userId}`, frontName);

  let backUpload = null;
  if (backBuffer) {
    backUpload = await uploadPrivateDocument(backBuffer, `verification/${userId}`, backName);
  }

  const updates = {
    'identity.aadhaar.number': aadhaarNumber || '',
    'identity.aadhaar.frontImage.public_id': frontUpload.path,
    'identity.aadhaar.frontImage.url': frontUpload.url,
    'identity.pan': pan || '',
    'identity.gst': gst || '',
    verificationStatus: VERIFICATION_STATUS.IN_PROGRESS,
    onboardingStep: 3,
  };

  if (backUpload) {
    updates['identity.aadhaar.backImage.public_id'] = backUpload.path;
    updates['identity.aadhaar.backImage.url'] = backUpload.url;
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
    sellerStatus: SELLER_STATUS.APPROVED,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    onboardingStep: 5,
  });

  if (!seller) throw new ApiError(404, 'Seller record not found.');

  await User.findByIdAndUpdate(userId, {
    role: 'seller',
    isVerified: true,
  });

  logger.info(`Step 5 (agreement) accepted and seller approved for userId: ${userId}`);
  return seller;
};

// ─── GET /api/seller/status ───────────────────────────────────────────────────

export const getSellerStatus = async (userId) => {
  const seller = await requireSeller(userId);
  const status = seller.sellerStatus === SELLER_STATUS.APPROVED ? 'Marketplace Seller' : seller.sellerStatus;
  return {
    status,
    sellerId: seller.sellerId,
    sellerStatus: seller.sellerStatus,
    verificationStatus: seller.verificationStatus,
    onboardingStep: seller.onboardingStep,
    trustScore: seller.reputation?.trustScore || 100,
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

  const folder = `sellers/${userId}`;
  let oldPublicId = null;
  let updateKey = '';

  if (isBusiness) {
    oldPublicId = seller.business?.businessLogo?.public_id || null;
    updateKey = 'business.businessLogo';
  } else {
    oldPublicId = seller.individual?.profilePhoto?.public_id || null;
    updateKey = 'individual.profilePhoto';
  }

  const uploaded = await replaceImage(oldPublicId, fileBuffer, folder);

  const updated = await sellerRepo.updateByUserId(userId, {
    [`${updateKey}.public_id`]: uploaded.path,
    [`${updateKey}.url`]: uploaded.url,
  });

  if (!updated) throw new ApiError(404, 'Seller record not found.');

  logger.info(`Profile image updated for userId: ${userId}`);
  return {
    url: uploaded.url,
    public_id: uploaded.path,
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

  const uploaded = await replaceImage(oldPublicId, fileBuffer, `sellers/${userId}`);

  const updated = await sellerRepo.updateByUserId(userId, {
    'business.businessBanner.public_id': uploaded.path,
    'business.businessBanner.url': uploaded.url,
  });

  if (!updated) throw new ApiError(404, 'Seller record not found.');

  logger.info(`Business banner updated for userId: ${userId}`);
  return {
    url: uploaded.url,
    public_id: uploaded.path,
  };
};

// ─── GET /api/seller/public/:identifier ───────────────────────────────────────

/**
 * Get public seller/user profile by identifier (slug, sellerId, userId, or _id).
 * Computes all real database statistics, active products, reviews, and follow state.
 * Never returns sensitive fields (passwords, tokens, credentials).
 */
export const getPublicSellerProfile = async (identifier, currentUserId = null) => {
  if (!identifier) {
    throw new ApiError(400, 'Profile identifier is required.');
  }

  let seller = null;
  let user = null;
  const isObjectId = mongoose.Types.ObjectId.isValid(identifier);

  // 1. Try finding seller by slug or sellerId
  seller = await Seller.findOne({
    $or: [
      { slug: identifier.toLowerCase() },
      { sellerId: identifier },
      ...(isObjectId ? [{ _id: identifier }, { userId: identifier }] : []),
    ],
  }).populate('userId');

  if (seller && seller.userId) {
    user = seller.userId;
  } else {
    // 2. Try finding user directly by _id or username
    user = await User.findOne({
      $or: [
        { username: identifier.toLowerCase() },
        ...(isObjectId ? [{ _id: identifier }] : []),
      ],
    });

    if (user) {
      seller = await Seller.findOne({ userId: user._id });
    }
  }

  if (!user) {
    throw new ApiError(404, 'Profile not found.');
  }

  if (seller && (seller.isDeleted || seller.isBlocked || !seller.isActive)) {
    throw new ApiError(404, 'Profile not found or is currently unavailable.');
  }

  if (user.isDeleted || user.isBlocked) {
    throw new ApiError(404, 'Profile not found or is currently unavailable.');
  }

  const targetUserId = user._id;
  const targetSellerId = seller?._id;
  const sellerIdFilter = [targetUserId, targetSellerId].filter(Boolean);

  // 3. Increment profile views atomically
  if (seller) {
    Seller.updateOne({ _id: seller._id }, { $inc: { profileViews: 1, 'statistics.profileViews': 1 } }).exec();
  }

  // 4. Fetch real seller products
  const activeProducts = await Product.find({
    sellerId: { $in: sellerIdFilter },
    status: 'Active',
    isDeleted: { $ne: true },
  })
    .sort({ createdAt: -1 })
    .lean();

  // 5. Calculate real completed orders & sales stats
  const orders = await Order.find({
    seller: { $in: sellerIdFilter },
    orderStatus: { $in: ['delivered', 'shipped', 'completed', 'confirmed', 'processing', 'packed'] },
  }).lean();

  const ordersCount = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // 6. Calculate real followers count
  const followersCount = await Follow.countDocuments({ following: targetUserId });

  // 7. Fetch real reviews & calculate real rating
  const reviews = await Review.find({ seller: targetUserId })
    .sort({ createdAt: -1 })
    .lean();

  const totalReviews = reviews.length;
  let avgRating = 0;
  if (totalReviews > 0) {
    avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews;
  } else if (seller?.rating) {
    avgRating = seller.rating;
  }

  // 8. Check follow state for current user
  let isFollowing = false;
  if (currentUserId) {
    isFollowing = !!(await Follow.exists({ follower: currentUserId, following: targetUserId }));
  }

  // 9. Format response payload safely
  const isBusiness = seller?.sellerType === 'business';
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || user.username || 'Marketplace User';

  const displayName = isBusiness
    ? seller.business?.businessName || seller.accountInfo?.displayName || fullName
    : seller?.individual?.fullName || seller?.accountInfo?.displayName || fullName;

  const avatar =
    user.avatar ||
    user.profile?.avatar ||
    seller?.individual?.profilePhoto?.url ||
    seller?.business?.businessLogo?.url ||
    seller?.profile?.logo?.url ||
    '';

  const banner = seller?.business?.businessBanner?.url || seller?.profile?.banner?.url || '';

  const bio =
    user.bio ||
    user.profile?.bio ||
    seller?.individual?.about ||
    seller?.business?.businessDescription ||
    seller?.profile?.description ||
    '';

  const city = seller?.address?.city || user.addresses?.[0]?.city || seller?.profile?.city || '';
  const state = seller?.address?.state || user.addresses?.[0]?.state || seller?.profile?.state || '';
  const country = seller?.address?.country || user.addresses?.[0]?.country || 'India';

  return {
    userId: user._id.toString(),
    sellerId: seller ? seller.sellerId || seller._id.toString() : user._id.toString(),
    username: user.username || seller?.slug || '',
    slug: seller?.slug || user.username || '',
    displayName,
    fullName,
    avatar,
    banner,
    sellerType: seller?.sellerType || (user.role === 'seller' || user.role === 'marketplace_seller' ? 'individual' : 'customer'),
    typeBadge: isBusiness ? 'Small Business' : seller?.sellerType === 'individual' ? 'Individual Seller' : 'Marketplace User',
    bio,
    city,
    state,
    country,
    createdAt: user.createdAt || seller?.createdAt,
    verificationStatus: seller?.verificationStatus || (user.isVerified ? 'Verified' : 'NOT_STARTED'),
    trustScore: seller?.trustScore || 0,
    sellerLevel: seller?.sellerLevel || 'bronze',
    isBusiness,
    gst: isBusiness ? seller.business?.gst || seller.identity?.gst || '' : '',
    ownerName: isBusiness ? seller.business?.ownerName || fullName : '',
    businessCategory: seller?.business?.businessCategory || '',
    stats: {
      activeListings: activeProducts.length,
      ordersCount,
      totalRevenue,
      profileViews: (seller?.profileViews || 0) + 1,
      followers: followersCount,
      rating: Number(avgRating.toFixed(1)),
      totalReviews,
    },
    isFollowing,
    isOwnProfile: currentUserId ? currentUserId.toString() === user._id.toString() : false,
    products: activeProducts.map((p) => ({
      id: p._id,
      title: p.title || p.name,
      slug: p.slug,
      brand: p.brand || 'Generic',
      category: p.category || 'General',
      condition: p.condition || 'New',
      price: p.price,
      mrp: p.mrp || p.price,
      discount: p.discount || 0,
      stock: p.stock || 0,
      status: p.status,
      image: p.images?.[0]?.url || p.images?.[0] || '',
      images: (p.images || []).map((img) => (typeof img === 'string' ? img : img.url)),
      rating: p.rating || 0,
      reviewsCount: p.reviewsCount || 0,
    })),
    reviews: reviews.map((r) => ({
      id: r._id,
      buyerName: r.buyerName || 'Verified Buyer',
      avatar: r.buyerAvatar || '',
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt
        ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recently',
      productTitle: r.productTitle || 'Marketplace Purchase',
      type: r.orderType || 'Verified Purchase',
    })),
  };
};

/**
 * Toggle follow/unfollow relationship between current user and target user/seller.
 */
export const toggleFollowSeller = async (targetIdentifier, currentUserId) => {
  if (!currentUserId) {
    throw new ApiError(401, 'Please log in to follow sellers.');
  }

  // Find target user
  let targetUser = null;
  const isObjectId = mongoose.Types.ObjectId.isValid(targetIdentifier);

  const seller = await Seller.findOne({
    $or: [
      { slug: targetIdentifier.toLowerCase() },
      { sellerId: targetIdentifier },
      ...(isObjectId ? [{ _id: targetIdentifier }, { userId: targetIdentifier }] : []),
    ],
  });

  if (seller) {
    targetUser = await User.findById(seller.userId);
  } else {
    targetUser = await User.findOne({
      $or: [
        { username: targetIdentifier.toLowerCase() },
        ...(isObjectId ? [{ _id: targetIdentifier }] : []),
      ],
    });
  }

  if (!targetUser) throw new ApiError(404, 'User/Seller not found.');

  if (targetUser._id.toString() === currentUserId.toString()) {
    throw new ApiError(400, 'You cannot follow yourself.');
  }

  const targetUserId = targetUser._id;
  const existingFollow = await Follow.findOne({ follower: currentUserId, following: targetUserId });

  let isFollowing = false;
  if (existingFollow) {
    await Follow.deleteOne({ _id: existingFollow._id });
    isFollowing = false;
  } else {
    await Follow.create({ follower: currentUserId, following: targetUserId });
    isFollowing = true;
  }

  const followersCount = await Follow.countDocuments({ following: targetUserId });

  // Update seller followers count if seller document exists
  if (seller) {
    seller.followers = followersCount;
    if (seller.statistics) seller.statistics.followers = followersCount;
    await seller.save();
  }

  return { isFollowing, followersCount };
};

/**
 * Create a real customer review for a seller.
 */
export const createSellerReview = async (targetIdentifier, currentUserId, reviewData) => {
  if (!currentUserId) throw new ApiError(401, 'Please log in to leave a review.');

  let targetUser = null;
  const isObjectId = mongoose.Types.ObjectId.isValid(targetIdentifier);

  const seller = await Seller.findOne({
    $or: [
      { slug: targetIdentifier.toLowerCase() },
      { sellerId: targetIdentifier },
      ...(isObjectId ? [{ _id: targetIdentifier }, { userId: targetIdentifier }] : []),
    ],
  });

  if (seller) {
    targetUser = await User.findById(seller.userId);
  } else {
    targetUser = await User.findOne({
      $or: [
        { username: targetIdentifier.toLowerCase() },
        ...(isObjectId ? [{ _id: targetIdentifier }] : []),
      ],
    });
  }

  if (!targetUser) throw new ApiError(404, 'Seller not found.');

  if (targetUser._id.toString() === currentUserId.toString()) {
    throw new ApiError(400, 'You cannot review your own profile.');
  }

  const buyer = await User.findById(currentUserId);
  if (!buyer) throw new ApiError(404, 'Buyer user not found.');

  const rating = Number(reviewData.rating);
  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5 stars.');
  }

  if (!reviewData.comment || !reviewData.comment.trim()) {
    throw new ApiError(400, 'Review comment is required.');
  }

  const buyerName = `${buyer.firstName} ${buyer.lastName}`.trim() || buyer.username;
  const buyerAvatar = buyer.avatar || buyer.profile?.avatar || '';

  const review = await Review.create({
    seller: targetUser._id,
    buyer: currentUserId,
    buyerName,
    buyerAvatar,
    rating,
    comment: reviewData.comment.trim(),
    productTitle: reviewData.productTitle?.trim() || 'Marketplace Item',
    orderType: reviewData.orderType || 'Verified Purchase',
  });

  // Update seller rating stats
  const allReviews = await Review.find({ seller: targetUser._id });
  const totalReviews = allReviews.length;
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  if (seller) {
    seller.rating = Number(avgRating.toFixed(1));
    seller.totalReviews = totalReviews;
    await seller.save();
  }

  return {
    id: review._id,
    buyerName,
    avatar: buyerAvatar,
    rating: review.rating,
    comment: review.comment,
    date: 'Just now',
    productTitle: review.productTitle,
    type: review.orderType,
  };
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

  // Clean up Supabase images before deleting
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
export const getDashboardSummary = async (userId, timeframe = '7D') => {
  const seller = await requireSeller(userId);

  // Timeframe calculation for analytics
  let startDays = 7;
  let prevStartDays = 14;
  let prevEndDays = 8;
  if (timeframe === '30D') {
    startDays = 30;
    prevStartDays = 60;
    prevEndDays = 31;
  } else if (timeframe === '12M') {
    startDays = 365;
    prevStartDays = 730;
    prevEndDays = 366;
  }

  const now = new Date();
  const currentStart = new Date();
  currentStart.setDate(now.getDate() - startDays);

  const prevStart = new Date();
  prevStart.setDate(now.getDate() - prevStartDays);
  const prevEnd = new Date();
  prevEnd.setDate(now.getDate() - prevEndDays);

  // Fetch all orders for seller (non-deleted)
  const orders = await Order.find({ seller: seller._id, isDeleted: false })
    .populate('customer', 'firstName lastName email avatar')
    .sort({ createdAt: -1 })
    .lean();

  // Fetch all sold marketplace listings for seller
  const soldMarketplaceListings = await MarketplaceListing.find({
    sellerId: seller.userId,
    status: 'sold'
  }).lean();

  // Fetch all products for seller (non-deleted)
  const products = await Product.find({ sellerId: seller.userId, status: { $ne: 'Deleted' } }).lean();

  // Basic stats computation
  let totalRevenue = 0;
  let deliveredOrdersCount = 0;
  let processingOrdersCount = 0;
  let shippedOrdersCount = 0;
  
  orders.forEach(o => {
    if (o.orderStatus !== 'cancelled') {
      totalRevenue += (o.totalAmount || 0);
    }
    if (o.orderStatus === 'delivered') deliveredOrdersCount++;
    if (o.orderStatus === 'processing' || o.orderStatus === 'pending') processingOrdersCount++;
    if (o.orderStatus === 'shipped') shippedOrdersCount++;
  });

  soldMarketplaceListings.forEach(l => {
    totalRevenue += (l.finalSalePrice || 0);
  });

  const activeProducts = products.filter(p => p.status === 'Active' || p.status === 'active');
  const lowStockItemsFull = activeProducts.filter(p => p.stock > 0 && p.stock <= 5).sort((a, b) => a.stock - b.stock);
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
  const c2cCount = products.filter(p => p.sellerType === 'individual' || p.sellerType === 'individual_c2c').length;
  const businessCount = products.filter(p => p.sellerType === 'business').length;
  const totalInventoryValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);

  // Period stats for growth
  let curRev = orders
    .filter(o => o.orderStatus !== 'cancelled' && new Date(o.createdAt) >= currentStart)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
  let prevRev = orders
    .filter(o => o.orderStatus !== 'cancelled' && new Date(o.createdAt) >= prevStart && new Date(o.createdAt) < prevEnd)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  curRev += soldMarketplaceListings
    .filter(l => new Date(l.soldAt || l.updatedAt) >= currentStart)
    .reduce((sum, l) => sum + (l.finalSalePrice || 0), 0);
    
  prevRev += soldMarketplaceListings
    .filter(l => new Date(l.soldAt || l.updatedAt) >= prevStart && new Date(l.soldAt || l.updatedAt) < prevEnd)
    .reduce((sum, l) => sum + (l.finalSalePrice || 0), 0);
  
  let growthText = '+0%';
  if (prevRev === 0) {
    if (curRev > 0) growthText = '+100%';
  } else {
    const diff = ((curRev - prevRev) / prevRev) * 100;
    growthText = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
  }

  // Chart data computation
  const chartDataMap = {};
  if (timeframe === '12M') {
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short' });
      chartDataMap[label] = { revenue: 0, orders: 0 };
    }
  } else {
    for (let i = startDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = timeframe === '7D' ? d.toLocaleString('default', { weekday: 'short' }) : d.getDate().toString();
      chartDataMap[label] = { revenue: 0, orders: 0 };
    }
  }

  orders.forEach(o => {
    if (o.orderStatus === 'cancelled') return;
    const oDate = new Date(o.createdAt);
    if (oDate >= currentStart) {
       let label;
       if (timeframe === '12M') {
         label = oDate.toLocaleString('default', { month: 'short' });
       } else if (timeframe === '7D') {
         label = oDate.toLocaleString('default', { weekday: 'short' });
       } else {
         label = oDate.getDate().toString();
       }
       if (chartDataMap[label]) {
         chartDataMap[label].revenue += (o.totalAmount || 0);
         chartDataMap[label].orders += 1;
       }
    }
  });

  soldMarketplaceListings.forEach(l => {
    const lDate = new Date(l.soldAt || l.updatedAt);
    if (lDate >= currentStart) {
       let label;
       if (timeframe === '12M') {
         label = lDate.toLocaleString('default', { month: 'short' });
       } else if (timeframe === '7D') {
         label = lDate.toLocaleString('default', { weekday: 'short' });
       } else {
         label = lDate.getDate().toString();
       }
       if (chartDataMap[label]) {
         chartDataMap[label].revenue += (l.finalSalePrice || 0);
         chartDataMap[label].orders += 1;
       }
    }
  });

  const revenueChartData = Object.keys(chartDataMap).map(label => ({
    label,
    revenue: chartDataMap[label].revenue,
    orders: chartDataMap[label].orders
  }));

  // Map backend orders format to frontend recent orders format
  const recentOrders = orders.slice(0, 5).map(ord => ({
    ...ord,
    id: ord.orderId,
    orderDate: new Date(ord.createdAt).toISOString().split('T')[0],
    status: (ord.orderStatus === 'confirmed' || ord.orderStatus === 'packed') ? 'Processing' : 
            (ord.orderStatus ? ord.orderStatus.charAt(0).toUpperCase() + ord.orderStatus.slice(1) : 'Pending'),
    deliveryType: ord.shippingCarrier ? `Courier (${ord.shippingCarrier})` : 'Courier',
    customer: ord.customer ? {
      name: `${ord.customer.firstName || ''} ${ord.customer.lastName || ''}`.trim() || 'John Doe',
      avatar: ord.customer.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
    } : { name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80' },
    items: (ord.items || []).map(item => ({
      ...item,
      title: item.name || '',
    }))
  }));

  // Map backend products format to frontend low stock items format
  const lowStockItems = lowStockItemsFull.slice(0, 3).map(prod => ({
    id: prod._id || prod.id,
    title: prod.title,
    category: prod.category,
    stock: prod.stock,
    image: (prod.images && prod.images.length > 0) ? prod.images[0].url : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  }));

  const trustScore = calculateTrustScore(seller);
  const sellerLevel = getTrustLevel(trustScore);
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
    
    analytics: {
      totalRevenue,
      ordersCount: orders.length,
      deliveredOrdersCount,
      processingOrdersCount,
      shippedOrdersCount,
      totalListings: products.length,
      activeListings: activeProducts.length,
      lowStockCount: lowStockItemsFull.length,
      outOfStockCount,
      totalViews,
      c2cCount,
      businessCount,
      totalInventoryValue,
      growthText,
      revenueChartData,
      rating: seller.rating || 4.9,
      reviewsCount: seller.totalReviews || 142
    },
    recentOrders,
    lowStockItems,
  };
};
