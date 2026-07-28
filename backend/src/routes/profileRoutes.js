import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateProfileUpdate } from '../validators/profileValidator.js';

const router = express.Router();

// GET /api/profile -> Returns currently logged-in user profile
router.get('/', authenticate, getProfile);

// PATCH /api/profile -> Updates editable profile fields
router.patch('/', authenticate, validateProfileUpdate, updateProfile);

// PUT /api/profile -> Updates editable profile fields
router.put('/', authenticate, validateProfileUpdate, updateProfile);

export default router;
