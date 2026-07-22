// src/routes/authRoutes.js
// All authentication API routes.
// Validators run before controllers. Protected routes use authenticateUser middleware.

import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyOtpValidator,
  resetPasswordValidator,
} from '../validators/authValidators.js';

const router = Router();

// Apply auth-specific rate limiter to all routes in this file
router.use(authLimiter);

// ─── Public Routes ────────────────────────────────────────────────────────────

/**
 * @route  POST /api/auth/register
 * @desc   Register a new Customer account
 * @access Public
 */
router.post('/register', registerValidator, authController.register);

/**
 * @route  POST /api/auth/login
 * @desc   Authenticate user and issue JWT tokens
 * @access Public
 */
router.post('/login', loginValidator, authController.login);

/**
 * @route  POST /api/auth/refresh
 * @desc   Exchange a valid refresh token for a new access token
 * @access Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route  POST /api/auth/forgot-password
 * @desc   Send OTP to the user's email for password reset
 * @access Public
 */
router.post('/forgot-password', forgotPasswordValidator, authController.forgotPassword);

/**
 * @route  POST /api/auth/verify-otp
 * @desc   Verify OTP for email verification or password reset
 * @access Public
 * @body   { email, otp, purpose: 'emailVerification' | 'passwordReset' }
 */
router.post('/verify-otp', verifyOtpValidator, authController.verifyOtp);

/**
 * @route  POST /api/auth/reset-password
 * @desc   Reset password after OTP verification
 * @access Public
 */
router.post('/reset-password', resetPasswordValidator, authController.resetPassword);

// ─── Protected Routes (Require Valid JWT) ─────────────────────────────────────

/**
 * @route  GET /api/auth/me
 * @desc   Get the currently authenticated user's profile
 * @access Protected
 */
router.get('/me', authenticateUser, authController.getMe);

/**
 * @route  POST /api/auth/logout
 * @desc   Invalidate session and clear refresh token
 * @access Protected
 */
router.post('/logout', authenticateUser, authController.logout);

export default router;
