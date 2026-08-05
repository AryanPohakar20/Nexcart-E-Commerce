// src/services/orderAnalyticsService.js
// High-performance Order Analytics and Reporting aggregation engine.

import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Seller from '../models/Seller.js';
import User from '../models/User.js';

/**
 * Get comprehensive order analytics statistics using optimized aggregation pipelines.
 */
export const getOrderAnalytics = async (query = {}) => {
  const { dateFrom, dateTo, orderStatus, sellerId, paymentStatus } = query;

  // 1. Build optimized $match stage
  const matchStage = { isDeleted: { $ne: true } };

  if (sellerId) {
    matchStage.seller = new mongoose.Types.ObjectId(sellerId);
  }

  if (orderStatus) {
    matchStage.orderStatus = new RegExp(`^${orderStatus}$`, 'i');
  }

  if (paymentStatus) {
    matchStage['paymentInfo.status'] = paymentStatus.toLowerCase();
  }

  if (dateFrom || dateTo) {
    matchStage.createdAt = {};
    if (dateFrom) matchStage.createdAt.$gte = new Date(dateFrom);
    if (dateTo) matchStage.createdAt.$lte = new Date(dateTo);
  }

  // 2. Determine trend time grouping format
  const trendType = query.trendType || 'daily';
  let dateFormat = '%Y-%m-%d';
  if (trendType === 'weekly') {
    dateFormat = '%Y-W%V';
  } else if (trendType === 'monthly') {
    dateFormat = '%Y-%m';
  }

  // 3. Execute optimized Mongo aggregation facet query
  const facetResult = await Order.aggregate([
    { $match: matchStage },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$orderStatus", "Cancelled"] },
                        { $ne: ["$orderStatus", "cancelled"] },
                        { $ne: ["$paymentInfo.status", "refunded"] },
                        { $ne: ["$payment.paymentStatus", "refunded"] },
                        { $ne: ["$refundInfo.status", "refunded"] }
                      ]
                    },
                    { $ifNull: ["$totalAmount", 0] },
                    0
                  ]
                }
              },
              totalItemsSold: { $sum: { $ifNull: ["$itemCount", 0] } },
              cancelledOrders: {
                $sum: {
                  $cond: [
                    { $in: ["$orderStatus", ["Cancelled", "cancelled"]] },
                    1,
                    0
                  ]
                }
              },
              completedOrders: {
                $sum: {
                  $cond: [
                    { $in: ["$orderStatus", ["Delivered", "delivered"]] },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ],
        statusDistribution: [
          {
            $group: {
              _id: "$orderStatus",
              count: { $sum: 1 }
            }
          }
        ],
        orderTrend: [
          {
            $group: {
              _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
              orders: { $sum: 1 },
              revenue: { $sum: { $ifNull: ["$totalAmount", 0] } }
            }
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date: "$_id",
              orders: 1,
              revenue: 1
            }
          }
        ],
        revenueTrend: [
          {
            $match: {
              orderStatus: { $nin: ["Cancelled", "cancelled"] },
              "paymentInfo.status": { $nin: ["refunded"] },
              "payment.paymentStatus": { $nin: ["refunded"] },
              "refundInfo.status": { $nin: ["refunded"] }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
              revenue: { $sum: { $ifNull: ["$totalAmount", 0] } }
            }
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date: "$_id",
              revenue: 1
            }
          }
        ],
        topProducts: [
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.product",
              totalQuantitySold: { $sum: "$items.quantity" },
              totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
              snapshotName: { $first: "$items.title" },
              snapshotImage: { $first: "$items.thumbnail" }
            }
          },
          { $sort: { totalQuantitySold: -1, totalRevenue: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "productDoc"
            }
          },
          {
            $project: {
              _id: 0,
              productId: "$_id",
              productName: { $ifNull: [{ $arrayElemAt: ["$productDoc.title", 0] }, "$snapshotName", "Unknown Product"] },
              productImage: { $ifNull: [{ $arrayElemAt: ["$productDoc.thumbnail", 0] }, "$snapshotImage", ""] },
              totalQuantitySold: 1,
              totalRevenue: 1
            }
          }
        ],
        topSellers: [
          {
            $group: {
              _id: "$seller",
              sellerModel: { $first: "$sellerModel" },
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: { $ifNull: ["$totalAmount", 0] } }
            }
          },
          { $sort: { totalRevenue: -1, totalOrders: -1 } },
          { $limit: 10 }
        ]
      }
    }
  ]);

  const results = facetResult[0];

  // 4. Map Summary KPIs
  const summaryData = results.summary[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    totalItemsSold: 0,
    cancelledOrders: 0,
    completedOrders: 0
  };

  const summary = {
    totalOrders: summaryData.totalOrders || 0,
    totalRevenue: summaryData.totalRevenue || 0,
    averageOrderValue: summaryData.totalOrders > 0 ? Math.round(summaryData.totalRevenue / summaryData.totalOrders) : 0,
    totalItemsSold: summaryData.totalItemsSold || 0,
    cancelledOrders: summaryData.cancelledOrders || 0,
    completedOrders: summaryData.completedOrders || 0
  };

  // 5. Map Status Distribution
  const statusDistribution = {
    Pending: 0,
    Confirmed: 0,
    Processing: 0,
    Packed: 0,
    Shipped: 0,
    "Out For Delivery": 0,
    Delivered: 0,
    Cancelled: 0,
    Returned: 0
  };

  results.statusDistribution.forEach((item) => {
    if (item._id) {
      const matchKey = Object.keys(statusDistribution).find(
        (key) => key.toLowerCase() === item._id.toLowerCase()
      );
      if (matchKey) {
        statusDistribution[matchKey] += item.count;
      } else {
        statusDistribution[item._id] = item.count; // Fallback key
      }
    }
  });

  // 6. Map Polymorphic Sellers
  const topSellers = await Promise.all(
    results.topSellers.map(async (item) => {
      let shopName = 'Nexcart Seller';
      if (item.sellerModel === 'Seller') {
        const profile = await Seller.findById(item._id).select('business.businessName accountInfo.displayName shopName').lean();
        shopName = profile?.business?.businessName || profile?.accountInfo?.displayName || profile?.shopName || shopName;
      } else {
        const user = await User.findById(item._id).select('firstName lastName shopName').lean();
        shopName = user?.shopName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || shopName;
      }
      return {
        sellerName: shopName,
        totalOrders: item.totalOrders,
        totalRevenue: item.totalRevenue
      };
    })
  );

  return {
    summary,
    statusDistribution,
    revenueTrend: results.revenueTrend,
    orderTrend: results.orderTrend,
    topProducts: results.topProducts,
    topSellers
  };
};
