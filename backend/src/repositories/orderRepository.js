import Order from '../models/Order.js';
import mongoose from 'mongoose';

/**
 * Run a single optimized MongoDB aggregation pipeline to compute seller performance statistics.
 * @param {string} sellerDocId - Seller document ID (Seller._id)
 */
export const calculateSellerPerformanceStats = async (sellerDocId) => {
  if (!sellerDocId || !mongoose.Types.ObjectId.isValid(sellerDocId)) {
    return {
      completedOrders: 0,
      cancellationRate: 0,
      responseRate: 0,
    };
  }

  const sellerIdObj = new mongoose.Types.ObjectId(sellerDocId);

  const aggregationResult = await Order.aggregate([
    {
      $match: {
        seller: sellerIdObj,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: '$seller',
        totalOrders: { $sum: 1 },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] },
        },
        sellerCancellations: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$orderStatus', 'cancelled'] },
                  {
                    $or: [
                      {
                        $regexMatch: {
                          input: { $ifNull: ['$cancelReason', ''] },
                          regex: /seller|stock|inventory|merchant|damaged|out of stock/i,
                        },
                      },
                      { $eq: [{ $ifNull: ['$cancelReason', ''] }, 'Cancelled by administrator'] },
                      { $eq: [{ $ifNull: ['$cancelReason', ''] }, 'Admin cancellation refund'] },
                    ],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  if (aggregationResult.length === 0) {
    return {
      completedOrders: 0,
      cancellationRate: 0,
      responseRate: 0,
    };
  }

  const result = aggregationResult[0];
  const eligibleOrders = result.totalOrders;

  let cancellationRate = 0;
  if (eligibleOrders > 0) {
    cancellationRate = Math.round((result.sellerCancellations / eligibleOrders) * 100 * 10) / 10;
  }

  return {
    completedOrders: result.completedOrders,
    cancellationRate,
    responseRate: 0, // Default to 0, not yet calculable
  };
};
