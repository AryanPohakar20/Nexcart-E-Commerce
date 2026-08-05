// src/services/adminVerificationService.js
// Business logic for Seller KYC Verification Center, document review, and approval lifecycle.

import * as sellerRepo from '../repositories/adminSellerRepository.js';
import * as auditLogRepo from '../repositories/auditLogRepository.js';
import Seller from '../models/Seller.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { buildVerificationFilter } from '../utils/buildFilter.js';

/**
 * List seller verification requests.
 */
export const listVerifications = async (query = {}) => {
  const { page, limit } = parsePagination(query);
  const filter = buildVerificationFilter(query);

  let sort = { updatedAt: -1, createdAt: -1 };
  if (query.sortBy) {
    const order = query.sortOrder === 'asc' ? 1 : -1;
    sort = { [query.sortBy]: order };
  }

  const { sellers, total } = await sellerRepo.listSellers({
    filter,
    page,
    limit,
    sort,
  });

  const pagination = buildPaginationMeta(total, page, limit);
  return { verifications: sellers, pagination };
};

/**
 * Get verification counts across all status tabs.
 */
export const getVerificationCounts = async () => {
  const [all, pending, approved, rejected] = await Promise.all([
    Seller.countDocuments({ isDeleted: { $ne: true } }),
    Seller.countDocuments({
      isDeleted: { $ne: true },
      verificationStatus: { $in: ['In Progress', 'Pending'] },
    }),
    Seller.countDocuments({
      isDeleted: { $ne: true },
      verificationStatus: 'Verified',
    }),
    Seller.countDocuments({
      isDeleted: { $ne: true },
      verificationStatus: 'Rejected',
    }),
  ]);

  return { all, pending, approved, rejected };
};

/**
 * Approve seller verification KYC.
 */
export const approveVerification = async (id, adminUser, ip) => {
  const seller = await sellerRepo.getSellerById(id);
  if (!seller) throw new ApiError(404, 'Seller not found');

  const updated = await sellerRepo.updateSeller(id, {
    verificationStatus: 'Verified',
    sellerStatus: 'Approved',
    status: 'Active',
    isActive: true,
    isSuspended: false,
    isBlocked: false,
  });

  await auditLogRepo.log({
    adminId: adminUser._id,
    adminEmail: adminUser.email,
    action: 'APPROVE_VERIFICATION',
    module: 'Verification',
    targetId: id,
    targetModel: 'Seller',
    target: seller.business?.businessName || seller.accountInfo?.displayName || seller.slug,
    details: { oldStatus: seller.verificationStatus, newStatus: 'Verified' },
    ip,
  });

  return updated;
};

/**
 * Reject seller verification KYC with remarks.
 */
export const rejectVerification = async (id, remarks = '', adminUser, ip) => {
  const seller = await sellerRepo.getSellerById(id);
  if (!seller) throw new ApiError(404, 'Seller not found');

  const updated = await sellerRepo.updateSeller(id, {
    verificationStatus: 'Rejected',
    sellerStatus: 'Rejected',
  });

  await auditLogRepo.log({
    adminId: adminUser._id,
    adminEmail: adminUser.email,
    action: 'REJECT_VERIFICATION',
    module: 'Verification',
    targetId: id,
    targetModel: 'Seller',
    target: seller.business?.businessName || seller.accountInfo?.displayName || seller.slug,
    details: { remarks },
    ip,
  });

  return updated;
};

/**
 * Request seller to re-upload documents.
 */
export const requestReupload = async (id, remarks = '', adminUser, ip) => {
  const seller = await sellerRepo.getSellerById(id);
  if (!seller) throw new ApiError(404, 'Seller not found');

  const updated = await sellerRepo.updateSeller(id, {
    verificationStatus: 'In Progress',
  });

  await auditLogRepo.log({
    adminId: adminUser._id,
    adminEmail: adminUser.email,
    action: 'REQUEST_REUPLOAD_VERIFICATION',
    module: 'Verification',
    targetId: id,
    targetModel: 'Seller',
    target: seller.business?.businessName || seller.accountInfo?.displayName || seller.slug,
    details: { remarks },
    ip,
  });

  return updated;
};
