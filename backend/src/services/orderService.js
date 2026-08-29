// src/services/orderService.js
// Business logic for Order Management.
// Implements: Controller → Service → Repository architecture.
//
// NOTE: placeOrder() attempts MongoDB transactions for stock atomicity.
// If the MongoDB deployment does not support replica sets (single-node local),
// transactions are automatically disabled and a non-transactional fallback is used.

import mongoose from 'mongoose';
import * as orderRepo from '../repositories/orderRepository.js';
import * as productRepo from '../repositories/productRepository.js';
import User from '../models/User.js';
import Seller from '../models/Seller.js';
import Order from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import {
  ORDER_STATUS,
  CANCELLABLE_STATUSES,
  RETURNABLE_STATUSES,
  SELLER_STATUS_TRANSITIONS,
  SELLER_TRANSITION_MESSAGES,
} from '../constants/orderStatus.js';

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Detect whether MongoDB supports transactions (replica set / Atlas).
 * Returns true if supported, false for single-node standalone.
 */
const supportsTransactions = async () => {
  try {
    const session = await mongoose.startSession();
    await session.endSession();
    return true;
  } catch {
    return false;
  }
};

// ─── Customer Order Services ───────────────────────────────────────────────────

/**
 * Place a new order.
 * - Validates items and stock
 * - Enforces single-seller constraint
 * - Decrements stock atomically (with transaction if supported)
 * - Creates order with pricing breakdown
 *
 * @param {string} customerId   - Authenticated customer's User ObjectId
 * @param {Object} orderData    - { items, shippingAddress, couponCode, orderNotes }
 */
