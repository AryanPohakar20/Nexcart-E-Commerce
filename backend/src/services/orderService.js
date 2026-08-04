import mongoose from 'mongoose';
import * as orderRepo from '../repositories/orderRepository.js';
import * as productRepo from '../repositories/productRepository.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';

/**
 * Place a new order with MongoDB transactions.
 */
export const placeOrder = async (customerId, orderData) => {
  const { items, shippingAddress, couponCode, orderNotes } = orderData;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let subtotal = 0;
    let sellerId = null;
    const orderItems = [];

    // Process and validate each item
    for (const item of items) {
      // 1. Fetch product with session (for transaction concurrency lock)
      const product = await productRepo.findProductById(item.product, session);
      if (!product) {
        throw new ApiError(404, `Product with ID ${item.product} not found`);
      }

      // 2. Prevent ordering inactive products
      if (!product.isActive) {
        throw new ApiError(400, `Product "${product.title}" is currently inactive and cannot be ordered.`);
      }

      // 3. Verify stock
      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for product "${product.title}". Available: ${product.stock}, Requested: ${item.quantity}`);
      }

      // 4. Verify seller exists
      const seller = await User.findById(product.seller).session(session);
      if (!seller || seller.role !== 'seller') {
        throw new ApiError(400, `Seller associated with product "${product.title}" does not exist.`);
      }

      // 5. Verify all products in this order belong to the same seller
      if (sellerId && sellerId.toString() !== product.seller.toString()) {
        throw new ApiError(400, 'Orders can only contain products from a single seller.');
      }
      sellerId = product.seller;

      // 6. Update product stock atomically and concurrently
      const updateResult = await productRepo.decreaseProductStock(
        item.product,
        item.quantity,
        session
      );

      if (updateResult.modifiedCount === 0) {
        throw new ApiError(
          400,
          `Failed to reserve stock for product "${product.title}". It may have run out of stock or become inactive concurrently.`
        );
      }

      // 7. Add snapshot to order items list
      orderItems.push({
        product: product._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        thumbnail: product.thumbnail || '',
        sku: product.brand || '',
      });

      // 8. Accumulate subtotal
      subtotal += product.price * item.quantity;
    }

    // Calculations:
    // Shipping: Flat ₹100, free for orders above ₹1,000
    const shippingCharges = subtotal >= 1000 ? 0 : 100;

    // Tax: 18% GST (rounded to 2 decimal places)
    const tax = Math.round(subtotal * 0.18 * 100) / 100;

    // Coupon discount logic matching dummyData.js codes
    let discount = 0;
    if (couponCode) {
      const codeUpper = couponCode.toUpperCase();
      if (codeUpper === 'NEXSTART20') {
        if (subtotal >= 5000) {
          discount = Math.round(subtotal * 0.20 * 100) / 100;
        } else {
          throw new ApiError(400, 'Min cart value for coupon NEXSTART20 is ₹5,000.');
        }
      } else if (codeUpper === 'FLASH50') {
        if (subtotal >= 15000) {
          discount = Math.round(subtotal * 0.50 * 100) / 100;
          if (discount > 10000) {
            discount = 10000; // Cap at ₹10,000 max discount
          }
        } else {
          throw new ApiError(400, 'Min cart value for coupon FLASH50 is ₹15,000.');
        }
      } else if (codeUpper === 'FREESHIP') {
        if (subtotal >= 1000) {
          discount = shippingCharges; // Discount matches shipping charges
        } else {
          throw new ApiError(400, 'Min cart value for coupon FREESHIP is ₹1,000.');
        }
      } else {
        throw new ApiError(400, 'Invalid coupon code.');
      }
    }

    const total = Math.round(Math.max(0, subtotal + shippingCharges + tax - discount) * 100) / 100;

    // Generate unique order number (e.g., ORD-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomHex}`;

    // Timeline initialization
    const timeline = [
      {
        status: ORDER_STATUS.PENDING,
        title: 'Order Placed',
        description: 'Order placed successfully and is pending confirmation.',
        timestamp: new Date(),
      },
    ];

    // Assemble payload
    const orderPayload = {
      orderNumber,
      customer: customerId,
      seller: sellerId,
      items: orderItems,
      pricing: {
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
      },
      shippingAddress,
      coupon: couponCode ? { code: couponCode, discountAmount: discount } : undefined,
      payment: {
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'pending',
      },
      orderStatus: ORDER_STATUS.PENDING,
      statusHistory: [
        {
          status: ORDER_STATUS.PENDING,
          updatedBy: customerId,
          comment: 'Order placed by customer.',
        },
      ],
      timeline,
      orderNotes: orderNotes || '',
    };

    // Save Order inside transaction session
    const savedOrder = await orderRepo.createOrder(orderPayload, { session });

    // Commit transaction
    await session.commitTransaction();

    // Populate and return final order
    const populatedOrder = await orderRepo.findById(savedOrder._id);
    return populatedOrder;

  } catch (error) {
    // Rollback changes on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Retrieve order details by ID, validating user authorization.
 * @param {string} orderId - Mongoose ID of the order
 * @param {string} userId - ID of the authenticated user
 */
export const getOrderDetails = async (orderId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, 'Invalid Order ID format');
  }

  const order = await orderRepo.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Authorization check: only customer who placed it or the seller who sells it
  const isCustomer = order.customer && order.customer._id.toString() === userId.toString();
  const isSeller = order.seller && order.seller._id.toString() === userId.toString();

  if (!isCustomer && !isSeller) {
    throw new ApiError(403, 'Not authorized to view this order');
  }

  return order;
};

