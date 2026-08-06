import mongoose from 'mongoose';
import * as returnRepo from '../repositories/returnRepository.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Seller from '../models/Seller.js';
import Return from '../models/Return.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

/**
 * Customer requests a return for a delivered order.
 */
export const requestReturn = async (orderId, customerId, returnData) => {
  const { reason, description = '' } = returnData;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, 'Invalid order id.');
  }

  // 1. Fetch order
  const order = await Order.findById(orderId);

  // 2. Validate ownership. If not owned by customer, return 404
  if (!order || order.customer.toString() !== customerId.toString()) {
    throw new ApiError(404, 'Order not found');
  }

  // 3. Validate eligibility
  // - Order status must be Delivered
  const isDelivered = order.orderStatus?.toLowerCase() === 'delivered';
  if (!isDelivered) {
    throw new ApiError(409, 'Only delivered orders can be returned.');
  }

  // - Order must not already be returned or refunded
  const isReturned = order.orderStatus?.toLowerCase() === 'returned';
  const isRefunded =
    order.paymentInfo?.status === 'refunded' ||
    order.payment?.paymentStatus === 'refunded' ||
    order.refundInfo?.status === 'refunded';

  if (isReturned || isRefunded) {
    throw new ApiError(409, 'Order is already returned or refunded.');
  }

  // - Order must have no active return request (Pending or Approved)
  const activeReturn = await Return.findOne({
    orderId: order._id,
    status: { $in: ['Pending', 'Approved'] },
  });

  if (activeReturn) {
    throw new ApiError(409, 'An active return request already exists for this order.');
  }

  // 4. Create return request
  const newReturn = await returnRepo.createReturn({
    orderId: order._id,
    customerId,
    reason,
    description,
    status: 'Pending',
    refundStatus: 'Pending',
    timeline: [
      {
        status: 'Pending',
        title: 'Return Requested',
        description: 'Customer requested a return.',
        updatedBy: 'Customer',
        timestamp: new Date(),
      },
    ],
  });

  // 5. Update related order
  order.returnRequested = true;
  if (!order.returnDetails) {
    order.returnDetails = {};
  }
  order.returnDetails.status = 'requested';
  order.returnDetails.reason = reason;
  order.returnDetails.requestedAt = new Date();

  order.timeline.push({
    status: 'Returned', // order status associated
    title: 'Return Requested',
    description: 'Customer requested a return.',
    updatedBy: 'Customer',
    timestamp: new Date(),
  });

  await order.save();

  return newReturn;
};

/**
 * List all return requests for administrators.
 */
export const listReturns = async (query = {}) => {
  const { page, limit, skip, sort } = parsePagination(query);

  const filter = {};

  // Filters
  if (query.status) {
    // Allow case-insensitive search or match exact since we have enum 'Pending', 'Approved', 'Rejected'
    const statusMap = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    filter.status = statusMap[query.status.toLowerCase()] || query.status;
  }

  if (query.refundStatus) {
    const refundMap = {
      pending: 'Pending',
      'refund completed': 'Refund Completed',
      refundcompleted: 'Refund Completed',
    };
    filter.refundStatus = refundMap[query.refundStatus.toLowerCase()] || query.refundStatus;
  }

  if (query.customerId && mongoose.Types.ObjectId.isValid(query.customerId)) {
    filter.customerId = new mongoose.Types.ObjectId(query.customerId);
  }

  if (query.sellerId && mongoose.Types.ObjectId.isValid(query.sellerId)) {
    // Find all orders for this seller and filter by those order IDs
    const sellerOrders = await Order.find({ seller: query.sellerId }).select('_id').lean();
    const orderIds = sellerOrders.map((o) => o._id);
    filter.orderId = { $in: orderIds };
  }

  if (query.dateFrom || query.dateTo) {
    filter.requestedAt = {};
    if (query.dateFrom) filter.requestedAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) filter.requestedAt.$lte = new Date(query.dateTo);
  }

  // Relational search
  if (query.search) {
    const escapedSearch = query.search.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const searchRegex = new RegExp(escapedSearch, 'i');

    // Customer search
    const matchingCustomers = await User.find({
      $or: [{ firstName: searchRegex }, { lastName: searchRegex }],
    })
      .select('_id')
      .lean();
    const customerIds = matchingCustomers.map((c) => c._id);

    // Order search
    const matchingOrders = await Order.find({
      $or: [
        { orderId: searchRegex },
        { orderNumber: searchRegex },
        { 'items.title': searchRegex },
      ],
    })
      .select('_id')
      .lean();
    const orderIds = matchingOrders.map((o) => o._id);

    filter.$or = [
      { returnId: searchRegex },
      { reason: searchRegex },
      { description: searchRegex },
      { customerId: { $in: customerIds } },
      { orderId: { $in: orderIds } },
    ];
  }

  // Execute queries
  const returns = await returnRepo.listReturns({ filter, page, limit, sort });
  const total = await returnRepo.countReturns(filter);

  // Map to clean response objects
  const mappedReturns = returns.map((ret) => {
    return {
      returnId: ret.returnId,
      id: ret._id,
      orderId: ret.orderId?._id || ret.orderId,
      orderNumber: ret.orderId?.orderNumber || '',
      customerName: ret.customerId
        ? `${ret.customerId.firstName || ''} ${ret.customerId.lastName || ''}`.trim()
        : 'Unknown Customer',
      reason: ret.reason,
      status: ret.status,
      refundStatus: ret.refundStatus,
      requestedAt: ret.requestedAt,
    };
  });

  const paginationMeta = buildPaginationMeta(total, page, limit);

  return { returns: mappedReturns, pagination: paginationMeta };
};