export const placeOrder = async (customerId, orderData) => {
  const { items, shippingAddress, couponCode, orderNotes } = orderData;

  const txSupported = await supportsTransactions();
  const session = txSupported ? await mongoose.startSession() : null;

  if (session) session.startTransaction();

  try {
    let subtotal  = 0;
    let sellerId  = null;
    const orderItems = [];

    // Process each order item
    for (const item of items) {
      // 1. Fetch product (with session lock if available)
      const product = await productRepo.findProductById(item.product, session);
      if (!product) {
        throw new ApiError(404, `Product with ID ${item.product} not found`);
      }

      // 2. Validate product is active
      if (product.status !== 'Active') {
        throw new ApiError(
          400,
          `Product "${product.title || product.name}" is currently inactive and cannot be ordered.`
        );
      }

      // 3. Validate stock
      if (product.stock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for "${product.title || product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      // 4. Resolve seller — product.seller may be a User _id or Seller _id
      //    Try Seller model first (by userId), then fallback to User lookup
      let resolvedSellerId = null;
      const sellerProfile = await Seller.findOne({ userId: product.sellerId })
        .session(session || null)
        .lean();

      if (sellerProfile) {
        resolvedSellerId = sellerProfile._id;
      } else {
        // Fallback: product.seller may already be a Seller ObjectId
        const directSeller = await Seller.findById(product.sellerId)
          .session(session || null)
          .lean();
        if (directSeller) {
          resolvedSellerId = directSeller._id;
        } else {
          // Fallback 2: The seller might just be a User (e.g. Admin) without a dedicated Seller profile
          const userSeller = await mongoose.model('User').findById(product.sellerId)
            .session(session || null)
            .lean();
            
          if (userSeller) {
            resolvedSellerId = userSeller._id;
          } else {
            throw new ApiError(400, `Seller for product "${product.title || product.name}" could not be resolved.`);
          }
        }
      }

      // 5. Enforce single-seller constraint
      if (sellerId && sellerId.toString() !== resolvedSellerId.toString()) {
        throw new ApiError(400, 'Orders can only contain products from a single seller.');
      }
      sellerId = resolvedSellerId;

      // 6. Decrement stock atomically
      if (session) {
        const updateResult = await productRepo.decreaseProductStock(item.product, item.quantity, session);
        if (updateResult.modifiedCount === 0) {
          throw new ApiError(
            400,
            `Failed to reserve stock for "${product.title || product.name}". It may have run out or become inactive.`
          );
        }
      } else {
        // Non-transactional fallback — still atomic via updateOne with condition
        const updateResult = await productRepo.decreaseProductStock(item.product, item.quantity);
        if (updateResult.modifiedCount === 0) {
          throw new ApiError(
            400,
            `Failed to reserve stock for "${product.title || product.name}". Insufficient stock or inactive.`
          );
        }
      }

      // 7. Build order item snapshot
      orderItems.push({
        product:   product._id,
        name:      product.title || product.name || 'Product',
        title:     product.title || product.name || 'Product',
        price:     product.price,
        quantity:  item.quantity,
        image:     product.thumbnail || (product.images && product.images[0]) || '',
        thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
        sku:       product.sku || product.brand || '',
        subtotal:  product.price * item.quantity,
      });

      subtotal += product.price * item.quantity;
    }

    // 8. Compute pricing breakdown
    const shippingCharges = subtotal >= 1000 ? 0 : 100;
    const tax             = Math.round(subtotal * 0.18 * 100) / 100;

    let discount = 0;
    if (couponCode) {
      const code = couponCode.toUpperCase();
      if (code === 'NEXSTART20') {
        if (subtotal >= 5000) discount = Math.round(subtotal * 0.20 * 100) / 100;
        else throw new ApiError(400, 'Min cart value for NEXSTART20 is ₹5,000.');
      } else if (code === 'FLASH50') {
        if (subtotal >= 15000) {
          discount = Math.min(Math.round(subtotal * 0.50 * 100) / 100, 10000);
        } else throw new ApiError(400, 'Min cart value for FLASH50 is ₹15,000.');
      } else if (code === 'FREESHIP') {
        if (subtotal >= 1000) discount = shippingCharges;
        else throw new ApiError(400, 'Min cart value for FREESHIP is ₹1,000.');
      } else {
        throw new ApiError(400, 'Invalid coupon code.');
      }
    }

    const total = Math.round(Math.max(0, subtotal + shippingCharges + tax - discount) * 100) / 100;

    // 9. Build initial timeline
    const timeline = [{
      status:      ORDER_STATUS.PENDING,
      title:       'Order Placed',
      description: 'Customer placed the order.',
      updatedBy:   'Customer',
      timestamp:   new Date(),
    }];

    // 10. Create order document
    const orderPayload = {
      customer:        customerId,
      seller:          sellerId,
      items:           orderItems,
      itemCount:       orderItems.reduce((s, i) => s + i.quantity, 0),
      totalAmount:     total,
      pricing: {
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
      },
      shippingAddress,
      paymentInfo: {
        method:        'COD',
        status:        'pending',
        transactionId: `TXN-${Date.now().toString().slice(-8)}`,
        paidAt:        null,
      },
      orderStatus:   ORDER_STATUS.PENDING,
      statusHistory: [{
        status:    ORDER_STATUS.PENDING,
        timestamp: new Date(),
        note:      'Order placed.',
      }],
      timeline,
      orderNotes:  orderNotes || '',
      coupon: couponCode ? { code: couponCode.toUpperCase(), discountAmount: discount } : undefined,
    };

    const order = await orderRepo.createOrder(orderPayload, session ? { session } : {});

    if (session) await session.commitTransaction();

    return order;
  } catch (err) {
    if (session) await session.abortTransaction();
    throw err;
  } finally {
    if (session) await session.endSession();
  }
};

/**
 * Get detailed order information for a specific customer.
 * Enforces customer ownership — returns 404 if order not found or not owned.
 * Accepts either the MongoDB ObjectId or the business order number (ORD-xxxxx).
 */
export const getCustomerOrderDetails = async (orderId, customerId) => {
  const order = mongoose.Types.ObjectId.isValid(orderId)
    ? await orderRepo.findCustomerOrderDetails(orderId, customerId)
    : await orderRepo.findCustomerOrderByNumber(orderId, customerId);

  if (!order) throw new ApiError(404, 'Order not found');

  return formatCustomerOrderDetail(order);
};

/**
 * List a customer's orders with pagination, filtering, and sorting.
 */
export const getCustomerOrders = async (customerId, query = {}) => {
  const page    = Math.max(1, parseInt(query.page,  10) || 1);
  const limit   = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip    = (page - 1) * limit;

  const { orderStatus, paymentStatus, paymentMethod, dateFrom, dateTo, search, sortBy, sortOrder } = query;

  const queryFilters = { customer: customerId, isDeleted: { $ne: true } };

  // Use exact case-insensitive string comparison via $regex with escaped value
  // to prevent ReDoS. Allowed values are validated before reaching here.
  const ORDER_STATUS_ALLOW_LIST = new Set([
    'pending', 'confirmed', 'processing', 'shipped', 'delivered',
    'cancelled', 'returned', 'refunded', 'failed',
  ]);
  if (orderStatus) {
    const normalized = orderStatus.toLowerCase();
    if (ORDER_STATUS_ALLOW_LIST.has(normalized)) {
      queryFilters.orderStatus = normalized;
    }
  }
  if (paymentStatus) queryFilters['paymentInfo.status'] = paymentStatus.toLowerCase();
  if (paymentMethod) queryFilters['paymentInfo.method'] = paymentMethod;

  if (dateFrom || dateTo) {
    queryFilters.createdAt = {};
    if (dateFrom) queryFilters.createdAt.$gte = new Date(dateFrom);
    if (dateTo)   queryFilters.createdAt.$lte = new Date(dateTo);
  }

  if (search) {
    // Escape user input before using in RegExp to prevent ReDoS
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escapeRegex(search.slice(0, 200)), 'i');
    queryFilters.$or = [
      { orderId:      re },
      { orderNumber:  re },
      { 'items.name': re },
      { 'items.title': re },
    ];
  }

  const allowedSort = { createdAt: 1, totalAmount: 1, orderStatus: 1 };
  const sortField   = allowedSort.hasOwnProperty(sortBy) ? sortBy : 'createdAt';
  const sortQuery   = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

  const [orders, totalOrders] = await Promise.all([
    orderRepo.findCustomerOrders({ queryFilters, sortQuery, skip, limit }),
    orderRepo.countCustomerOrders(queryFilters),
  ]);

  const totalPages = Math.ceil(totalOrders / limit) || 1;

  const mappedOrders = orders.map(order => formatCustomerOrderSummary(order));

  return {
    orders: mappedOrders,
    pagination: {
      totalOrders,
      currentPage: page,
      totalPages,
      limit,
      hasNextPage:      page < totalPages,
      hasPreviousPage:  page > 1,
    },
  };
};

