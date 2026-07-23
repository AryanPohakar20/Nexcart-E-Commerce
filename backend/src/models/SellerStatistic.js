import mongoose from 'mongoose';

const SellerStatisticSchema = new mongoose.Schema(
  {
    sellerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerProfile',
      required: true,
      unique: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    responseRate: {
      type: Number,
      default: 100,
    },
    avgResponseTime: {
      type: Number, // In minutes
      default: 0,
    },
    productsListed: {
      type: Number,
      default: 0,
    },
    productsSold: {
      type: Number,
      default: 0,
    },
    followers: {
      type: Number,
      default: 0,
    },
    following: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('SellerStatistic', SellerStatisticSchema);
