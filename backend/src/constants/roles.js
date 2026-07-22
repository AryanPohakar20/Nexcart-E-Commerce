// src/constants/roles.js
// Single source of truth for user roles.
// Import this anywhere role strings are needed to avoid magic strings.

export const ROLES = Object.freeze({
  CUSTOMER: 'Customer',
  SELLER: 'Seller',
  MARKETPLACE_SELLER: 'MarketplaceSeller',
  ADMIN: 'Admin',
});

export const ALL_ROLES = Object.values(ROLES);
