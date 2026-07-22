// src/config/env.js
// Validates that all required environment variables are present before
// the server starts. Exits immediately if any required variable is missing.

const REQUIRED_VARS = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ACCESS_TOKEN_EXPIRE',
  'REFRESH_TOKEN_EXPIRE',
  'CLIENT_URL',
];

/**
 * Call this once at server startup (before app is initialized).
 * Throws a descriptive error listing every missing variable.
 */
const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `\n❌ Missing required environment variables:\n   ${missing.join('\n   ')}\n\n` +
      `   Please copy .env.example to .env and fill in all values.\n`
    );
    process.exit(1);
  }

  // Warn (but don't exit) if email is not configured — OTP flow will be disabled
  if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    console.warn(
      '\n⚠️  EMAIL / EMAIL_PASSWORD not set — OTP email delivery will be disabled.\n' +
      '   Set these in .env to enable forgot-password email flows.\n'
    );
  }
};

export default validateEnv;
