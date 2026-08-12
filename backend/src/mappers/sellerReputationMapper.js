import { getSellerDisplayName, getSellerAvatar } from '../helpers/sellerHelpers.js';
import { toSellerBadgesDTOList } from './sellerBadgeMapper.js';

/**
 * Map Seller document to public Seller Reputation DTO.
 * Excludes sensitive fields and internal database values.
 * @param {Object} seller - Seller document (populated with userId)
 * @returns {Object} Public Reputation DTO
 */
export const toSellerReputationDTO = (seller) => {
  if (!seller) return null;

  return {
    sellerId: seller.sellerId,
    sellerName: getSellerDisplayName(seller),
    profileImage: getSellerAvatar(seller),
    memberSince: seller.createdAt,
    averageRating: seller.averageRating || 0,
    totalReviews: seller.totalReviews || 0,
    ratingDistribution: seller.ratingDistribution || {
      oneStar: 0,
      twoStar: 0,
      threeStar: 0,
      fourStar: 0,
      fiveStar: 0,
    },
    completedOrders: seller.statistics?.completedOrders || 0,
    cancellationRate: seller.statistics?.cancellationRate || 0,
    responseRate: seller.statistics?.responseRate || 0,
    badges: toSellerBadgesDTOList(seller.badges || []),
  };
};
