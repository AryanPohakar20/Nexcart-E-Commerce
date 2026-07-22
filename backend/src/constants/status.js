// src/constants/status.js
// Single source of truth for user account status values.

export const STATUS = Object.freeze({
  ACTIVE: 'Active',
  BLOCKED: 'Blocked',
  DELETED: 'Deleted',
});

export const ALL_STATUSES = Object.values(STATUS);