/**
 * Retrieve a paginated, filterable, searchable list of orders for the logged-in customer.
 * @param {string} customerId - Authenticated customer's ID
 * @param {Object} queryParams - Filters, sorting, search, and pagination parameters
 */
export const getCustomerOrders = async (customerId, queryParams) => {
  let {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    orderStatus,
    paymentStatus,
    paymentMethod,
    dateFrom,
    dateTo,
    search,
  } = queryParams;

  // Normalize parameters
  page = Math.max(1, parseInt(page, 10) || 1);
  limit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

  const queryFilters = { customer: customerId };

  // Exact match filters for status and payment details
  if (orderStatus) {
    queryFilters.orderStatus = orderStatus;
  }
  if (paymentStatus) {
    queryFilters['payment.paymentStatus'] = paymentStatus;
  }
  if (paymentMethod) {
    queryFilters['payment.paymentMethod'] = paymentMethod;
  }

  // Date range filters
  if (dateFrom || dateTo) {
    queryFilters.createdAt = {};
    if (dateFrom) {
      queryFilters.createdAt.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      queryFilters.createdAt.$lte = endOfDay;
    }
  }

  // Case-insensitive, partial-match search on: orderNumber, items.title, seller.shopName
  if (search) {
    const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const searchRegex = new RegExp(escapedSearch, 'i');

    // Query seller user IDs matching shopName search
    const matchingSellers = await User.find({
      role: 'seller',
      shopName: searchRegex,
    }).select('_id').lean();

    const sellerIds = matchingSellers.map(s => s._id);

    const searchConditions = [
      { orderNumber: searchRegex },
      { 'items.title': searchRegex },
    ];

    if (sellerIds.length > 0) {
      searchConditions.push({ seller: { $in: sellerIds } });
    }

    queryFilters.$and = queryFilters.$and || [];
    queryFilters.$and.push({ $or: searchConditions });
  }

  // Sorting maps query key to database path
  let sortField = 'createdAt';
  if (sortBy === 'grandTotal') {
    sortField = 'pricing.total';
  } else if (sortBy === 'orderStatus') {
    sortField = 'orderStatus';
  }

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortQuery = { [sortField]: sortDirection };

  // Skip count for database pagination
  const skip = (page - 1) * limit;

  // Retrieve records and total count concurrently
  const [orders, totalOrders] = await Promise.all([
    orderRepo.findCustomerOrders({ queryFilters, sortQuery, skip, limit }),
    orderRepo.countCustomerOrders(queryFilters),
  ]);

  // Construct flat response schema for front-end consumption
  const mappedOrders = orders.map((order) => {
    const firstItem = order.items?.[0] || {};
    const totalNumberOfItems = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

    return {
      _id: order._id,
      id: order._id,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      orderStatus: order.orderStatus,
      paymentStatus: order.payment?.paymentStatus || 'pending',
      paymentMethod: order.payment?.paymentMethod || 'Cash on Delivery',
      grandTotal: order.pricing?.total || 0,
      estimatedDeliveryDate: order.tracking?.estimatedDelivery || null,
      totalNumberOfItems,
      totalItems: totalNumberOfItems, // Compatibility alias
      firstProductThumbnail: firstItem.thumbnail || '',
      sellerShopName: order.seller?.shopName || 'Nexcart Seller',
    };
  });

  const totalPages = Math.ceil(totalOrders / limit);

  return {
    orders: mappedOrders,
    pagination: {
      totalOrders,
      currentPage: page,
      totalPages,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * Fetch and map complete details of a specific order for an authorized customer.
 * @param {string} orderId - Mongoose ID of the order
 * @param {string} customerId - ID of the authenticated customer
 */
export const getCustomerOrderDetails = async (orderId, customerId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, 'Invalid order id.');
  }

  const order = await orderRepo.findCustomerOrderDetails(orderId, customerId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Generate URL slug from titles
  const generateSlug = (title) => {
    return (title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Map products list
  const orderedProducts = (order.items || []).map((item) => {
    const p = item.product || {};
    const priceAtPurchase = item.price || 0;
    const quantity = item.quantity || 0;

    return {
      productId: p._id || item.product || null,
      name: p.title || item.title || '',
      thumbnail: item.thumbnail || p.thumbnail || '',
      slug: generateSlug(p.title || item.title),
      quantity,
      priceAtPurchase,
      subtotal: priceAtPurchase * quantity,
      variant: item.variant || null,
    };
  });

  // Map timeline (reads from stored timeline or falls back to status history)
  const timeline = (order.timeline && order.timeline.length > 0)
    ? order.timeline.map((event) => ({
        status: event.status,
        updatedBy: event.updatedBy || null,
        timestamp: event.timestamp,
        message: event.description || event.title || '',
      }))
    : (order.statusHistory || []).map((history) => ({
        status: history.status,
        updatedBy: history.updatedBy || null,
        timestamp: history.updatedAt,
        message: history.comment || '',
      }));

  // Map address fields to standard output keys
  const shippingAddress = order.shippingAddress
    ? {
        recipientName: `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim(),
        phone: order.shippingAddress.phone || '',
        street: order.shippingAddress.street || '',
        city: order.shippingAddress.city || '',
        state: order.shippingAddress.state || '',
        postalCode: order.shippingAddress.zipCode || '',
        country: order.shippingAddress.country || 'India',
      }
    : null;

  // Final mapping format
  return {
    _id: order._id,
    id: order._id,
    orderNumber: order.orderNumber,
    orderDate: order.createdAt,
    orderStatus: order.orderStatus,
    paymentMethod: order.payment?.paymentMethod || 'Cash on Delivery',
    paymentStatus: order.payment?.paymentStatus || 'pending',
    subtotal: order.pricing?.subtotal || 0,
    discount: order.pricing?.discount || 0,
    tax: order.pricing?.tax || 0,
    shippingCharges: order.pricing?.shippingCharges || 0,
    grandTotal: order.pricing?.total || 0,
    estimatedDeliveryDate: order.tracking?.estimatedDelivery || null,
    trackingNumber: order.tracking?.trackingNumber || null,
    courierName: order.tracking?.carrier || null,
    shippingAddress,
    billingAddress: null, // Billing address not stored separately
    orderedProducts,
    sellerInformation: {
      sellerId: order.seller?._id || order.seller || null,
      shopName: order.seller?.shopName || 'Nexcart Seller',
      shopLogo: order.seller?.shopLogo || null,
    },
    customerNotes: order.orderNotes || null,
    cancellationReason: order.cancellation?.reason || null,
    timeline,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

/**
 * Handle transactional order cancellation by customer.
 * Restores product stock and updates timeline and status logs.
 * @param {string} orderId - Mongoose ID of the target order
 * @param {string} customerId - ID of the customer requesting cancellation
 * @param {string} cancellationReason - Explanation text for cancel request
 */
export const cancelCustomerOrder = async (orderId, customerId, cancellationReason) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, 'Invalid order id.');
  }

  // Retrieve the full order document
  const order = await orderRepo.findById(orderId);

  // Security check: If order doesn't exist or is owned by someone else, return 404
  if (!order || order.customer?._id.toString() !== customerId.toString()) {
    throw new ApiError(404, 'Order not found');
  }

  // Validation: Status check (Only Pending or Confirmed orders are cancellable)
  if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Confirmed') {
    throw new ApiError(409, `Order cannot be cancelled. Current status is '${order.orderStatus}'.`);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Update status and cancellation info
    order.orderStatus = 'Cancelled';
    order.cancellation = {
      reason: cancellationReason,
      cancelledBy: customerId,
      cancelledAt: new Date(),
    };

    // 2. Append new timeline entry
    order.timeline.push({
      status: 'Cancelled',
      title: 'Cancelled',
      description: 'Customer cancelled the order.',
      timestamp: new Date(),
    });

    // 3. Append history log
    order.statusHistory.push({
      status: 'Cancelled',
      updatedBy: customerId,
      comment: cancellationReason,
      updatedAt: new Date(),
    });

    // Save changes to Order collection in session
    await order.save({ session });

    // 4. Restore inventory for all items in the order
    for (const item of order.items) {
      const updateResult = await productRepo.increaseProductStock(
        item.product,
        item.quantity,
        session
      );

      if (updateResult.matchedCount === 0) {
        throw new ApiError(500, `Failed to restore stock. Product with ID ${item.product} does not exist.`);
      }
    }

    // 5. Commit all modifications
    await session.commitTransaction();

  } catch (error) {
    // 6. Rollback edits on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  // Map timeline items to return schema
  const timelineMapped = order.timeline.map((event) => ({
    status: event.status,
    updatedBy: 'Customer', // Timeline updated by customer role
    timestamp: event.timestamp,
    message: event.description || event.title || '',
  }));

  // Structure response payload matching spec
  return {
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    cancelledAt: order.cancellation?.cancelledAt || null,
    cancellationReason: order.cancellation?.reason || null,
    timeline: timelineMapped,
  };
};

/**
 * Retrieve paginated, searchable, sorted, and filtered orders belonging to a seller.
 * @param {string} sellerId - Mongoose ID of the seller
 * @param {Object} query - Express query parameters object
 */
export const getSellerOrders = async (sellerId, query = {}) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const sortQuery = { [sortBy]: sortOrder };

  const { orderStatus, paymentStatus, paymentMethod, dateFrom, dateTo, search } = query;

  const queryFilters = { seller: sellerId };

  if (orderStatus) queryFilters.orderStatus = orderStatus;
  if (paymentStatus) queryFilters['payment.paymentStatus'] = paymentStatus;
  if (paymentMethod) queryFilters['payment.paymentMethod'] = paymentMethod;

  if (dateFrom || dateTo) {
    queryFilters.createdAt = {};
    if (dateFrom) queryFilters.createdAt.$gte = new Date(dateFrom);
    if (dateTo) queryFilters.createdAt.$lte = new Date(dateTo);
  }

  if (search) {
    const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const searchRegex = new RegExp(escapedSearch, 'i');

    const matchingCustomers = await User.find({
      role: 'customer',
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
      ],
    }).select('_id').lean();
    const customerIds = matchingCustomers.map((c) => c._id);

    queryFilters.$or = [
      { orderNumber: searchRegex },
      { 'items.title': searchRegex },
      { customer: { $in: customerIds } },
    ];
  }

  const [orders, totalOrders] = await Promise.all([
    orderRepo.findSellerOrders({ queryFilters, sortQuery, skip, limit }),
    orderRepo.countSellerOrders(queryFilters),
  ]);

  const totalPages = Math.ceil(totalOrders / limit);

  const mappedOrders = orders.map((order) => {
    const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

    return {
      _id: order._id,
      id: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customer
        ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
        : 'Unknown Customer',
      customerProfileImage: order.customer?.profileImage || null,
      orderDate: order.createdAt,
      orderStatus: order.orderStatus,
      paymentStatus: order.payment?.paymentStatus || 'pending',
      paymentMethod: order.payment?.paymentMethod || 'Cash on Delivery',
      grandTotal: order.pricing?.total || 0,
      totalItems,
      estimatedDeliveryDate: order.tracking?.estimatedDelivery || null,
      firstProductThumbnail: order.items?.[0]?.product?.thumbnail || order.items?.[0]?.thumbnail || null,
    };
  });

  return {
    orders: mappedOrders,
    pagination: {
      totalOrders,
      currentPage: page,
      totalPages,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * Fetch and map complete details of a specific order for an authorized seller.
 * @param {string} orderId - Mongoose ID of the order
 * @param {string} sellerId - ID of the authenticated seller
 */
export const getSellerOrderDetails = async (orderId, sellerId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, 'Invalid order id.');
  }

  const order = await orderRepo.findSellerOrderDetails(orderId, sellerId);

  // Security check: If order doesn't exist or is owned by another seller, return 404
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Format ordered products
  const orderedProducts = order.items.map((item) => {
    const productData = item.product || {};
    return {
      productId: productData._id || item.product || null,
      name: productData.title || item.title || 'Unknown Product',
      thumbnail: productData.thumbnail || item.thumbnail || null,
      slug: productData.slug || null,
      quantity: item.quantity,
      priceAtPurchase: item.price,
      subtotal: (item.price || 0) * (item.quantity || 0),
      variant: item.variant || null,
    };
  });

  // Map timeline items
  const timeline = order.timeline?.map((event) => ({
    status: event.status,
    updatedBy: 'Customer', // Timeline read-only view
    timestamp: event.timestamp,
    message: event.description || event.title || '',
  })) || [];

  // Address mapping
  const shippingAddress = order.shippingAddress
    ? {
        recipientName: `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim(),
        phone: order.shippingAddress.phone || '',
        street: order.shippingAddress.street || '',
        city: order.shippingAddress.city || '',
        state: order.shippingAddress.state || '',
        postalCode: order.shippingAddress.zipCode || '',
        country: order.shippingAddress.country || 'India',
      }
    : null;

  return {
    orderNumber: order.orderNumber,
    orderDate: order.createdAt,
    orderStatus: order.orderStatus,
    paymentMethod: order.payment?.paymentMethod || 'Cash on Delivery',
    paymentStatus: order.payment?.paymentStatus || 'pending',
    shippingAddress,
    customerName: order.customer
      ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
      : 'Unknown Customer',
    customerPhone: order.customer?.phone || null,
    orderedProducts,
    grandTotal: order.pricing?.total || 0,
    estimatedDeliveryDate: order.tracking?.estimatedDelivery || null,
    trackingNumber: order.tracking?.trackingNumber || null,
    customerNotes: order.orderNotes || null,
    timeline,
  };
};
