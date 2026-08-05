// src/routes/profileRoutes.js
// All profile routes are protected by the authenticate middleware.

import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getSettings,
  updateSettings,
} from '../controllers/profileController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';
import {
  validateProfileUpdate,
  validatePasswordChange,
  validateSettingsUpdate,
} from '../validations/profileValidation.js';

const router = Router();

// All routes below require a valid JWT
router.use(authenticate);

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get('/', getProfile);
router.put('/', validateProfileUpdate, updateProfile);

// ─── Avatar ───────────────────────────────────────────────────────────────────
// upload.single('avatar') parses the multipart body and attaches file to req.file
router.patch('/avatar', upload.single('avatar'), uploadAvatar);

// ─── Password ─────────────────────────────────────────────────────────────────
router.patch('/password', validatePasswordChange, changePassword);

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get('/settings', getSettings);
router.put('/settings', validateSettingsUpdate, updateSettings);

export default router;
