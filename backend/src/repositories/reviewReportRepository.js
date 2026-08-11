import ReviewReport from '../models/ReviewReport.js';

/**
 * Save a new ReviewReport document to the database.
 * @param {Object} reportData - Review report data object
 * @returns {Promise<Object>} The saved report document
 */
export const createReport = async (reportData) => {
  const report = new ReviewReport(reportData);
  return await report.save();
};

/**
 * Find a ReviewReport by its ID.
 * @param {string} id - ReviewReport document ID
 * @returns {Promise<Object>} The report document (or null)
 */
export const findReportById = async (id) => {
  return await ReviewReport.findById(id);
};
