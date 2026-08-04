import { Router } from 'express';
import sellerRoutes from './sellerRoutes.js';
import profileRoutes from './profileRoutes.js';
import addressRoutes from './addressRoutes.js';

import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  logoutSeller,
  registerSeller,
  loginSeller,
  getCurrentSeller,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/authController.js';
import { getPublicProfile } from '../controllers/sellerController.js';
import { validateRegistration, validateLogin } from '../validations/authValidation.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

// ─── Seller Auth Routes ───────────────────────────────────────────────────────
router.post('/seller/auth/register', validateRegistration, registerSeller);
router.post('/seller/auth/login', validateLogin, loginSeller);
router.post('/seller/auth/logout', logoutSeller);
router.get('/seller/auth/me', authenticate, getCurrentSeller);

// ─── Seller Onboarding & Dashboard Routes ────────────────────────────────────
router.use('/seller', sellerRoutes);

// ─── Public Seller Search / Discovery (no auth) ───────────────────────────────
// Accessible to customers and anonymous visitors
router.get('/search/seller/:slug', getPublicProfile);

// ─── General User Auth Routes ─────────────────────────────────────────────────
router.post('/auth/register', validateRegistration, registerUser);
router.post('/auth/login', validateLogin, loginUser);
router.get('/auth/me', authenticate, getCurrentUser);
router.post('/auth/logout', logoutUser);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/reset-password', resetPassword);

// ─── Customer Profile & Address Routes ───────────────────────────────────────
router.use('/profile', profileRoutes);
router.use('/address', addressRoutes);

export default router;
