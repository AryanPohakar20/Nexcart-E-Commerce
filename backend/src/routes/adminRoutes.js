// src/routes/adminRoutes.js
// All admin routes with role-based and permission-based authorization.

import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize }    from '../middlewares/authorize.js';
import { requirePermission } from '../middlewares/requirePermission.js';
import { ADMIN_ROLES }  from '../constants/roles.js';
import { getAdminReviewReports, getAdminReviewReportDetails } from '../controllers/adminReviewReportController.js';
import { validateAdminReviewReportsList, validateAdminReviewReportId } from '../validations/adminReviewReportValidation.js';
import { moderateReviewReport } from '../controllers/adminReviewModerationController.js';
import { validateAdminReviewModeration } from '../validations/adminReviewModerationValidation.js';
import Review from '../models/Review.js';
import SellerReview from '../models/SellerReview.js';
import {
  // Dashboard
  getDashboardStats,
  getRecentUsers,
  getRecentSellers,
  getRecentActivity,
  getPendingVerifications,

  // User Management
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  suspendUser,
  activateUser,
  blockUser,
  unblockUser,
  updateUserStatus,
  bulkSuspendUsers,
  bulkActivateUsers,
  bulkDeleteUsers,


  // Seller Management
  getSellers,
  getSeller,
  updateSeller,
  deleteSeller,
  suspendSeller,
  activateSeller,
  blockSeller,

  // Search
  globalSearch,

  // Audit Logs
  getAuditLogs,

  // Products
  getProducts,
  getProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  restoreProduct,
  approveProduct,
  rejectProduct,
  toggleFeaturedProduct,
  bulkProductAction,

  // Categories
  getCategories,
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,

  // Orders
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,

  // Verification Center
  getVerifications,
  getVerificationCounts,
  approveVerification,
  rejectVerification,
  requestReuploadVerification,

  // CSV / Excel Import
  previewImport,
  executeImport,

  // Bulk Operations
  executeBulkAction,

  // Reports & Disputes
  getBusinessReport,
  getDisputeReports,
  getDisputeReport,
  resolveDisputeReport,

  // Analytics
  getMarketplaceAnalytics,

  // Notifications
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  publishNotification,
  unpublishNotification,
  getUnreadNotificationsCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,

  // Settings
  getPlatformSettings,
  updatePlatformSettings,

  // System Monitoring
  getSystemHealth,

  // Export
  exportData,

  // Roles & Permissions
  getRolesAndPermissions,

  // Profile & Security
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
} from '../controllers/adminController.js';
import { listReturns, getReturnDetails, reviewReturn } from '../controllers/returnController.js';
import { getOrderAnalytics } from '../services/orderAnalyticsService.js';
import { validateAdminReturnListing, validateReturnId, validateReturnReview } from '../validations/returnValidation.js';
import { validateOrderAnalytics } from '../validations/orderValidation.js';
import { validateNotificationCreate, validateNotificationUpdate } from '../validations/notificationValidation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/ApiResponse.js';
import { importUpload } from '../middlewares/importUpload.js';

const router = Router();

// ─── All admin routes require authentication and admin-tier role ───────────────
router.use(authenticate);
router.use(authorize(ADMIN_ROLES));

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/dashboard/stats',                 getDashboardStats);
router.get('/dashboard/recent-users',          getRecentUsers);
router.get('/dashboard/recent-sellers',        getRecentSellers);
router.get('/dashboard/recent-activity',       getRecentActivity);
router.get('/dashboard/pending-verifications', getPendingVerifications);

// ═══════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

router.get(   '/users',              requirePermission('users', 'read'),    getUsers);
router.patch( '/users/bulk/suspend',  requirePermission('users', 'suspend'), bulkSuspendUsers);
router.post(  '/users/bulk/suspend',  requirePermission('users', 'suspend'), bulkSuspendUsers);
router.patch( '/users/bulk/activate', requirePermission('users', 'update'),  bulkActivateUsers);
router.post(  '/users/bulk/activate', requirePermission('users', 'update'),  bulkActivateUsers);
router.delete('/users/bulk/delete',   requirePermission('users', 'delete'),  bulkDeleteUsers);
router.post(  '/users/bulk/delete',   requirePermission('users', 'delete'),  bulkDeleteUsers);

router.get(   '/users/:id',          requirePermission('users', 'read'),    getUser);


router.put(   '/users/:id',          requirePermission('users', 'update'),  updateUser);
router.delete('/users/:id',          requirePermission('users', 'delete'),  deleteUser);

