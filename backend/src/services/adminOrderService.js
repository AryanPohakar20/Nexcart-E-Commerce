// src/services/adminOrderService.js
// Business logic for Admin Order Management.
// Enhanced version from Manjusha branch — supports:
//   - Title Case and lowercase status strings (backward compatibility)
//   - Timeline tracking for admin status changes
//   - Status conflict detection (409 on duplicate / terminal status updates)
//   - Detailed order detail mapping with all field aliases

import mongoose from 'mongoose';
import * as orderRepo from '../repositories/adminOrderRepository.js';
import * as auditLogRepo from '../repositories/auditLogRepository.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { buildOrderFilter } from '../utils/buildFilter.js';
import { ALL_ORDER_STATUSES, ALL_ORDER_STATUSES_LOWER } from '../constants/orderStatus.js';

// Combined set of all valid status strings (Title Case + lowercase)
const ALL_VALID_STATUSES = new Set([...ALL_ORDER_STATUSES, ...ALL_ORDER_STATUSES_LOWER]);

// ─── Admin Order Services ──────────────────────────────────────────────────────

/**
 * List orders with pagination, filtering, sorting, and search.
 * Supports advanced search across orderId, orderNumber, customer name, seller, product.
 *
 * @param {Object} query - req.query params
 */
export const listOrders = async (query = {}) => {
  const { page, limit } = parsePagination(query);
  const filter = buildOrderFilter(query);

  // Sorting
  const allowedSortFields = ['createdAt', 'grandTotal', 'orderStatus', 'paymentStatus', 'totalAmount'];
  if (query.sortBy && !allowedSortFields.includes(query.sortBy)) {
    throw new ApiError(400, `Unsupported sort field: ${query.sortBy}`);
  }
  if (query.sortOrder && !['asc', 'desc'].includes(query.sortOrder)) {
    throw new ApiError(400, `Unsupported sort order: ${query.sortOrder}`);
  }

  const sortField = query.sortBy === 'grandTotal' ? 'totalAmount' : (query.sortBy || 'createdAt');
  const direction = query.sortOrder === 'asc' ? 1 : -1;
  const sort      = { [sortField]: direction };

  const { orders, total } = await orderRepo.listOrders({ filter, page, limit, sort });

  // Map orders to clean list response
  const mappedOrders = orders.map(order => {
    const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    return {
      orderId:       order._id,
      orderNumber:   order.orderNumber || order.orderId,
      customerName:  order.customer
        ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
        : order.shippingAddress?.fullName || 'Unknown Customer',
      sellerShopName:
        order.seller?.business?.businessName ||
        order.seller?.accountInfo?.displayName ||
        order.seller?.shopName ||
        'Nexcart Seller',
      orderDate:     order.createdAt,
      orderStatus:   order.orderStatus,
      paymentStatus: order.paymentInfo?.status || order.payment?.paymentStatus || 'pending',
      paymentMethod: order.paymentInfo?.method || order.payment?.paymentMethod || 'COD',
      grandTotal:    order.totalAmount || order.pricing?.total || 0,
      totalItems,
      estimatedDelivery: order.tracking?.estimatedDelivery || null,
    };
  });

  const totalPages = Math.ceil(total / limit) || 1;
  const paginationMeta = {
    totalOrders:    total,
    currentPage:    page,
    totalPages,
    limit,
    hasNextPage:     page < totalPages,
    hasPreviousPage: page > 1,
  };

  return { orders: mappedOrders, pagination: paginationMeta };
};

/**
 * Get full order details for admin view.
 * Maps both old and new field aliases for complete backward compatibility.
 *
 * @param {string} id - MongoDB Order ObjectId
 */
