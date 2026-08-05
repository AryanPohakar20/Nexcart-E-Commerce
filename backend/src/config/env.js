const REQUIRED_VARS = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'CLIENT_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
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

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.warn(
      '\nCLOUDINARY credentials not fully set in .env - document uploads will return mock URLs in dev mode.\n'
    );
  }
};

export default validateEnv;
