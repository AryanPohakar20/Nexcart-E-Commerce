import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'location', 'offer', 'meetup', 'system'],
      default: 'text',
    },
    attachments: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        fileType: { type: String, default: 'image' },
        fileName: { type: String, default: '' },
        fileSize: { type: Number, default: 0 },
      },
    ],
    locationDetails: {
      latitude: { type: Number },
      longitude: { type: Number },
      title: { type: String },
      address: { type: String },
      googleMapsUrl: { type: String },
    },
    offerDetails: {
      offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
      offerPrice: { type: Number },
      originalPrice: { type: Number },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'countered', 'expired'],
        default: 'pending',
      },
      proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    meetupDetails: {
      date: { type: String },
      time: { type: String },
      location: { type: String },
      status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
      },
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    seenAt: {
      type: Date,
      default: null,
    },
    deletedForEveryone: {
      type: Boolean,
      default: false,
    },
    deletedForMe: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for paginated message retrieval
messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
