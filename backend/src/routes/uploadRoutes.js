import express from 'express';
import { uploadAadhaar } from '../controllers/uploadController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize('seller'),
  upload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 },
  ]),
  uploadAadhaar
);

export default router;
