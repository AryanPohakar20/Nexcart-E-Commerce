// src/repositories/auditLogRepository.js
// Data-access layer for the AuditLog entity.

import AuditLog from '../models/AuditLog.js';

/**
 * Create a new audit log entry.
 * This is the only write operation — audit logs are never updated or deleted.
 */
export const createLog = async (data) => {
  const log = new AuditLog(data);
  return log.save();
};

/**
 * Paginated list of audit logs with optional filtering.
 * @param {Object} filter  - MongoDB filter object (from buildAuditFilter)
 * @param {number} page
 * @param {number} limit
 * @param {Object} sort    - e.g. { createdAt: -1 }
 */
export const listLogs = async ({ filter = {}, page = 1, limit = 20, sort = { createdAt: -1 } } = {}) => {
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate({ path: 'admin', select: 'firstName lastName email avatar' })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);
  return { logs, total };
};

/**
 * Get recent N audit log entries — used by the dashboard activity feed.
 * @param {number} limit
 */
export const getRecent = async (limit = 10) => {
  return AuditLog.find({})
    .populate({ path: 'admin', select: 'firstName lastName email avatar' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};
