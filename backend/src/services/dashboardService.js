// src/services/dashboardService.js
// Aggregates all platform-level statistics for the Admin Dashboard overview.
// Controllers call this — never query models directly from controllers.

import * as adminUserRepo    from '../repositories/adminUserRepository.js';
import * as adminSellerRepo  from '../repositories/adminSellerRepository.js';
import * as adminProductRepo from '../repositories/adminProductRepository.js';
import * as adminOrderRepo   from '../repositories/adminOrderRepository.js';
import * as auditLogRepo     from '../repositories/auditLogRepository.js';

// ─── Platform Dashboard Stats ─────────────────────────────────────────────────

/**
 * Returns all platform statistics used by the dashboard stat cards.
 * Runs aggregations in parallel to minimise latency.
 */
export const getDashboardStats = async () => {
  const [userStats, sellerStats, productStats, orderStats] = await Promise.all([
    adminUserRepo.getUserStats(),
    adminSellerRepo.getSellerStats(),
    adminProductRepo.getProductStats(),
    adminOrderRepo.getOrderStats(),
  ]);

  return {
    users: {
      total:       userStats.total,
      customers:   userStats.customers,
      sellers:     userStats.sellers,
      admins:      userStats.admins,
      active:      userStats.active,
      suspended:   userStats.suspended,
      blocked:     userStats.blocked,
      verified:    userStats.verified,
      deleted:     userStats.softDeleted,
    },
    sellers: {
      total:            sellerStats.total,
      individuals:      sellerStats.individuals,
      businesses:       sellerStats.businesses,
      verified:         sellerStats.verified,
      pendingVerify:    sellerStats.pendingVerify,
      rejectedVerify:   sellerStats.rejectedVerify,
      active:           sellerStats.active,
      suspended:        sellerStats.suspended,
      blocked:          sellerStats.blocked,
      approved:         sellerStats.approved,
      pendingApproval:  sellerStats.pending,
      draft:            sellerStats.draft,
      avgTrustScore:    Math.round(sellerStats.avgTrustScore || 0),
      avgRating:        parseFloat((sellerStats.avgRating || 0).toFixed(1)),
    },
    products: {
      total:      productStats.total,
      active:     productStats.active,
      pending:    productStats.pending,
      outOfStock: productStats.outOfStock,
      rejected:   productStats.rejected,
      deleted:    productStats.deleted,
    },
    orders: {
      total:      orderStats.total,
      delivered:  orderStats.delivered,
      shipped:    orderStats.shipped,
      processing: orderStats.processing,
      pending:    orderStats.pending,
      cancelled:  orderStats.cancelled,
    },
    revenue: {
      total:   orderStats.totalRevenue,
      note:    'Real-time gross order revenue.',
    },
  };
};

// ─── Recent Activity ──────────────────────────────────────────────────────────

/**
 * Returns the latest N audit log entries for the dashboard activity feed.
 */
export const getRecentActivity = async (limit = 10) => {
  return auditLogRepo.getRecent(limit);
};

// ─── Recent Registrations ─────────────────────────────────────────────────────

/**
 * Returns the latest N registered users.
 */
export const getRecentUsers = async (limit = 5) => {
  return adminUserRepo.getRecentUsers(limit);
};

/**
 * Returns the latest N created seller accounts.
 */
export const getRecentSellers = async (limit = 5) => {
  return adminSellerRepo.getRecentSellers(limit);
};

/**
 * Returns pending seller verifications.
 */
export const getPendingVerifications = async (limit = 10) => {
  const { sellers } = await adminSellerRepo.listSellers({
    filter: { verificationStatus: 'In Progress', isDeleted: { $ne: true } },
    page: 1,
    limit,
    sort: { createdAt: -1 },
  });
  return sellers;
};
