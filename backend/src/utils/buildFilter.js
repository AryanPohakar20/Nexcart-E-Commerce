// src/utils/buildFilter.js
// Reusable filter builder for admin list endpoints.
// Returns a MongoDB filter object based on query params — no duplication across controllers.
//
// SECURITY: All user-provided search strings are regex-escaped before being passed
// to new RegExp(). This prevents ReDoS (Regular Expression Denial of Service) attacks.
// Search length is also capped at 200 characters.

import mongoose from 'mongoose';

// ─── Regex Escape Utility ─────────────────────────────────────────────────────
// Escapes all regex metacharacters in a user-supplied string.
// Prevents ReDoS via malicious patterns like (a+)+$, .*.*  etc.
const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// ─── Max search string length ─────────────────────────────────────────────────
const MAX_SEARCH_LEN = 200;

const safeSearch = (raw) => {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim().slice(0, MAX_SEARCH_LEN);
  if (!trimmed) return null;
  return new RegExp(escapeRegex(trimmed), 'i');
};

// ─── Status Allow-lists (prevent arbitrary regex injection via status param) ───
const VALID_USER_STATUSES = new Set(['Active', 'Suspended', 'Deleted', 'Blocked']);
const VALID_PRODUCT_STATUSES = new Set(['Active', 'Approved', 'Pending', 'Rejected', 'Deleted', 'Draft', 'Inactive']);
const VALID_CATEGORY_STATUSES = new Set(['Active', 'Inactive', 'Draft', 'Archived']);

/**
 * Build a MongoDB filter for User queries.
 *
 * Supported query params:
 *   role         - 'customer' | 'seller' | 'marketplace_seller' | 'admin'
 *   status       - 'Active' | 'Suspended' | 'Deleted' | 'Blocked'
 *   isBlocked    - 'true' | 'false'
 *   isVerified   - 'true' | 'false'
 *   fromDate     - ISO date string (joined after)
 *   toDate       - ISO date string (joined before)
 *   search       - partial match on firstName, lastName, email, phone, username
 *
 * Always excludes soft-deleted documents.
 */
export const buildUserFilter = (query = {}) => {
  const filter = { isDeleted: { $ne: true } };

  if (query.role) filter.role = query.role;

  // Use allow-list for status to prevent regex injection
  if (query.status && VALID_USER_STATUSES.has(query.status)) {
    filter.status = query.status;
  }

  if (query.isBlocked === 'true')  filter.isBlocked = true;
  if (query.isBlocked === 'false') filter.isBlocked = false;

  if (query.isVerified === 'true')  filter.isVerified = true;
  if (query.isVerified === 'false') filter.isVerified = false;

  // Date range filter on createdAt
  if (query.fromDate || query.toDate) {
    filter.createdAt = {};
    if (query.fromDate) filter.createdAt.$gte = new Date(query.fromDate);
    if (query.toDate)   filter.createdAt.$lte = new Date(query.toDate);
  }

  // Full-text search via ESCAPED regex — safe against ReDoS
  const regex = safeSearch(query.search);
  if (regex) {
    filter.$or = [
      { firstName: regex },
      { lastName:  regex },
      { email:     regex },
      { phone:     regex },
      { username:  regex },
    ];
  }

  return filter;
};

/**
 * Build a MongoDB filter for Seller queries.
 */
export const buildSellerFilter = (query = {}) => {
  const filter = { isDeleted: { $ne: true } };

  if (query.sellerType)         filter.sellerType         = query.sellerType;
  if (query.verificationStatus) filter.verificationStatus = query.verificationStatus;
  if (query.sellerStatus)       filter.sellerStatus       = query.sellerStatus;

  if (query.isActive    === 'true')  filter.isActive    = true;
  if (query.isActive    === 'false') filter.isActive    = false;
  if (query.isSuspended === 'true')  filter.isSuspended = true;
  if (query.isSuspended === 'false') filter.isSuspended = false;
  if (query.isBlocked   === 'true')  filter.isBlocked   = true;
  if (query.isBlocked   === 'false') filter.isBlocked   = false;

  if (query.fromDate || query.toDate) {
    filter.createdAt = {};
    if (query.fromDate) filter.createdAt.$gte = new Date(query.fromDate);
    if (query.toDate)   filter.createdAt.$lte = new Date(query.toDate);
  }

  const regex = safeSearch(query.search);
  if (regex) {
    filter.$or = [
      { slug:     regex },
      { sellerId: regex },
      { 'business.businessName':   regex },
      { 'individual.fullName':     regex },
      { 'accountInfo.email':       regex },
      { 'accountInfo.displayName': regex },
    ];
  }

  return filter;
};

/**
 * Build a MongoDB filter for AuditLog queries.
 */
export const buildAuditFilter = (query = {}) => {
  const filter = {};

  if (query.module) filter.module = query.module;
  if (query.action) filter.action = query.action.toUpperCase();
  if (query.status) filter.status = query.status;

  if (query.adminId && mongoose.Types.ObjectId.isValid(query.adminId)) {
    filter.admin = new mongoose.Types.ObjectId(query.adminId);
  }

  if (query.fromDate || query.toDate) {
    filter.createdAt = {};
    if (query.fromDate) filter.createdAt.$gte = new Date(query.fromDate);
    if (query.toDate)   filter.createdAt.$lte = new Date(query.toDate);
  }

  return filter;
};

/**
 * Build a MongoDB filter for Product queries.
 */
