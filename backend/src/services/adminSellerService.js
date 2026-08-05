// src/services/adminSellerService.js
// Business logic layer for admin Seller Management operations.
// Calls adminSellerRepository — never touches the model directly.
// Also emits an AuditLog entry for every mutating action.

import * as adminSellerRepo from '../repositories/adminSellerRepository.js';
import * as auditLogRepo    from '../repositories/auditLogRepository.js';
import { buildSellerFilter } from '../utils/buildFilter.js';
import { parsePagination   } from '../utils/pagination.js';
import { ApiError }          from '../utils/ApiError.js';

// ─── Helper: emit audit log ───────────────────────────────────────────────────

const audit = (admin, action, target, targetId, remarks = '', ipAddress = null, status = 'success') => {
  return auditLogRepo.createLog({
    admin:    admin._id,
    adminName: `${admin.firstName} ${admin.lastName}`.trim(),
    action,
    module:   'Sellers',
    target,
    targetId,
    remarks,
    ipAddress,
    status,
  }).catch(() => {}); // Non-blocking
};

// Helper to get display name from seller doc
const sellerName = (seller) => {
  return seller.business?.businessName ||
    seller.individual?.fullName ||
    seller.accountInfo?.displayName ||
    seller.sellerId ||
    String(seller._id);
};

// ─── List ─────────────────────────────────────────────────────────────────────

export const getSellers = async (query) => {
  const { page, limit, sort, search } = parsePagination(query);
  const filter = buildSellerFilter({ ...query, search });
  return adminSellerRepo.listSellers({ filter, page, limit, sort });
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getSellerById = async (id) => {
  const seller = await adminSellerRepo.findSellerById(id);
  if (!seller) throw new ApiError(404, 'Seller not found.');
  return seller;
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateSeller = async (id, data, admin, ipAddress) => {
  const seller = await adminSellerRepo.findSellerById(id);
  if (!seller) throw new ApiError(404, 'Seller not found.');

  // Whitelist updatable fields for admin
  const allowed = ['sellerType', 'sellerStatus', 'trustScore', 'sellerLevel',
    'verificationStatus', 'isActive', 'isSuspended'];
  const updates = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  const updated = await adminSellerRepo.updateSellerById(id, updates);
  const name = sellerName(seller);
  audit(admin, 'UPDATE_SELLER', `${name} (${seller._id})`, seller._id, JSON.stringify(updates), ipAddress);
  return updated;
};

// ─── Status Actions ───────────────────────────────────────────────────────────

export const suspendSeller = async (id, { reason } = {}, admin, ipAddress) => {
  const seller = await adminSellerRepo.findSellerById(id);
  if (!seller) throw new ApiError(404, 'Seller not found.');

  const updated = await adminSellerRepo.suspendSeller(id, reason);
  const name = sellerName(seller);
  audit(admin, 'SUSPEND_SELLER', `${name} (${seller._id})`, seller._id, reason || '', ipAddress);
  return updated;
};

export const activateSeller = async (id, admin, ipAddress) => {
  const seller = await adminSellerRepo.findSellerById(id);
  if (!seller) throw new ApiError(404, 'Seller not found.');

  const updated = await adminSellerRepo.activateSeller(id);
  const name = sellerName(seller);
  audit(admin, 'ACTIVATE_SELLER', `${name} (${seller._id})`, seller._id, '', ipAddress);
  return updated;
};

export const blockSeller = async (id, { reason } = {}, admin, ipAddress) => {
  const seller = await adminSellerRepo.findSellerById(id);
  if (!seller) throw new ApiError(404, 'Seller not found.');

  const updated = await adminSellerRepo.blockSeller(id, reason);
  const name = sellerName(seller);
  audit(admin, 'BLOCK_SELLER', `${name} (${seller._id})`, seller._id, reason || '', ipAddress);
  return updated;
};

// ─── Soft Delete ──────────────────────────────────────────────────────────────

export const deleteSeller = async (id, admin, ipAddress) => {
  const seller = await adminSellerRepo.findSellerById(id);
  if (!seller) throw new ApiError(404, 'Seller not found.');
  if (seller.isDeleted) throw new ApiError(400, 'Seller is already deleted.');

  const updated = await adminSellerRepo.softDeleteSeller(id, admin._id);
  const name = sellerName(seller);
  audit(admin, 'DELETE_SELLER', `${name} (${seller._id})`, seller._id, 'Soft deleted by admin.', ipAddress);
  return updated;
};
