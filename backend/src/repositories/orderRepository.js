// src/repositories/orderRepository.js
// Data-access layer for the Order entity.
// All direct Mongoose calls for Customer and Seller Order queries live here.
// Adapted from Manjusha branch to use Main's field naming conventions.

import Order from '../models/Order.js';

/**
 * Create a new order document.
 * @param {Object} data - Order creation payload
 * @param {Object} [options] - Mongoose save options (e.g. session for transactions)
 */
export const createOrder = async (data, options = {}) => {
  const order = new Order(data);
  return order.save(options);
};

/**
 * Find an order by its MongoDB ObjectId.
 * Populates customer and seller references.
 */
export const findById = async (id) => {
  return Order.findById(id)
    .populate('customer', 'firstName lastName email phone')
    .populate('seller', 'business individual accountInfo sellerType slug');
};

/**
 * Find an order by its business order number/orderId string.
 */
export const findByOrderNumber = async (orderNumber) => {
  return Order.findOne({
    $or: [{ orderNumber }, { orderId: orderNumber }],
    isDeleted: { $ne: true },
  })
    .populate('customer', 'firstName lastName email phone')
    .populate('seller', 'business individual accountInfo sellerType slug');
};

/**
 * Retrieve all orders associated with a specific customer (simple version).
 * Returns orders sorted newest-first.
 */
export const findByCustomer = async (customerId, skip = 0, limit = 20) => {
  return Order.find({ customer: customerId, isDeleted: { $ne: true } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('seller', 'business individual accountInfo sellerType slug');
};

/**
 * Retrieve all orders associated with a specific seller (simple version).
 * Returns orders sorted newest-first.
 */
export const findBySeller = async (sellerId, skip = 0, limit = 20) => {
  return Order.find({ seller: sellerId, isDeleted: { $ne: true } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('customer', 'firstName lastName email phone');
};

/**
 * Count total orders for a customer.
 */
export const countByCustomer = async (customerId) => {
  return Order.countDocuments({ customer: customerId, isDeleted: { $ne: true } });
};

/**
 * Count total orders for a seller.
 */
export const countBySeller = async (sellerId) => {
  return Order.countDocuments({ seller: sellerId, isDeleted: { $ne: true } });
};

/**
 * Update the status of an order and append to status history.
 * @param {string} orderId   - Mongoose order ID
 * @param {string} status    - New order status string
 * @param {string} userId    - User ID triggering the change
 * @param {string} [comment] - Optional comment
 */
export const updateStatus = async (orderId, status, userId, comment = '') => {
  return Order.findByIdAndUpdate(
    orderId,
    {
      $set: { orderStatus: status },
      $push: {
        statusHistory: {
          status,
          updatedBy: userId,
          note: comment,
          timestamp: new Date(),
        },
      },
    },
    { new: true, runValidators: true }
  );
};

/**
 * Append a timeline event to an order.
 * @param {string} orderId      - MongoDB Order ID
 * @param {string} status       - Status label for the timeline entry
 * @param {string} title        - Short title
 * @param {string} [description] - Optional detail message
 * @param {string} [updatedBy]  - Actor label (e.g. 'Seller', 'Admin', 'Customer')
 */
export const addTimelineEvent = async (orderId, status, title, description = '', updatedBy = 'System') => {
  return Order.findByIdAndUpdate(
    orderId,
    {
      $push: {
        timeline: {
          status,
          title,
          description,
          updatedBy,
          timestamp: new Date(),
        },
      },
    },
    { new: true }
  );
};

// ─── Customer-facing paginated queries ───────────────────────────────────────

/**
 * Retrieve paginated, filtered, and sorted orders for a customer.
 */
export const findCustomerOrders = async ({ queryFilters, sortQuery, skip, limit }) => {
  return Order.find(queryFilters)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'seller',
      select: 'business individual accountInfo sellerType slug',
    })
    .populate({ path: 'items.product', select: 'title name thumbnail images brand' })
    .select('orderId orderNumber createdAt orderStatus paymentInfo totalAmount pricing tracking items seller')
    .lean();
};

/**
 * Count customer orders matching filter criteria.
 */
export const countCustomerOrders = async (queryFilters) => {
  return Order.countDocuments(queryFilters);
};

/**
 * Retrieve detailed customer order by its MongoDB ID, enforcing ownership.
 * @param {string} orderId     - MongoDB ObjectId string
 * @param {string} customerId  - Authenticated customer's ObjectId
 */
export const findCustomerOrderDetails = async (orderId, customerId) => {
  return Order.findOne({ _id: orderId, customer: customerId, isDeleted: { $ne: true } })
    .populate({
      path: 'seller',
      select: 'business individual accountInfo sellerType slug',
    })
    .populate({ path: 'items.product', select: 'title name thumbnail images brand' })
    .lean();
};

/**
 * Retrieve detailed customer order by its business order number (ORD-xxxxx),
 * enforcing ownership.
 * @param {string} orderNumber - Business order number / orderId string
 * @param {string} customerId  - Authenticated customer's ObjectId
 */
export const findCustomerOrderByNumber = async (orderNumber, customerId) => {
  return Order.findOne({
    $or: [{ orderNumber }, { orderId: orderNumber }],
    customer: customerId,
    isDeleted: { $ne: true },
  })
    .populate({
      path: 'seller',
      select: 'business individual accountInfo sellerType slug',
    })
    .populate({ path: 'items.product', select: 'title name thumbnail images brand' })
    .lean();
};

// ─── Seller-facing paginated queries ─────────────────────────────────────────

/**
 * Retrieve paginated, filtered, and sorted orders for a seller.
 */
export const findSellerOrders = async ({ queryFilters, sortQuery, skip, limit }) => {
  return Order.find(queryFilters)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .populate({ path: 'customer', select: 'firstName lastName profileImage' })
    .populate({ path: 'items.product', select: 'title name thumbnail' })
    .select('orderId orderNumber createdAt orderStatus paymentInfo totalAmount payment pricing tracking items customer')
    .lean();
};

/**
 * Count seller orders matching filter criteria.
 */
export const countSellerOrders = async (queryFilters) => {
  return Order.countDocuments(queryFilters);
};

/**
 * Retrieve detailed seller order by its MongoDB ID, enforcing seller ownership.
 * @param {string} orderId   - MongoDB ObjectId string
 * @param {string} sellerId  - Authenticated seller's ObjectId
 */
export const findSellerOrderDetails = async (orderId, sellerId) => {
  return Order.findOne({ _id: orderId, seller: sellerId, isDeleted: { $ne: true } })
    .populate({ path: 'customer', select: 'firstName lastName profileImage phone' })
    .populate({ path: 'items.product', select: 'title name thumbnail slug' })
    .lean();
};
