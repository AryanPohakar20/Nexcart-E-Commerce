import mongoose from 'mongoose';
import { REPORT_STATUS, REPORT_REASONS } from '../constants/reviewReport.js';
import { ReviewType } from '../constants/reviewStatus.js';

const reviewReportSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Review ID is required'],
    },
    reviewType: {
      type: String,
      enum: Object.values(ReviewType),
      required: [true, 'Review type is required'],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter User ID is required'],
    },
    reason: {
      type: String,
      enum: Object.values(REPORT_REASONS),
      required: [true, 'Reason is required'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(REPORT_STATUS),
      default: REPORT_STATUS.PENDING,
    },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: { type: Date },
    moderationReason: { type: String, maxlength: 500 },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
reviewReportSchema.index({ reportedBy: 1, reviewId: 1, reviewType: 1 }, { unique: true });
reviewReportSchema.index({ reviewId: 1, reviewType: 1 });
reviewReportSchema.index({ reportedBy: 1 });
reviewReportSchema.index({ status: 1 });
reviewReportSchema.index({ createdAt: -1 });

const ReviewReport = mongoose.model('ReviewReport', reviewReportSchema);
export default ReviewReport;
