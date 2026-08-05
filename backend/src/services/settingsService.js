// src/services/settingsService.js
// Handles retrieval and updates for global platform configuration.

import Settings from '../models/Settings.js';
import * as auditLogRepo from '../repositories/auditLogRepository.js';

/**
 * Get or initialize global platform settings.
 */
export const getPlatformSettings = async () => {
  let settings = await Settings.findOne().lean();
  if (!settings) {
    settings = await Settings.create({});
    return settings.toObject ? settings.toObject() : settings;
  }
  return settings;
};

/**
 * Update platform settings and record audit log.
 */
export const updatePlatformSettings = async (updateData, adminUser, ipAddress = '') => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings(updateData);
  } else {
    // Deep merge sections
    if (updateData.general) settings.general = { ...settings.general, ...updateData.general };
    if (updateData.marketplace) settings.marketplace = { ...settings.marketplace, ...updateData.marketplace };
    if (updateData.security) settings.security = { ...settings.security, ...updateData.security };
    if (updateData.storage) settings.storage = { ...settings.storage, ...updateData.storage };
    if (updateData.email) settings.email = { ...settings.email, ...updateData.email };
    if (updateData.maintenance) settings.maintenance = { ...settings.maintenance, ...updateData.maintenance };
    if (updateData.branding) settings.branding = { ...settings.branding, ...updateData.branding };

    // Flat top-level fallback
    const flatKeys = ['platformName', 'supportEmail', 'currency', 'commissionRate', 'minPayout', 'autoApproveSellers', 'maintenanceMode', 'require2FA', 'sessionTimeout', 'smtpHost', 'smtpPort', 'razorpayKey'];
    flatKeys.forEach((key) => {
      if (updateData[key] !== undefined) {
        if (key === 'platformName' || key === 'supportEmail' || key === 'currency') {
          if (!settings.general) settings.general = {};
          if (key === 'platformName') settings.general.siteName = updateData[key];
          if (key === 'supportEmail') settings.general.contactEmail = updateData[key];
          if (key === 'currency') settings.general.currency = updateData[key];
        }
        if (key === 'commissionRate' || key === 'minPayout' || key === 'autoApproveSellers') {
          if (!settings.marketplace) settings.marketplace = {};
          settings.marketplace[key] = updateData[key];
        }
        if (key === 'maintenanceMode') {
          if (!settings.maintenance) settings.maintenance = {};
          settings.maintenance.enabled = updateData[key];
        }
        if (key === 'require2FA' || key === 'sessionTimeout') {
          if (!settings.security) settings.security = {};
          settings.security[key] = updateData[key];
        }
        if (key === 'smtpHost' || key === 'smtpPort') {
          if (!settings.email) settings.email = {};
          settings.email[key] = updateData[key];
        }
        if (key === 'razorpayKey') {
          if (!settings.branding) settings.branding = {};
          settings.branding.razorpayKey = updateData[key];
        }
      }
    });
  }

  await settings.save();

  // Audit log
  if (adminUser) {
    await auditLogRepo.createAuditLog({
      admin: adminUser._id,
      adminName: `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || 'Admin',
      action: 'UPDATE_SETTINGS',
      module: 'Settings',
      target: 'Platform Governance Settings',
      targetId: settings._id,
      targetModel: 'Settings',
      remarks: 'Updated global platform and governance settings',
      ipAddress,
      status: 'success',
    });
  }

  return settings.toObject();
};
