export const NOTIFICATION_PRIORITIES = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
});

export const NOTIFICATION_CATEGORIES = Object.freeze({
  ORDER: 'order',
  SELLER: 'seller',
  PRODUCT: 'product',
  ACCOUNT: 'account',
  SECURITY: 'security',
  SYSTEM: 'system',
  PAYMENT: 'payment',
  INVENTORY: 'inventory',
  PROMOTION: 'promotion',
  GENERAL: 'general',
});

export const NOTIFICATION_ROLES = Object.freeze({
  CUSTOMER: 'customer',
  SELLER: 'seller',
  ADMIN: 'admin',
});

export const NOTIFICATION_STATUS = Object.freeze({
  UNREAD: 'unread',
  READ: 'read',
  ARCHIVED: 'archived',
  EXPIRED: 'expired',
});

export const NOTIFICATION_ENTITY_TYPES = Object.freeze({
  ORDER: 'order',
  PRODUCT: 'product',
  USER: 'user',
  SELLER: 'seller',
  PAYMENT: 'payment',
  REVIEW: 'review',
  SYSTEM: 'system',
  CAMPAIGN: 'campaign',
  OTHER: 'other',
});

export const NOTIFICATION_PRIORITY_VALUES = Object.values(NOTIFICATION_PRIORITIES);
export const NOTIFICATION_CATEGORY_VALUES = Object.values(NOTIFICATION_CATEGORIES);
export const NOTIFICATION_ROLE_VALUES = Object.values(NOTIFICATION_ROLES);
export const NOTIFICATION_STATUS_VALUES = Object.values(NOTIFICATION_STATUS);
export const NOTIFICATION_ENTITY_TYPE_VALUES = Object.values(NOTIFICATION_ENTITY_TYPES);
