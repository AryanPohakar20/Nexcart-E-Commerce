// src/middlewares/rateLimiter.js
// Express-rate-limit configuration.
// SECURITY: All limiters are now actively wired to routes (see routes/index.js and app.js).

import rateLimit from 'express-rate-limit';

/**
 * General API Rate Limiter
 * Applied globally to /api — prevents abuse of any endpoint.
 * 200 requests per 15-minute window per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true, // Sends RateLimit-* headers (RFC 6585)
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
 * Applied specifically to authentication endpoints — prevents brute-force attacks.
 * 10 requests per 15-minute window per IP. Only counts failed requests.
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

/**
 * Public API Rate Limiter
 * Applied to high-volume public endpoints (product listing, search, autocomplete).
 * 300 requests per 15-minute window per IP.
 */
export const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * Chat Rate Limiter
 * Prevents spamming message sends or offer submissions.
 * 120 requests per 1-minute window per IP.
 */
export const chatRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many chat requests. Please slow down.',
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});
