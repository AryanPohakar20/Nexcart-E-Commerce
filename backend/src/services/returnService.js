// src/services/returnService.js
// Business logic for Return Management lifecycle.
// Handles: Customer return requests, Admin approval/rejection, Refund completion.

import mongoose from 'mongoose';
import * as returnRepo from '../repositories/returnRepository.js';
import Order from '../models/Order.js';
import Return from '../models/Return.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';

// ─── Customer Return Services ─────────────────────────────────────────────────

/**
 * Customer requests a return for a delivered order.
 * Validates: order ownership, delivered status, no duplicate active return.
 *
 * @param {string} orderId      - MongoDB Order ObjectId
 * @param {string} customerId   - Authenticated customer's User ObjectId
 * @param {Object} returnData   - { reason, description }
 */
export const requestReturn = async (orderId, customerId, returnData) => {
  const { reason, description = '' } = returnData;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, 'Invalid order id.');
  }

  // 1. Fetch order and verify ownership
  const order = await Order.findById(orderId);
  if (!order || order.customer.toString() !== customerId.toString()) {
    throw new ApiError(404, 'Order not found');
  }

  // 2. Order must be Delivered to request return
  const statusLower = (order.orderStatus || '').toLowerCase();
  if (statusLower !== 'delivered') {
    throw new ApiError(409, 'Only delivered orders can be returned.');
  }

  // 3. Order must not already be returned or refunded
  const isReturned = statusLower === 'returned';
  const isRefunded =
    order.paymentInfo?.status === 'refunded' ||
    order.payment?.paymentStatus === 'refunded' ||
    order.refundInfo?.status === 'refunded';

  if (isReturned || isRefunded) {
    throw new ApiError(409, 'Order is already returned or refunded.');
  }

  // 4. No active return request should exist
  const activeReturn = await Return.findOne({
    orderId:  order._id,
    status:   { $in: ['Pending', 'Approved'] },
  });
  if (activeReturn) {
    throw new ApiError(409, 'An active return request already exists for this order.');
  }

  // 5. Create return document
  const now = new Date();
  const newReturn = await returnRepo.createReturn({
    orderId:     order._id,
    customerId,
    reason,
    description,
    status:      'Pending',
    refundStatus: 'Pending',
    requestedAt: now,
    timeline: [{
      status:      'Pending',
      title:       'Return Requested',
      description: 'Customer requested a return.',
      updatedBy:   'Customer',
      timestamp:   now,
    }],
  });

  // 6. Update order to reflect pending return
  order.returnRequested = true;
  if (!order.returnDetails) order.returnDetails = {};
  order.returnDetails.status      = 'requested';
  order.returnDetails.reason      = reason;
  order.returnDetails.requestedAt = now;
  order.timeline.push({
    status:      ORDER_STATUS.RETURNED,
    title:       'Return Requested',
    description: 'Customer requested a return.',
    updatedBy:   'Customer',
    timestamp:   now,
  });
  await order.save();

  return newReturn;
};

// ─── Admin Return Services ────────────────────────────────────────────────────

/**
 * List all return requests with filtering and pagination.
 * Admin-only operation.
 *
 * @param {Object} query - Request query params
 */
