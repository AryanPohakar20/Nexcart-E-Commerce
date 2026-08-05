// src/middlewares/importUpload.js
// Dedicated multer memory storage middleware for CSV and Excel files.

import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];

  const ext = file.originalname.toLowerCase();
  if (
    allowedMimeTypes.includes(file.mimetype) ||
    ext.endsWith('.csv') ||
    ext.endsWith('.xlsx') ||
    ext.endsWith('.xls')
  ) {
    cb(null, true);
  } else {
    cb(
      new ApiError(400, 'Unsupported file format. Please upload a .csv, .xlsx, or .xls file.'),
      false
    );
  }
};

export const importUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max file size
  },
});
