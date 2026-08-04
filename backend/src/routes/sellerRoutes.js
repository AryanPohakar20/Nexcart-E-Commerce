import { Router } from 'express';
import {
  // ── Existing Onboarding ───────────────────────────────────────────────────
  createSeller,
  getSellerProfile,
  updateStep1,
  updateStep2,
  updateStep3,
  updateStep4,
  updateStep5,
  getSellerStatus,
  // ── Phase 2B Part 1: Dashboard / Profile / Settings ──────────────────────
  getDashboardProfile,
  updateSellerProfile,
  updateProfileImage,
  updateBanner,
  getPublicProfile,
  getSettings,
  updateSettings,
  changePassword,
  deactivateStore,
  deleteStore,
  getDashboardSummary,
} from '../controllers/sellerController.js';

import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { upload } from '../middlewares/upload.js';
import {
  validateStep1,
  validateStep2,
  validateStep4,
  validateProfileUpdate,
  validateSettingsUpdate,
  validatePasswordChange,
} from '../validations/sellerValidation.js';

const router = Router();

// ─── Public Routes (no authentication required) ───────────────────────────────
// Must be defined BEFORE the authenticate middleware below

router.get('/public/:slug', getPublicProfile);

// ─── All routes below require authentication ──────────────────────────────────

router.use(authenticate);

// ─── Seller Account (Onboarding — existing) ───────────────────────────────────
router.post('/create', createSeller);
router.get('/profile', getSellerProfile);
router.get('/status', getSellerStatus);
router.get('/verification-status', getSellerStatus);

// ─── Onboarding Steps (existing) ─────────────────────────────────────────────
router.put('/onboarding/step-1', validateStep1, updateStep1);
router.put('/onboarding/step-2', validateStep2, updateStep2);
router.put(
  '/onboarding/step-3',
  upload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 },
  ]),
  updateStep3
);
router.put('/onboarding/step-4', validateStep4, updateStep4);
router.put('/onboarding/step-5', updateStep5);

// ─── Dashboard Routes (Phase 2B Part 1) ──────────────────────────────────────
// All require seller or marketplace_seller role

// Profile
router.get('/dashboard/profile',    authorize('seller', 'marketplace_seller'), getDashboardProfile);
router.put('/dashboard/profile',    authorize('seller', 'marketplace_seller'), validateProfileUpdate, updateSellerProfile);
router.patch(
  '/dashboard/profile/image',
  authorize('seller', 'marketplace_seller'),
  upload.single('image'),
  updateProfileImage
);
router.patch(
  '/dashboard/profile/banner',
  authorize('seller', 'marketplace_seller'),
  upload.single('banner'),
  updateBanner
);

// Dashboard Summary
router.get('/dashboard/summary', authorize('seller', 'marketplace_seller'), getDashboardSummary);

// Settings
router.get('/dashboard/settings',           authorize('seller', 'marketplace_seller'), getSettings);
router.put('/dashboard/settings',           authorize('seller', 'marketplace_seller'), validateSettingsUpdate, updateSettings);
router.patch('/dashboard/settings/password', authorize('seller', 'marketplace_seller'), validatePasswordChange, changePassword);
router.patch('/dashboard/settings/deactivate', authorize('seller', 'marketplace_seller'), deactivateStore);
router.delete('/dashboard/settings/delete',    authorize('seller', 'marketplace_seller'), deleteStore);

export default router;