/**
 * Get detailed return request summary for administrators.
 */
export const getReturnDetails = async (returnId) => {
  const returnRequest = await Return.findOne({
    $or: [
      { returnId: returnId },
      { _id: mongoose.Types.ObjectId.isValid(returnId) ? new mongoose.Types.ObjectId(returnId) : null },
    ].filter(Boolean),
  })
    .populate({
      path: 'customerId',
      select: 'firstName lastName email phone',
    })
    .populate({
      path: 'orderId',
      populate: [
        { path: 'customer', select: 'firstName lastName email phone' },
        { path: 'seller', select: 'business individual accountInfo sellerType slug email' },
        { path: 'items.product', select: 'title name price images thumbnail sku' },
      ],
    });

  if (!returnRequest) {
    throw new ApiError(404, 'Return request not found');
  }

  const order = returnRequest.orderId;
  if (!order) {
    throw new ApiError(404, 'Associated order not found for this return request.');
  }

  // Map products list
  const products = (order.items || []).map((item) => {
    return {
      productId: item.product?._id || item.product || null,
      name: item.title || item.name || '',
      price: item.price || 0,
      quantity: item.quantity || 0,
      thumbnail: item.thumbnail || '',
    };
  });

  return {
    returnId: returnRequest.returnId,
    id: returnRequest._id,
    reason: returnRequest.reason,
    description: returnRequest.description,
    status: returnRequest.status,
    refundStatus: returnRequest.refundStatus,
    requestedAt: returnRequest.requestedAt,
    rejectionReason: returnRequest.rejectionReason || null,
    returnedAt: returnRequest.returnedAt || null,
    timeline: returnRequest.timeline,
    customer: {
      customerId: returnRequest.customerId?._id || null,
      firstName: returnRequest.customerId?.firstName || '',
      lastName: returnRequest.customerId?.lastName || '',
      email: returnRequest.customerId?.email || '',
      phone: returnRequest.customerId?.phone || '',
    },
    seller: {
      sellerId: order.seller?._id || null,
      shopName:
        order.seller?.business?.businessName ||
        order.seller?.accountInfo?.displayName ||
        'Nexcart Seller',
      email: order.seller?.email || '',
    },
    order: {
      orderId: order._id,
      orderNumber: order.orderNumber || '',
      orderStatus: order.orderStatus || '',
      grandTotal: order.totalAmount || order.pricing?.total || 0,
      orderDate: order.createdAt,
    },
    products,
  };
};

/**
 * Admin reviews a return request (Approve, Reject, Complete Refund).
 */
