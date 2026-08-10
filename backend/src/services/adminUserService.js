// src/services/adminUserService.js
// Business logic layer for admin User Management operations.
// Calls adminUserRepository — never touches the model directly.
// Also emits an AuditLog entry for every mutating action.

import mongoose from 'mongoose';
import User from '../models/User.js';
import * as adminUserRepo  from '../repositories/adminUserRepository.js';
import * as auditLogRepo   from '../repositories/auditLogRepository.js';
import { buildUserFilter } from '../utils/buildFilter.js';
import { parsePagination  } from '../utils/pagination.js';
import { ApiError }         from '../utils/ApiError.js';


// ─── Helper: emit audit log ───────────────────────────────────────────────────

const audit = (admin, action, target, targetId, remarks = '', ipAddress = null, status = 'success') => {
  const adminId = admin?._id || admin?.id;
  if (!adminId) return Promise.resolve();
  const adminName = admin ? `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.email || 'Admin' : 'Admin';
  return auditLogRepo.createLog({
    admin:    adminId,
    adminName,
    action,
    module:   'Users',
    target,
    targetId: targetId && mongoose.Types.ObjectId.isValid(targetId) ? targetId : null,
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

export const updateUserStatus = async (id, status, admin, ipAddress) => {
  const user = await adminUserRepo.findUserById(id);
  if (!user) throw new ApiError(404, 'User not found.');

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

const filterValidTargetIds = async (userIds, admin) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new ApiError(400, 'Please provide an array of user IDs.');
  }
  const validObjectIds = userIds.filter(
    (id) => id && mongoose.Types.ObjectId.isValid(id)
  );

  if (validObjectIds.length === 0) {
    throw new ApiError(400, 'No valid user IDs provided.');
  }

  const adminId = admin?._id || admin?.id;
  const orConditions = [{ role: { $in: ['admin', 'super_admin'] } }];
  if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
    orConditions.push({ _id: adminId });
  }

  const adminUsers = await User.find({
    _id: { $in: validObjectIds },
    $or: orConditions,
  }).select('_id');

  const adminIdSet = new Set(adminUsers.map((u) => u._id.toString()));
  if (adminId) {
    adminIdSet.add(adminId.toString());
  }

  const validIds = validObjectIds.filter((id) => !adminIdSet.has(id.toString()));
  const skippedAdminsCount = validObjectIds.length - validIds.length;

  return { validIds, skippedAdminsCount };
};

export const bulkSuspendUsers = async (userIds, admin, ipAddress) => {
  const { validIds, skippedAdminsCount } = await filterValidTargetIds(userIds, admin);
  if (validIds.length === 0) {
    throw new ApiError(400, 'Cannot suspend selected users: Admin accounts cannot be suspended.');
  }
  const result = await adminUserRepo.bulkSuspendUsers(validIds);
  const count = result?.modifiedCount ?? result?.nModified ?? 0;
  audit(admin, 'BULK_SUSPEND_USERS', `${count} users suspended`, null, `IDs: ${validIds.join(', ')}`, ipAddress);
  return { count, skippedAdminsCount };
};

export const bulkActivateUsers = async (userIds, admin, ipAddress) => {
  const { validIds, skippedAdminsCount } = await filterValidTargetIds(userIds, admin);
  if (validIds.length === 0) {
    throw new ApiError(400, 'Cannot activate selected users: Admin accounts cannot be modified.');
  }
  const result = await adminUserRepo.bulkActivateUsers(validIds);
  const count = result?.modifiedCount ?? result?.nModified ?? 0;
  audit(admin, 'BULK_ACTIVATE_USERS', `${count} users activated`, null, `IDs: ${validIds.join(', ')}`, ipAddress);
  return { count, skippedAdminsCount };
};

export const bulkDeleteUsers = async (userIds, admin, ipAddress) => {
  const adminId = admin?._id || admin?.id;
  const { validIds, skippedAdminsCount } = await filterValidTargetIds(userIds, admin);
  if (validIds.length === 0) {
    throw new ApiError(400, 'Cannot delete selected users: Admin accounts cannot be deleted.');
  }
  const result = await adminUserRepo.bulkDeleteUsers(validIds, adminId);
  const count = result?.modifiedCount ?? result?.nModified ?? 0;
  audit(admin, 'BULK_DELETE_USERS', `${count} users deleted`, null, `IDs: ${validIds.join(', ')}`, ipAddress);
  return { count, skippedAdminsCount };
};

