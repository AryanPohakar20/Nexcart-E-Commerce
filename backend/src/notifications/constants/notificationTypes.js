const NOTIFICATION_TYPES = Object.freeze({
  ORDER_CREATED: 'order_created',
  ORDER_UPDATED: 'order_updated',
  ORDER_CANCELLED: 'order_cancelled',
  ORDER_DELIVERED: 'order_delivered',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  SELLER_VERIFICATION_APPROVED: 'seller_verification_approved',
  SELLER_VERIFICATION_REJECTED: 'seller_verification_rejected',
  PRODUCT_APPROVED: 'product_approved',
  PRODUCT_REJECTED: 'product_rejected',
  STOCK_ALERT: 'stock_alert',
  ACCOUNT_ALERT: 'account_alert',
  SECURITY_ALERT: 'security_alert',
  SYSTEM_BROADCAST: 'system_broadcast',
  PROMOTIONAL_ANNOUNCEMENT: 'promotional_announcement',
  WELCOME: 'welcome',
});

export const NOTIFICATION_TYPE_VALUES = Object.values(NOTIFICATION_TYPES);

export default NOTIFICATION_TYPES;
