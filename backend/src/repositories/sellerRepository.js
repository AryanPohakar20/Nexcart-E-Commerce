// src/repositories/sellerRepository.js

import SellerProfile from '../models/SellerProfile.js';
import VerificationDocument from '../models/VerificationDocument.js';
import PaymentDetail from '../models/PaymentDetail.js';
import SellerStatistic from '../models/SellerStatistic.js';
import SellerSetting from '../models/SellerSetting.js';

export const createSellerProfile = async (data) => {
  const profile = new SellerProfile(data);
  return profile.save();
};

export const findProfileByUserId = async (userId) => {
  return SellerProfile.findOne({ user: userId }).populate('user', 'firstName lastName email phone isVerified role');
};

export const updateSellerProfile = async (userId, updates) => {
  return SellerProfile.findOneAndUpdate({ user: userId }, updates, { new: true, runValidators: true });
};

// Verification Documents
export const saveVerificationDocuments = async (profileId, data) => {
  return VerificationDocument.findOneAndUpdate(
    { sellerProfile: profileId },
    { ...data },
    { new: true, upsert: true, runValidators: true }
  );
};

export const getVerificationDocuments = async (profileId) => {
  return VerificationDocument.findOne({ sellerProfile: profileId });
};

// Payment Details
export const savePaymentDetails = async (profileId, data) => {
  return PaymentDetail.findOneAndUpdate(
    { sellerProfile: profileId },
    { ...data },
    { new: true, upsert: true, runValidators: true }
  );
};

export const getPaymentDetails = async (profileId) => {
  return PaymentDetail.findOne({ sellerProfile: profileId });
};

// Statistics
export const createStatistics = async (profileId) => {
  const stats = new SellerStatistic({ sellerProfile: profileId });
  return stats.save();
};

export const getStatistics = async (profileId) => {
  return SellerStatistic.findOne({ sellerProfile: profileId });
};

// Settings
export const createSettings = async (profileId) => {
  const settings = new SellerSetting({ sellerProfile: profileId });
  return settings.save();
};

export const getSettings = async (profileId) => {
  return SellerSetting.findOne({ sellerProfile: profileId });
};
