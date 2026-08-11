/**
 * Map a single raw review report and its associated review to an Admin DTO.
 * Shields PII data (email, phone, password) and database metadata.
 * @param {Object} report - Review report document
 * @param {Object} review - Populated review document
 * @returns {Object} Public admin report DTO
 */
export const toAdminReviewReportDTO = (report, review) => {
  if (!report) return null;

  return {
    reportId: report._id,
    reviewId: report.reviewId,
    reviewType: report.reviewType,
    reportReason: report.reason,
    description: report.description,
    status: report.status,
    reportedAt: report.createdAt,
    reportedBy: report.reportedBy ? {
      _id: report.reportedBy._id,
      firstName: report.reportedBy.firstName,
      lastName: report.reportedBy.lastName,
      username: report.reportedBy.username,
    } : null,
    reviewAuthor: review?.customerId ? {
      _id: review.customerId._id,
      firstName: review.customerId.firstName,
      lastName: review.customerId.lastName,
      username: review.customerId.username,
    } : null,
    reviewRating: review?.rating || 0,
    reviewComment: review?.comment || '',
    productId: report.reviewType === 'PRODUCT' ? review?.productId : undefined,
    sellerId: report.reviewType === 'SELLER' ? review?.sellerId : undefined,
  };
};

/**
 * Map list of reports and associated reviews in bulk.
 * @param {Array} reports - Array of report documents
 * @param {Map} reviewMap - Map of reviewId string to review document
 * @returns {Array} List of Admin DTOs
 */
export const toAdminReviewReportsDTOList = (reports, reviewMap) => {
  if (!Array.isArray(reports)) return [];
  return reports.map((report) => {
    const review = reviewMap.get(report.reviewId.toString());
    return toAdminReviewReportDTO(report, review);
  });
};
