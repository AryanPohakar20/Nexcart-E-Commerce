// src/constants/sellerStatus.js
// Single source of truth for seller status values.

export const SELLER_STATUS = Object.freeze({
  DRAFT: 'Draft',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
});

export const ALL_SELLER_STATUSES = Object.values(SELLER_STATUS);

export const VERIFICATION_STATUS = Object.freeze({
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
});

export const ALL_VERIFICATION_STATUSES = Object.values(VERIFICATION_STATUS);
