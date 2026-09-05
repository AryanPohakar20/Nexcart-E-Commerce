// src/services/adminProductService.js
// Business logic for Admin Product Management, Moderation, and Lifecycle.

import * as productRepo from '../repositories/adminProductRepository.js';
import * as auditLogRepo from '../repositories/auditLogRepository.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { buildProductFilter } from '../utils/buildFilter.js';
import { toProductDTO, toProductDTOList } from '../mappers/productMapper.js';

/**
 * List products with filtering, pagination, and sorting.
 */
export const listProducts = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildProductFilter(query);

  let sort = { createdAt: -1 };
  if (query.sortBy) {
    const order = query.sortOrder === 'asc' ? 1 : -1;
    sort = { [query.sortBy]: order };
  }

  const { products, total } = await productRepo.listProducts({
    filter,
    page,
    limit,
    sort,
  });

  const pagination = buildPaginationMeta(total, page, limit);
  return { products: toProductDTOList(products), pagination, rawTotal: total };
};

/**
 * Get product by ID.
 */
export const getProduct = async (id) => {
  const product = await productRepo.getProductById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  return toProductDTO(product);
};

/**
 * Update product fields.
 */
export const updateProduct = async (id, data, adminUser, ip) => {
  const existing = await productRepo.getProductById(id);
  if (!existing) {
    throw new ApiError(404, 'Product not found');
  }

  const updated = await productRepo.updateProduct(id, data);

  if (adminUser) {
    await auditLogRepo.log({
      adminId: adminUser._id,
      adminEmail: adminUser.email,
      action: 'UPDATE_PRODUCT',
      module: 'Products',
      targetId: id,
      targetModel: 'Product',
      target: updated?.name || updated?.title || 'Product',
      details: { updatedFields: Object.keys(data) },
      ip,
    });
  }

  return toProductDTO(updated);
};

/**
 * Update stock specifically.
 */
export const updateStock = async (id, stock, adminUser, ip) => {
  return updateProduct(id, { stock: Number(stock) }, adminUser, ip);
};

/**
 * Soft delete product.
 */
export const deleteProduct = async (id, adminUser, ip) => {
  const existing = await productRepo.getProductById(id);
  if (!existing) {
    throw new ApiError(404, 'Product not found');
  }

  const updated = await productRepo.updateProduct(id, {
    isDeleted: true,
    deletedAt: new Date(),
    status: 'Deleted',
  });

  if (adminUser) {
    await auditLogRepo.log({
      adminId: adminUser._id,
      adminEmail: adminUser.email,
      action: 'DELETE_PRODUCT',
      module: 'Products',
      targetId: id,
      targetModel: 'Product',
      target: existing.name || existing.title || 'Product',
      details: { reason: 'Soft deleted by admin' },
      ip,
    });
  }

  return toProductDTO(updated);
};

/**
 * Restore a soft-deleted product.
 */
export const restoreProduct = async (id, adminUser, ip) => {
  const existing = await productRepo.getProductById(id);
  if (!existing) {
    throw new ApiError(404, 'Product not found');
  }

  const updated = await productRepo.updateProduct(id, {
    isDeleted: false,
    deletedAt: null,
    status: 'Approved',
  });

  if (adminUser) {
    await auditLogRepo.log({
      adminId: adminUser._id,
      adminEmail: adminUser.email,
      action: 'RESTORE_PRODUCT',
      module: 'Products',
      targetId: id,
      targetModel: 'Product',
      target: existing.name || existing.title || 'Product',
      ip,
    });
  }

  return toProductDTO(updated);
};

/**
 * Moderate Product: Approve.
 */
export const approveProduct = async (id, adminUser, ip) => {
  const updated = await productRepo.updateProduct(id, {
    status: 'Active',
    approvedBy: adminUser?._id,
    approvedAt: new Date(),
  });

  if (!updated) throw new ApiError(404, 'Product not found');

  if (adminUser) {
    await auditLogRepo.log({
      adminId: adminUser._id,
      adminEmail: adminUser.email,
      action: 'APPROVE_PRODUCT',
      module: 'Products',
      targetId: id,
      targetModel: 'Product',
      target: updated.name || updated.title || 'Product',
      ip,
    });
  }

  return toProductDTO(updated);
};

/**
 * Moderate Product: Reject.
 */
