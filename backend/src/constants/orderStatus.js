// src/constants/orderStatus.js
// Single source of truth for order status values.

export const ORDER_STATUS = Object.freeze({
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
});

export const ALL_ORDER_STATUSES = Object.values(ORDER_STATUS);
