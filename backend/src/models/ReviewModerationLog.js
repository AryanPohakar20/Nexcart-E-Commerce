import mongoose from 'mongoose';

const reviewModerationLogSchema = new mongoose.Schema(
  {
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReviewReport', required: true },
    reviewId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reviewType: { type: String, enum: ['PRODUCT', 'SELLER'], required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['hide', 'remove', 'restore', 'reject', 'under_review'], required: true },
    previousReviewStatus: { type: String, required: true },
    newReviewStatus: { type: String, required: true },
    previousReportStatus: { type: String, required: true },
    newReportStatus: { type: String, required: true },
    reason: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for efficient queries
reviewModerationLogSchema.index({ reportId: 1 });
reviewModerationLogSchema.index({ reviewId: 1, reviewType: 1 });
reviewModerationLogSchema.index({ adminId: 1 });
reviewModerationLogSchema.index({ createdAt: -1 });

const ReviewModerationLog = mongoose.model('ReviewModerationLog', reviewModerationLogSchema);
export default ReviewModerationLog;
