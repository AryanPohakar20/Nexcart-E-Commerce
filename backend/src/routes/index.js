import { Router } from 'express';
import authRoutes from './authRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import cartRoutes from './cartRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
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

// ─── Phase 1B Standard Spec Routes ───────────────────────────────────────────
router.use('/seller/auth', authRoutes);
router.use('/seller/upload-aadhaar', uploadRoutes);

// ─── Cart, Wishlist, and Product Catalog Routes ──────────────────────────────
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/products', productRoutes);

// ─── Frontend Integration Routes ─────────────────────────────────────────────
router.post('/seller/register', validateRegistration, registerSeller);
router.post('/seller/login', validateLogin, loginSeller);
router.get('/seller/profile', authenticate, authorize('seller'), getCurrentSeller);
router.patch('/seller/profile', authenticate, authorize('seller'), async (req, res, next) => {
  try {
    const user = req.user;
    if (req.body.displayName) {
      user.businessName = req.body.displayName;
    }
    if (req.body.bio) {
      user.description = req.body.bio;
    }
    if (req.body.address) {
      if (req.body.address.pickupAddress) user.address = req.body.address.pickupAddress;
      if (req.body.address.city) user.city = req.body.address.city;
      if (req.body.address.state) user.state = req.body.address.state;
      if (req.body.address.pincode) user.pincode = req.body.address.pincode;
    }
    if (req.body.country) user.country = req.body.country;
    if (req.body.businessType) user.businessType = req.body.businessType;
    if (req.body.gstNumber) user.gstNumber = req.body.gstNumber;

    if (process.env.MOCK_DB !== 'true') {
      await user.save();
    }
    
    console.log(`[INFO] Onboarding patch profile update for user: ${user.email}`);
    console.log(`[INFO] Update details:`, req.body);

    res.status(200).json({
      success: true,
      message: 'Profile details saved successfully',
      user,
    });
  } catch (err) {
    console.error(`[ERROR] Profile update failed:`, err);
    next(err);
  }
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
