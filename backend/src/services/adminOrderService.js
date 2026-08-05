// src/services/adminOrderService.js
// Business logic for Admin Order Management, Dossier Viewing, and Status Transitions.

import * as orderRepo from '../repositories/adminOrderRepository.js';
import * as auditLogRepo from '../repositories/auditLogRepository.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { buildOrderFilter } from '../utils/buildFilter.js';

/**
 * List orders with pagination and filtering.
 */
export const listOrders = async (query = {}) => {
  const { page, limit } = parsePagination(query);
  const filter = buildOrderFilter(query);

  let sort = { createdAt: -1 };
  if (query.sortBy) {
    const order = query.sortOrder === 'asc' ? 1 : -1;
    sort = { [query.sortBy]: order };
  }

  const { orders, total } = await orderRepo.listOrders({
    filter,
    page,
    limit,
    sort,
  });

  const pagination = buildPaginationMeta(total, page, limit);
  return { orders, pagination };
};

/**
 * Get order dossier by ID.
 */
export const getOrder = async (id) => {
  const order = await orderRepo.getOrderById(id);
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
};

/**
 * Update order status with timeline tracking.
 */
export const updateOrderStatus = async (id, status, note = '', adminUser, ip) => {
  const allowed = [
    'pending',
    'confirmed',
    'processing',
    'packed',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
  ];

  if (!allowed.includes(status.toLowerCase())) {
    throw new ApiError(400, `Invalid order status: ${status}`);
  }

  const orderDoc = await orderRepo.findOrderDocument(id);
  if (!orderDoc) throw new ApiError(404, 'Order not found');

  const oldStatus = orderDoc.orderStatus;
  orderDoc.orderStatus = status.toLowerCase();

  if (status.toLowerCase() === 'delivered') {
    orderDoc.deliveredDate = new Date();
  }

  if (status.toLowerCase() === 'cancelled') {
    orderDoc.cancelledAt = new Date();
    orderDoc.cancelReason = note || 'Cancelled by administrator';
    orderDoc.paymentInfo.status = 'refunded';
    orderDoc.refundInfo = {
      amount: orderDoc.totalAmount,
      status: 'refunded',
      reason: note || 'Admin cancellation refund',
      processedAt: new Date(),
    };
  }

  orderDoc.statusHistory.push({
    status: status.toLowerCase(),
    timestamp: new Date(),
    note: note || `Order status updated from ${oldStatus} to ${status}`,
    updatedBy: adminUser._id,
  });

  await orderDoc.save();

  const populated = await orderRepo.getOrderById(id);

  await auditLogRepo.log({
    adminId: adminUser._id,
    adminEmail: adminUser.email,
    action: `ORDER_STATUS_${status.toUpperCase()}`,
    module: 'Orders',
    targetId: id,
    targetModel: 'Order',
    target: orderDoc.orderId,
    details: { oldStatus, newStatus: status, note },
    ip,
  });

  return populated;
};

/**
 * Cancel and refund order.
 */
export const cancelOrder = async (id, reason = '', adminUser, ip) => {
  return updateOrderStatus(id, 'cancelled', reason, adminUser, ip);
};
