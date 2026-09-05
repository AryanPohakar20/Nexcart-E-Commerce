// src/services/emailService.js
// Email service stub — SMTP / nodemailer removed.
// OTP email verification has been removed from the authentication flow.
// All accounts are immediately active after registration.
//
// If a legitimate email feature is added in future (e.g., order confirmations),
// re-add a mailer here without OTP dependencies.

import logger from '../utils/logger.js';

/**
 * Stub — no-op. Kept for compatibility if any module still imports sendWelcomeEmail.
 * Remove callers that reference this once confirmed unused.
 */
export const sendWelcomeEmail = async (to, firstName) => {
  logger.info(`[EMAIL STUB] Welcome email skipped for ${to} (${firstName}) — SMTP not configured.`);
  return { success: true, skipped: true };
};
