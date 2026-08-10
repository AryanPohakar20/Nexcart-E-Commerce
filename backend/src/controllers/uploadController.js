import { uploadStreamToCloudinary } from '../config/cloudinary.js';
import asyncHandler from '../utils/asyncHandler.js';
import { AppError } from '../middlewares/errorMiddleware.js';

/**
 * @route   POST /api/upload
 * @desc    Upload multiple files/images/attachments to Cloudinary
 * @access  Private (JWT Protected)
 */
export const uploadFiles = asyncHandler(async (req, res) => {
  const files = req.files || (req.file ? [req.file] : []);

  if (!files || files.length === 0) {
    throw new AppError('No files were provided for upload.', 400);
  }

  // Determine resource type: 'auto', 'raw', or 'image'
  const uploadPromises = files.map((file) => {
    const isImage = file.mimetype.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';
    return uploadStreamToCloudinary(file.buffer, 'nexcart/chat', resourceType);
  });

  const uploadedResults = await Promise.all(uploadPromises);

  res.status(200).json({
    success: true,
    message: `${uploadedResults.length} file(s) uploaded successfully.`,
    data: uploadedResults,
  });
});