export const buildProductFilter = (query = {}) => {
  const filter = { isDeleted: { $ne: true } };

  if (query.category && query.category !== 'All' && query.category !== 'All Categories') {
    if (mongoose.Types.ObjectId.isValid(query.category)) {
      filter.category = new mongoose.Types.ObjectId(query.category);
    } else {
      filter.category = new RegExp(`^${escapeRegex(query.category.trim())}$`, 'i');
    }
  }

  const sellerQuery = query.seller || query.sellerId;
  if (sellerQuery) {
    if (mongoose.Types.ObjectId.isValid(sellerQuery)) {
      filter.sellerId = new mongoose.Types.ObjectId(sellerQuery);
    }
  }

  if (query.status && query.status !== 'All' && query.status !== 'All Status' && query.status !== 'All Statuses') {
    const st = query.status.toLowerCase();
    if (st === 'out_of_stock' || st === 'outofstock') {
      filter.stock = { $lte: 0 };
    } else if (st === 'in_stock' || st === 'instock') {
      filter.stock = { $gt: 0 };
    } else if (st === 'active') {
      filter.status = { $in: ['Approved', 'Active', 'active'] };
    } else if (st === 'pending') {
      filter.status = { $in: ['Pending', 'Pending Approval'] };
    } else if (st === 'rejected') {
      filter.status = 'Rejected';
    } else if (st === 'draft') {
      filter.status = 'Draft';
    } else if (VALID_PRODUCT_STATUSES.has(query.status)) {
      filter.status = query.status;
    }
  }

  if (query.featured === 'true' || query.isFeatured === 'true') {
    filter.$or = [{ isFeatured: true }, { featured: true }];
  } else if (query.featured === 'false' || query.isFeatured === 'false') {
    filter.isFeatured = { $ne: true };
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.fromDate || query.toDate) {
    filter.createdAt = {};
    if (query.fromDate) filter.createdAt.$gte = new Date(query.fromDate);
    if (query.toDate)   filter.createdAt.$lte = new Date(query.toDate);
  }

  const regex = safeSearch(query.search);
  if (regex) {
    filter.$or = [
      { title: regex },
      { brand: regex },
      { category: regex },
      { sku:   regex },
      { slug:  regex },
      { tags:  regex },
      { description: regex },
    ];
  }

  return filter;
};

/**
 * Build a MongoDB filter for Category queries.
 */
export const buildCategoryFilter = (query = {}) => {
  const filter = { isDeleted: { $ne: true } };

  // Use allow-list for status (prevents raw status injection into RegExp)
  if (query.status && query.status !== 'all' && VALID_CATEGORY_STATUSES.has(query.status)) {
    filter.status = query.status;
  }

  if (query.parent !== undefined) {
    if (query.parent === 'null' || query.parent === null || query.parent === '') {
      filter.parent = null;
    } else if (mongoose.Types.ObjectId.isValid(query.parent)) {
      filter.parent = new mongoose.Types.ObjectId(query.parent);
    }
  }

  const regex = safeSearch(query.search);
  if (regex) {
    filter.$or = [{ name: regex }, { slug: regex }, { description: regex }];
  }

  return filter;
};

/**
 * Build a MongoDB filter for Order queries.
 */
export const buildOrderFilter = (query = {}) => {
  const filter = { isDeleted: { $ne: true } };

  // Use exact string match for status instead of regex (allow-list enforced in controller)
  if (query.status && query.status !== 'All Statuses') {
    filter.orderStatus = query.status.toLowerCase();
  }

  if (query.paymentStatus && query.paymentStatus !== 'All Payments') {
    filter['paymentInfo.status'] = query.paymentStatus.toLowerCase();
  }

  if (query.paymentMethod) {
    filter['paymentInfo.method'] = query.paymentMethod;
  }

  if (query.seller && mongoose.Types.ObjectId.isValid(query.seller)) {
    filter.seller = new mongoose.Types.ObjectId(query.seller);
  }

  if (query.customer && mongoose.Types.ObjectId.isValid(query.customer)) {
    filter.customer = new mongoose.Types.ObjectId(query.customer);
  }

  if (query.fromDate || query.toDate) {
    filter.createdAt = {};
    if (query.fromDate) filter.createdAt.$gte = new Date(query.fromDate);
    if (query.toDate)   filter.createdAt.$lte = new Date(query.toDate);
  }

  const regex = safeSearch(query.search);
  if (regex) {
    filter.$or = [
      { orderId: regex },
      { 'shippingAddress.fullName': regex },
      { 'shippingAddress.phone':    regex },
      { 'shippingAddress.city':     regex },
      { 'items.name':               regex },
    ];
  }

  return filter;
};

/**
 * Build a MongoDB filter for Seller Verification queries.
 */
export const buildVerificationFilter = (query = {}) => {
  const filter = { isDeleted: { $ne: true } };

  if (query.status && query.status !== 'all') {
    const map = {
      pending:  ['In Progress', 'Pending'],
      approved: ['Verified'],
      rejected: ['Rejected'],
    };
    const statuses = map[query.status.toLowerCase()] || [query.status];
    filter.verificationStatus = { $in: statuses };
  }

  const regex = safeSearch(query.search);
  if (regex) {
    filter.$or = [
      { slug:     regex },
      { sellerId: regex },
      { 'business.businessName':   regex },
      { 'individual.fullName':     regex },
      { 'accountInfo.email':       regex },
      { 'accountInfo.displayName': regex },
    ];
  }

  return filter;
};