router.patch('/users/:id/status',    requirePermission('users', 'update'),  updateUserStatus);
router.patch('/users/:id/suspend',   requirePermission('users', 'suspend'), suspendUser);
router.patch('/users/:id/activate',  requirePermission('users', 'update'),  activateUser);
router.patch('/users/:id/block',     requirePermission('users', 'suspend'), blockUser);
router.patch('/users/:id/unblock',   requirePermission('users', 'update'),  unblockUser);

// ═══════════════════════════════════════════════════════════════════════════════
// SELLER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

router.get(   '/sellers',            requirePermission('sellers', 'read'),    getSellers);
router.get(   '/sellers/:id',        requirePermission('sellers', 'read'),    getSeller);
router.put(   '/sellers/:id',        requirePermission('sellers', 'update'),  updateSeller);
router.delete('/sellers/:id',        requirePermission('sellers', 'delete'),  deleteSeller);

router.patch('/sellers/:id/suspend', requirePermission('sellers', 'suspend'), suspendSeller);
router.patch('/sellers/:id/activate',requirePermission('sellers', 'update'),  activateSeller);
router.patch('/sellers/:id/block',   requirePermission('sellers', 'suspend'), blockSeller);

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

router.get(   '/products',                 requirePermission('products', 'read'),    getProducts);
router.get(   '/products/:id',             requirePermission('products', 'read'),    getProduct);
router.put(   '/products/:id',             requirePermission('products', 'update'),  updateProduct);
router.patch( '/products/:id/stock',       requirePermission('products', 'update'),  updateProductStock);
router.delete('/products/:id',             requirePermission('products', 'delete'),  deleteProduct);
router.patch( '/products/:id/restore',     requirePermission('products', 'update'),  restoreProduct);
router.patch( '/products/:id/approve',     requirePermission('products', 'approve'), approveProduct);
router.patch( '/products/:id/reject',      requirePermission('products', 'reject'),  rejectProduct);
router.patch( '/products/:id/featured',    requirePermission('products', 'update'),  toggleFeaturedProduct);
router.post(  '/products/bulk',            requirePermission('products', 'update'),  bulkProductAction);

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

router.get(   '/categories',               requirePermission('categories', 'read'),   getCategories);
router.get(   '/categories/tree',          requirePermission('categories', 'read'),   getCategoryTree);
router.get(   '/categories/:id',           requirePermission('categories', 'read'),   getCategory);
router.post(  '/categories',               requirePermission('categories', 'create'), createCategory);
router.put(   '/categories/:id',           requirePermission('categories', 'update'), updateCategory);
router.delete('/categories/:id',           requirePermission('categories', 'delete'), deleteCategory);

// ═══════════════════════════════════════════════════════════════════════════════
// ORDER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

router.get(   '/orders',                   requirePermission('orders', 'read'),   getOrders);
router.get(   '/orders/:id',               requirePermission('orders', 'read'),   getOrder);
router.patch( '/orders/:id/status',        requirePermission('orders', 'update'), updateOrderStatus);
router.patch( '/orders/:id/cancel',        requirePermission('orders', 'update'), cancelOrder);

// ═══════════════════════════════════════════════════════════════════════════════
// VERIFICATION CENTER
// ═══════════════════════════════════════════════════════════════════════════════

router.get(   '/verification',                  requirePermission('verification', 'read'),    getVerifications);
router.get(   '/verification/counts',           requirePermission('verification', 'read'),    getVerificationCounts);
router.patch( '/verification/:id/approve',      requirePermission('verification', 'approve'), approveVerification);
router.patch( '/verification/:id/reject',       requirePermission('verification', 'reject'),  rejectVerification);
router.patch( '/verification/:id/request-reupload', requirePermission('verification', 'update'), requestReuploadVerification);

// ═══════════════════════════════════════════════════════════════════════════════
// CSV & EXCEL IMPORT
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/import/preview', requirePermission('imports', 'import'), importUpload.single('file'), previewImport);
router.post('/import/execute', requirePermission('imports', 'import'), executeImport);

// ═══════════════════════════════════════════════════════════════════════════════
// BULK OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/bulk', executeBulkAction);

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL SEARCH
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/search', globalSearch);

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT LOGS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/audit-logs', requirePermission('audit', 'read'), getAuditLogs);

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS & DISPUTES
// ═══════════════════════════════════════════════════════════════════════════════

