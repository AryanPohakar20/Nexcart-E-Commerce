import { uploadImage } from '../services/supabaseStorageService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { AppError } from '../middlewares/errorMiddleware.js';

/**
 * @route   POST /api/upload
 * @desc    Upload multiple files/images/attachments to Supabase
 * @access  Private (JWT Protected)
 */
export const uploadFiles = asyncHandler(async (req, res) => {
  const files = req.files || (req.file ? [req.file] : []);

  if (!files || files.length === 0) {
    throw new AppError('No files were provided for upload.', 400);
  }

  let folder = req.body.folder || 'misc';
  if (!req.body.folder) {
    if (req.body.categoryId) folder = `categories/${req.body.categoryId}`;
    else if (req.body.brandId) folder = `brands/${req.body.brandId}`;
    else if (req.body.conversationId) folder = `chat/${req.body.conversationId}`;
  }

  // Determine resource type: 'auto', 'raw', or 'image'
  const uploadPromises = files.map((file) => {
    return uploadImage(file.buffer, folder, file.originalname);
  });

  const uploadedResults = await Promise.all(uploadPromises);

  res.status(200).json({
    success: true,
    message: `${uploadedResults.length} file(s) uploaded successfully.`,
    data: uploadedResults,
  });
});
