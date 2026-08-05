// src/utils/buildFilter.js
// Reusable filter builder for admin list endpoints.
// Returns a MongoDB filter object based on query params — no duplication across controllers.

import mongoose from 'mongoose';

/**
 * Build a MongoDB filter for User queries.
 *
 * Supported query params:
 *   role         - 'customer' | 'seller' | 'marketplace_seller' | 'admin'
 *   status       - 'Active' | 'Suspended' | 'Deleted'
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

  if (query.status) filter.status = query.status;

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

  // Full-text search via regex — partial match across key fields
  if (query.search) {
    const regex = new RegExp(query.search.trim(), 'i');
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
 *
 * Supported query params:
 *   sellerType         - 'individual' | 'business'
 *   verificationStatus - 'Not Started' | 'In Progress' | 'Verified' | 'Rejected'
 *   sellerStatus       - 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Suspended'
 *   isActive           - 'true' | 'false'
 *   isSuspended        - 'true' | 'false'
 *   isBlocked          - 'true' | 'false'
 *   fromDate / toDate  - ISO date strings for createdAt range
 *   search             - partial match on businessName, ownerName, email, slug, sellerId
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

  if (query.search) {
    const regex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { slug:     regex },
      { sellerId: regex },
      { 'business.businessName': regex },
      { 'individual.fullName':   regex },
      { 'accountInfo.email':     regex },
      { 'accountInfo.displayName': regex },
    ];
  }

  return filter;
};

/**
 * Build a MongoDB filter for AuditLog queries.
 *
 * Supported query params:
 *   module     - 'Users' | 'Sellers' | ...
 *   action     - e.g. 'SUSPEND_USER'
 *   adminId    - ObjectId string
 *   status     - 'success' | 'failed'
 *   fromDate / toDate
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

  if (query.category) {
    if (mongoose.Types.ObjectId.isValid(query.category)) {
      filter.category = new mongoose.Types.ObjectId(query.category);
    }
  }

  if (query.seller) {
    if (mongoose.Types.ObjectId.isValid(query.seller)) {
      filter.seller = new mongoose.Types.ObjectId(query.seller);
    }
  }

  if (query.status && query.status !== 'All Statuses') {
    if (query.status.toLowerCase() === 'out_of_stock' || query.status.toLowerCase() === 'outofstock') {
      filter.stock = { $lte: 0 };
    } else if (query.status.toLowerCase() === 'active') {
      filter.status = { $in: ['Approved', 'Active'] };
    } else {
      filter.status = new RegExp(`^${query.status}$`, 'i');
    }
  }

  if (query.featured === 'true') filter.featured = true;
  if (query.featured === 'false') filter.featured = false;

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.fromDate || query.toDate) {
    filter.createdAt = {};
    if (query.fromDate) filter.createdAt.$gte = new Date(query.fromDate);
    if (query.toDate) filter.createdAt.$lte = new Date(query.toDate);
  }

  if (query.search) {
    const regex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { name: regex },
      { sku: regex },
      { slug: regex },
      { tags: regex },
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

  if (query.status && query.status !== 'all') {
    filter.status = new RegExp(`^${query.status}$`, 'i');
  }

  if (query.parent !== undefined) {
    if (query.parent === 'null' || query.parent === null || query.parent === '') {
      filter.parent = null;
    } else if (mongoose.Types.ObjectId.isValid(query.parent)) {
      filter.parent = new mongoose.Types.ObjectId(query.parent);
    }
  }

  if (query.search) {
    const regex = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ name: regex }, { slug: regex }, { description: regex }];
  }

  return filter;
};

/**
 * Build a MongoDB filter for Order queries.
 */
export const buildOrderFilter = (query = {}) => {
  const filter = { isDeleted: { $ne: true } };

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
    if (query.toDate) filter.createdAt.$lte = new Date(query.toDate);
  }

  if (query.search) {
    const regex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { orderId: regex },
      { 'shippingAddress.fullName': regex },
      { 'shippingAddress.phone': regex },
      { 'shippingAddress.city': regex },
      { 'items.name': regex },
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
      pending: ['In Progress', 'Pending'],
      approved: ['Verified'],
      rejected: ['Rejected'],
    };
    const statuses = map[query.status.toLowerCase()] || [query.status];
    filter.verificationStatus = { $in: statuses };
  }

  if (query.search) {
    const regex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { slug: regex },
      { sellerId: regex },
      { 'business.businessName': regex },
      { 'individual.fullName': regex },
      { 'accountInfo.email': regex },
      { 'accountInfo.displayName': regex },
    ];
  }

  return filter;
};

