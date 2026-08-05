// src/controllers/adminController.js
// Thin controller layer for all Admin Dashboard APIs.
// Each handler delegates to the appropriate service and returns a uniform response.

import { asyncHandler }     from '../utils/asyncHandler.js';
import { successResponse }  from '../utils/ApiResponse.js';
import { ApiError }         from '../utils/ApiError.js';
import * as dashboardService          from '../services/dashboardService.js';
import * as adminUserService          from '../services/adminUserService.js';
import * as adminSellerService        from '../services/adminSellerService.js';
import * as adminProductService       from '../services/adminProductService.js';
import * as adminCategoryService      from '../services/adminCategoryService.js';
import * as adminOrderService         from '../services/adminOrderService.js';
import * as adminVerificationService  from '../services/adminVerificationService.js';
import * as adminImportService        from '../services/adminImportService.js';
import * as adminBulkService          from '../services/adminBulkService.js';
import * as adminSearchService        from '../services/adminSearchService.js';
import * as auditLogRepo              from '../repositories/auditLogRepository.js';
import * as settingsService          from '../services/settingsService.js';
import * as notificationService      from '../services/notificationService.js';
import * as adminReportsService      from '../services/adminReportsService.js';
import * as adminAnalyticsService    from '../services/adminAnalyticsService.js';
import * as adminExportService       from '../services/adminExportService.js';
import * as systemMonitorService     from '../services/systemMonitorService.js';
import * as rolePermissionService    from '../services/rolePermissionService.js';
import User                          from '../models/User.js';
import bcrypt                        from 'bcryptjs';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';
import { buildAuditFilter }           from '../utils/buildFilter.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract client IP from request */
const getIp = (req) =>
  (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/dashboard/stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats();
  return successResponse(res, 'Dashboard statistics fetched successfully.', stats);
});

// GET /api/admin/dashboard/recent-users?limit=5
export const getRecentUsers = asyncHandler(async (req, res) => {
  const limit = Math.min(20, parseInt(req.query.limit, 10) || 5);
  const users = await dashboardService.getRecentUsers(limit);
  return successResponse(res, 'Recent users fetched successfully.', { users });
});

// GET /api/admin/dashboard/recent-sellers?limit=5
export const getRecentSellers = asyncHandler(async (req, res) => {
  const limit = Math.min(20, parseInt(req.query.limit, 10) || 5);
  const sellers = await dashboardService.getRecentSellers(limit);
  return successResponse(res, 'Recent sellers fetched successfully.', { sellers });
});

// GET /api/admin/dashboard/recent-activity?limit=10
export const getRecentActivity = asyncHandler(async (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
  const activities = await dashboardService.getRecentActivity(limit);
  return successResponse(res, 'Recent activity fetched successfully.', { activities });
});

// GET /api/admin/dashboard/pending-verifications?limit=10
export const getPendingVerifications = asyncHandler(async (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
  const verifications = await dashboardService.getPendingVerifications(limit);
  return successResponse(res, 'Pending verifications fetched successfully.', { verifications });
});

// ═══════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/users?page=1&limit=10&role=customer&status=Active&search=arjun
export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const { users, total } = await adminUserService.getUsers(req.query);
  const pagination = buildPaginationMeta(total, page, limit);

  return successResponse(res, 'Users fetched successfully.', { users, pagination });
});

// GET /api/admin/users/:id
export const getUser = asyncHandler(async (req, res) => {
  const user = await adminUserService.getUserById(req.params.id);
  return successResponse(res, 'User fetched successfully.', { user });
});

// PUT /api/admin/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const user = await adminUserService.updateUser(req.params.id, req.body, req.user, getIp(req));
  return successResponse(res, 'User updated successfully.', { user });
});

// DELETE /api/admin/users/:id  (soft delete)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await adminUserService.deleteUser(req.params.id, req.user, getIp(req));
  return successResponse(res, 'User deleted successfully.', { user });
});

