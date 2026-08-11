// src/repositories/adminSellerRepository.js
// Admin-specific data-access layer for the Seller entity.
// Separate from sellerRepository.js (which handles seller-facing flows).

import Seller from '../models/Seller.js';

// ─── Populate projection for admin list ──────────────────────────────────────
const ADMIN_USER_POPULATE = {
  path: 'userId',
  select: 'firstName lastName email phone avatar isVerified role status isBlocked',
};

// ─── Fields selected in list view ────────────────────────────────────────────
const LIST_SELECT = [
  'userId', 'sellerId', 'slug', 'sellerType',
  'sellerStatus', 'verificationStatus', 'isActive', 'isSuspended', 'isBlocked',
  'trustScore', 'rating', 'totalReviews', 'followers', 'profileViews',
  'individual', 'business', 'accountInfo', 'address',
  'statistics', 'isDeleted', 'deletedAt', 'createdAt', 'updatedAt',
].join(' ');

// ─── List ─────────────────────────────────────────────────────────────────────

/**
 * Paginated list of sellers with join to user.
 */
export const listSellers = async ({ filter = {}, page = 1, limit = 10, sort = { createdAt: -1 } } = {}) => {
  const skip = (page - 1) * limit;
  const [sellers, total] = await Promise.all([
    Seller.find(filter)
      .select(LIST_SELECT)
      .populate(ADMIN_USER_POPULATE)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Seller.countDocuments(filter),
  ]);
  return { sellers, total };
};

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Full seller document for admin detail view.
 */
export const findSellerById = async (id) => {
  return Seller.findById(id)
    .populate(ADMIN_USER_POPULATE)
    .lean();
};

export const findSellerByUserId = async (userId) => {
  return Seller.findOne({ userId })
    .populate(ADMIN_USER_POPULATE)
    .lean();
};

/**
 * Alias used by the admin verification service.
 */
export const getSellerById = findSellerById;

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateSellerById = async (id, updates) => {
  return Seller.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true })
    .populate(ADMIN_USER_POPULATE)
    .lean();
};

// ─── Status actions ───────────────────────────────────────────────────────────

export const suspendSeller = async (id, reason) => {
  return updateSellerById(id, {
    isSuspended: true,
    isActive: false,
    ...(reason && { suspendedReason: reason }),
  });
};

export const activateSeller = async (id) => {
  return updateSellerById(id, {
    isSuspended: false,
    isBlocked: false,
    isActive: true,
    suspendedReason: null,
    blockedReason: null,
  });
};

export const blockSeller = async (id, reason) => {
  return updateSellerById(id, {
    isBlocked: true,
    isActive: false,
    ...(reason && { blockedReason: reason }),
  });
};

// ─── Soft Delete ──────────────────────────────────────────────────────────────

export const softDeleteSeller = async (id, adminId) => {
  return Seller.findByIdAndUpdate(
    id,
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: adminId,
        isActive: false,
        sellerStatus: 'Rejected',
      },
    },
    { new: true }
  )
    .populate(ADMIN_USER_POPULATE)
    .lean();
};

// ─── Stats Aggregation ────────────────────────────────────────────────────────

/**
 * Seller statistics — single round-trip aggregation.
 */
export const getSellerStats = async () => {
  const pipeline = [
    {
      $group: {
        _id: null,
        total:            { $sum: 1 },
        individuals:      { $sum: { $cond: [{ $eq: ['$sellerType', 'individual'] }, 1, 0] } },
        businesses:       { $sum: { $cond: [{ $eq: ['$sellerType', 'business'] }, 1, 0] } },
        verified:         { $sum: { $cond: [{ $eq: ['$verificationStatus', 'Verified'] }, 1, 0] } },
        pendingVerify:    { $sum: { $cond: [{ $eq: ['$verificationStatus', 'In Progress'] }, 1, 0] } },
        rejectedVerify:   { $sum: { $cond: [{ $eq: ['$verificationStatus', 'Rejected'] }, 1, 0] } },
        active:           { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
        suspended:        { $sum: { $cond: [{ $eq: ['$isSuspended', true] }, 1, 0] } },
        blocked:          { $sum: { $cond: [{ $eq: ['$isBlocked', true] }, 1, 0] } },
        approved:         { $sum: { $cond: [{ $eq: ['$sellerStatus', 'Approved'] }, 1, 0] } },
        pending:          { $sum: { $cond: [{ $eq: ['$sellerStatus', 'Pending'] }, 1, 0] } },
        draft:            { $sum: { $cond: [{ $eq: ['$sellerStatus', 'Draft'] }, 1, 0] } },
        avgTrustScore:    { $avg: '$trustScore' },
        avgRating:        { $avg: '$rating' },
        softDeleted:      { $sum: { $cond: [{ $eq: ['$isDeleted', true] }, 1, 0] } },
      },
    },
  ];

  const [result] = await Seller.aggregate(pipeline);
  return result || {
    total: 0, individuals: 0, businesses: 0,
    verified: 0, pendingVerify: 0, rejectedVerify: 0,
    active: 0, suspended: 0, blocked: 0,
    approved: 0, pending: 0, draft: 0,
    avgTrustScore: 0, avgRating: 0, softDeleted: 0,
  };
};

/**
 * Recent seller registrations — used by dashboard overview.
 */
export const getRecentSellers = async (limit = 5) => {
  return Seller.find({ isDeleted: { $ne: true } })
    .select(LIST_SELECT)
    .populate(ADMIN_USER_POPULATE)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};
