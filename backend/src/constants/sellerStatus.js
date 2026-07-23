export const SELLER_STATUS = Object.freeze({
  DRAFT: 'Draft',
  PROFILE_COMPLETED: 'Profile Completed',
  EMAIL_VERIFIED: 'Email Verified',
  MOBILE_VERIFIED: 'Mobile Verified',
  IDENTITY_SUBMITTED: 'Identity Submitted',
  VERIFICATION_PENDING: 'Verification Pending',
  MARKETPLACE_SELLER: 'Marketplace Seller',
  SUSPENDED: 'Suspended',
  REJECTED: 'Rejected',
});

export const ALL_SELLER_STATUSES = Object.values(SELLER_STATUS);
