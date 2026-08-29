import { Router } from 'express';
import authRoutes from './authRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import chatRoutes from './chatRoutes.js';
import sellerRoutes from './sellerRoutes.js';
import profileRoutes from './profileRoutes.js';
import addressRoutes from './addressRoutes.js';
import adminRoutes from './adminRoutes.js';
import orderRoutes from './orderRoutes.js';
import sellerOrderRoutes from './sellerOrderRoutes.js';

import marketplaceRoutes from './marketplaceRoutes.js';
import productRoutes from './productRoutes.js';
import searchRoutes from './searchRoutes.js';
import searchHistoryRoutes from './searchHistoryRoutes.js';
import productReviewRoutes from './productReviewRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import sellerReviewRoutes from './sellerReviewRoutes.js';
import brandRoutes from './brandRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import subcategoryRoutes from './subcategoryRoutes.js';
import attributeRoutes from './attributeRoutes.js';

import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  registerSeller,
  loginSeller,
  logoutSeller,
  forgotPassword,
  resetPassword,
  loginWithGoogle,
  loginWithApple,
  refreshAccessToken,
} from '../controllers/authController.js';
import { getPublicProfile, updateStep3, updateStep4, updateStep5, getSellerStatus, getSellerReputation } from '../controllers/sellerController.js';
import { validateRegistration, validateLogin } from '../validations/authValidation.js';
import { validateGetSellerReputation } from '../validations/sellerValidation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize }    from '../middlewares/authorize.js';
import { upload }       from '../middlewares/upload.js';
import { authLimiter, publicApiLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// ─── Messenger & Upload Routes ────────────────────────────────────────────────
router.use('/chat', chatRoutes);
router.use('/upload', uploadRoutes);

router.use('/seller/auth', authRoutes);
router.use('/seller/upload-aadhaar', uploadRoutes);

// ─── Seller Auth Routes (rate limited) ────────────────────────────────────────
router.post('/seller/register', authLimiter, validateRegistration, registerSeller);
router.post('/seller/login',    authLimiter, validateLogin,        loginSeller);
router.post('/seller/logout',   logoutSeller);

router.post(
  '/seller/upload-document',
  authenticate,
  authorize('seller', 'marketplace_seller'),
  upload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage',  maxCount: 1 },
  ]),
  updateStep3
);
router.post('/seller/payment-details', authenticate, authorize('seller', 'marketplace_seller'), updateStep4);
router.post('/seller/agree-terms',     authenticate, authorize('seller', 'marketplace_seller'), updateStep5);
router.get( '/seller/verification-status', authenticate, authorize('seller', 'marketplace_seller'), getSellerStatus);

router.use('/seller', sellerRoutes);
router.get('/search/seller/:slug', getPublicProfile);

// ─── Customer Auth Routes (rate limited) ──────────────────────────────────────
router.post('/auth/register',       authLimiter, validateRegistration, registerUser);
router.post('/auth/login',          authLimiter, validateLogin,        loginUser);
router.post('/auth/login/google',   authLimiter, loginWithGoogle);
router.post('/auth/login/apple',    authLimiter, loginWithApple);
router.post('/auth/refresh',        authLimiter, refreshAccessToken);   // Token rotation endpoint
router.get( '/auth/me',             authenticate, getCurrentUser);
router.post('/auth/logout',         logoutUser);
router.post('/auth/forgot-password', authLimiter, forgotPassword);
router.post('/auth/reset-password',  authLimiter, resetPassword);

router.use('/profile',  profileRoutes);
router.use('/address',  addressRoutes);
router.use('/admin',    adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/orders',   orderRoutes);
router.use('/seller/orders', sellerOrderRoutes);

// ─── Marketplace / Public Routes (general rate limiting from app.js) ──────────
// NOTE: /search/history MUST be mounted before /search to avoid prefix interception.
router.use('/search/history', searchHistoryRoutes);
router.use('/search',         publicApiLimiter, searchRoutes);
router.use('/marketplace',    marketplaceRoutes);
router.use('/products',       publicApiLimiter, productRoutes);
router.use('/brands',         brandRoutes);
router.use('/categories',     categoryRoutes);
router.use('/subcategories',  subcategoryRoutes);
router.use('/attributes',     attributeRoutes);

router.use('/product-reviews', productReviewRoutes);
router.use('/reviews',         productReviewRoutes);
router.use('/seller-reviews',  sellerReviewRoutes);
router.use('/sellers',         sellerReviewRoutes);

router.get('/sellers/:sellerId/reputation', validateGetSellerReputation, getSellerReputation);

export default router;
