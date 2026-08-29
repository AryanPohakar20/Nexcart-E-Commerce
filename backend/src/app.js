import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { generalLimiter } from './middlewares/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// ─── Trust proxy (required for correct IP detection behind nginx/Vercel/etc.) ──
// SECURITY: Set to 1 (one level of trusted proxy). Do NOT set to true (trusts all).
app.set('trust proxy', 1);

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// SECURITY: localhost origins are only allowed in non-production environments.
// In production, only explicitly configured origins are permitted.
const productionOrigins = [
  process.env.CLIENT_URL,
  'https://nexcart-e-commerce.vercel.app',
].filter(Boolean);

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? productionOrigins
  : [
      ...productionOrigins,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In development allow any localhost port (e.g. Vite HMR on different ports)
      if (
        process.env.NODE_ENV !== 'production' &&
        (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))
      ) {
        return callback(null, true);
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);

// ─── General Request Middleware ───────────────────────────────────────────────
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Only log HTTP requests in development (avoids noisy production logs)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── Global Rate Limiter ───────────────────────────────────────────────────────
// SECURITY: Applied to all /api routes. Auth endpoints have a stricter limiter
// applied at the route level in routes/index.js.
app.use('/api', generalLimiter);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', apiRouter);
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
