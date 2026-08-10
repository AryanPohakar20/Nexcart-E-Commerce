// src/repositories/adminOrderRepository.js
// Data access layer for Order entity in the admin panel.

import Order from '../models/Order.js';

/**
 * List orders with customer and seller population, pagination, and sorting.
 */
export const listOrders = async ({
  filter = {},
  page = 1,
  limit = 10,
  sort = { createdAt: -1 },
} = {}) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate({ path: 'customer', select: 'firstName lastName email phone avatar' })
      .populate({
        path: 'seller',
        select: 'business individual accountInfo sellerType slug',
      })
      .populate({ path: 'items.product', select: 'name slug images thumbnail sku price' })
      .populate({ path: 'statusHistory.updatedBy', select: 'firstName lastName email' })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return { orders, total };
};

/**
 * Get order by ID with full details.
 */
export const getOrderById = async (id) => {
  return Order.findById(id)
    .populate({ path: 'customer', select: 'firstName lastName email phone avatar role createdAt' })
    .populate({
      path: 'seller',
      select: 'business individual accountInfo sellerType slug trustScore rating status isActive',
    })
    .populate({ path: 'items.product', select: 'name slug images thumbnail sku price' })
    .populate({ path: 'statusHistory.updatedBy', select: 'firstName lastName email role' })
    .lean();
};

/**
 * Find raw Mongoose document for state updates.
 */
export const findOrderDocument = async (id) => {
  return Order.findById(id);
};

/**
 * Create order.
 */
export const createOrder = async (data) => {
  const order = new Order(data);
  return order.save();
};

/**
 * Update order.
 */
export const updateOrder = async (id, data) => {
  return Order.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate({ path: 'customer', select: 'firstName lastName email phone' })
    .populate({ path: 'seller', select: 'business individual accountInfo slug' })
    .lean();
};

/**
 * Bulk write operations for orders.
 */
export const bulkWriteOrders = async (operations) => {
  return Order.bulkWrite(operations);
};

/**
 * Order aggregations & metrics for admin dashboard.
 */
export const getOrderStats = async () => {
  const [stats] = await Order.aggregate([
    {
      $facet: {
        total: [{ $match: { isDeleted: { $ne: true } } }, { $count: 'count' }],
        delivered: [
          { $match: { isDeleted: { $ne: true }, orderStatus: 'delivered' } },
          { $count: 'count' },
        ],
        shipped: [
          { $match: { isDeleted: { $ne: true }, orderStatus: 'shipped' } },
          { $count: 'count' },
        ],
        processing: [
          { $match: { isDeleted: { $ne: true }, orderStatus: 'processing' } },
          { $count: 'count' },
        ],
        pending: [
          { $match: { isDeleted: { $ne: true }, orderStatus: 'pending' } },
          { $count: 'count' },
        ],
        cancelled: [
          { $match: { isDeleted: { $ne: true }, orderStatus: 'cancelled' } },
          { $count: 'count' },
        ],
        revenue: [
          { $match: { isDeleted: { $ne: true }, 'paymentInfo.status': 'paid' } },
          { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
        ],
      },
    },
  ]);

  return {
    total: stats?.total?.[0]?.count || 0,
    delivered: stats?.delivered?.[0]?.count || 0,
    shipped: stats?.shipped?.[0]?.count || 0,
    processing: stats?.processing?.[0]?.count || 0,
    pending: stats?.pending?.[0]?.count || 0,
    cancelled: stats?.cancelled?.[0]?.count || 0,
    totalRevenue: stats?.revenue?.[0]?.totalRevenue || 0,
  };
};
