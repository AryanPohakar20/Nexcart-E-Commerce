import express from 'express';
import {
  registerSeller,
  loginSeller,
  getCurrentSeller,
  logoutSeller,
} from '../controllers/authController.js';
import { validateRegistration, validateLogin } from '../validations/authValidation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.post('/register', validateRegistration, registerSeller);
router.post('/login', validateLogin, loginSeller);
router.post('/logout', logoutSeller);
router.get('/me', authenticate, authorize('seller'), getCurrentSeller);

export default router;
