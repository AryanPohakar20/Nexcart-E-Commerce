import mongoose from 'mongoose';

const VerificationDocumentSchema = new mongoose.Schema(
  {
    sellerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerProfile',
      required: true,
      unique: true,
    },
    idType: {
      type: String,
      enum: ['Aadhaar', 'PAN', 'Driving Licence', 'Passport'],
      required: true,
    },
    frontImage: {
      type: String,
      required: true,
    },
    backImage: {
      type: String,
      default: null,
    },
    selfie: {
      type: String,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('VerificationDocument', VerificationDocumentSchema);
