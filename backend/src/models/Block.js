import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema(
  {
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    blockedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee unique blocker-blockedUser pairs
blockSchema.index({ blocker: 1, blockedUser: 1 }, { unique: true });

const Block = mongoose.model('Block', blockSchema);

export default Block;
