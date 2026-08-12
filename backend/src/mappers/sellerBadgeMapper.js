import { BADGE_METADATA } from '../constants/sellerBadge.js';

/**
 * Map a single database badge state to public enriched DTO format.
 * Resolves description, displayName, and iconKey dynamically from constants configuration.
 * @param {Object} badge - Database badge state ({ badgeType, awardedAt, isActive })
 * @returns {Object} Public Badge DTO
 */
export const toSellerBadgeDTO = (badge) => {
  if (!badge) return null;

  const metadata = BADGE_METADATA[badge.badgeType] || {};

  return {
    badgeType: badge.badgeType,
    displayName: metadata.displayName || badge.badgeType,
    description: metadata.description || '',
    iconKey: metadata.iconKey || 'default-badge',
    awardedAt: badge.awardedAt,
  };
};

/**
 * Filter and map seller badges array to public DTO list.
 * Only returns badges where isActive is true.
 * @param {Array} badges - Array of database badge states
 * @returns {Array} List of active Badge DTOs
 */
export const toSellerBadgesDTOList = (badges) => {
  if (!Array.isArray(badges)) return [];

  return badges
    .filter((b) => b && b.isActive === true)
    .map(toSellerBadgeDTO);
};
