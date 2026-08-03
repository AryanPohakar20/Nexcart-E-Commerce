import { Router } from 'express';
import authRoutes from './authRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import subcategoryRoutes from './subcategoryRoutes.js';
import attributeRoutes from './attributeRoutes.js';
import brandRoutes from './brandRoutes.js';
import searchRoutes from './searchRoutes.js';
import searchHistoryRoutes from './searchHistoryRoutes.js';
import productRoutes from './productRoutes.js';

// Import controllers and middlewares directly to map legacy/frontend routes
import {
  registerSeller,
  loginSeller,
  getCurrentSeller,
  logoutSeller,
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/authController.js';
import { uploadAadhaar } from '../controllers/uploadController.js';
import { validateRegistration, validateLogin } from '../validations/authValidation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// ─── Phase 3 Marketplace Routes ──────────────────────────────────────────────
router.use('/categories', categoryRoutes);
router.use('/subcategories', subcategoryRoutes);
router.use('/attributes', attributeRoutes);
router.use('/brands', brandRoutes);
router.use('/search/history', searchHistoryRoutes);
router.use('/search', searchRoutes);
router.use('/products', productRoutes);

// ─── Phase 1B Standard Spec Routes ───────────────────────────────────────────
router.use('/seller/auth', authRoutes);
router.use('/seller/upload-aadhaar', uploadRoutes);

// ─── Frontend Integration Routes ─────────────────────────────────────────────
router.post('/seller/register', validateRegistration, registerSeller);
router.post('/seller/login', validateLogin, loginSeller);
router.get('/seller/profile', authenticate, authorize('seller'), getCurrentSeller);
router.patch('/seller/profile', authenticate, authorize('seller'), (req, res) => {
  // Safe mock endpoint for Step 2 Profile onboarding
  res.status(200).json({
    success: true,
    message: 'Profile details saved successfully',
    user: req.user,
  });
});
router.post(
  '/seller/upload-document',
  authenticate,
  authorize('seller'),
  upload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 },
  ]),
  uploadAadhaar
);
router.post('/seller/logout', logoutSeller);

// General User Auth Routes
router.post('/auth/register', validateRegistration, registerUser);
router.post('/auth/login', validateLogin, loginUser);
router.get('/auth/me', authenticate, getCurrentUser);
router.post('/auth/logout', logoutSeller);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/reset-password', resetPassword);

// Step 4 & 5 Mock Endpoints for onboarding completion
router.post('/seller/payment-details', authenticate, authorize('seller'), (req, res) => {
  res.status(200).json({ success: true, message: 'Payment details stored' });
});
router.post('/seller/agree-terms', authenticate, authorize('seller'), (req, res) => {
  res.status(200).json({ success: true, message: 'Terms agreed' });
});
router.get('/seller/verification-status', authenticate, authorize('seller'), (req, res) => {
  res.status(200).json({ success: true, isVerified: req.user.isVerified });
});

export default router;
