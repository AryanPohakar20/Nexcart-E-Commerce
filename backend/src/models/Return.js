import mongoose from 'mongoose';

const returnTimelineEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: false,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: String,
      default: 'Admin',
    },
    message: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const returnSchema = new mongoose.Schema(
  {
    returnId: {
      type: String,
      unique: true,
      trim: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    refundStatus: {
      type: String,
      enum: ['Pending', 'Refund Completed'],
      default: 'Pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    timeline: {
      type: [returnTimelineEventSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-validate hook to generate returnId
returnSchema.pre('validate', function (next) {
  if (!this.returnId) {
    this.returnId = `RET-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

// Indexes for query optimization
returnSchema.index({ orderId: 1 });
returnSchema.index({ customerId: 1 });
returnSchema.index({ status: 1 });
returnSchema.index({ refundStatus: 1 });
returnSchema.index({ createdAt: -1 });

const Return = mongoose.model('Return', returnSchema);
export default Return;
