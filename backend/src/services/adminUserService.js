// src/services/adminUserService.js
// Business logic layer for admin User Management operations.
// Calls adminUserRepository — never touches the model directly.
// Also emits an AuditLog entry for every mutating action.

import mongoose from 'mongoose';
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

  // Safety check: Prevent admin from deleting their own active session/account or the root admin
  if (user._id.toString() === admin._id.toString() || user.email === 'admin@nexcart.in') {
    throw new ApiError(403, 'Forbidden: You cannot delete your own active session or the root admin account.');
  }

  const updated = await adminUserRepo.softDeleteUser(id, admin._id);
  const name = `${user.firstName} ${user.lastName}`.trim();
  audit(admin, 'DELETE_USER', `${name} (${user._id})`, user._id, 'Soft deleted by admin.', ipAddress);
  return updated;
};

// ─── Update User Status ────────────────────────────────────────────────────────

export const updateUserStatus = async (id, status, admin, ipAddress) => {
  const user = await adminUserRepo.findUserById(id);
  if (!user) throw new ApiError(404, 'User not found.');

  // Safety check: Prevent admin from suspending/reactivating their own active session/account or the root admin
  if (user._id.toString() === admin._id.toString() || user.email === 'admin@nexcart.in') {
    throw new ApiError(403, 'Forbidden: You cannot suspend or reactivate your own active session or the root admin account.');
  }

  const targetStatus = status.toLowerCase() === 'active' ? 'Active' : 'Suspended';

  let updated;
  if (targetStatus === 'Active') {
    updated = await adminUserRepo.activateUser(id);
  } else {
    updated = await adminUserRepo.suspendUser(id, 'Suspended by admin');
  }

  const name = `${user.firstName} ${user.lastName}`.trim();
  audit(admin, targetStatus === 'Active' ? 'ACTIVATE_USER' : 'SUSPEND_USER', `${name} (${user._id})`, user._id, `Status set to ${targetStatus}`, ipAddress);
  return updated;
};

// ─── Bulk Operations ──────────────────────────────────────────────────────────

const filterValidTargetIds = (userIds, currentAdminId) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new ApiError(400, 'Please provide an array of user IDs.');
  }
  const validIds = userIds.filter((id) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return false;
    if (id.toString() === currentAdminId.toString()) return false;
    return true;
  });
  if (validIds.length === 0) {
    throw new ApiError(400, 'No valid target users selected (Admin accounts cannot be modified).');
  }
  return validIds;
};

export const bulkSuspendUsers = async (userIds, admin, ipAddress) => {
  const validUserIds = filterValidTargetIds(userIds, admin._id);
  const result = await adminUserRepo.bulkSuspendUsers(validUserIds);
  const count = result.modifiedCount || 0;
  audit(admin, 'BULK_SUSPEND_USERS', `${count} users suspended`, null, `IDs: ${validUserIds.join(', ')}`, ipAddress);
  return { count };
};

export const bulkActivateUsers = async (userIds, admin, ipAddress) => {
  const validUserIds = filterValidTargetIds(userIds, admin._id);
  const result = await adminUserRepo.bulkActivateUsers(validUserIds);
  const count = result.modifiedCount || 0;
  audit(admin, 'BULK_ACTIVATE_USERS', `${count} users activated`, null, `IDs: ${validUserIds.join(', ')}`, ipAddress);
  return { count };
};

export const bulkDeleteUsers = async (userIds, admin, ipAddress) => {
  const validUserIds = filterValidTargetIds(userIds, admin._id);
  const result = await adminUserRepo.bulkDeleteUsers(validUserIds, admin._id);
  const count = result.modifiedCount || 0;
  audit(admin, 'BULK_DELETE_USERS', `${count} users deleted`, null, `IDs: ${validUserIds.join(', ')}`, ipAddress);
  return { count };
};

