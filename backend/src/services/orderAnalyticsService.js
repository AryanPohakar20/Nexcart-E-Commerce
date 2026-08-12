// src/services/orderAnalyticsService.js
// High-performance Order Analytics aggregation engine.
// Provides detailed order metrics, trend data, and top performer leaderboards.
// Compatible with Main's existing Order schema field names (both casings).

import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Seller from '../models/Seller.js';

/**
 * Get comprehensive order analytics using optimized MongoDB aggregation pipelines.
 *
 * @param {Object} query - Filter options
 * @param {string} [query.dateFrom]     - ISO date string start
 * @param {string} [query.dateTo]       - ISO date string end
 * @param {string} [query.orderStatus]  - Filter by specific status
 * @param {string} [query.sellerId]     - Filter by specific seller
 * @param {string} [query.paymentStatus] - Filter by payment status
 * @param {string} [query.trendType]    - 'daily' | 'weekly' | 'monthly'
 */
export const getOrderAnalytics = async (query = {}) => {
  const { dateFrom, dateTo, orderStatus, sellerId, paymentStatus, trendType = 'daily' } = query;

  // 1. Build match stage
  const matchStage = { isDeleted: { $ne: true } };

  if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
    matchStage.seller = new mongoose.Types.ObjectId(sellerId);
  }

  if (orderStatus) {
    // Case-insensitive match — supports both 'Delivered' and 'delivered'
    matchStage.orderStatus = new RegExp(`^${orderStatus}$`, 'i');
  }

  if (paymentStatus) {
    matchStage['paymentInfo.status'] = paymentStatus.toLowerCase();
  }

  if (dateFrom || dateTo) {
    matchStage.createdAt = {};
    if (dateFrom) matchStage.createdAt.$gte = new Date(dateFrom);
    if (dateTo)   matchStage.createdAt.$lte = new Date(dateTo);
  }

  // 2. Determine trend date format
  let dateFormat = '%Y-%m-%d';
  if (trendType === 'weekly')  dateFormat = '%Y-W%V';
  if (trendType === 'monthly') dateFormat = '%Y-%m';

  // 3. Run faceted aggregation pipeline
  const facetResult = await Order.aggregate([
    { $match: matchStage },
    {
      $facet: {
        // Summary KPIs
        summary: [
          {
            $group: {
              _id: null,
              totalOrders:      { $sum: 1 },
              totalRevenue: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $not: [{ $in: ['$orderStatus', ['Cancelled', 'cancelled']] }] },
                        { $not: [{ $in: ['$paymentInfo.status', ['refunded']] }] },
                      ],
                    },
                    { $ifNull: ['$totalAmount', 0] },
                    0,
                  ],
                },
              },
              totalItemsSold:  { $sum: { $ifNull: ['$itemCount', 0] } },
              cancelledOrders: {
                $sum: { $cond: [{ $in: ['$orderStatus', ['Cancelled', 'cancelled']] }, 1, 0] },
              },
              completedOrders: {
                $sum: { $cond: [{ $in: ['$orderStatus', ['Delivered', 'delivered']] }, 1, 0] },
              },
              returnedOrders: {
                $sum: { $cond: [{ $in: ['$orderStatus', ['Returned', 'returned']] }, 1, 0] },
              },
              pendingOrders: {
                $sum: { $cond: [{ $in: ['$orderStatus', ['Pending', 'pending']] }, 1, 0] },
              },
              shippedOrders: {
                $sum: { $cond: [{ $in: ['$orderStatus', ['Shipped', 'shipped']] }, 1, 0] },
              },
            },
          },
        ],

        // Distribution by status
        statusDistribution: [
          { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
        ],

        // Order volume trend over time
        orderTrend: [
          {
            $group: {
              _id:     { $dateToString: { format: dateFormat, date: '$createdAt' } },
              orders:  { $sum: 1 },
              revenue: { $sum: { $ifNull: ['$totalAmount', 0] } },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, date: '$_id', orders: 1, revenue: 1 } },
        ],

        // Revenue trend over time (excludes cancelled/refunded)
        revenueTrend: [
          {
            $match: {
              orderStatus: { $nin: ['Cancelled', 'cancelled'] },
              'paymentInfo.status': { $nin: ['refunded'] },
            },
          },
          {
            $group: {
              _id:     { $dateToString: { format: dateFormat, date: '$createdAt' } },
              revenue: { $sum: { $ifNull: ['$totalAmount', 0] } },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, date: '$_id', revenue: 1 } },
        ],

        // Top 10 products by quantity sold
        topProducts: [
          { $unwind: '$items' },
          {
            $group: {
              _id:                '$items.product',
              totalQuantitySold:  { $sum: '$items.quantity' },
              totalRevenue:       { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
              snapshotName:       { $first: '$items.title' },
              snapshotNameAlt:    { $first: '$items.name' },
              snapshotImage:      { $first: '$items.thumbnail' },
              snapshotImageAlt:   { $first: '$items.image' },
            },
          },
          { $sort: { totalQuantitySold: -1, totalRevenue: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from:         'products',
              localField:   '_id',
              foreignField: '_id',
              as:           'productDoc',
            },
          },
          {
            $project: {
              _id:              0,
              productId:        '$_id',
              productName:      {
                $ifNull: [
                  { $arrayElemAt: ['$productDoc.title', 0] },
                  { $ifNull: ['$snapshotName', { $ifNull: ['$snapshotNameAlt', 'Unknown Product'] }] },
                ],
              },
              productImage:     {
                $ifNull: [
                  { $arrayElemAt: ['$productDoc.thumbnail', 0] },
                  { $ifNull: ['$snapshotImage', { $ifNull: ['$snapshotImageAlt', ''] }] },
                ],
              },
              totalQuantitySold: 1,
              totalRevenue:      1,
            },
          },
        ],

        // Top 10 sellers by order volume
        topSellers: [
          {
            $group: {
              _id:          '$seller',
              totalOrders:  { $sum: 1 },
              totalRevenue: { $sum: { $ifNull: ['$totalAmount', 0] } },
            },
          },
          { $sort: { totalRevenue: -1, totalOrders: -1 } },
          { $limit: 10 },
        ],
      },
    },
  ]);

  const results = facetResult[0];

  // 4. Map Summary KPIs
  const rawSummary = results.summary[0] || {};
  const summary = {
    totalOrders:      rawSummary.totalOrders      || 0,
    totalRevenue:     rawSummary.totalRevenue      || 0,
    averageOrderValue: rawSummary.totalOrders > 0
      ? Math.round(rawSummary.totalRevenue / rawSummary.totalOrders)
      : 0,
    totalItemsSold:   rawSummary.totalItemsSold   || 0,
    cancelledOrders:  rawSummary.cancelledOrders  || 0,
    completedOrders:  rawSummary.completedOrders  || 0,
    returnedOrders:   rawSummary.returnedOrders   || 0,
    pendingOrders:    rawSummary.pendingOrders     || 0,
    shippedOrders:    rawSummary.shippedOrders     || 0,
  };

  // 5. Map Status Distribution (normalize casings)
  const statusDistribution = {
    Pending:          0,
    Confirmed:        0,
    Processing:       0,
    Packed:           0,
    Shipped:          0,
    'Out For Delivery': 0,
    Delivered:        0,
    Cancelled:        0,
    Returned:         0,
  };

  results.statusDistribution.forEach(item => {
    if (item._id) {
      const matchKey = Object.keys(statusDistribution).find(
        k => k.toLowerCase() === item._id.toLowerCase()
      );
      if (matchKey) {
        statusDistribution[matchKey] += item.count;
      } else {
        statusDistribution[item._id] = (statusDistribution[item._id] || 0) + item.count;
      }
    }
  });

  // 6. Enrich top sellers with shop names
  const topSellers = await Promise.all(
    results.topSellers.map(async item => {
      let shopName = 'Nexcart Seller';
      const profile = await Seller.findById(item._id)
        .select('business.businessName accountInfo.displayName shopName')
        .lean();
      if (profile) {
        shopName = profile.business?.businessName ||
                   profile.accountInfo?.displayName ||
                   profile.shopName ||
                   shopName;
      }
      return {
        sellerId:     item._id,
        sellerName:   shopName,
        totalOrders:  item.totalOrders,
        totalRevenue: item.totalRevenue,
      };
    })
  );

  return {
    summary,
    statusDistribution,
    revenueTrend:  results.revenueTrend,
    orderTrend:    results.orderTrend,
    topProducts:   results.topProducts,
    topSellers,
  };
};
