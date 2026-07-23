// src/routes/sellerRoutes.js

import { Router } from 'express';
import * as sellerController from '../controllers/sellerController.js';
import * as authController from '../controllers/authController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = Router();

// Public Routes
router.post('/register', sellerController.register);
router.post('/login', sellerController.login);
router.post('/logout', authController.logout); // Reuse auth logout

router.post('/send-otp', authController.forgotPassword); // Reuse OTP send
router.post('/verify-email', authController.verifyOtp); // Reuse OTP verify

// Protected Routes (Needs JWT)
router.use(authenticateUser);

router.get('/profile', sellerController.getProfile);
router.patch('/profile', sellerController.updateProfile);

router.post('/upload-document', sellerController.uploadIdentity);
router.post('/payment-details', sellerController.submitPayment);
router.post('/agree-terms', sellerController.agreeTerms);

router.get('/verification-status', sellerController.getStatus);

export default router;
