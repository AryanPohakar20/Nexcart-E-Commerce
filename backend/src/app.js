import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoose from 'mongoose';

import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
      } else {
        callback(null, allowedOrigins);
      }
    },
    credentials: true,
  })
);

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// API Routes
app.use('/api', apiRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date(),
  });
});

// 404 Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
