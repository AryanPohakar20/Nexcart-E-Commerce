import * as orderRepository from '../repositories/orderRepository.js';
import * as sellerRepository from '../repositories/sellerRepository.js';
import logger from '../utils/logger.js';
import { recalculateSellerTrustScore } from './sellerTrustScoreService.js';

/**
 * Recalculates and updates the performance statistics for a seller.
 * @param {string} sellerDocId - Seller document ID (Seller._id)
 */
export const recalculateSellerStatistics = async (sellerDocId) => {
  if (!sellerDocId) return;

  try {
    // 1. Calculate performance statistics from Order database records
    const stats = await orderRepository.calculateSellerPerformanceStats(sellerDocId);

    const statsUpdates = {
      'statistics.completedOrders': stats.completedOrders,
      'statistics.cancellationRate': stats.cancellationRate,
      'statistics.responseRate': stats.responseRate,
    };

    // 2. Persist the statistics to the Seller document using atomic $set
    const updatedSeller = await sellerRepository.updateSellerStatistics(sellerDocId, statsUpdates);

    if (updatedSeller) {
      logger.info(
        `Seller performance statistics recalculated. Seller ID: ${sellerDocId}, Completed: ${stats.completedOrders}, Cancellation Rate: ${stats.cancellationRate}%`
      );

      // Recalculate trust score (non-blocking)
      try {
        await recalculateSellerTrustScore(sellerDocId);
      } catch (err) {
        logger.error(`Failed to trigger trust score recalculation for Seller ID: ${sellerDocId}`, err);
      }
    } else {
      logger.warn(`Seller not found during statistics recalculation. Seller ID: ${sellerDocId}`);
    }
  } catch (error) {
    logger.error(`Failed to recalculate seller statistics. Seller ID: ${sellerDocId}`, error);
    throw error;
  }
};

/**
 * Hook to track seller message activity for future response rate calculations.
 * Document: Currently, response rate is not calculated because full interaction
 * message SLAs and customer-inquiry tracking are not yet implemented.
 * This hook is an extension point to log/record response events.
 */
export const trackSellerMessage = async (message) => {
  // Placeholder for future SLA/response tracking.
  // Will be implemented in a future commit.
};
