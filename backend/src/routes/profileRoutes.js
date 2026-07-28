import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateProfileUpdate } from '../validations/profileValidation.js';

const router = express.Router();

router.get('/', authenticate, getProfile);
router.patch('/', authenticate, validateProfileUpdate, updateProfile);

export default router;
