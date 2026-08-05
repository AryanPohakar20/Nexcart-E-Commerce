// src/repositories/adminUserRepository.js
// Admin-specific data-access layer for the User entity.
// Kept separate from userRepository.js (which handles auth flows) to avoid coupling.

import User from '../models/User.js';

// ─── Fields returned in list views ───────────────────────────────────────────
const LIST_PROJECTION = {
  firstName: 1, lastName: 1, username: 1, email: 1, phone: 1,
  role: 1, status: 1, isBlocked: 1, isVerified: 1,
  avatar: 1, lastLogin: 1, profileCompletion: 1,
  isDeleted: 1, deletedAt: 1,
  createdAt: 1, updatedAt: 1,
};

// ─── List ─────────────────────────────────────────────────────────────────────

/**
 * Paginated list of users with optional filter and sort.
 */
export const listUsers = async ({ filter = {}, page = 1, limit = 10, sort = { createdAt: -1 } } = {}) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter, LIST_PROJECTION)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);
  return { users, total };
};

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Get a single user by ID — full document (excluding secrets).
 */
export const findUserById = async (id) => {
  return User.findById(id)
    .select('-password -refreshToken -otp.code -otp.expiresAt')
    .lean();
};

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Generic update by ID.  Returns updated document.
 */
export const updateUserById = async (id, updates) => {
  return User.findByIdAndUpdate(id, { $set: updates }, { new: true })
    .select('-password -refreshToken -otp.code -otp.expiresAt')
    .lean();
};

// ─── Status actions ───────────────────────────────────────────────────────────

export const suspendUser = async (id, reason) => {
  return updateUserById(id, { status: 'Suspended', ...(reason && { bio: reason }) });
};

export const activateUser = async (id) => {
  return updateUserById(id, { status: 'Active', isBlocked: false });
};

export const blockUser = async (id) => {
  return updateUserById(id, { isBlocked: true, status: 'Suspended' });
};

export const unblockUser = async (id) => {
  return updateUserById(id, { isBlocked: false, status: 'Active' });
};

// ─── Soft Delete ──────────────────────────────────────────────────────────────

export const softDeleteUser = async (id, adminId) => {
  return User.findByIdAndUpdate(
    id,
    { $set: { isDeleted: true, deletedAt: new Date(), deletedBy: adminId, status: 'Deleted' } },
    { new: true }
  ).select('-password -refreshToken -otp.code -otp.expiresAt').lean();
};

// ─── Counts / Aggregations ────────────────────────────────────────────────────

/**
 * Aggregation pipeline for platform user statistics.
 * Returns all counts in a single DB round-trip.
 */
export const getUserStats = async () => {
  const pipeline = [
    {
      $group: {
        _id: null,
        total:        { $sum: 1 },
        customers:    { $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] } },
        sellers:      { $sum: { $cond: [{ $in: ['$role', ['seller', 'marketplace_seller']] }, 1, 0] } },
        admins:       { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        active:       { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
        suspended:    { $sum: { $cond: [{ $eq: ['$status', 'Suspended'] }, 1, 0] } },
        deleted:      { $sum: { $cond: [{ $eq: ['$status', 'Deleted'] }, 1, 0] } },
        blocked:      { $sum: { $cond: [{ $eq: ['$isBlocked', true] }, 1, 0] } },
        verified:     { $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] } },
        softDeleted:  { $sum: { $cond: [{ $eq: ['$isDeleted', true] }, 1, 0] } },
      },
    },
  ];

  const [result] = await User.aggregate(pipeline);
  return result || {
    total: 0, customers: 0, sellers: 0, admins: 0,
    active: 0, suspended: 0, deleted: 0, blocked: 0, verified: 0, softDeleted: 0,
  };
};

/**
 * Recent user registrations — used by dashboard overview.
 */
export const getRecentUsers = async (limit = 5) => {
  return User.find({ isDeleted: { $ne: true } }, LIST_PROJECTION)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};
