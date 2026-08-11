// src/constants/reviewStatus.js
// Shared enums for the Reviews module.

export const ReviewStatus = Object.freeze({
  PUBLISHED: 'Published',
  PENDING: 'Pending',
  HIDDEN: 'Hidden',
  REPORTED: 'Reported',
  REMOVED: 'Removed',
});

export const ReviewType = Object.freeze({
  PRODUCT: 'PRODUCT',
  SELLER: 'SELLER',
});