// PATCH /api/admin/users/:id/suspend
export const suspendUser = asyncHandler(async (req, res) => {
  const user = await adminUserService.suspendUser(req.params.id, req.body, req.user, getIp(req));
  return successResponse(res, 'User suspended successfully.', { user });
});

// PATCH /api/admin/users/:id/activate
export const activateUser = asyncHandler(async (req, res) => {
  const user = await adminUserService.activateUser(req.params.id, req.user, getIp(req));
  return successResponse(res, 'User activated successfully.', { user });
});

// PATCH /api/admin/users/:id/block
export const blockUser = asyncHandler(async (req, res) => {
  const user = await adminUserService.blockUser(req.params.id, req.body, req.user, getIp(req));
  return successResponse(res, 'User blocked successfully.', { user });
});

// PATCH /api/admin/users/:id/unblock
export const unblockUser = asyncHandler(async (req, res) => {
  const user = await adminUserService.unblockUser(req.params.id, req.user, getIp(req));
  return successResponse(res, 'User unblocked successfully.', { user });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SELLER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/sellers?page=1&limit=10&sellerType=business&verificationStatus=Verified&search=tech
export const getSellers = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const { sellers, total } = await adminSellerService.getSellers(req.query);
  const pagination = buildPaginationMeta(total, page, limit);

  return successResponse(res, 'Sellers fetched successfully.', { sellers, pagination });
});

// GET /api/admin/sellers/:id
export const getSeller = asyncHandler(async (req, res) => {
  const seller = await adminSellerService.getSellerById(req.params.id);
  return successResponse(res, 'Seller fetched successfully.', { seller });
});

// PUT /api/admin/sellers/:id
export const updateSeller = asyncHandler(async (req, res) => {
  const seller = await adminSellerService.updateSeller(req.params.id, req.body, req.user, getIp(req));
  return successResponse(res, 'Seller updated successfully.', { seller });
});

// DELETE /api/admin/sellers/:id  (soft delete)
export const deleteSeller = asyncHandler(async (req, res) => {
  const seller = await adminSellerService.deleteSeller(req.params.id, req.user, getIp(req));
  return successResponse(res, 'Seller deleted successfully.', { seller });
});

// PATCH /api/admin/sellers/:id/suspend
export const suspendSeller = asyncHandler(async (req, res) => {
  const seller = await adminSellerService.suspendSeller(req.params.id, req.body, req.user, getIp(req));
  return successResponse(res, 'Seller suspended successfully.', { seller });
});

// PATCH /api/admin/sellers/:id/activate
export const activateSeller = asyncHandler(async (req, res) => {
  const seller = await adminSellerService.activateSeller(req.params.id, req.user, getIp(req));
  return successResponse(res, 'Seller activated successfully.', { seller });
});

// PATCH /api/admin/sellers/:id/block
export const blockSeller = asyncHandler(async (req, res) => {
  const seller = await adminSellerService.blockSeller(req.params.id, req.body, req.user, getIp(req));
  return successResponse(res, 'Seller blocked successfully.', { seller });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL SEARCH
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/search?q=arjun&type=all&limit=10
export const globalSearch = asyncHandler(async (req, res) => {
  const q     = (req.query.q || req.query.search || '').trim();
  const type  = req.query.type || 'all';
  const limit = Math.min(20, parseInt(req.query.limit, 10) || 10);

  if (!q) throw new ApiError(400, 'Search query is required.');

  const results = await adminSearchService.globalSearch(q, type, limit);
  return successResponse(res, 'Search results fetched successfully.', results);
});

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT LOGS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/audit-logs?page=1&limit=20&module=Users&action=SUSPEND_USER
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, sort } = parsePagination(req.query, 20);
  const filter = buildAuditFilter(req.query);
  const { logs, total } = await auditLogRepo.listLogs({ filter, page, limit, sort });
  const pagination = buildPaginationMeta(total, page, limit);

  return successResponse(res, 'Audit logs fetched successfully.', { logs, pagination });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/products
export const getProducts = asyncHandler(async (req, res) => {
  const result = await adminProductService.listProducts(req.query);
  return successResponse(res, 'Products fetched successfully.', result);
});

// GET /api/admin/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const product = await adminProductService.getProduct(req.params.id);
  return successResponse(res, 'Product fetched successfully.', { product });
});

