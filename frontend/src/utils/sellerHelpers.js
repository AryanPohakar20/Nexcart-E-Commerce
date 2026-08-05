import React from 'react';

/**
 * Returns the appropriate display name based on the seller type.
 * - Individual: Profile Name (or accountInfo.displayName)
 * - Business: Business Name (or profile.shopName / accountInfo.displayName depending on where it's stored)
 * 
 * Note: Since the prompt says "If sellerType === 'individual', Business fields should remain null",
 * we prioritize displayName for individual, and shopName/businessName for business.
 */
export const getSellerDisplayName = (seller) => {
  if (!seller) return 'Unknown Seller';

  if (seller.sellerType === 'business') {
    return seller.profile?.shopName || seller.accountInfo?.displayName || 'Business Seller';
  }

  // Individual
  return seller.accountInfo?.displayName || 'Individual Seller';
};

/**
 * Returns the appropriate avatar/logo based on the seller type.
 * - Individual: Profile Photo (from user or seller profile logo if reused)
 * - Business: Business Logo
 */
export const getSellerAvatar = (seller) => {
  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80';
  
  if (!seller) return defaultAvatar;

  // Assuming seller.profile.logo.url stores the image
  if (seller.profile?.logo?.url) {
    return seller.profile.logo.url;
  }
  
  // If the seller document contains a user object populated
  if (seller.userId && seller.userId.avatar) {
    return seller.userId.avatar;
  }

  return defaultAvatar;
};

/**
 * Returns the badge text based on seller type.
 */
export const getSellerBadgeText = (seller) => {
  if (!seller) return 'Seller';
  return seller.sellerType === 'business' ? 'Small Business' : 'Individual Seller';
};

/**
 * Returns the title for the owner/primary contact.
 */
export const getSellerOwnerLabel = (seller) => {
  return seller?.sellerType === 'business' ? 'Owner Name' : 'Full Name';
};