/**
 * Cancel a customer's own eligible order.
 * Only PENDING / CONFIRMED / PROCESSING orders can be cancelled.
 *
 * @param {string} orderId            - MongoDB Order ObjectId
 * @param {string} customerId         - Authenticated customer's ObjectId
 * @param {string} cancellationReason - Required reason string
 */
export const cancelCustomerOrder = async (orderId, customerId, cancellationReason) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, 'Invalid order id.');
  }

  const order = await Order.findOne({ _id: orderId, customer: customerId, isDeleted: { $ne: true } });
  if (!order) throw new ApiError(404, 'Order not found');

  if (!CANCELLABLE_STATUSES.has(order.orderStatus)) {
    throw new ApiError(409, `Order cannot be cancelled in its current status: "${order.orderStatus}".`);
  }

  const now = new Date();
  order.orderStatus = ORDER_STATUS.CANCELLED;
  order.cancelledAt  = now;
  order.cancelReason = cancellationReason;

  order.statusHistory.push({
    status:    ORDER_STATUS.CANCELLED,
    timestamp: now,
    note:      cancellationReason,
  });

  order.timeline.push({
    status:      ORDER_STATUS.CANCELLED,
    title:       'Order Cancelled',
    description: cancellationReason,
    updatedBy:   'Customer',
    timestamp:   now,
  });

  await order.save();
  return order;
};

// ─── Seller Order Services ─────────────────────────────────────────────────────

