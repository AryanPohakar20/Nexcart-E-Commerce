// src/constants/roles.js
// Single source of truth for user roles.
// Import this anywhere role strings are needed to avoid magic strings.

export const ROLES = Object.freeze({
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  MODERATOR: "moderator",
  SUPPORT_STAFF: "support_staff",
});

export const ADMIN_ROLES = [
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
  ROLES.MODERATOR,
  ROLES.SUPPORT_STAFF,
];

export const ALL_ROLES = Object.values(ROLES);
