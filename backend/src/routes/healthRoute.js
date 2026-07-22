// src/routes/healthRoute.js
// Simple health-check endpoint for monitoring, load balancer probes, and uptime checks.

import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * GET /api/health
 * Returns server status and MongoDB connection state.
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;

  // Mongoose readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }[dbState] || 'unknown';

  const healthy = dbState === 1;

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    status: healthy ? 'ok' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: dbStatus,
    version: '1.0.0',
  });
});

export default router;