// PUT /api/admin/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await adminProductService.updateProduct(
    req.params.id,
    req.body,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Product updated successfully.', { product });
});

// DELETE /api/admin/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await adminProductService.deleteProduct(
    req.params.id,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Product deleted successfully.', { product });
});

// PATCH /api/admin/products/:id/restore
export const restoreProduct = asyncHandler(async (req, res) => {
  const product = await adminProductService.restoreProduct(
    req.params.id,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Product restored successfully.', { product });
});

// PATCH /api/admin/products/:id/approve
export const approveProduct = asyncHandler(async (req, res) => {
  const product = await adminProductService.approveProduct(
    req.params.id,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Product approved successfully.', { product });
});

// PATCH /api/admin/products/:id/reject
export const rejectProduct = asyncHandler(async (req, res) => {
  const { reason, adminNotes } = req.body;
  const product = await adminProductService.rejectProduct(
    req.params.id,
    reason,
    adminNotes,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Product rejected successfully.', { product });
});

// PATCH /api/admin/products/:id/featured
export const toggleFeaturedProduct = asyncHandler(async (req, res) => {
  const product = await adminProductService.toggleFeatured(
    req.params.id,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Product featured status updated.', { product });
});

// POST /api/admin/products/bulk
export const bulkProductAction = asyncHandler(async (req, res) => {
  const { action, ids, extraData } = req.body;
  const result = await adminProductService.bulkProductAction(
    action,
    ids,
    extraData,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Bulk product action completed.', result);
});

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/categories
export const getCategories = asyncHandler(async (req, res) => {
  const result = await adminCategoryService.listCategories(req.query);
  return successResponse(res, 'Categories fetched successfully.', result);
});

// GET /api/admin/categories/tree
export const getCategoryTree = asyncHandler(async (req, res) => {
  const tree = await adminCategoryService.getCategoryTree();
  return successResponse(res, 'Category tree fetched successfully.', { tree });
});

// GET /api/admin/categories/:id
export const getCategory = asyncHandler(async (req, res) => {
  const category = await adminCategoryService.getCategory(req.params.id);
  return successResponse(res, 'Category fetched successfully.', { category });
});

// POST /api/admin/categories
export const createCategory = asyncHandler(async (req, res) => {
  const category = await adminCategoryService.createCategory(
    req.body,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Category created successfully.', { category }, 201);
});

// PUT /api/admin/categories/:id
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await adminCategoryService.updateCategory(
    req.params.id,
    req.body,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Category updated successfully.', { category });
});

// DELETE /api/admin/categories/:id
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await adminCategoryService.deleteCategory(
    req.params.id,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Category deleted successfully.', { category });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/orders
export const getOrders = asyncHandler(async (req, res) => {
  const result = await adminOrderService.listOrders(req.query);
  return successResponse(res, 'Orders fetched successfully.', result);
});

// GET /api/admin/orders/:id
export const getOrder = asyncHandler(async (req, res) => {
  const order = await adminOrderService.getOrder(req.params.id);
  return successResponse(res, 'Order dossier fetched successfully.', { order });
});

// PATCH /api/admin/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await adminOrderService.updateOrderStatus(
    req.params.id,
    status,
    note,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Order status updated successfully.', { order });
});

// PATCH /api/admin/orders/:id/cancel
export const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await adminOrderService.cancelOrder(
    req.params.id,
    reason,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Order cancelled & refund queued.', { order });
});

// ═══════════════════════════════════════════════════════════════════════════════
// VERIFICATION CENTER
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/verification
export const getVerifications = asyncHandler(async (req, res) => {
  const result = await adminVerificationService.listVerifications(req.query);
  return successResponse(res, 'Verifications fetched successfully.', result);
});

// GET /api/admin/verification/counts
export const getVerificationCounts = asyncHandler(async (req, res) => {
  const counts = await adminVerificationService.getVerificationCounts();
  return successResponse(res, 'Verification counts fetched successfully.', counts);
});

// PATCH /api/admin/verification/:id/approve
export const approveVerification = asyncHandler(async (req, res) => {
  const seller = await adminVerificationService.approveVerification(
    req.params.id,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Seller KYC approved successfully.', { seller });
});

// PATCH /api/admin/verification/:id/reject
export const rejectVerification = asyncHandler(async (req, res) => {
  const { remarks } = req.body;
  const seller = await adminVerificationService.rejectVerification(
    req.params.id,
    remarks,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Seller KYC rejected.', { seller });
});

// PATCH /api/admin/verification/:id/request-reupload
export const requestReuploadVerification = asyncHandler(async (req, res) => {
  const { remarks } = req.body;
  const seller = await adminVerificationService.requestReupload(
    req.params.id,
    remarks,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Re-upload requested from merchant.', { seller });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CSV & EXCEL IMPORT
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/admin/import/preview
export const previewImport = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded.');
  const { type = 'products' } = req.body;

  const preview = await adminImportService.previewImport(
    type,
    req.file.buffer,
    req.file.mimetype,
    req.file.originalname
  );

  return successResponse(res, 'File parsed and validated successfully.', preview);
});

// POST /api/admin/import/execute
export const executeImport = asyncHandler(async (req, res) => {
  const { type = 'products', rows = [] } = req.body;
  const result = await adminImportService.executeImport(
    type,
    rows,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Import executed successfully.', result);
});

// ═══════════════════════════════════════════════════════════════════════════════
// BULK ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/admin/bulk
export const executeBulkAction = asyncHandler(async (req, res) => {
  const { targetEntity, action, ids, payload } = req.body;
  const result = await adminBulkService.executeBulkAction(
    targetEntity,
    action,
    ids,
    payload,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Bulk action completed successfully.', result);
});

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS & DISPUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/reports/business
export const getBusinessReport = asyncHandler(async (req, res) => {
  const { type = 'marketplace', timeframe = 'monthly' } = req.query;
  const report = await adminReportsService.getBusinessReport(type, timeframe, req.query);
  return successResponse(res, 'Business report generated successfully.', report);
});

// GET /api/admin/reports/disputes
export const getDisputeReports = asyncHandler(async (req, res) => {
  const data = await adminReportsService.getDisputeReports(req.query);
  return successResponse(res, 'Dispute reports fetched successfully.', data);
});

// GET /api/admin/reports/disputes/:id
export const getDisputeReport = asyncHandler(async (req, res) => {
  const report = await adminReportsService.getDisputeReportById(req.params.id);
  return successResponse(res, 'Dispute report fetched successfully.', { report });
});

// PATCH /api/admin/reports/disputes/:id/resolve
export const resolveDisputeReport = asyncHandler(async (req, res) => {
  const report = await adminReportsService.resolveDisputeReport(
    req.params.id,
    req.body,
    req.user,
    getIp(req)
  );
  return successResponse(res, 'Dispute report resolved successfully.', { report });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MARKETPLACE ANALYTICS & BI
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/analytics
export const getMarketplaceAnalytics = asyncHandler(async (req, res) => {
  const range = req.query.range || '12 Months';
  const analytics = await adminAnalyticsService.getMarketplaceAnalytics(range);
  return successResponse(res, 'Marketplace analytics generated successfully.', analytics);
});

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const data = await notificationService.getNotifications(req.query);
  return successResponse(res, 'Notifications fetched successfully.', data);
});

// GET /api/admin/notifications/:id
export const getNotificationById = asyncHandler(async (req, res) => {
  const notification = await notificationService.getNotificationById(req.params.id);
  return successResponse(res, 'Notification fetched successfully.', { notification });
});

// POST /api/admin/notifications
export const createNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.createNotification(req.body, req.user, getIp(req));
  return successResponse(res, 'Notification created successfully.', { notification }, 201);
});

// PUT /api/admin/notifications/:id
export const updateNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.updateNotification(req.params.id, req.body, req.user, getIp(req));
  return successResponse(res, 'Notification updated successfully.', { notification });
});

// PATCH /api/admin/notifications/:id/publish
export const publishNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.publishNotification(req.params.id, req.user, getIp(req));
  return successResponse(res, 'Notification published successfully.', { notification });
});

// PATCH /api/admin/notifications/:id/unpublish
export const unpublishNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.unpublishNotification(req.params.id, req.user, getIp(req));
  return successResponse(res, 'Notification unpublished successfully.', { notification });
});

