// src/services/adminUserService.js
// Business logic layer for admin User Management operations.
// Calls adminUserRepository — never touches the model directly.
// Also emits an AuditLog entry for every mutating action.

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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

// ─── Create ───────────────────────────────────────────────────────────────────

export const createUser = async (data, admin, ipAddress) => {
  const { firstName, lastName, email, phone, password, role = 'customer', status = 'Active', isVerified = false } = data;

  if (!firstName || !firstName.trim() || !lastName || !lastName.trim()) {
    throw new ApiError(400, 'First name and last name are required.');
  }

  if (!email || !email.trim()) {
    throw new ApiError(400, 'Email is required.');
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email.trim())) {
    throw new ApiError(400, 'Please provide a valid email address.');
  }

  if (!password || password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long.');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim(), isDeleted: { $ne: true } });
  if (existingUser) {
    throw new ApiError(409, 'A user with this email address already exists.');
  }

  const allowedRoles = ['customer', 'seller', 'marketplace_seller', 'admin', 'moderator', 'support_staff'];
  const formattedRole = (role || 'customer').toLowerCase();
  if (!allowedRoles.includes(formattedRole)) {
    throw new ApiError(400, `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`);
  }

  const formattedStatus = status && ['suspended', 'blocked'].includes(status.toLowerCase())
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : 'Active';

  const isBlocked = formattedStatus === 'Blocked';

  const userData = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase().trim(),
    phone: phone ? phone.trim() : undefined,
    password,
    role: formattedRole,
    status: formattedStatus,
    isBlocked,
    isVerified: Boolean(isVerified),
  };

  const user = await adminUserRepo.createUser(userData);
  const name = `${user.firstName} ${user.lastName}`.trim();
  audit(admin, 'CREATE_USER', `${name} (${user._id})`, user._id, `Created user with role '${formattedRole}'`, ipAddress);
  return user;
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateUser = async (id, data, admin, ipAddress) => {
  const user = await adminUserRepo.findUserById(id);
  if (!user) throw new ApiError(404, 'User not found.');

  const adminRole = String(admin?.role || '').toLowerCase();
  if (data.role && data.role !== user.role) {
    if (adminRole !== 'super_admin' && (user.role === 'admin' || user.role === 'super_admin')) {
      throw new ApiError(403, 'Cannot change the role of an administrator account.');
    }
  }

  const allowed = ['firstName', 'lastName', 'email', 'phone', 'role', 'status', 'isVerified', 'isBlocked', 'bio', 'gender'];
  const updates = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  // Validate email uniqueness if changed
  if (updates.email) {
    const normalizedEmail = updates.email.toLowerCase().trim();
    if (normalizedEmail !== user.email?.toLowerCase()) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(normalizedEmail)) {
        throw new ApiError(400, 'Please provide a valid email address.');
      }
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: id }, isDeleted: { $ne: true } });
      if (existing) {
        throw new ApiError(409, 'A user with this email address already exists.');
      }
      updates.email = normalizedEmail;
    }
  }

  // Synchronize status and isBlocked
  if (updates.status) {
    const s = String(updates.status).toLowerCase();
    if (s === 'active') {
      updates.status = 'Active';
      updates.isBlocked = false;
    } else if (s === 'suspended') {
      updates.status = 'Suspended';
    } else if (s === 'blocked') {
      updates.status = 'Blocked';
      updates.isBlocked = true;
    }
  }

  if (updates.isBlocked !== undefined) {
    updates.isBlocked = Boolean(updates.isBlocked);
    if (updates.isBlocked) {
      updates.status = 'Blocked';
    }
  }

  // Optional password update
  if (data.password && typeof data.password === 'string' && data.password.trim().length > 0) {
    if (data.password.trim().length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters long.');
    }
    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(data.password.trim(), salt);
  }

  const updated = await adminUserRepo.updateUserById(id, updates);
  const name = `${user.firstName} ${user.lastName}`.trim();
  audit(admin, 'UPDATE_USER', `${name} (${user._id})`, user._id, JSON.stringify(updates), ipAddress);
  return updated;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteUser = async (id, admin, ipAddress) => {
  const user = await adminUserRepo.findUserById(id);
  if (!user) throw new ApiError(404, 'User not found.');

  const adminId = admin?._id || admin?.id;
  if (adminId && user._id.toString() === adminId.toString()) {
    throw new ApiError(400, 'You cannot delete your own admin account.');
  }

  if (['admin', 'super_admin'].includes(user.role)) {
    throw new ApiError(403, 'Cannot delete an administrator account.');
  }

  const deleted = await adminUserRepo.softDeleteUser(id, adminId);
  const name = `${user.firstName} ${user.lastName}`.trim();
  audit(admin, 'DELETE_USER', `${name} (${user._id})`, user._id, 'User account soft deleted by admin', ipAddress);
  return deleted;
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetUserPassword = async (id, newPassword, admin, ipAddress) => {
  const user = await adminUserRepo.findUserById(id);
  if (!user) throw new ApiError(404, 'User not found.');

  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await User.findByIdAndUpdate(id, { $set: { password: hashedPassword } });
  const name = `${user.firstName} ${user.lastName}`.trim();
  audit(admin, 'RESET_PASSWORD', `${name} (${user._id})`, user._id, 'Admin password reset', ipAddress);
  return { success: true };
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

  const lower = String(status).toLowerCase();
  let updated;
  let targetStatus;

  if (lower === 'active') {
    targetStatus = 'Active';
    updated = await adminUserRepo.activateUser(id);
  } else if (lower === 'blocked') {
    targetStatus = 'Blocked';
    updated = await adminUserRepo.blockUser(id);
  } else {
    targetStatus = 'Suspended';
    updated = await adminUserRepo.suspendUser(id, 'Suspended by admin');
  }

  const name = `${user.firstName} ${user.lastName}`.trim();
  audit(admin, targetStatus === 'Active' ? 'ACTIVATE_USER' : targetStatus === 'Blocked' ? 'BLOCK_USER' : 'SUSPEND_USER', `${name} (${user._id})`, user._id, `Status set to ${targetStatus}`, ipAddress);
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

