import express from 'express';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/upload.js';
import { uploadFiles } from '../controllers/uploadController.js';

const router = express.Router();

// Upload route with auth protection and Multer array middleware (up to 5 files per request)
router.post('/', authenticateUser, upload.array('files', 5), uploadFiles);

export default router;