/**
 * List a seller's orders with pagination, filtering, and sorting.
 * Resolves the seller's profile ObjectId from the authenticated User ObjectId.
 *
 * @param {string} sellerUserId - Authenticated seller's User ObjectId
 * @param {Object} query        - Query params (page, limit, orderStatus, etc.)
 */
export const getSellerOrders = async (sellerUserId, query = {}) => {
  // Resolve Seller profile from User ID
  const sellerProfile = await Seller.findOne({ userId: sellerUserId }).lean();
  if (!sellerProfile) throw new ApiError(404, 'Seller profile not found');
  const sellerId = sellerProfile._id;

  const page  = Math.max(1, parseInt(query.page,  10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip  = (page - 1) * limit;

  const { orderStatus, paymentStatus, paymentMethod, dateFrom, dateTo, search, sortBy, sortOrder } = query;

  const queryFilters = { seller: sellerId, isDeleted: { $ne: true } };

  if (orderStatus)   queryFilters.orderStatus = new RegExp(`^${orderStatus}$`, 'i');
  if (paymentStatus) queryFilters['paymentInfo.status'] = paymentStatus.toLowerCase();
  if (paymentMethod) queryFilters['paymentInfo.method'] = paymentMethod;

  if (dateFrom || dateTo) {
    queryFilters.createdAt = {};
    if (dateFrom) queryFilters.createdAt.$gte = new Date(dateFrom);
    if (dateTo)   queryFilters.createdAt.$lte = new Date(dateTo);
  }

  if (search) {
    const re = new RegExp(search.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
    queryFilters.$or = [
      { orderId:       re },
      { orderNumber:   re },
      { 'items.title': re },
      { 'items.name':  re },
    ];
  }

  const allowedSort = { createdAt: 1, totalAmount: 1, orderStatus: 1 };
  const sortField   = allowedSort.hasOwnProperty(sortBy) ? sortBy : 'createdAt';
  const sortQuery   = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

  const [orders, totalOrders] = await Promise.all([
    orderRepo.findSellerOrders({ queryFilters, sortQuery, skip, limit }),
    orderRepo.countSellerOrders(queryFilters),
  ]);

  const totalPages = Math.ceil(totalOrders / limit) || 1;

  const mappedOrders = orders.map(order => ({
    _id:                    order._id,
    orderNumber:            order.orderNumber || order.orderId,
    customerName:           order.customer
      ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
      : 'Unknown Customer',
    customerProfileImage:   order.customer?.profileImage || null,
    orderDate:              order.createdAt,
    orderStatus:            order.orderStatus,
    paymentStatus:          order.paymentInfo?.status || order.payment?.paymentStatus || 'pending',
    paymentMethod:          order.paymentInfo?.method || order.payment?.paymentMethod || 'COD',
    grandTotal:             order.totalAmount || order.pricing?.total || 0,
    totalItems:             order.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0,
    firstProductThumbnail:  order.items?.[0]?.product?.thumbnail || order.items?.[0]?.thumbnail || null,
  }));

  return {
    orders: mappedOrders,
    pagination: {
      totalOrders,
      currentPage: page,
      totalPages,
      limit,
      hasNextPage:     page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * Get full details of a specific order for an authorized seller.
 * Enforces seller ownership.
 *
 * @param {string} orderId       - MongoDB Order ObjectId
 * @param {string} sellerUserId  - Authenticated seller's User ObjectId
 */
export const getSellerOrderDetails = async (orderId, sellerUserId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, 'Invalid order id.');
  }

  const sellerProfile = await Seller.findOne({ userId: sellerUserId }).lean();
  if (!sellerProfile) throw new ApiError(404, 'Order not found');
  const sellerId = sellerProfile._id;

  const order = await orderRepo.findSellerOrderDetails(orderId, sellerId);
  if (!order) throw new ApiError(404, 'Order not found');

  return {
    orderNumber:   order.orderNumber || order.orderId,
    orderDate:     order.createdAt,
    orderStatus:   order.orderStatus,
    paymentMethod: order.paymentInfo?.method  || order.payment?.paymentMethod  || 'COD',
    paymentStatus: order.paymentInfo?.status  || order.payment?.paymentStatus  || 'pending',
    shippingAddress: order.shippingAddress ? {
      recipientName: order.shippingAddress.fullName ||
        `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim(),
      phone:         order.shippingAddress.phone || '',
      street:        order.shippingAddress.addressLine1 || order.shippingAddress.street || '',
      city:          order.shippingAddress.city || '',
      state:         order.shippingAddress.state || '',
      postalCode:    order.shippingAddress.pincode || order.shippingAddress.zipCode || '',
      country:       order.shippingAddress.country || 'India',
    } : null,
    customerName:  order.customer
      ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
      : 'Unknown Customer',
    customerPhone: order.customer?.phone || null,
    orderedProducts: order.items.map(item => ({
      productId:      item.product?._id || item.product || null,
      name:           item.product?.title || item.product?.name || item.title || item.name || 'Unknown Product',
      thumbnail:      item.product?.thumbnail || item.thumbnail || null,
      slug:           item.product?.slug || null,
      quantity:       item.quantity,
      priceAtPurchase: item.price,
      subtotal:       (item.price || 0) * (item.quantity || 0),
    })),
    grandTotal:          order.totalAmount || order.pricing?.total || 0,
    trackingNumber:      order.tracking?.trackingNumber || order.trackingNumber || null,
    estimatedDelivery:   order.tracking?.estimatedDelivery || null,
    customerNotes:       order.orderNotes || null,
    timeline:            (order.timeline || []).map(event => ({
      status:    event.status,
      updatedBy: event.updatedBy || 'System',
      timestamp: event.timestamp,
      message:   event.description || event.title || event.message || '',
    })),
  };
};

/**
 * Update order status on behalf of the seller.
 * Enforces valid status transitions and timeline tracking.
 *
 * @param {string} orderId       - MongoDB Order ObjectId
 * @param {string} sellerUserId  - Authenticated seller's User ObjectId
 * @param {string} status        - Desired new order status (Title Case)
 */
export const updateSellerOrderStatus = async (orderId, sellerUserId, status) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, 'Invalid order id.');
  }

  const sellerProfile = await Seller.findOne({ userId: sellerUserId });
  if (!sellerProfile) throw new ApiError(404, 'Order not found');
  const sellerId = sellerProfile._id;

  const order = await Order.findOne({ _id: orderId, seller: sellerId })
    .populate('customer', 'firstName lastName')
    .populate('seller', 'business accountInfo');

  if (!order) throw new ApiError(404, 'Order not found');

  // Reject duplicate status
  if (order.orderStatus === status) {
    throw new ApiError(409, `Order is already in '${status}' status.`);
  }

  // Enforce transition rules
  const expectedNext = SELLER_STATUS_TRANSITIONS[order.orderStatus];
  if (expectedNext !== status) {
    throw new ApiError(
      409,
      `Invalid status transition. Cannot change from '${order.orderStatus}' to '${status}'.`
    );
  }

  const previousStatus = order.orderStatus;
  const message = SELLER_TRANSITION_MESSAGES[status] || `Seller marked order as ${status}.`;
  const now = new Date();

  order.orderStatus = status;

  if (status === ORDER_STATUS.DELIVERED) {
    order.deliveredDate = now;
  }

  // Add to both statusHistory (for admin/legacy) and timeline (for customer/seller views)
  order.statusHistory.push({ status, timestamp: now, note: message });
  order.timeline.push({ status, title: status, description: message, updatedBy: 'Seller', timestamp: now });

  await order.save();

  return {
    orderId:          order._id,
    orderNumber:      order.orderNumber || order.orderId,
    updatedStatus:    order.orderStatus,
    previousStatus,
    updatedTimeline:  order.timeline.map(e => ({
      status:    e.status,
      updatedBy: e.updatedBy || 'Seller',
      timestamp: e.timestamp,
      message:   e.description || e.title || e.message || '',
    })),
    updatedTimestamp: order.updatedAt,
    customerName: order.customer
      ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
      : 'Unknown Customer',
  };
};

// ─── Internal Formatters ──────────────────────────────────────────────────────

/**
 * Map order items to the customer-facing DTO shape.
 * Uses the MongoDB product data (populated by the repository) as the source
 * of truth for title/brand/image, falling back to the order snapshot fields.
 */
const formatCustomerOrderItems = (order) =>
  (order.items || []).map(item => {
    const product = item.product || {};
    const images = Array.isArray(product.images) ? product.images : [];
    const primaryImage =
      (images.find(img => img && img.isPrimary)?.url) ||
      (images[0]?.url) ||
      '';

    let itemImage = primaryImage;
    if (!itemImage) {
      if (typeof item.image === 'string' && item.image.startsWith('{')) {
        try {
          const parsed = JSON.parse(item.image.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ').replace(/'/g, '"'));
          itemImage = parsed.url;
        } catch (e) {
          itemImage = item.image;
        }
      } else {
        itemImage = item.image || item.thumbnail || product.thumbnail || '';
      }
    }

    return {
      product: {
        _id:   product._id || item.productId || null,
        title: product.title || product.name || item.title || item.name || 'Product',
        brand: product.brand || 'NexCart',
        price: item.price || 0,
        image: itemImage,
        images: images,
      },
      quantity: item.quantity || 1,
      price:    item.price || 0,
      subtotal: item.subtotal || ((item.price || 0) * (item.quantity || 1)),
    };
  });

/**
 * Customer-facing order summary DTO (list view).
 * Contains everything the frontend Orders page and context normalizer need.
 */
const formatCustomerOrderSummary = (order) => {
  const total = order.totalAmount ?? order.pricing?.total ?? 0;
  const sellerName =
    order.seller?.business?.businessName ||
    order.seller?.accountInfo?.displayName ||
    'Nexcart Seller';

  return {
    _id:           order._id,
    orderId:       order.orderId || order.orderNumber,
    orderNumber:   order.orderNumber || order.orderId,
    createdAt:     order.createdAt,
    orderDate:     order.createdAt,
    orderStatus:   order.orderStatus,
    paymentStatus: order.paymentInfo?.status || order.payment?.paymentStatus || 'pending',
    paymentMethod: order.paymentInfo?.method || order.payment?.paymentMethod || 'COD',
    totalAmount:   total,
    grandTotal:    total,
    itemCount:     order.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0,
    firstProduct:  order.items?.[0]?.product?.thumbnail || order.items?.[0]?.thumbnail || null,
    sellerName,
    seller: {
      id:   order.seller?._id || null,
      name: sellerName,
    },
    items: formatCustomerOrderItems(order),
    pricing: {
      subtotal:        order.pricing?.subtotal || 0,
      tax:             order.pricing?.tax || 0,
      shippingCharges: order.pricing?.shippingCharges || 0,
      discount:        order.pricing?.discount || 0,
      total:           total,
    },
    tracking: {
      trackingNumber:    order.tracking?.trackingNumber || order.trackingNumber || null,
      carrier:           order.tracking?.carrier || order.shippingCarrier || null,
      estimatedDelivery: order.tracking?.estimatedDelivery || null,
    },
  };
};

/**
 * Customer-facing order detail DTO.
 * Superset of the summary DTO with addresses, timeline, notes, and return info.
 */
const formatCustomerOrderDetail = (order) => {
  const summary = formatCustomerOrderSummary(order);

  return {
    ...summary,
    shippingAddress:  order.shippingAddress || null,
    billingAddress:   order.billingAddress || null,
    timeline: (order.timeline || []).map(e => ({
      status:    e.status,
      updatedBy: e.updatedBy || 'System',
      timestamp: e.timestamp,
      message:   e.description || e.title || e.message || '',
    })),
    trackingNumber:    summary.tracking.trackingNumber,
    estimatedDelivery: summary.tracking.estimatedDelivery,
    orderNotes:        order.orderNotes || null,
    coupon:            order.coupon || null,
    returnRequested:   order.returnRequested || false,
  };
};