// GET /api/admin/notifications/unread-count
export const getUnreadNotificationsCount = asyncHandler(async (req, res) => {
  const unreadCount = await notificationService.getUnreadCount();
  return successResponse(res, 'Unread notification count fetched.', { unreadCount });
});

// PATCH /api/admin/notifications/:id/read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationRead(req.params.id);
  return successResponse(res, 'Notification marked as read.', { notification });
});

// PATCH /api/admin/notifications/read-all
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllNotificationsRead();
  return successResponse(res, 'All notifications marked as read.');
});

// DELETE /api/admin/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.deleteNotification(req.params.id, req.user, getIp(req));
  return successResponse(res, 'Notification deleted successfully.', { notification });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PLATFORM SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/settings
export const getPlatformSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getPlatformSettings();
  return successResponse(res, 'Platform settings fetched successfully.', { settings });
});

// PUT /api/admin/settings
export const updatePlatformSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updatePlatformSettings(req.body, req.user, getIp(req));
  return successResponse(res, 'Platform settings saved successfully.', { settings });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM MONITORING
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/system/health
export const getSystemHealth = asyncHandler(async (req, res) => {
  const health = await systemMonitorService.getSystemHealth();
  return successResponse(res, 'System telemetry fetched successfully.', health);
});

// ═══════════════════════════════════════════════════════════════════════════════
// DATA EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/export/:entity?format=csv|xlsx|json
export const exportData = asyncHandler(async (req, res) => {
  const { entity } = req.params;
  const { format = 'csv', ...filters } = req.query;

  const exportResult = await adminExportService.exportEntityData(
    entity,
    format,
    filters,
    req.user,
    getIp(req)
  );

  res.setHeader('Content-Type', exportResult.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);

  if (exportResult.isBuffer) {
    return res.end(exportResult.data);
  }
  return res.send(exportResult.data);
});

