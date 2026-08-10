// src/services/profileCompletion.js
// Calculates profile completion percentage for both customers and sellers.

import Address from '../models/Address.js';

// ─── Customer Profile Completion ──────────────────────────────────────────────

/**
 * Weight map for customer profile fields.
 * Total: 100%
 */
const CUSTOMER_WEIGHTS = {
  avatar: 10,
  phone: 15,
  dob: 10,
  gender: 10,
  bio: 10,
  address: 20,   // at least one saved address
  isVerified: 15, // email verified
  password: 10,   // password exists (always true for registered users)
};

/**
 * Calculate customer profile completion.
 *
 * @param {Object} user - Mongoose User document
 * @param {Boolean|null} hasAddress - Optional pre-fetched flag
 * @returns {Promise<{ completion: number, completed: boolean }>}
 */
export const calculateCompletion = async (user, hasAddress = null) => {
  let addressExists = hasAddress;
  if (addressExists === null) {
    const count = await Address.countDocuments({ userId: user._id });
    addressExists = count > 0;
  }

  let total = 0;

  if (user.avatar) total += CUSTOMER_WEIGHTS.avatar;
  if (user.phone && user.phone.trim()) total += CUSTOMER_WEIGHTS.phone;
  if (user.dob) total += CUSTOMER_WEIGHTS.dob;
  if (user.gender) total += CUSTOMER_WEIGHTS.gender;
  if (user.bio && user.bio.trim()) total += CUSTOMER_WEIGHTS.bio;
  if (addressExists) total += CUSTOMER_WEIGHTS.address;
  if (user.isVerified) total += CUSTOMER_WEIGHTS.isVerified;
  // Password always exists for registered users — give full credit
  total += CUSTOMER_WEIGHTS.password;

  const completion = Math.min(total, 100);
  const completed = completion === 100;

  return { completion, completed };
};

/**
 * Recalculate and persist customer profile completion onto the User document.
 *
 * @param {Object} user - Mongoose User document (must have .save())
 * @param {Boolean|null} hasAddress - Optional pre-fetched flag
 * @returns {Promise<{ completion: number, completed: boolean }>}
 */
export const updateCompletion = async (user, hasAddress = null) => {
  const { completion, completed } = await calculateCompletion(user, hasAddress);
  user.profileCompletion = completion;
  user.profileCompleted = completed;
  await user.save();
  return { completion, completed };
};

// ─── Seller Profile Completion ────────────────────────────────────────────────

/**
 * Weight map for seller profile fields.
 * Total: 100%
 * Weights differ based on sellerType (individual vs business).
 */
const SELLER_WEIGHTS = {
  shared: {
    phone: 10,
    address: 10,
    city: 5,
    isVerified: 15, // email verified (from User)
  },
  individual: {
    photo: 15,       // profilePhoto
    fullName: 15,    // individual.fullName
    about: 15,       // individual.about
    verification: 15, // verificationStatus === Verified
  },
  business: {
    logo: 10,        // business.businessLogo
    banner: 10,      // business.businessBanner
    businessName: 10, // business.businessName
    ownerName: 5,    // business.ownerName
    description: 15,  // business.businessDescription
    category: 5,      // business.businessCategory
    verification: 10, // verificationStatus === Verified
  },
};

/**
 * Calculate seller profile completion.
 * Accounts for sellerType: individual vs business.
 *
 * @param {Object} seller - Mongoose Seller document (with populated userId or plain user ref)
 * @param {Object|null} user - Mongoose User document (if not populated on seller)
 * @returns {{ completion: number, breakdown: Object }}
 */
export const calculateSellerCompletion = (seller, user = null) => {
  const resolvedUser = seller.userId?._id ? seller.userId : user;
  const isBusiness = seller.sellerType === 'business';
  const weights = SELLER_WEIGHTS;

  let total = 0;
  const breakdown = {};

  // ── Shared fields ────────────────────────────────────────────────────────────
  const phone = seller.accountInfo?.phone || resolvedUser?.phone || '';
  if (phone && phone.trim()) {
    total += weights.shared.phone;
    breakdown.phone = true;
  }

  const city = seller.address?.city || seller.profile?.city || '';
  if (city && city.trim()) {
    total += weights.shared.city;
    breakdown.city = true;
  }

  const address = seller.address?.address || seller.profile?.address || '';
  if (address && address.trim()) {
    total += weights.shared.address;
    breakdown.address = true;
  }

  const isVerified = resolvedUser?.isVerified || false;
  if (isVerified) {
    total += weights.shared.isVerified;
    breakdown.emailVerified = true;
  }

  // ── Type-specific fields ─────────────────────────────────────────────────────
  if (isBusiness) {
    const w = weights.business;

    if (seller.business?.businessLogo?.url) { total += w.logo; breakdown.logo = true; }
    if (seller.business?.businessBanner?.url) { total += w.banner; breakdown.banner = true; }
    if (seller.business?.businessName?.trim()) { total += w.businessName; breakdown.businessName = true; }
    if (seller.business?.ownerName?.trim()) { total += w.ownerName; breakdown.ownerName = true; }
    if (seller.business?.businessDescription?.trim()) { total += w.description; breakdown.description = true; }
    if (seller.business?.businessCategory?.trim()) { total += w.category; breakdown.category = true; }
    if (seller.verificationStatus === 'Verified') { total += w.verification; breakdown.verified = true; }
  } else {
    const w = weights.individual;

    const hasPhoto = seller.individual?.profilePhoto?.url || resolvedUser?.avatar;
    if (hasPhoto) { total += w.photo; breakdown.photo = true; }

    const fullName = seller.individual?.fullName || seller.accountInfo?.displayName || '';
    if (fullName.trim()) { total += w.fullName; breakdown.fullName = true; }

    const about = seller.individual?.about || seller.profile?.description || '';
    if (about.trim()) { total += w.about; breakdown.about = true; }

    if (seller.verificationStatus === 'Verified') { total += w.verification; breakdown.verified = true; }
  }

  const completion = Math.min(Math.round(total), 100);
  return { completion, breakdown };
};

/**
 * Recalculate and persist seller profile completion.
 * Updates seller.dashboard.profileCompletion.
 *
 * @param {Object} seller - Mongoose Seller document (must have .save())
 * @param {Object|null} user - Populated User document (optional if already populated)
 * @returns {Promise<number>} - Updated completion percentage
 */
export const updateSellerCompletion = async (seller, user = null) => {
  const { completion } = calculateSellerCompletion(seller, user);

  if (!seller.dashboard) seller.dashboard = {};
  seller.dashboard.profileCompletion = completion;

  await seller.save();
  return completion;
};
