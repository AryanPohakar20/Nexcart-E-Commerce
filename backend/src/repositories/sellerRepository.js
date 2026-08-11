// src/repositories/sellerRepository.js
// Data-access layer for the Seller entity.
// All direct Mongoose calls live here. Services call this — never query the model directly.

import Seller from '../models/Seller.js';

// ─── User populate projection ─────────────────────────────────────────────────
const USER_POPULATE = {
  path: 'userId',
  select: 'firstName lastName email phone avatar isVerified role status',
};

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Create a new Seller document linked to a User.
 * @param {Object} data - { userId, ...any initial fields }
 */
export const createSeller = async (data) => {
  const seller = new Seller(data);
  return seller.save();
};

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Find a Seller document by the owner's User._id.
 * Populates userId with essential user fields.
 */
export const findByUserId = async (userId) => {
  return Seller.findOne({ userId }).populate(USER_POPULATE);
};

/**
 * Find a Seller document by its public slug.
 * Uses lean() for performance on public profile reads.
 * @param {string} slug
 */
export const findBySlug = async (slug) => {
  return Seller.findOne({ slug: slug.toLowerCase().trim() })
    .populate(USER_POPULATE)
    .lean();
};

/**
 * Find a Seller document by its internal MongoDB _id.
 * @param {string} id
 */
export const findById = async (id) => {
  return Seller.findById(id).populate(USER_POPULATE);
};

/**
 * Find a Seller document by its sellerId string (e.g. 'SLR-...-...')
 * @param {string} sellerId
 */
export const findBySellerId = async (sellerId) => {
  return Seller.findOne({ sellerId }).populate(USER_POPULATE).lean();
};

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Update a Seller document by the owner's User._id.
 * Returns the updated document with populated userId.
 * @param {string} userId
 * @param {Object} updates - Flat or dot-notation update map (for $set)
 */
export const updateByUserId = async (userId, updates) => {
  return Seller.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true, runValidators: true }
  ).populate(USER_POPULATE);
};

/**
 * Atomically increment a numeric field (e.g. profileViews, followers).
 * @param {string} slug
 * @param {Object} increments - e.g. { profileViews: 1 }
 */
export const incrementBySlug = async (slug, increments) => {
  return Seller.findOneAndUpdate(
    { slug: slug.toLowerCase().trim() },
    { $inc: increments },
    { new: true }
  ).lean();
};

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete a Seller document by the owner's User._id.
 * @param {string} userId
 */
export const deleteByUserId = async (userId) => {
  return Seller.findOneAndDelete({ userId });
};

// ─── Search / List ────────────────────────────────────────────────────────────

/**
 * Paginated list of sellers.
 * @param {Object} options
 * @param {number} options.page
 * @param {number} options.limit
 * @param {Object} options.filter
 */
export const listSellers = async ({ page = 1, limit = 20, filter = {} } = {}) => {
  const skip = (page - 1) * limit;
  const [sellers, total] = await Promise.all([
    Seller.find(filter)
      .select('slug sellerType sellerId rating totalReviews followers verificationStatus isActive createdAt individual.fullName business.businessName business.businessCategory')
      .populate({ path: 'userId', select: 'firstName lastName avatar' })
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Seller.countDocuments(filter),
  ]);

  return { sellers, total, page, limit, totalPages: Math.ceil(total / limit) };
};

/**
 * Update the rating statistics for a seller by their User ID.
 * @param {string} sellerUserId - Seller User ID
 * @param {Object} stats - Statistics object
 */
export const updateSellerRatingStatistics = async (sellerUserId, stats) => {
  return await Seller.findOneAndUpdate(
    { userId: sellerUserId },
    { $set: stats },
    { new: true }
  );
};

/**
 * Update the performance statistics object on a Seller document by the Seller's _id.
 * @param {string} sellerDocId - Seller document ID
 * @param {Object} statsUpdates - Statistics updates using dot notation
 */
export const updateSellerStatistics = async (sellerDocId, statsUpdates) => {
  return await Seller.findByIdAndUpdate(
    sellerDocId,
    { $set: statsUpdates },
    { new: true }
  );
};

/**
 * Update the trust score and metadata for a seller by their document ID.
 * @param {string} sellerDocId - Seller document ID
 * @param {Object} trustData - { trustScore, lastTrustScoreUpdatedAt }
 */
export const updateSellerTrustScore = async (sellerDocId, trustData) => {
  return await Seller.findByIdAndUpdate(
    sellerDocId,
    { $set: trustData },
    { new: true }
  );
};
