// src/routes/adminRoutes.js
// All admin routes.
// Every route requires: authenticate → authorize('admin')
// Customers and sellers can never access these endpoints.

import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize    } from '../middlewares/authorize.js';
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
} from '../controllers/adminController.js';
import { importUpload } from '../middlewares/importUpload.js';

const router = Router();

// ─── All admin routes require authentication and admin role ────────────────────
router.use(authenticate);
router.use(authorize('admin'));

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

router.get(   '/users',              getUsers);
router.get(   '/users/:id',          getUser);
router.put(   '/users/:id',          updateUser);
router.delete('/users/:id',          deleteUser);          // soft delete

router.patch('/users/:id/suspend',   suspendUser);
router.patch('/users/:id/activate',  activateUser);
router.patch('/users/:id/block',     blockUser);
router.patch('/users/:id/unblock',   unblockUser);

// ═══════════════════════════════════════════════════════════════════════════════
// SELLER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

router.get(   '/sellers',            getSellers);
router.get(   '/sellers/:id',        getSeller);
router.put(   '/sellers/:id',        updateSeller);
router.delete('/sellers/:id',        deleteSeller);        // soft delete

router.patch('/sellers/:id/suspend', suspendSeller);
router.patch('/sellers/:id/activate',activateSeller);
router.patch('/sellers/:id/block',   blockSeller);

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

router.get(   '/products',                 getProducts);
router.get(   '/products/:id',             getProduct);
router.put(   '/products/:id',             updateProduct);
router.delete('/products/:id',             deleteProduct);        // soft delete
router.patch( '/products/:id/restore',     restoreProduct);
router.patch( '/products/:id/approve',     approveProduct);
router.patch( '/products/:id/reject',      rejectProduct);
router.patch( '/products/:id/featured',    toggleFeaturedProduct);
router.post(  '/products/bulk',            bulkProductAction);

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

router.get(   '/categories',               getCategories);
router.get(   '/categories/tree',          getCategoryTree);
router.get(   '/categories/:id',           getCategory);
router.post(  '/categories',               createCategory);
router.put(   '/categories/:id',           updateCategory);
router.delete('/categories/:id',           deleteCategory);       // soft delete

// ═══════════════════════════════════════════════════════════════════════════════
// ORDER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

router.get(   '/orders',                   getOrders);
router.get(   '/orders/:id',               getOrder);
router.patch( '/orders/:id/status',        updateOrderStatus);
router.patch( '/orders/:id/cancel',        cancelOrder);

// ═══════════════════════════════════════════════════════════════════════════════
// VERIFICATION CENTER
// ═══════════════════════════════════════════════════════════════════════════════

router.get(   '/verification',                  getVerifications);
router.get(   '/verification/counts',           getVerificationCounts);
router.patch( '/verification/:id/approve',      approveVerification);
router.patch( '/verification/:id/reject',       rejectVerification);
router.patch( '/verification/:id/request-reupload', requestReuploadVerification);

// ═══════════════════════════════════════════════════════════════════════════════
// CSV & EXCEL IMPORT
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/import/preview', importUpload.single('file'), previewImport);
router.post('/import/execute', executeImport);

// ═══════════════════════════════════════════════════════════════════════════════
// BULK OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/bulk', executeBulkAction);

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL SEARCH
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/search?q=query&type=all|users|sellers|products|categories|orders&limit=10
router.get('/search', globalSearch);

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT LOGS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/audit-logs?page=1&limit=20&module=Users&action=SUSPEND_USER
router.get('/audit-logs', getAuditLogs);

export default router;
