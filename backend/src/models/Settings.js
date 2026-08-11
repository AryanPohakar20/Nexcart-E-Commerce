// src/models/Settings.js
// Singleton platform governance and configuration schema.

import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    general: {
      siteName: { type: String, default: 'NexCart' },
      tagline: { type: String, default: 'Shop Limitless' },
      logo: { type: String, default: '' },
      favicon: { type: String, default: '' },
      contactEmail: { type: String, default: 'support@nexcart.in' },
      supportPhone: { type: String, default: '+91 1800 123 4567' },
      timezone: { type: String, default: 'Asia/Kolkata' },
      currency: { type: String, default: 'INR (₹)' },
      language: { type: String, default: 'English' },
    },
    marketplace: {
      commissionRate: { type: Number, default: 10, min: 0, max: 100 },
      minPayout: { type: Number, default: 1000, min: 0 },
      autoApproveSellers: { type: Boolean, default: false },
      minTrustScore: { type: Number, default: 70, min: 0, max: 100 },
      listingExpiryDays: { type: Number, default: 90 },
      defaultSellerLevel: { type: String, default: 'Level 1 (Standard)' },
    },
    security: {
      jwtExpiry: { type: String, default: '7d' },
      sessionTimeout: { type: Number, default: 60 }, // minutes
      require2FA: { type: Boolean, default: true },
      passwordMinLength: { type: Number, default: 8 },
      requireSpecialChar: { type: Boolean, default: true },
      rateLimitMaxRequests: { type: Number, default: 100 },
    },
    storage: {
      provider: { type: String, default: 'supabase' },
      supabaseUrl: { type: String, default: '' },
      uploadLimitsMb: { type: Number, default: 20 },
      maxImageSizeMb: { type: Number, default: 5 },
      allowedFormats: { type: [String], default: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'csv', 'xlsx'] },
    },
    email: {
      smtpHost: { type: String, default: 'smtp.sendgrid.net' },
      smtpPort: { type: Number, default: 587 },
      smtpUser: { type: String, default: 'apikey' },
      senderName: { type: String, default: 'NexCart Marketplace' },
      replyEmail: { type: String, default: 'support@nexcart.in' },
    },
    maintenance: {
      enabled: { type: Boolean, default: false },
      message: { type: String, default: 'NexCart is undergoing scheduled maintenance. We will be back shortly.' },
      scheduledAt: { type: Date, default: null },
      allowedAdminAccess: { type: Boolean, default: true },
    },
    branding: {
      primaryColor: { type: String, default: '#FFC107' },
      secondaryColor: { type: String, default: '#10B981' },
      platformName: { type: String, default: 'NexCart Marketplace' },
      footerText: { type: String, default: '© 2026 NexCart Technologies Inc. All rights reserved.' },
      razorpayKey: { type: String, default: 'rzp_live_9948291048102' },
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
