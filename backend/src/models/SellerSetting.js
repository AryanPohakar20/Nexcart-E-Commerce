import mongoose from 'mongoose';

const SellerSettingSchema = new mongoose.Schema(
  {
    sellerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerProfile',
      required: true,
      unique: true,
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    vacationMode: {
      active: { type: Boolean, default: false },
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('SellerSetting', SellerSettingSchema);
