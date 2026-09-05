// src/constants/orderStatus.js
// Single source of truth for order status values.
// Supports both Title Case (Manjusha convention) and lowercase (Main legacy) for
// backward compatibility with existing orders in the database.

export const ORDER_STATUS = Object.freeze({
  // Title Case — used by Seller Order Management, Return Service, Timeline Events
  PENDING:          'Pending',
  CONFIRMED:        'Confirmed',
  PROCESSING:       'Processing',
  PACKED:           'Packed',
  SHIPPED:          'Shipped',
  OUT_FOR_DELIVERY: 'Out For Delivery',
  DELIVERED:        'Delivered',
  CANCELLED:        'Cancelled',
  RETURNED:         'Returned',
});

// Lowercase aliases — used by Admin Order Service and legacy Main code
export const ORDER_STATUS_LOWER = Object.freeze({
  PENDING:    'pending',
  CONFIRMED:  'confirmed',
  PROCESSING: 'processing',
  PACKED:     'packed',
  SHIPPED:    'shipped',
  DELIVERED:  'delivered',
  CANCELLED:  'cancelled',
  RETURNED:   'returned',
});

// All allowed statuses (Title Case) — used for enum validation
export const ALL_ORDER_STATUSES = Object.values(ORDER_STATUS);

// All allowed statuses (lowercase) — used for admin legacy support
export const ALL_ORDER_STATUSES_LOWER = Object.values(ORDER_STATUS_LOWER);

// All statuses combined (for the Order schema enum field)
export const ALL_ORDER_STATUSES_COMBINED = [
  ...ALL_ORDER_STATUSES,
  ...ALL_ORDER_STATUSES_LOWER,
];

// Valid seller-initiated status transitions (Title Case only)
export const SELLER_STATUS_TRANSITIONS = Object.freeze({
  [ORDER_STATUS.PENDING]:   ORDER_STATUS.CONFIRMED,
  [ORDER_STATUS.CONFIRMED]: ORDER_STATUS.PACKED,
  [ORDER_STATUS.PACKED]:    ORDER_STATUS.SHIPPED,
  [ORDER_STATUS.SHIPPED]:   ORDER_STATUS.OUT_FOR_DELIVERY,
  [ORDER_STATUS.OUT_FOR_DELIVERY]: ORDER_STATUS.DELIVERED,
});

// Transition messages for timeline entries
export const SELLER_TRANSITION_MESSAGES = Object.freeze({
  [ORDER_STATUS.CONFIRMED]:        'Seller confirmed the order.',
  [ORDER_STATUS.PACKED]:           'Seller packed the order.',
  [ORDER_STATUS.SHIPPED]:          'Seller shipped the order.',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Seller marked the order as out for delivery.',
  [ORDER_STATUS.DELIVERED]:        'Seller delivered the order.',
});

// Statuses eligible for customer cancellation
export const CANCELLABLE_STATUSES = new Set([
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PROCESSING,
  'pending',
  'confirmed',
  'processing',
]);

// Statuses eligible for customer return request
export const RETURNABLE_STATUSES = new Set([
  ORDER_STATUS.DELIVERED,
  'delivered',
]);
