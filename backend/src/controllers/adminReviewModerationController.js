import { asyncHandler } from '../utils/asyncHandler.js';
import * as reviewReportService from '../services/reviewReportService.js';
import logger from '../utils/logger.js';

/**
 * PATCH /admin/review-reports/:reportId/moderate
 * Body: { action: 'hide'|'remove'|'restore'|'reject', reason?: string }
 */
export const moderateReviewReport = asyncHandler(async (req, res) => {
  const adminId = req.user._id;
  const { reportId } = req.params;
  const { action, reason } = req.body;

  logger.info(`Admin ${adminId} moderating report ${reportId} with action '${action}'`);

  const result = await reviewReportService.moderateReview(adminId, reportId, action, reason);

  res.status(200).json({
    success: true,
    message: 'Review moderation successful.',
    data: result,
  });
});
