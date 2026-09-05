import express from 'express';
import {
  registerSeller,
  loginSeller,
  getCurrentSeller,
  logoutSeller,
  loginWithGoogle,
  loginWithApple
} from '../controllers/authController.js';
import { validateRegistration, validateLogin } from '../validations/authValidation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/register',      authLimiter, validateRegistration, registerSeller);
router.post('/login',         authLimiter, validateLogin,        loginSeller);
router.post('/login/google',  authLimiter, loginWithGoogle);
router.post('/login/apple',   authLimiter, loginWithApple);
router.post('/logout',        logoutSeller);
router.get( '/me',            authenticate, authorize('seller'), getCurrentSeller);

export default router;
