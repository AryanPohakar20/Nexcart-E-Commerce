const REQUIRED_VARS = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_SECRET',   // Required — separate secret for refresh tokens
  'CLIENT_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `\nMissing required environment variables:\n   ${missing.join('\n   ')}\n\n` +
        '   Please copy .env.example to .env and fill in all values.\n'
    );
    process.exit(1);
  }

  if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    console.warn(
      '\nEMAIL / EMAIL_PASSWORD not set in .env - transactional emails will log to console in dev mode.\n'
    );
  }

  if (!process.env.APPLE_CLIENT_ID) {
    console.warn(
      '\nAPPLE_CLIENT_ID not set in .env - Apple Sign-In will be unavailable.\n'
    );
  }

  if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.warn(
      '\nSUPABASE credentials not fully set in .env - document uploads will return mock URLs in dev mode.\n'
    );
  }
};

export default validateEnv;