router.get(  '/reports/business',          requirePermission('reports', 'read'),   getBusinessReport);
router.get(  '/reports/disputes',          requirePermission('reports', 'read'),   getDisputeReports);
router.get(  '/reports/disputes/:id',      requirePermission('reports', 'read'),   getDisputeReport);
router.patch('/reports/disputes/:id/resolve', requirePermission('reports', 'update'), resolveDisputeReport);

// ═══════════════════════════════════════════════════════════════════════════════
// MARKETPLACE ANALYTICS & BI
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/analytics', requirePermission('analytics', 'read'), getMarketplaceAnalytics);

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

router.get(   '/notifications',              requirePermission('notifications', 'read'),   getNotifications);
router.post(  '/notifications',              requirePermission('notifications', 'write'),  validateNotificationCreate, createNotification);
router.get(   '/notifications/unread-count', requirePermission('notifications', 'read'),   getUnreadNotificationsCount);
router.get(   '/notifications/:id',          requirePermission('notifications', 'read'),   getNotificationById);
router.put(   '/notifications/:id',          requirePermission('notifications', 'update'), validateNotificationUpdate, updateNotification);
router.patch( '/notifications/:id/publish',  requirePermission('notifications', 'update'), publishNotification);
router.patch( '/notifications/:id/unpublish',requirePermission('notifications', 'update'), unpublishNotification);
router.patch( '/notifications/:id/read',     requirePermission('notifications', 'update'), markNotificationRead);
router.patch( '/notifications/read-all',     requirePermission('notifications', 'update'), markAllNotificationsRead);
router.delete('/notifications/:id',          requirePermission('notifications', 'delete'), deleteNotification);

// ═══════════════════════════════════════════════════════════════════════════════
// PLATFORM SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/settings', requirePermission('settings', 'read'),   getPlatformSettings);
router.put('/settings', requirePermission('settings', 'update'), updatePlatformSettings);

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM MONITORING
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/system/health', requirePermission('system', 'read'), getSystemHealth);

// ═══════════════════════════════════════════════════════════════════════════════
// DATA EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/export/:entity', requirePermission('export', 'export'), exportData);

// ═══════════════════════════════════════════════════════════════════════════════
// ROLES & PERMISSIONS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/roles-permissions', getRolesAndPermissions);

// ═══════════════════════════════════════════════════════════════════════════════
// REVIEW REPORTS QUEUE
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/review-reports', requirePermission('reports', 'read'), validateAdminReviewReportsList, getAdminReviewReports);
router.get('/review-reports/:reportId', requirePermission('reports', 'read'), validateAdminReviewReportId, getAdminReviewReportDetails);
router.patch('/review-reports/:reportId/moderate', requirePermission('reports', 'update'), validateAdminReviewModeration, moderateReviewReport);

router.get('/migrate-reviews-temp', async (req, res) => {
  try {
    const oldReviews = await Review.find().lean();
    let migrated = 0;
    for (const old of oldReviews) {
      const existing = await SellerReview.findOne({
        sellerId: old.seller,
        customerId: old.buyer,
        comment: old.comment,
        createdAt: old.createdAt,
      });
      if (!existing) {
        await SellerReview.create({
          sellerId: old.seller,
          customerId: old.buyer,
          rating: old.rating,
          comment: old.comment,
          status: 'PUBLISHED',
          createdAt: old.createdAt,
          updatedAt: old.updatedAt,
        });
        migrated++;
      }
    }
    res.json({ migrated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════════
// ADMIN PROFILE & CREDENTIALS
// ════════════════════════════════════════════════════════════════════════════════

router.get('/profile',          getAdminProfile);
router.put('/profile',          updateAdminProfile);
router.put('/profile/password', updateAdminPassword);

// ════════════════════════════════════════════════════════════════════════════════
// RETURNS & REFUNDS MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════════

router.get(   '/returns',             requirePermission('orders', 'read'),   validateAdminReturnListing, listReturns);
router.get(   '/returns/:returnId',   requirePermission('orders', 'read'),   validateReturnId,           getReturnDetails);
router.patch( '/returns/:returnId',   requirePermission('orders', 'update'), validateReturnReview,       reviewReturn);

// ════════════════════════════════════════════════════════════════════════════════
// ORDER ANALYTICS
// ════════════════════════════════════════════════════════════════════════════════

router.get(
  '/orders/analytics',
  requirePermission('orders', 'read'),
  validateOrderAnalytics,
  asyncHandler(async (req, res) => {
    const result = await getOrderAnalytics(req.query);
    return successResponse(res, 'Order analytics fetched successfully.', result);
  })
);

export default router;
