import { Router } from 'express';
import {
  createSeller,
  getSellerProfile,
  updateStep1,
  updateStep2,
  updateStep3,
  updateStep4,
  updateStep5,
  getSellerStatus,
} from '../controllers/sellerController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';
import {
  validateStep1,
  validateStep2,
  validateStep4,
} from '../validations/sellerValidation.js';

const router = Router();

// All seller routes require authentication
router.use(authenticate);

// ─── Seller Account ───────────────────────────────────────────────────────────
router.post('/create', createSeller);
router.get('/profile', getSellerProfile);
router.get('/status', getSellerStatus);
router.get('/verification-status', getSellerStatus);

// ─── Onboarding Steps ─────────────────────────────────────────────────────────
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

export default router;
