// src/services/adminBulkService.js
// Universal bulk operation handler for Users, Sellers, Products, and Categories.
//
// SECURITY FIXES:
// 1. Fixed critical duplicate _id key bug (JavaScript silently overwrote $in with $ne,
//    causing bulk actions to affect ALL records instead of only selected IDs).
// 2. Action names are now validated against an explicit allow-list per entity.
// 3. All IDs are validated as valid MongoDB ObjectIds before any DB query.
// 4. Empty ID arrays are rejected.
// 5. Protected accounts (admin, super_admin) are excluded via safe filter composition.

import mongoose from 'mongoose';
import User     from '../models/User.js';
import Seller   from '../models/Seller.js';
import Product  from '../models/Product.js';
import Category from '../models/Category.js';
import * as auditLogRepo from '../repositories/auditLogRepository.js';
import { ApiError }      from '../utils/ApiError.js';

// ─── Allow-lists for each entity ──────────────────────────────────────────────
const ALLOWED_ACTIONS = {
  products: new Set(['delete', 'approve', 'feature', 'unfeature']),
  users:    new Set(['activate', 'suspend', 'block', 'delete']),
  sellers:  new Set(['verify', 'suspend', 'activate']),
};

// ─── Validate IDs ─────────────────────────────────────────────────────────────
const validateIds = (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, 'No IDs provided for bulk operation');
  }
  const invalid = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
  if (invalid.length > 0) {
    throw new ApiError(400, `Invalid ID(s) supplied: ${invalid.join(', ')}`);
  }
  return ids.map((id) => new mongoose.Types.ObjectId(id));
};

// ─── Main handler ─────────────────────────────────────────────────────────────

export const executeBulkAction = async (targetEntity, action, ids = [], payload = {}, adminUser, ip) => {
  const entity    = String(targetEntity).toLowerCase();
  const actionKey = String(action).toLowerCase();

  // 1. Validate entity
  if (!ALLOWED_ACTIONS[entity]) {
    throw new ApiError(400, `Invalid target entity: ${targetEntity}`);
  }

  // 2. Validate action against allow-list (prevents arbitrary action injection)
  if (!ALLOWED_ACTIONS[entity].has(actionKey)) {
    throw new ApiError(400, `Unsupported bulk action '${action}' for entity '${entity}'`);
  }

  // 3. Validate and cast IDs to ObjectIds
  const objectIds = validateIds(ids);

  let result;

  // ─── Products ─────────────────────────────────────────────────────────────
  if (entity === 'products') {
    // Only operate on selected IDs — no cross-contamination
    const productFilter = { _id: { $in: objectIds } };

    if (actionKey === 'delete') {
      result = await Product.updateMany(
        productFilter,
        { $set: { isDeleted: true, deletedAt: new Date(), status: 'Deleted' } }
      );
    } else if (actionKey === 'approve') {
      result = await Product.updateMany(
        productFilter,
        { $set: { status: 'Approved', approvalStatus: 'Approved' } }
      );
    } else if (actionKey === 'feature') {
      result = await Product.updateMany(productFilter, { $set: { featured: true } });
    } else if (actionKey === 'unfeature') {
      result = await Product.updateMany(productFilter, { $set: { featured: false } });
    }

  // ─── Users ────────────────────────────────────────────────────────────────
  } else if (entity === 'users') {
    // SECURITY FIX: Previously had duplicate _id key — { _id: {$in:ids}, …, _id: {$ne:admin._id} }
    // JavaScript silently overwrote the first _id with the second, turning "$in selected" into
    // "everyone except admin". Fixed by composing the filter correctly with $and.
    //
    // This filter:
    //   a) Only affects the explicitly selected IDs via $in
    //   b) Excludes the performing admin's own account
    //   c) Excludes protected privileged accounts (admin, super_admin)
    const userFilter = {
      $and: [
        { _id: { $in: objectIds } },                                    // Only selected IDs
        { _id: { $ne: adminUser._id } },                                // Never affect self
        { role: { $nin: ['admin', 'super_admin'] } },                   // Protect privileged accounts
      ],
    };

    if (actionKey === 'activate') {
      result = await User.updateMany(userFilter, { $set: { status: 'Active', isBlocked: false } });
    } else if (actionKey === 'suspend') {
      result = await User.updateMany(userFilter, { $set: { status: 'Suspended' } });
    } else if (actionKey === 'block') {
      result = await User.updateMany(userFilter, { $set: { status: 'Blocked', isBlocked: true } });
    } else if (actionKey === 'delete') {
      result = await User.updateMany(
        userFilter,
        { $set: { isDeleted: true, status: 'Deleted', deletedAt: new Date(), deletedBy: adminUser._id } }
      );
    }

  // ─── Sellers ──────────────────────────────────────────────────────────────
  } else if (entity === 'sellers') {
    const sellerFilter = { _id: { $in: objectIds } };

    if (actionKey === 'verify') {
      result = await Seller.updateMany(
        sellerFilter,
        { $set: { verificationStatus: 'Verified', status: 'Active', isActive: true } }
      );
    } else if (actionKey === 'suspend') {
      result = await Seller.updateMany(sellerFilter, { $set: { isSuspended: true, status: 'Suspended' } });
    } else if (actionKey === 'activate') {
      result = await Seller.updateMany(sellerFilter, { $set: { isSuspended: false, status: 'Active', isActive: true } });
    }
  }

  await auditLogRepo.log({
    adminId:    adminUser._id,
    adminEmail: adminUser.email,
    action:     `BULK_${actionKey.toUpperCase()}_${entity.toUpperCase()}`,
    module:     'Bulk',
    target:     `${objectIds.length} ${entity}`,
    details:    { entity, action: actionKey, affectedCount: result?.modifiedCount ?? 0, requestedIds: objectIds.length },
    ip,
  });

  return { success: true, count: result?.modifiedCount ?? 0 };
};
