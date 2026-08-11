export const BADGE_TYPES = {
  TRUSTED_SELLER: 'TrustedSeller',
  TOP_RATED_SELLER: 'TopRatedSeller',
  FAST_RESPONDER: 'FastResponder',
  IDENTITY_VERIFIED: 'IdentityVerified',
};

export const BADGE_METADATA = {
  [BADGE_TYPES.TRUSTED_SELLER]: {
    displayName: 'Trusted Seller',
    description: 'Awarded to sellers who consistently maintain high trust and excellent customer service.',
    iconKey: 'trusted-seller',
  },
  [BADGE_TYPES.TOP_RATED_SELLER]: {
    displayName: 'Top Rated Seller',
    description: 'Awarded to sellers with outstanding average ratings and reviews.',
    iconKey: 'top-rated-seller',
  },
  [BADGE_TYPES.FAST_RESPONDER]: {
    displayName: 'Fast Responder',
    description: 'Awarded to sellers who respond quickly and efficiently to customer inquiries.',
    iconKey: 'fast-responder',
  },
  [BADGE_TYPES.IDENTITY_VERIFIED]: {
    displayName: 'Identity Verified',
    description: 'Awarded to sellers who have successfully completed the identity verification process.',
    iconKey: 'identity-verified',
  },
};
