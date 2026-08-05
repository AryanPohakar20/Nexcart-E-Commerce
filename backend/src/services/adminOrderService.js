// src/services/adminOrderService.js
// Business logic for Admin Order Management, Dossier Viewing, and Status Transitions.

import mongoose from 'mongoose';
import * as orderRepo from '../repositories/adminOrderRepository.js';
import * as auditLogRepo from '../repositories/auditLogRepository.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination } from '../utils/pagination.js';
import { buildOrderFilter } from '../utils/buildFilter.js';
import { ALL_ORDER_STATUSES, ORDER_STATUS } from '../constants/orderStatus.js';
import User from '../models/User.js';
import Seller from '../models/Seller.js';
import Product from '../models/Product.js';

/**
 * List orders with pagination, filtering, sorting, and relational search.
 */
export const listOrders = async (query = {}) => {
  const { page, limit } = parsePagination(query);

  // 1. Normalize query parameters to make them compatible with buildOrderFilter
  const mappedQuery = { ...query };
  if (query.orderStatus) mappedQuery.status = query.orderStatus;
  if (query.customerId) mappedQuery.customer = query.customerId;
  if (query.sellerId) mappedQuery.seller = query.sellerId;
  if (query.dateFrom) mappedQuery.fromDate = query.dateFrom;
  if (query.dateTo) mappedQuery.toDate = query.dateTo;

  const filter = buildOrderFilter(mappedQuery);

  // Apply case-insensitive regex for orderStatus to match mixed casings in database
  if (filter.orderStatus) {
    filter.orderStatus = new RegExp(`^${filter.orderStatus}$`, 'i');
  }

  // 2. Perform database pre-queries for relational search
  if (query.search) {
    const escapedSearch = query.search.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const searchRegex = new RegExp(escapedSearch, 'i');

    // Customer search
    const matchingCustomers = await User.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex }
      ]
    }).select('_id').lean();
    const customerIds = matchingCustomers.map((c) => c._id);

    // Seller search
    const matchingSellers = await Seller.find({
      $or: [
        { 'business.businessName': searchRegex },
        { 'accountInfo.displayName': searchRegex }
      ]
    }).select('_id').lean();
    const sellerIds = matchingSellers.map((s) => s._id);

    const matchingSellerUsers = await User.find({
      role: 'seller',
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex }
      ]
    }).select('_id').lean();
    const sellerUserIds = matchingSellerUsers.map((su) => su._id);

    // Product search
    const matchingProducts = await Product.find({
      $or: [
        { title: searchRegex },
        { name: searchRegex }
      ]
    }).select('_id').lean();
    const productIds = matchingProducts.map((p) => p._id);

    filter.$or = [
      { orderId: searchRegex },
      { orderNumber: searchRegex },
      { 'shippingAddress.fullName': searchRegex },
      { customer: { $in: customerIds } },
      { seller: { $in: [...sellerIds, ...sellerUserIds] } },
      { 'items.title': searchRegex },
      { 'items.product': { $in: productIds } }
    ];
  }

  // 3. Sorting & Validation
  const allowedSortFields = ['createdAt', 'grandTotal', 'orderStatus', 'paymentStatus'];
  if (query.sortBy && !allowedSortFields.includes(query.sortBy)) {
    throw new ApiError(400, `Unsupported sort field: ${query.sortBy}`);
  }
  if (query.sortOrder && !['asc', 'desc'].includes(query.sortOrder)) {
    throw new ApiError(400, `Unsupported sort order: ${query.sortOrder}`);
  }

  const sortByField = query.sortBy || 'createdAt';
  const sortField = sortByField === 'grandTotal' ? 'totalAmount' : sortByField;
  const direction = query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortField]: direction };

  const { orders, total } = await orderRepo.listOrders({
    filter,
    page,
    limit,
    sort,
  });

  // 4. Map returned orders to the strict list response keys
  const mappedOrders = orders.map((order) => {
    const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customer
        ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
        : order.shippingAddress?.fullName || 'Unknown Customer',
      sellerShopName: order.seller?.business?.businessName || order.seller?.accountInfo?.displayName || order.seller?.shopName || 'Nexcart Seller',
      orderDate: order.createdAt,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentInfo?.status || order.payment?.paymentStatus || 'pending',
      paymentMethod: order.paymentInfo?.method || order.payment?.paymentMethod || 'COD',
      grandTotal: order.totalAmount || order.pricing?.total || 0,
      totalItems: totalItems,
      estimatedDelivery: order.tracking?.estimatedDelivery || null
    };
  });

  // 5. Structure pagination details
  const totalPages = Math.ceil(total / limit) || 1;
  const paginationMeta = {
    totalOrders: total,
    currentPage: page,
    totalPages,
    limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return { orders: mappedOrders, pagination: paginationMeta };
};

/**
 * Get order details by ID.
 */
