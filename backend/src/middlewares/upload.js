import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

// Memory storage keeps the file in memory as Buffer
const storage = multer.memoryStorage();

// File filter for allowed extensions
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(400, 'Unsupported file format. Allowed formats: JPEG, PNG, WEBP'),
      false
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});
