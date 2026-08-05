// src/services/adminUserService.js
// Business logic layer for admin User Management operations.
// Calls adminUserRepository — never touches the model directly.
// Also emits an AuditLog entry for every mutating action.

import * as adminUserRepo  from '../repositories/adminUserRepository.js';
import * as auditLogRepo   from '../repositories/auditLogRepository.js';
import { buildUserFilter } from '../utils/buildFilter.js';
import { parsePagination  } from '../utils/pagination.js';
import { ApiError }         from '../utils/ApiError.js';

// ─── Helper: emit audit log ───────────────────────────────────────────────────

const audit = (admin, action, target, targetId, remarks = '', ipAddress = null, status = 'success') => {
  return auditLogRepo.createLog({
    admin:    admin._id,
    adminName: `${admin.firstName} ${admin.lastName}`.trim(),
    action,
    module:   'Users',
    target,
    targetId,
    remarks,
    ipAddress,
    status,
  }).catch(() => {}); // Non-blocking — never fail the main operation because of logging
};

// ─── List ─────────────────────────────────────────────────────────────────────

export const getUsers = async (query) => {
  const { page, limit, sort, search } = parsePagination(query);
  const filter = buildUserFilter({ ...query, search });
  return adminUserRepo.listUsers({ filter, page, limit, sort });
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getUserById = async (id) => {
  const user = await adminUserRepo.findUserById(id);
  if (!user) throw new ApiError(404, 'User not found.');
  return user;
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateUser = async (id, data, admin, ipAddress) => {
  const user = await adminUserRepo.findUserById(id);
  if (!user) throw new ApiError(404, 'User not found.');

  // Whitelist updatable fields — admin cannot change password or tokens here
  const allowed = ['firstName', 'lastName', 'phone', 'role', 'status', 'isVerified', 'bio', 'gender'];
  const updates = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  const updated = await adminUserRepo.updateUserById(id, updates);
  const name = `${user.firstName} ${user.lastName}`.trim();
  audit(admin, 'UPDATE_USER', `${name} (${user._id})`, user._id, JSON.stringify(updates), ipAddress);
  return updated;
};

// ─── Status Actions ───────────────────────────────────────────────────────────

export const suspendUser = async (id, { reason } = {}, admin, ipAddress) => {
  const user = await adminUserRepo.findUserById(id);
  if (!user) throw new ApiError(404, 'User not found.');
  if (user.role === 'admin') throw new ApiError(403, 'Cannot suspend another admin account.');

  const updated = await adminUserRepo.suspendUser(id, reason);
  const name = `${user.firstName} ${user.lastName}`.trim();
  audit(admin, 'SUSPEND_USER', `${name} (${user._id})`, user._id, reason || '', ipAddress);
  return updated;
};

export const activateUser = async (id, admin, ipAddress) => {
  const user = await adminUserRepo.findUserById(id);
  if (!user) throw new ApiError(404, 'User not found.');

  const updated = await adminUserRepo.activateUser(id);
  const name = `${user.firstName} ${user.lastName}`.trim();
  audit(admin, 'ACTIVATE_USER', `${name} (${user._id})`, user._id, '', ipAddress);
  return updated;
};

export const blockUser = async (id, { reason } = {}, admin, ipAddress) => {
  const user = await adminUserRepo.findUserById(id);
  if (!user) throw new ApiError(404, 'User not found.');
  if (user.role === 'admin') throw new ApiError(403, 'Cannot block another admin account.');

  const updated = await adminUserRepo.blockUser(id);
  const name = `${user.firstName} ${user.lastName}`.trim();
  audit(admin, 'BLOCK_USER', `${name} (${user._id})`, user._id, reason || '', ipAddress);
  return updated;
};

export const unblockUser = async (id, admin, ipAddress) => {
  const user = await adminUserRepo.findUserById(id);
  if (!user) throw new ApiError(404, 'User not found.');

  const updated = await adminUserRepo.unblockUser(id);
  const name = `${user.firstName} ${user.lastName}`.trim();
  audit(admin, 'UNBLOCK_USER', `${name} (${user._id})`, user._id, '', ipAddress);
  return updated;
};

// ─── Soft Delete ──────────────────────────────────────────────────────────────

export const deleteUser = async (id, admin, ipAddress) => {
  const user = await adminUserRepo.findUserById(id);
  if (!user) throw new ApiError(404, 'User not found.');
  if (user.role === 'admin') throw new ApiError(403, 'Cannot delete an admin account.');
  if (user.isDeleted) throw new ApiError(400, 'User is already deleted.');

  const updated = await adminUserRepo.softDeleteUser(id, admin._id);
  const name = `${user.firstName} ${user.lastName}`.trim();
  audit(admin, 'DELETE_USER', `${name} (${user._id})`, user._id, 'Soft deleted by admin.', ipAddress);
  return updated;
};
