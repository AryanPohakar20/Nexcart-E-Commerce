import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import logger from '../utils/logger.js';

// Configure Cloudinary from process.env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload buffer stream to Cloudinary
 * @param {Buffer} buffer - File buffer from Multer memory storage
 * @param {String} folder - Target folder in Cloudinary
 * @param {String} resourceType - 'auto' | 'image' | 'raw' | 'video'
 * @returns {Promise<{url: String, publicId: String}>}
 */
export const uploadStreamToCloudinary = (buffer, folder = 'nexcart/chat', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          fileType: result.resource_type,
          fileName: result.original_filename || '',
          fileSize: result.bytes || 0,
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export default cloudinary;