export const getOrder = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid order id.');
  }

  const order = await orderRepo.getOrderById(id);
  if (!order) throw new ApiError(404, 'Order not found');

  return {
    orderNumber: order.orderNumber,
    orderDate: order.createdAt,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentInfo?.status || order.payment?.paymentStatus || 'pending',
    paymentMethod: order.paymentInfo?.method || order.payment?.paymentMethod || 'COD',
    customerInformation: order.customer ? {
      customerId: order.customer._id,
      firstName: order.customer.firstName || '',
      lastName: order.customer.lastName || '',
      email: order.customer.email || '',
      phone: order.customer.phone || '',
    } : null,
    sellerInformation: order.seller ? {
      sellerId: order.seller._id,
      shopName: order.seller.business?.businessName || order.seller.accountInfo?.displayName || order.seller.shopName || 'Nexcart Seller',
      email: order.seller.accountInfo?.email || order.seller.email || '',
    } : null,
    shippingAddress: order.shippingAddress ? {
      fullName: order.shippingAddress.fullName || '',
      phone: order.shippingAddress.phone || '',
      addressLine1: order.shippingAddress.addressLine1 || order.shippingAddress.street || '',
      addressLine2: order.shippingAddress.addressLine2 || '',
      city: order.shippingAddress.city || '',
      state: order.shippingAddress.state || '',
      pincode: order.shippingAddress.pincode || order.shippingAddress.zipCode || '',
      country: order.shippingAddress.country || 'India',
    } : null,
    orderedProducts: order.items?.map(item => ({
      productId: item.product?._id || item.product,
      name: item.title || item.name || item.product?.name || '',
      quantity: item.quantity,
      unitPrice: item.price,
      itemTotal: (item.quantity * item.price) || 0
    })) || [],
    subtotal: order.pricing?.subtotal || order.totalAmount || 0,
    tax: order.pricing?.tax || 0,
    discount: order.pricing?.discount || 0,
    shippingCharges: order.pricing?.shippingCharges || 0,
    grandTotal: order.totalAmount || order.pricing?.total || 0,
    estimatedDelivery: order.tracking?.estimatedDelivery || order.estimatedDeliveryDate || null,
    trackingNumber: order.tracking?.trackingNumber || order.trackingNumber || null,
    timeline: order.timeline?.map(event => ({
      status: event.status,
      updatedBy: event.updatedBy || 'System',
      timestamp: event.timestamp,
      message: event.message || event.description || event.title || ''
    })) || []
  };
};

/**
 * Update order status with overrides, duplicate checking, and admin timeline log.
 */
export const updateOrderStatus = async (id, status, note = '', adminUser, ip) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid order id.');
  }

  // Exact validation matching the ORDER_STATUS enum values case-sensitively
  if (!ALL_ORDER_STATUSES.includes(status)) {
    throw new ApiError(400, `Invalid order status: ${status}`);
  }

  const orderDoc = await orderRepo.findOrderDocument(id);
  if (!orderDoc) throw new ApiError(404, 'Order not found');

  const oldStatus = orderDoc.orderStatus;
  
  // Reject duplicate status updates (409 Conflict)
  if (oldStatus === status) {
    throw new ApiError(409, `Order is already in '${status}' status.`);
  }

  // Reject updates on Delivered, Returned, or Refunded orders (409 Conflict)
  const currentStatusLower = oldStatus.toLowerCase();
  const paymentStatus = orderDoc.paymentInfo?.status || orderDoc.payment?.paymentStatus;
  const isRefunded = 
    (paymentStatus || '').toLowerCase() === 'refunded' ||
    (orderDoc.refundInfo?.status || '').toLowerCase() === 'refunded';

  if (['delivered', 'returned'].includes(currentStatusLower) || isRefunded) {
    throw new ApiError(409, `Cannot update status. Order is already ${oldStatus} or Refunded.`);
  }

  orderDoc.orderStatus = status;

  if (status === 'Delivered') {
    orderDoc.deliveredDate = new Date();
  }

  if (status === 'Cancelled') {
    orderDoc.cancelledAt = new Date();
    orderDoc.cancelReason = note || 'Cancelled by administrator';
    if (orderDoc.paymentInfo) {
      orderDoc.paymentInfo.status = 'refunded';
    }
    orderDoc.refundInfo = {
      amount: orderDoc.totalAmount || 0,
      status: 'refunded',
      reason: note || 'Admin cancellation refund',
      processedAt: new Date(),
    };
  }

  // Save audit history log
  orderDoc.statusHistory.push({
    status: status,
    timestamp: new Date(),
    note: note || `Order status updated from ${oldStatus} to ${status}`,
    updatedBy: adminUser._id,
  });

  // Append exactly one Admin timeline entry
  orderDoc.timeline.push({
    status: status,
    updatedBy: 'Admin',
    timestamp: new Date(),
    message: note || 'Administrator changed order status.'
  });

  await orderDoc.save();

  // Log audit info
  await auditLogRepo.createLog({
    admin: adminUser._id,
    adminName: `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim(),
    action: `ORDER_STATUS_${status.toUpperCase()}`,
    module: 'Orders',
    targetId: id,
    targetModel: 'Order',
    target: orderDoc.orderId,
    remarks: note || `Order status updated from ${oldStatus} to ${status}`,
    ipAddress: ip,
    status: 'success',
  });

  // Return the detailed populated order dossier representation
  return getOrder(id);
};

/**
 * Cancel and refund order.
 */
export const cancelOrder = async (id, reason = '', adminUser, ip) => {
  return updateOrderStatus(id, 'Cancelled', reason, adminUser, ip);
};
