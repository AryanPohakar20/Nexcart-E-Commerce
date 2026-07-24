// src/services/emailService.js
// Nodemailer email service — handles all transactional emails for Nexcart.
// Currently configured for Gmail SMTP with App Password.
// To switch providers (SendGrid, Brevo, SES), replace only the transporter config.

import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

/**
 * Build the Nodemailer transporter.
 * Uses Gmail SMTP — requires EMAIL + EMAIL_PASSWORD env vars.
 * In development/test environments, logs to console if email is unconfigured.
 */
const createTransporter = () => {
  const email = process.env.EMAIL;
  const password = process.env.EMAIL_PASSWORD;

  if (
    !email ||
    !password ||
    email === 'your_email@gmail.com' ||
    email === 'your_gmail@gmail.com' ||
    password === 'your_app_password' ||
    password === 'your_gmail_app_password'
  ) {
    logger.warn('EmailService: EMAIL/EMAIL_PASSWORD not set or are placeholder values — emails will be logged to console only.');
    return null;
  }

  // If custom SMTP host is set, use general SMTP configuration
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: email,
        pass: password,
      },
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: password,
    },
  });
};

/**
 * Core send function.
 * Falls back to console.log when transporter is unavailable (dev/test).
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  if (!transporter) {
    // Development fallback — print OTPs to console so dev can still test
    logger.info(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
    logger.info(`[DEV EMAIL] Body: ${html.replace(/<[^>]+>/g, ' ')}`);
    return { success: true, dev: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"NexCart" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to} — MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw new Error('Email delivery failed. Please try again.');
  }
};

// ─── Email Templates ──────────────────────────────────────────────────────────

/**
 * Send a 6-digit OTP to the user's email for password reset or email verification.
 */
export const sendOtpEmail = async (to, otp, purpose = 'Password Reset') => {
  const subject = `NexCart — Your ${purpose} OTP Code`;

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin:0;padding:0;background:#070B12;font-family:'Segoe UI',sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding:40px 20px;">
            <table role="presentation" width="100%" max-width="520px" style="max-width:520px;margin:0 auto;background:#0E1420;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
              
              <!-- Header -->
              <tr>
                <td style="padding:32px 40px 24px;background:linear-gradient(135deg,#1a1200,#0E1420);border-bottom:1px solid rgba(255,193,7,0.2);">
                  <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:2px;color:#FFC107;">
                    NEX<span style="color:#ffffff;">CART</span>
                  </p>
                  <p style="margin:4px 0 0;font-size:12px;color:#AAB4C5;letter-spacing:1px;font-family:monospace;">
                    AI-POWERED E-COMMERCE
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:36px 40px;">
                  <p style="margin:0 0 8px;font-size:16px;color:#ffffff;font-weight:600;">${purpose} Request</p>
                  <p style="margin:0 0 28px;font-size:13px;color:#AAB4C5;line-height:1.6;">
                    Your one-time verification code is below. This code expires in <strong style="color:#FFC107;">10 minutes</strong>. 
                    Do not share it with anyone.
                  </p>

                  <!-- OTP Box -->
                  <div style="text-align:center;background:#070B12;border:2px solid #FFC107;border-radius:12px;padding:28px 20px;margin:0 0 28px;box-shadow:0 0 30px rgba(255,193,7,0.15);">
                    <p style="margin:0 0 8px;font-size:11px;color:#AAB4C5;letter-spacing:3px;font-family:monospace;text-transform:uppercase;">Verification Code</p>
                    <p style="margin:0;font-size:42px;font-weight:900;letter-spacing:10px;color:#FFC107;font-family:monospace;">${otp}</p>
                  </div>

                  <p style="margin:0;font-size:12px;color:#AAB4C5;line-height:1.6;">
                    If you did not request this, please ignore this email. 
                    Your account remains secure.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px 28px;border-top:1px solid rgba(255,255,255,0.06);">
                  <p style="margin:0;font-size:11px;color:#4A5568;font-family:monospace;">
                    © 2026 NEXCART INC. · SYSTEM v2.4.0-QUANTUM
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  return sendEmail({ to, subject, html });
};

/**
 * Send a welcome email after successful registration + verification.
 */
export const sendWelcomeEmail = async (to, firstName) => {
  const subject = 'Welcome to NexCart — Shop Beyond Limits! 🛒';

  const html = `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background:#070B12;font-family:'Segoe UI',sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding:40px 20px;">
            <table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#0E1420;border-radius:16px;border:1px solid rgba(255,255,255,0.08);">
              <tr>
                <td style="padding:32px 40px;background:linear-gradient(135deg,#1a1200,#0E1420);border-bottom:1px solid rgba(255,193,7,0.2);">
                  <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:2px;color:#FFC107;">NEX<span style="color:#ffffff;">CART</span></p>
                </td>
              </tr>
              <tr>
                <td style="padding:36px 40px;">
                  <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#ffffff;">Welcome aboard, ${firstName}! 👋</p>
                  <p style="margin:0 0 20px;font-size:13px;color:#AAB4C5;line-height:1.7;">
                    Your NexCart account is now active and verified. Start exploring thousands of 
                    premium products with AI-powered recommendations, instant checkout, and exclusive deals.
                  </p>
                  <a href="${process.env.CLIENT_URL}/products" 
                     style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#FFC107,#FF8C00);color:#000;font-weight:800;font-size:13px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
                    Start Shopping →
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 40px 28px;border-top:1px solid rgba(255,255,255,0.06);">
                  <p style="margin:0;font-size:11px;color:#4A5568;font-family:monospace;">© 2026 NEXCART INC.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  return sendEmail({ to, subject, html });
};