// ═══════════════════════════════════════════════════════════════════════════════
// ROLES & PERMISSIONS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/roles-permissions
export const getRolesAndPermissions = asyncHandler(async (req, res) => {
  const data = rolePermissionService.getRolesAndPermissions();
  return successResponse(res, 'Roles and permissions matrix fetched successfully.', data);
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PROFILE & CREDENTIALS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/profile
export const getAdminProfile = asyncHandler(async (req, res) => {
  const adminUser = await User.findById(req.user._id).lean();
  if (!adminUser) throw new ApiError(404, 'Admin user not found.');
  return successResponse(res, 'Admin profile fetched successfully.', { user: adminUser });
});

// PUT /api/admin/profile
export const updateAdminProfile = asyncHandler(async (req, res) => {
  const { name, firstName, lastName, phone, bio, avatar } = req.body;
  const updateData = {};

  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (name && !firstName) {
    const parts = name.split(' ');
    updateData.firstName = parts[0];
    updateData.lastName = parts.slice(1).join(' ') || '.';
  }
  if (phone) updateData.phone = phone;
  if (bio !== undefined) updateData.bio = bio;
  if (avatar !== undefined) updateData.avatar = avatar;

  const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).lean();
  return successResponse(res, 'Admin profile updated successfully.', { user });
});

// PUT /api/admin/profile/password
export const updateAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required.');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new ApiError(404, 'Admin user not found.');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(400, 'Incorrect current password.');
  }

  user.password = newPassword;
  await user.save();

  return successResponse(res, 'Admin password changed successfully.');
});