export const rejectProduct = async (id, reason = '', adminNotes = '', adminUser, ip) => {
  const updated = await productRepo.updateProduct(id, {
    status: 'Rejected',
    rejectedReason: reason || adminNotes || 'Rejected by administrator',
  });

  if (!updated) throw new ApiError(404, 'Product not found');

  if (adminUser) {
    await auditLogRepo.log({
      adminId: adminUser._id,
      adminEmail: adminUser.email,
      action: 'REJECT_PRODUCT',
      module: 'Products',
      targetId: id,
      targetModel: 'Product',
      target: updated.name || updated.title || 'Product',
      details: { reason, adminNotes },
      ip,
    });
  }

  return toProductDTO(updated);
};

/**
 * Toggle Featured status of a product.
 */
export const toggleFeatured = async (id, adminUser, ip) => {
  const existing = await productRepo.getProductById(id);
  if (!existing) throw new ApiError(404, 'Product not found');

  const newFeatured = !(existing.featured || existing.isFeatured);
  const updated = await productRepo.updateProduct(id, {
    featured: newFeatured,
    isFeatured: newFeatured,
  });

  if (adminUser) {
    await auditLogRepo.log({
      adminId: adminUser._id,
      adminEmail: adminUser.email,
      action: newFeatured ? 'FEATURE_PRODUCT' : 'UNFEATURE_PRODUCT',
      module: 'Products',
      targetId: id,
      targetModel: 'Product',
      target: existing.name || existing.title || 'Product',
      ip,
    });
  }

  return toProductDTO(updated);
};

/**
 * Toggle Trending status of a product.
 */
export const toggleTrending = async (id, adminUser, ip) => {
  const existing = await productRepo.getProductById(id);
  if (!existing) throw new ApiError(404, 'Product not found');

  const newTrending = !(existing.trending || existing.isTrending);
  const updated = await productRepo.updateProduct(id, {
    trending: newTrending,
    isTrending: newTrending,
  });

  if (adminUser) {
    await auditLogRepo.log({
      adminId: adminUser._id,
      adminEmail: adminUser.email,
      action: newTrending ? 'TRENDING_PRODUCT' : 'UNTRENDING_PRODUCT',
      module: 'Products',
      targetId: id,
      targetModel: 'Product',
      target: existing.name || existing.title || 'Product',
      ip,
    });
  }

  return toProductDTO(updated);
};

/**
 * Bulk action on products.
 */
export const bulkProductAction = async (action, ids = [], extraData = {}, adminUser, ip) => {
  if (!ids || ids.length === 0) {
    throw new ApiError(400, 'No product IDs provided');
  }

  const operations = [];

  switch (action) {
    case 'approve':
      operations.push({
        updateMany: {
          filter: { _id: { $in: ids } },
          update: {
            $set: {
              status: 'Approved',
              approvalStatus: 'Approved',
              'moderation.reviewedBy': adminUser?._id,
              'moderation.reviewedAt': new Date(),
            },
          },
        },
      });
      break;

    case 'reject':
      operations.push({
        updateMany: {
          filter: { _id: { $in: ids } },
          update: {
            $set: {
              status: 'Rejected',
              approvalStatus: 'Rejected',
              'moderation.reason': extraData.reason || 'Bulk rejected by admin',
              'moderation.reviewedBy': adminUser?._id,
              'moderation.reviewedAt': new Date(),
            },
          },
        },
      });
      break;

    case 'delete':
      operations.push({
        updateMany: {
          filter: { _id: { $in: ids } },
          update: {
            $set: {
              isDeleted: true,
              deletedAt: new Date(),
              status: 'Deleted',
            },
          },
        },
      });
      break;

    case 'feature':
      operations.push({
        updateMany: {
          filter: { _id: { $in: ids } },
          update: { $set: { featured: true, isFeatured: true } },
        },
      });
      break;

    case 'unfeature':
      operations.push({
        updateMany: {
          filter: { _id: { $in: ids } },
          update: { $set: { featured: false, isFeatured: false } },
        },
      });
      break;

    default:
      throw new ApiError(400, `Invalid bulk action: ${action}`);
  }

  const result = await productRepo.bulkWriteProducts(operations);

  if (adminUser) {
    await auditLogRepo.log({
      adminId: adminUser._id,
      adminEmail: adminUser.email,
      action: `BULK_${action.toUpperCase()}_PRODUCTS`,
      module: 'Products',
      target: `${ids.length} products`,
      details: { ids, result },
      ip,
    });
  }

  return { success: true, count: ids.length, result };
};
