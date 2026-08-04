// src/repositories/orderRepository.js
// Data-access layer for the Order entity.
// All direct Mongoose calls for Orders live here.

import Order from '../models/Order.js';

/**
 * Create a new order.
 * @param {Object} data - Order creation payload
 */
export const createOrder = async (data, options = {}) => {
  const order = new Order(data);
  return order.save(options);
};

/**
 * Find an order by its MongoDB ID.
 * Populates customer and seller references.
 */
export const findById = async (id) => {
  return Order.findById(id)
    .populate('customer', 'firstName lastName email phone')
    .populate('seller', 'firstName lastName email phone');
};

/**
 * Find an order by its unique business order number.
 */
export const findByOrderNumber = async (orderNumber) => {
  return Order.findOne({ orderNumber })
    .populate('customer', 'firstName lastName email phone')
    .populate('seller', 'firstName lastName email phone');
};

/**
 * Retrieve all orders associated with a specific customer.
 * Returns orders sorted by newest first by default.
 */
export const findByCustomer = async (customerId, skip = 0, limit = 20) => {
  return Order.find({ customer: customerId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('seller', 'firstName lastName email phone');
};

/**
 * Retrieve all orders associated with a specific seller.
 * Returns orders sorted by newest first by default.
 */
export const findBySeller = async (sellerId, skip = 0, limit = 20) => {
  return Order.find({ seller: sellerId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('customer', 'firstName lastName email phone');
};

/**
 * Count total orders for a customer.
 */
export const countByCustomer = async (customerId) => {
  return Order.countDocuments({ customer: customerId });
};

/**
 * Count total orders for a seller.
 */
export const countBySeller = async (sellerId) => {
  return Order.countDocuments({ seller: sellerId });
};

/**
 * Update the status of an order and append to status history.
 * @param {string} orderId - Mongoose order ID
 * @param {string} status - New order status
 * @param {string} userId - User ID triggering the status change
 * @param {string} [comment] - Optional comment detailing the status change
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
          comment,
        },
      },
    },
    { new: true, runValidators: true }
  );
};

/**
 * Log a generic event to the order's timeline history.
 */
export const addTimelineEvent = async (orderId, status, title, description = '') => {
  return Order.findByIdAndUpdate(
    orderId,
    {
      $push: {
        timeline: {
          status,
          title,
          description,
        },
      },
    },
    { new: true }
  );
};

/**
 * Retrieve paginated, filtered, and sorted orders for a customer.
 */
export const findCustomerOrders = async ({
  queryFilters,
  sortQuery,
  skip,
  limit,
}) => {
  return Order.find(queryFilters)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .populate('seller', 'shopName')
    .populate('items.product', 'title thumbnail')
    .select('orderNumber createdAt orderStatus payment pricing tracking items seller')
    .lean();
};

/**
 * Count total customer orders matching filter criteria.
 */
export const countCustomerOrders = async (queryFilters) => {
  return Order.countDocuments(queryFilters);
};
