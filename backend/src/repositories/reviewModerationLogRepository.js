import ReviewModerationLog from '../models/ReviewModerationLog.js';

/**
 * Create an audit log entry for a moderation action.
 * @param {Object} logData - Fields matching ReviewModerationLog schema.
 * @returns {Promise<Object>} Saved log document.
 */
export const createLog = async (logData) => {
  const log = new ReviewModerationLog(logData);
  return await log.save();
};