export const listReturns = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const filter = {};

  if (query.status) {
    const statusMap = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
    filter.status = statusMap[query.status.toLowerCase()] || query.status;
  }

  if (query.refundStatus) {
    const refundMap = {
      pending:         'Pending',
      'refund completed': 'Refund Completed',
      refundcompleted: 'Refund Completed',
    };
    filter.refundStatus = refundMap[query.refundStatus.toLowerCase()] || query.refundStatus;
  }

  if (query.customerId && mongoose.Types.ObjectId.isValid(query.customerId)) {
    filter.customerId = new mongoose.Types.ObjectId(query.customerId);
  }

  if (query.dateFrom || query.dateTo) {
    filter.createdAt = {};
    if (query.dateFrom) filter.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo)   filter.createdAt.$lte = new Date(query.dateTo);
  }

  const returns = await returnRepo.listReturns({ filter, page, limit, sort: { createdAt: -1 } });
  const total   = await returnRepo.countReturns(filter);

  const mappedReturns = returns.map(ret => ({
    returnId:     ret.returnId,
    id:           ret._id,
    orderId:      ret.orderId?._id || ret.orderId,
    orderNumber:  ret.orderId?.orderNumber || ret.orderId?.orderId || '',
    customerName: ret.customerId
      ? `${ret.customerId.firstName || ''} ${ret.customerId.lastName || ''}`.trim()
      : 'Unknown Customer',
    reason:       ret.reason,
    status:       ret.status,
    refundStatus: ret.refundStatus,
    requestedAt:  ret.requestedAt,
  }));

  return {
    returns: mappedReturns,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Get full details of a return request for administrators.
 * Includes customer, seller, order, and product information.
 *
 * @param {string} returnId - RET-XXXXXX string or MongoDB ObjectId
 */
export const getReturnDetails = async (returnId) => {
  const returnRequest = await Return.findOne({
    $or: [
      { returnId },
      {
        _id: mongoose.Types.ObjectId.isValid(returnId)
          ? new mongoose.Types.ObjectId(returnId)
          : null,
      },
    ].filter(c => Object.values(c)[0] !== null),
  })
    .populate({ path: 'customerId', select: 'firstName lastName email phone' })
    .populate({
      path: 'orderId',
      populate: [
        { path: 'customer', select: 'firstName lastName email phone' },
        { path: 'seller',   select: 'business individual accountInfo sellerType slug' },
        { path: 'items.product', select: 'title name price images thumbnail sku' },
      ],
    });

  if (!returnRequest) throw new ApiError(404, 'Return request not found');

  const order = returnRequest.orderId;
  if (!order) throw new ApiError(404, 'Associated order not found for this return request.');

  const products = (order.items || []).map(item => ({
    productId:  item.product?._id || item.product || null,
    name:       item.title || item.name || item.product?.title || item.product?.name || '',
    price:      item.price || 0,
    quantity:   item.quantity || 0,
    thumbnail:  item.thumbnail || item.product?.thumbnail || '',
  }));

  return {
    returnId:        returnRequest.returnId,
    id:              returnRequest._id,
    reason:          returnRequest.reason,
    description:     returnRequest.description,
    status:          returnRequest.status,
    refundStatus:    returnRequest.refundStatus,
    requestedAt:     returnRequest.requestedAt,
    rejectionReason: returnRequest.rejectionReason || null,
    returnedAt:      returnRequest.returnedAt || null,
    timeline:        returnRequest.timeline,
    customer: {
      customerId: returnRequest.customerId?._id || null,
      firstName:  returnRequest.customerId?.firstName || '',
      lastName:   returnRequest.customerId?.lastName || '',
      email:      returnRequest.customerId?.email || '',
      phone:      returnRequest.customerId?.phone || '',
    },
    seller: {
      sellerId: order.seller?._id || null,
      shopName:
        order.seller?.business?.businessName ||
        order.seller?.accountInfo?.displayName ||
        'Nexcart Seller',
      email: order.seller?.accountInfo?.email || order.seller?.email || '',
    },
    order: {
      orderId:     order._id,
      orderNumber: order.orderNumber || order.orderId || '',
      orderStatus: order.orderStatus || '',
      grandTotal:  order.totalAmount || order.pricing?.total || 0,
      orderDate:   order.createdAt,
    },
    products,
  };
};

/**
 * Admin reviews a return request: Approve, Reject, or Complete Refund.
 * Status flow:
 *   Pending → Approved  (admin approves)
 *   Pending → Rejected  (admin rejects with rejectionReason)
 *   Approved → Refund Completed  (admin marks refund done)
 *
 * @param {string} returnId    - RET-XXXXXX or MongoDB ObjectId
 * @param {Object} updateData  - { status?, refundStatus?, rejectionReason? }
 */
export const reviewReturn = async (returnId, updateData) => {
  const { status, refundStatus, rejectionReason } = updateData;

  const returnRequest = await Return.findOne({
    $or: [
      { returnId },
      {
        _id: mongoose.Types.ObjectId.isValid(returnId)
          ? new mongoose.Types.ObjectId(returnId)
          : null,
      },
    ].filter(c => Object.values(c)[0] !== null),
  });

  if (!returnRequest) throw new ApiError(404, 'Return request not found');

  const order = await Order.findById(returnRequest.orderId);
  if (!order) throw new ApiError(404, 'Associated order not found');

  const now = new Date();

  // ── Transition: Approve or Reject from Pending ─────────────────────────────
  if (status) {
    if (returnRequest.status !== 'Pending') {
      throw new ApiError(409, `Cannot change status once it is already '${returnRequest.status}'.`);
    }

    if (status === 'Approved') {
      returnRequest.status = 'Approved';
      returnRequest.timeline.push({
        status:      'Approved',
        title:       'Return Approved',
        description: 'Administrator approved the return request.',
        updatedBy:   'Admin',
        timestamp:   now,
      });

      if (!order.returnDetails) order.returnDetails = {};
      order.returnDetails.status    = 'approved';
      order.returnDetails.actionedAt = now;
      order.timeline.push({
        status:      ORDER_STATUS.RETURNED,
        title:       'Return Approved',
        description: 'Administrator approved the return request.',
        updatedBy:   'Admin',
        timestamp:   now,
      });

    } else if (status === 'Rejected') {
      if (!rejectionReason) {
        throw new ApiError(400, 'Rejection reason is required when rejecting a return.');
      }
      returnRequest.status           = 'Rejected';
      returnRequest.rejectionReason  = rejectionReason;
      returnRequest.timeline.push({
        status:      'Rejected',
        title:       'Return Rejected',
        description: 'Administrator rejected the return request.',
        message:     rejectionReason,
        updatedBy:   'Admin',
        timestamp:   now,
      });

      if (!order.returnDetails) order.returnDetails = {};
      order.returnDetails.status    = 'rejected';
      order.returnDetails.actionedAt = now;
      order.returnRequested          = false; // reset since rejected
      order.timeline.push({
        status:      ORDER_STATUS.DELIVERED, // falls back to delivered since return is rejected
        title:       'Return Rejected',
        description: 'Administrator rejected the return request.',
        updatedBy:   'Admin',
        timestamp:   now,
      });

    } else {
      throw new ApiError(400, `Invalid status value: ${status}. Must be 'Approved' or 'Rejected'.`);
    }
  }

  // ── Transition: Complete Refund from Approved ──────────────────────────────
  if (refundStatus) {
    if (refundStatus !== 'Refund Completed') {
      throw new ApiError(400, `Invalid refundStatus: ${refundStatus}. Must be 'Refund Completed'.`);
    }
    if (returnRequest.status !== 'Approved') {
      throw new ApiError(409, `Cannot complete refund when return status is '${returnRequest.status}'. It must be 'Approved'.`);
    }
    if (returnRequest.refundStatus === 'Refund Completed') {
      throw new ApiError(409, 'Refund has already been completed.');
    }

    returnRequest.refundStatus = 'Refund Completed';
    returnRequest.returnedAt   = now;
    returnRequest.timeline.push({
      status:      'Refund Completed',
      title:       'Refund Completed',
      description: 'Administrator completed the refund.',
      updatedBy:   'Admin',
      timestamp:   now,
    });

    // Sync order status and payment
    order.orderStatus = ORDER_STATUS.RETURNED;
    if (!order.returnDetails) order.returnDetails = {};
    order.returnDetails.status    = 'completed';
    order.returnDetails.actionedAt = now;

    if (!order.paymentInfo) order.paymentInfo = {};
    order.paymentInfo.status = 'refunded';

    if (order.payment) order.payment.paymentStatus = 'refunded';

    order.refundInfo = {
      amount:      order.totalAmount || order.pricing?.total || 0,
      status:      'refunded',
      reason:      returnRequest.reason || 'Customer Return',
      processedAt: now,
    };

    order.timeline.push({
      status:      ORDER_STATUS.RETURNED,
      title:       'Refund Completed',
      description: 'Administrator completed the refund.',
      updatedBy:   'Admin',
      timestamp:   now,
    });
  }

  await returnRequest.save();
  await order.save();

  return getReturnDetails(returnRequest.returnId);
};
