// src/helpers/sellerHelpers.js
// Reusable display helpers for seller profiles.
// Used across controllers and services to keep response building DRY.

// ─── Display Name ─────────────────────────────────────────────────────────────

/**
 * Get the canonical display name for a seller.
 * Business  → businessName → ownerName → accountInfo.displayName
 * Individual → fullName   → accountInfo.displayName
 */
export const getSellerDisplayName = (seller) => {
  if (!seller) return 'Unknown Seller';

  if (seller.sellerType === 'business') {
    return (
      seller.business?.businessName ||
      seller.business?.ownerName ||
      seller.accountInfo?.displayName ||
      'Business Seller'
    );
  }

  return (
    seller.individual?.fullName ||
    seller.accountInfo?.displayName ||
    'Individual Seller'
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

/**
 * Get the avatar/logo URL for a seller.
 * Business  → businessLogo.url → populated userId.avatar
 * Individual → profilePhoto.url → populated userId.avatar
 */
export const getSellerAvatar = (seller) => {
  if (!seller) return null;

  if (seller.sellerType === 'business') {
    return seller.business?.businessLogo?.url || seller.userId?.avatar || null;
  }

  return seller.individual?.profilePhoto?.url || seller.userId?.avatar || null;
};

// ─── Banner ───────────────────────────────────────────────────────────────────

/**
 * Get the banner URL for a seller.
 * Business  → businessBanner.url
 * Individual → null (no banner concept for individuals)
 */
export const getSellerBanner = (seller) => {
  if (!seller) return null;
  if (seller.sellerType === 'business') {
    return seller.business?.businessBanner?.url || null;
  }
  return null;
};

// ─── Type Badge ───────────────────────────────────────────────────────────────

/**
 * Get the human-readable type badge for a seller.
 * business    → 'Small Business'
 * individual  → 'Individual Seller'
 */
export const getSellerTypeBadge = (seller) => {
  if (!seller) return 'Seller';
  return seller.sellerType === 'business' ? 'Small Business' : 'Individual Seller';
};

// ─── Public Profile Builder ───────────────────────────────────────────────────

/**
 * Build a public-safe seller profile object.
 * Strips all sensitive data (payment, identity, private settings).
 * Type-aware: business fields never appear for individuals and vice versa.
 *
 * @param {Object} seller - Populated Mongoose Seller document
 * @returns {Object}
 */
export const buildPublicProfile = (seller) => {
  if (!seller) return null;

  const isBusiness = seller.sellerType === 'business';
  const displayName = getSellerDisplayName(seller);
  const avatar = getSellerAvatar(seller);
  const banner = getSellerBanner(seller);

  // Respect privacy settings
  const privacySettings = seller.settings?.privacy || {};

  const base = {
    sellerId: seller.sellerId,
    slug: seller.slug,
    sellerType: seller.sellerType,
    typeBadge: getSellerTypeBadge(seller),
    displayName,
    avatar,
    banner,
    rating: seller.rating || 0,
    totalReviews: seller.totalReviews || 0,
    followers: seller.followers || 0,
    profileViews: seller.profileViews || 0,
    trustScore: seller.trustScore || 0,
    sellerLevel: seller.sellerLevel || 'bronze',
    verificationStatus: seller.verificationStatus,
    isActive: seller.isActive,
    city: seller.address?.city || seller.profile?.city || '',
    state: seller.address?.state || seller.profile?.state || '',
    country: seller.address?.country || 'India',
    memberSince: seller.createdAt,
  };

  // Conditionally expose contact info based on privacy settings
  if (privacySettings.showEmail) {
    base.email = seller.accountInfo?.email || seller.userId?.email || '';
  }
  if (privacySettings.showPhone) {
    base.phone = seller.accountInfo?.phone || seller.userId?.phone || '';
  }

  // Type-specific fields — strict separation
  if (isBusiness) {
    base.businessName = seller.business?.businessName || '';
    base.ownerName = seller.business?.ownerName || '';
    base.businessDescription = seller.business?.businessDescription || '';
    base.businessCategory = seller.business?.businessCategory || '';
    base.website = seller.business?.website || '';
  } else {
    base.fullName = seller.individual?.fullName || '';
    base.about = seller.individual?.about || '';
  }

  return base;
};

// ─── Dashboard Profile Builder ────────────────────────────────────────────────

/**
 * Build a full dashboard seller profile.
 * Includes everything the seller themselves needs — more than public profile.
 * Still excludes payment details, identity documents (handled separately).
 *
 * @param {Object} seller - Populated Mongoose Seller document
 * @returns {Object}
 */
export const buildDashboardProfile = (seller) => {
  if (!seller) return null;

  const isBusiness = seller.sellerType === 'business';
  const publicPart = buildPublicProfile(seller);

  const dashboard = {
    ...publicPart,
    // Always expose these to the seller themselves
    email: seller.accountInfo?.email || seller.userId?.email || '',
    phone: seller.accountInfo?.phone || seller.userId?.phone || '',
    sellerStatus: seller.sellerStatus,
    onboardingStep: seller.onboardingStep,
    address: {
      address: seller.address?.address || seller.profile?.address || '',
      city: seller.address?.city || seller.profile?.city || '',
      state: seller.address?.state || seller.profile?.state || '',
      country: seller.address?.country || 'India',
      pincode: seller.address?.pincode || seller.profile?.pincode || '',
    },
    settings: seller.settings || {},
    statistics: seller.statistics || {},
    dashboard: seller.dashboard || {},
    userId: seller.userId
      ? {
          _id: seller.userId._id,
          firstName: seller.userId.firstName,
          lastName: seller.userId.lastName,
          email: seller.userId.email,
          phone: seller.userId.phone,
          avatar: seller.userId.avatar,
          isVerified: seller.userId.isVerified,
          role: seller.userId.role,
        }
      : null,
  };

  // Business-only extras
  if (isBusiness) {
    dashboard.gst = seller.business?.gst || '';
  }

  return dashboard;
};
