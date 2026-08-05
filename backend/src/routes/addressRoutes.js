// src/routes/addressRoutes.js
// All address routes are protected by the authenticate middleware.

import { Router } from 'express';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addressController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateAddress, validateAddressUpdate } from '../validations/addressValidation.js';

const router = Router();

// All routes below require a valid JWT
router.use(authenticate);

// ─── Address CRUD ──────────────────────────────────────────────────────────────
router.get('/', getAddresses);
router.post('/', validateAddress, createAddress);

// IMPORTANT: /default/:id must be declared BEFORE /:id to prevent Express
// from treating "default" as an address ObjectId parameter.
router.patch('/default/:id', setDefaultAddress);

router.put('/:id', validateAddressUpdate, updateAddress);
router.delete('/:id', deleteAddress);

export default router;
