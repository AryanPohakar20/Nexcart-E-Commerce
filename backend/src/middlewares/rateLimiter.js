// src/middlewares/rateLimiter.js
// Express-rate-limit configuration.
// Two limiters: a general API limiter and a tighter auth-specific limiter.

import rateLimit from 'express-rate-limit';

/**
 * General API Rate Limiter
 * Applied to all routes — prevents abuse of non-auth endpoints.
 * 100 requests per 15-minute window per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,  // Sends RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in 15 minutes.',
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * Auth Route Rate Limiter
 * Applied specifically to /api/auth/* — prevents brute-force attacks.
 * 10 requests per 15-minute window per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts toward the limit
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});