export const getOrder = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid order id.');
  }

  const order = await orderRepo.getOrderById(id);
  if (!order) throw new ApiError(404, 'Order not found');

  return {
    orderNumber:   order.orderNumber || order.orderId,
    orderDate:     order.createdAt,
    orderStatus:   order.orderStatus,
    paymentStatus: order.paymentInfo?.status || order.payment?.paymentStatus || 'pending',
    paymentMethod: order.paymentInfo?.method || order.payment?.paymentMethod || 'COD',
    customerInformation: order.customer ? {
      customerId: order.customer._id,
      firstName:  order.customer.firstName || '',
      lastName:   order.customer.lastName  || '',
      email:      order.customer.email     || '',
      phone:      order.customer.phone     || '',
    } : null,
    sellerInformation: order.seller ? {
      sellerId: order.seller._id,
      shopName:
        order.seller.business?.businessName ||
        order.seller.accountInfo?.displayName ||
        order.seller.shopName ||
        'Nexcart Seller',
      email: order.seller.accountInfo?.email || order.seller.email || '',
    } : null,
    shippingAddress: order.shippingAddress ? {
      fullName:     order.shippingAddress.fullName ||
        `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim(),
      phone:        order.shippingAddress.phone || '',
      addressLine1: order.shippingAddress.addressLine1 || order.shippingAddress.street || '',
      addressLine2: order.shippingAddress.addressLine2 || '',
      city:         order.shippingAddress.city || '',
      state:        order.shippingAddress.state || '',
      pincode:      order.shippingAddress.pincode || order.shippingAddress.zipCode || '',
      country:      order.shippingAddress.country || 'India',
    } : null,
    orderedProducts: order.items?.map(item => ({
      productId:  item.product?._id || item.product,
      name:       item.title || item.name || item.product?.name || item.product?.title || '',
      quantity:   item.quantity,
      unitPrice:  item.price,
      itemTotal:  (item.quantity * item.price) || 0,
      thumbnail:  item.thumbnail || item.image || null,
    })) || [],
    subtotal:        order.pricing?.subtotal || order.totalAmount || 0,
    tax:             order.pricing?.tax || 0,
    discount:        order.pricing?.discount || 0,
    shippingCharges: order.pricing?.shippingCharges || 0,
    grandTotal:      order.totalAmount || order.pricing?.total || 0,
    estimatedDelivery: order.tracking?.estimatedDelivery || order.estimatedDeliveryDate || null,
    trackingNumber:    order.tracking?.trackingNumber || order.trackingNumber || null,
    cancelReason:      order.cancelReason || order.cancellation?.reason || null,
    refundInfo:        order.refundInfo || null,
    timeline: (order.timeline || []).map(event => ({
      status:    event.status,
      updatedBy: event.updatedBy || 'System',
      timestamp: event.timestamp,
      message:   event.message || event.description || event.title || '',
    })),
    statusHistory: (order.statusHistory || []).map(h => ({
      status:    h.status,
      timestamp: h.timestamp,
      note:      h.note || '',
    })),
  };
};

/**
 * Update order status with conflict checking and admin timeline logging.
 * Supports both Title Case and lowercase status values.
 *
 * @param {string} id       - MongoDB Order ObjectId
 * @param {string} status   - New order status
 * @param {string} note     - Optional reason/note
 * @param {Object} adminUser - Authenticated admin user document
 * @param {string} ip       - Request IP address (for audit log)
 */
export const updateOrderStatus = async (id, status, note = '', adminUser, ip) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid order id.');
  }

  if (!ALL_VALID_STATUSES.has(status)) {
    throw new ApiError(400, `Invalid order status: "${status}". Valid values are: ${[...ALL_ORDER_STATUSES].join(', ')}`);
  }

  const orderDoc = await orderRepo.findOrderDocument(id);
  if (!orderDoc) throw new ApiError(404, 'Order not found');

  const oldStatus = orderDoc.orderStatus;

  // Reject duplicate status updates
  if (oldStatus === status) {
    throw new ApiError(409, `Order is already in '${status}' status.`);
  }

  // Reject updates on terminal statuses
  const currentLower   = (oldStatus || '').toLowerCase();
  const paymentStatus  = orderDoc.paymentInfo?.status || orderDoc.payment?.paymentStatus;
  const isRefunded     =
    (paymentStatus || '').toLowerCase() === 'refunded' ||
    (orderDoc.refundInfo?.status || '').toLowerCase() === 'refunded';

  if (['delivered', 'returned'].includes(currentLower) || isRefunded) {
    throw new ApiError(409, `Cannot update status. Order is already "${oldStatus}"${isRefunded ? ' or Refunded' : ''}.`);
  }

  const now = new Date();
  orderDoc.orderStatus = status;

  // Handle status-specific side effects
  const statusLower = status.toLowerCase();
  if (statusLower === 'delivered') {
    orderDoc.deliveredDate = now;
  }

  if (statusLower === 'cancelled') {
    orderDoc.cancelledAt  = now;
    orderDoc.cancelReason = note || 'Cancelled by administrator';
    if (orderDoc.paymentInfo) orderDoc.paymentInfo.status = 'refunded';
    orderDoc.refundInfo = {
      amount:      orderDoc.totalAmount || 0,
      status:      'refunded',
      reason:      note || 'Admin cancellation refund',
      processedAt: now,
    };
  }

  // Append to legacy statusHistory
  orderDoc.statusHistory.push({
    status,
    timestamp: now,
    note:      note || `Order status updated from ${oldStatus} to ${status}`,
    updatedBy: adminUser._id,
  });

  // Append to timeline
  if (!orderDoc.timeline) orderDoc.timeline = [];
  orderDoc.timeline.push({
    status,
    updatedBy:   'Admin',
    timestamp:   now,
    description: note || 'Administrator changed order status.',
    message:     note || 'Administrator changed order status.',
  });

  await orderDoc.save();

  // Log to audit log (use Main's createLog which accepts both 'admin' and 'adminId')
  try {
    await auditLogRepo.createLog({
      admin:      adminUser._id,
      adminId:    adminUser._id,
      adminName:  `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim(),
      action:     `ORDER_STATUS_${status.toUpperCase().replace(/\s+/g, '_')}`,
      module:     'Orders',
      targetId:   id,
      targetModel: 'Order',
      target:     orderDoc.orderId || orderDoc.orderNumber,
      remarks:    note || `Order status updated from ${oldStatus} to ${status}`,
      ipAddress:  ip,
      ip,
      status:     'success',
    });
  } catch (auditErr) {
    // Non-blocking — audit failure should not fail the operation
    console.error('Audit log error (non-fatal):', auditErr.message);
  }

  return getOrder(id);
};

/**
 * Cancel and refund an order (convenience wrapper around updateOrderStatus).
 *
 * @param {string} id        - MongoDB Order ObjectId
 * @param {string} reason    - Cancellation reason
 * @param {Object} adminUser - Admin user document
 * @param {string} ip        - Request IP
 */
export const cancelOrder = async (id, reason = '', adminUser, ip) => {
  return updateOrderStatus(id, 'Cancelled', reason, adminUser, ip);
};
