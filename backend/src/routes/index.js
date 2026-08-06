import { Router } from 'express';
import authRoutes from './authRoutes.js';
import uploadRoutes from './uploadRoutes.js';
<<<<<<< HEAD
=======
<<<<<<< HEAD
import notificationRoutes from '../notifications/routes/notificationRoutes.js';
=======
>>>>>>> e8d0900ced9bf7a4719054ff92c4de298e6e9b9c
import sellerRoutes from './sellerRoutes.js';
import profileRoutes from './profileRoutes.js';
import addressRoutes from './addressRoutes.js';
import adminRoutes from './adminRoutes.js';
<<<<<<< HEAD
=======
>>>>>>> 059c255642e76f5ef48c7f7de605a736d8915c9b
>>>>>>> e8d0900ced9bf7a4719054ff92c4de298e6e9b9c

import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  registerSeller,
  loginSeller,
  logoutSeller,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/authController.js';
import { getPublicProfile, updateStep3, updateStep4, updateStep5, getSellerStatus } from '../controllers/sellerController.js';
import { validateRegistration, validateLogin } from '../validations/authValidation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.use('/seller/auth', authRoutes);
router.use('/seller/upload-aadhaar', uploadRoutes);

router.post('/seller/register', validateRegistration, registerSeller);
router.post('/seller/login', validateLogin, loginSeller);
router.post('/seller/logout', logoutSeller);

router.post(
  '/seller/upload-document',
  authenticate,
  authorize('seller', 'marketplace_seller'),
  upload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 },
  ]),
  updateStep3
);
router.post('/seller/payment-details', authenticate, authorize('seller', 'marketplace_seller'), updateStep4);
router.post('/seller/agree-terms', authenticate, authorize('seller', 'marketplace_seller'), updateStep5);
router.get('/seller/verification-status', authenticate, authorize('seller', 'marketplace_seller'), getSellerStatus);

router.use('/seller', sellerRoutes);
router.get('/search/seller/:slug', getPublicProfile);

router.post('/auth/register', validateRegistration, registerUser);
router.post('/auth/login', validateLogin, loginUser);
router.get('/auth/me', authenticate, getCurrentUser);
router.post('/auth/logout', logoutUser);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/reset-password', resetPassword);

router.use('/profile', profileRoutes);
router.use('/address', addressRoutes);
router.use('/admin', adminRoutes);

export default router;
