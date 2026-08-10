// src/services/adminBulkService.js
// Universal bulk operation handler for Users, Sellers, Products, and Categories.

import User from '../models/User.js';
import Seller from '../models/Seller.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import * as auditLogRepo from '../repositories/auditLogRepository.js';
import { ApiError } from '../utils/ApiError.js';

export const executeBulkAction = async (targetEntity, action, ids = [], payload = {}, adminUser, ip) => {
  if (!ids || ids.length === 0) {
    throw new ApiError(400, 'No IDs provided for bulk operation');
  }

  let result;
  const entity = targetEntity.toLowerCase();

  if (entity === 'products') {
    if (action === 'delete') {
      result = await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { isDeleted: true, deletedAt: new Date(), status: 'Deleted' } }
      );
    } else if (action === 'approve') {
      result = await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { status: 'Approved', approvalStatus: 'Approved' } }
      );
    } else if (action === 'feature') {
      result = await Product.updateMany({ _id: { $in: ids } }, { $set: { featured: true } });
    } else if (action === 'unfeature') {
      result = await Product.updateMany({ _id: { $in: ids } }, { $set: { featured: false } });
    } else {
      throw new ApiError(400, `Unsupported product bulk action: ${action}`);
    }
  } else if (entity === 'users') {
    const userFilter = { _id: { $in: ids }, role: { $nin: ['admin', 'super_admin'] }, _id: { $ne: adminUser._id } };
    if (action === 'activate') {
      result = await User.updateMany(userFilter, { $set: { status: 'Active', isBlocked: false } });
    } else if (action === 'suspend') {
      result = await User.updateMany(userFilter, { $set: { status: 'Suspended' } });
    } else if (action === 'block') {
      result = await User.updateMany(userFilter, { $set: { isBlocked: true } });
    } else if (action === 'delete') {
      result = await User.updateMany(userFilter, { $set: { isDeleted: true, status: 'Deleted', deletedAt: new Date(), deletedBy: adminUser._id } });
    } else {
      throw new ApiError(400, `Unsupported user bulk action: ${action}`);
    }
  } else if (entity === 'sellers') {
    if (action === 'verify') {
      result = await Seller.updateMany(
        { _id: { $in: ids } },
        { $set: { verificationStatus: 'Verified', status: 'Active', isActive: true } }
      );
    } else if (action === 'suspend') {
      result = await Seller.updateMany({ _id: { $in: ids } }, { $set: { isSuspended: true, status: 'Suspended' } });
    } else if (action === 'activate') {
      result = await Seller.updateMany({ _id: { $in: ids } }, { $set: { isSuspended: false, status: 'Active', isActive: true } });
    } else {
      throw new ApiError(400, `Unsupported seller bulk action: ${action}`);
    }
  } else {
    throw new ApiError(400, `Invalid target entity: ${targetEntity}`);
  }

  await auditLogRepo.log({
    adminId: adminUser._id,
    adminEmail: adminUser.email,
    action: `BULK_${action.toUpperCase()}_${entity.toUpperCase()}`,
    module: 'Bulk',
    target: `${ids.length} ${entity}`,
    details: { entity, action, affectedCount: result?.modifiedCount || ids.length },
    ip,
  });

  return { success: true, count: result?.modifiedCount || ids.length };
};
