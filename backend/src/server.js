// src/server.js
// Application entry point.
// Loads environment variables, validates them, connects to MongoDB, then starts HTTP server.
// Also handles graceful shutdown on SIGTERM/SIGINT and uncaught exceptions.

import 'dotenv/config'; // Load .env variables FIRST, before any other imports
import validateEnv from './config/env.js';
import connectDB from './config/db.js';
import app from './app.js';
import logger from './utils/logger.js';

// ─── Validate Environment ─────────────────────────────────────────────────────
validateEnv();

const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB, then Start Server ────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 NexCart Backend running on http://localhost:${PORT}`);
      logger.info(`📌 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🩺 Health check: http://localhost:${PORT}/api/health`);
    });

    // ─── Graceful Shutdown ────────────────────────────────────────────────────
    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });

      // Force exit after 10 seconds if graceful shutdown hangs
      setTimeout(() => {
        logger.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

// ─── Handle Uncaught Exceptions ───────────────────────────────────────────────
// These indicate programming errors; log and exit so the process manager restarts cleanly.

process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`UNHANDLED REJECTION: ${reason}`);
  process.exit(1);
});

startServer();