export const reviewReturn = async (returnId, updateData) => {
  const { status, refundStatus, rejectionReason } = updateData;

  const returnRequest = await Return.findOne({
    $or: [
      { returnId: returnId },
      { _id: mongoose.Types.ObjectId.isValid(returnId) ? new mongoose.Types.ObjectId(returnId) : null },
    ].filter(Boolean),
  });

  if (!returnRequest) {
    throw new ApiError(404, 'Return request not found');
  }

  const order = await Order.findById(returnRequest.orderId);
  if (!order) {
    throw new ApiError(404, 'Associated order not found');
  }

  // VALID STATUS FLOW
  // Pending -> Approved -> Refund Completed
  // OR
  // Pending -> Rejected

  // Transition: Approve or Reject from Pending
  if (status) {
    if (returnRequest.status !== 'Pending') {
      throw new ApiError(409, `Cannot change status once it is already '${returnRequest.status}'.`);
    }

    if (status === 'Approved') {
      returnRequest.status = 'Approved';
      returnRequest.timeline.push({
        status: 'Approved',
        title: 'Return Approved',
        description: 'Administrator approved return request.',
        updatedBy: 'Admin',
        timestamp: new Date(),
      });

      // Update order status/timeline
      if (!order.returnDetails) order.returnDetails = {};
      order.returnDetails.status = 'approved';
      order.returnDetails.actionedAt = new Date();
      order.timeline.push({
        status: 'Returned',
        title: 'Return Approved',
        description: 'Administrator approved return request.',
        updatedBy: 'Admin',
        timestamp: new Date(),
      });
    } else if (status === 'Rejected') {
      returnRequest.status = 'Rejected';
      returnRequest.rejectionReason = rejectionReason || '';
      returnRequest.timeline.push({
        status: 'Rejected',
        title: 'Return Rejected',
        description: 'Administrator rejected return request.',
        message: rejectionReason || '',
        updatedBy: 'Admin',
        timestamp: new Date(),
      });

      // Update order status/timeline
      if (!order.returnDetails) order.returnDetails = {};
      order.returnDetails.status = 'rejected';
      order.returnDetails.actionedAt = new Date();
      order.returnRequested = false; // Reset request flag since it was rejected
      order.timeline.push({
        status: 'Delivered', // Fall back to Delivered since return request is rejected
        title: 'Return Rejected',
        description: 'Administrator rejected return request.',
        updatedBy: 'Admin',
        timestamp: new Date(),
      });
    } else {
      throw new ApiError(409, `Invalid status value: ${status}`);
    }
  }

  // Transition: Complete Refund from Approved
  if (refundStatus) {
    if (refundStatus === 'Refund Completed') {
      if (returnRequest.status !== 'Approved') {
        throw new ApiError(
          409,
          `Cannot complete refund when return request status is '${returnRequest.status}'. It must be 'Approved'.`
        );
      }
      if (returnRequest.refundStatus === 'Refund Completed') {
        throw new ApiError(409, 'Refund has already been completed.');
      }

      returnRequest.refundStatus = 'Refund Completed';
      returnRequest.returnedAt = new Date();
      returnRequest.timeline.push({
        status: 'Refund Completed',
        title: 'Refund Completed',
        description: 'Administrator completed refund.',
        updatedBy: 'Admin',
        timestamp: new Date(),
      });

      // Sync Order status and payment details
      order.orderStatus = 'Returned';
      if (!order.returnDetails) order.returnDetails = {};
      order.returnDetails.status = 'completed';
      order.returnDetails.actionedAt = new Date();

      if (!order.paymentInfo) order.paymentInfo = {};
      order.paymentInfo.status = 'refunded';

      if (!order.payment) order.payment = {};
      order.payment.paymentStatus = 'refunded';

      order.refundInfo = {
        amount: order.totalAmount || order.pricing?.total || 0,
        status: 'refunded',
        reason: returnRequest.reason || 'Customer Return',
        processedAt: new Date(),
      };

      order.timeline.push({
        status: 'Returned',
        title: 'Refund Completed',
        description: 'Administrator completed refund.',
        updatedBy: 'Admin',
        timestamp: new Date(),
      });
    } else {
      throw new ApiError(409, `Invalid refundStatus value: ${refundStatus}`);
    }
  }

  await returnRequest.save();
  await order.save();

  return getReturnDetails(returnRequest.returnId);
};
