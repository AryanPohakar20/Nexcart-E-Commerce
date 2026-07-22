// src/app.js
// Express application factory.
// Configures all global middleware and mounts the API router.
// Kept separate from server.js for clean testing (import app without starting server).

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import apiRouter from './routes/index.js';
import errorMiddleware, { notFoundHandler } from './middlewares/errorMiddleware.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import logger from './utils/logger.js';

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────

// Helmet sets various HTTP security headers
app.use(helmet());

// CORS — only allow requests from the configured CLIENT_URL
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.CLIENT_URL,
        'http://localhost:5173', // Vite dev server default
        'http://localhost:3000',
      ].filter(Boolean);

      // Allow requests with no origin (e.g., Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
      }
    },
    credentials: true, // Allow cookies to be sent cross-origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Request Parsing ──────────────────────────────────────────────────────────

app.use(express.json({ limit: '10kb' }));           // JSON body parser (limit prevents large payloads)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());                              // Parse Cookie header into req.cookies

// ─── HTTP Logging ─────────────────────────────────────────────────────────────

// Use Morgan with Winston stream in production; concise in development
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: { write: (message) => logger.http(message.trim()) },
    skip: (req) => req.url === '/api/health', // Skip health check spam in logs
  })
);

// ─── General Rate Limiting ────────────────────────────────────────────────────

app.use('/api', generalLimiter);

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api', apiRouter);

// ─── Root Endpoint (sanity check) ────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 NexCart API is running.',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
// Must come AFTER all route definitions

app.use(notFoundHandler);

// ─── Centralized Error Handler ────────────────────────────────────────────────
// Must be the LAST middleware registered (4 args signals Express it's an error handler)

app.use(errorMiddleware);

export default app;
