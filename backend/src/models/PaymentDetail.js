import mongoose from 'mongoose';

const PaymentDetailSchema = new mongoose.Schema(
  {
    sellerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerProfile',
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['UPI', 'BankAccount'],
      required: true,
    },
    upiId: {
      type: String,
      default: null,
    },
    upiQr: {
      type: String,
      default: null,
    },
    bank: {
      accountHolder: { type: String, default: null },
      accountNumber: { type: String, default: null },
      ifsc: { type: String, default: null },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('PaymentDetail', PaymentDetailSchema);
