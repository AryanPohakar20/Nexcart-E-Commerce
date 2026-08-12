import { asyncHandler } from '../utils/asyncHandler.js';
import * as reviewReportService from '../services/reviewReportService.js';
import logger from '../utils/logger.js';

/**
 * Get paginated list of all review reports for administrators.
 * GET /admin/review-reports
 */
export const getAdminReviewReports = asyncHandler(async (req, res) => {
  const adminId = req.user._id;
  logger.info(`Admin Review Report Queue accessed by Admin ID: ${adminId}`);

  const data = await reviewReportService.getReportedReviews(req.query);

  res.status(200).json({
    success: true,
    message: 'Reported reviews queue fetched successfully.',
    data,
  });
});

/**
 * Get details of a single review report by ID for administrators.
 * GET /admin/review-reports/:reportId
 */
export const getAdminReviewReportDetails = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const adminId = req.user._id;
  logger.info(`Admin Review Report Details accessed for Report ID: ${reportId} by Admin ID: ${adminId}`);

  const reportDetails = await reviewReportService.getReportDetails(reportId);

  res.status(200).json({
    success: true,
    message: 'Reported review details fetched successfully.',
    data: { report: reportDetails },
  });
});
