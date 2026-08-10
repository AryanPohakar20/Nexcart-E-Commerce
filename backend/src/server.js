// src/server.js
// Application entry point.
// Loads environment variables, validates them, connects to MongoDB, attaches Socket.IO, then starts HTTP server.
// Also handles graceful shutdown on SIGTERM/SIGINT and uncaught exceptions.

import 'dotenv/config'; // Load .env variables FIRST, before any other imports
import http from 'http';
import validateEnv from './config/env.js';
import connectDB from './config/db.js';
import app from './app.js';
import { initSocketServer } from './sockets/chatSocket.js';
import logger from './utils/logger.js';

// ─── Validate Environment ─────────────────────────────────────────────────────
validateEnv();

const PORT = process.env.PORT || 5000;

// Allowed CORS origins for HTTP & Socket.IO
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

// ─── Connect to MongoDB, then Start HTTP & Socket.IO Server ───────────────────
const startServer = async () => {
  try {
    await connectDB();

    // Create HTTP Server from Express App
    const httpServer = http.createServer(app);

    // Initialize Real-Time Socket.IO Server
    const io = initSocketServer(httpServer, allowedOrigins);
    app.set('io', io);

    const server = httpServer.listen(PORT, () => {
      logger.info(`🚀 NexCart Messenger Backend running on http://localhost:${PORT}`);
      logger.info(`⚡ Socket.IO real-time engine initialized`);
      logger.info(`📌 Environment: ${process.env.NODE_ENV}`);
    });

    // ─── Graceful Shutdown ────────────────────────────────────────────────────
    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP & Socket.IO server closed.');
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
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`UNHANDLED REJECTION: ${reason}`);
  process.exit(1);
});

startServer();
