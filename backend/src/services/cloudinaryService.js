import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import logger from '../utils/logger.js';

// ─── Generic Image Upload ─────────────────────────────────────────────────────

/**
 * Upload any image buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The memory buffer of the file.
 * @param {String} folder - The Cloudinary folder to upload into.
 * @param {Object} options - Additional Cloudinary upload options.
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export const uploadImage = (fileBuffer, folder = 'nexcart/misc', options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, ...options },
      (error, result) => {
        if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          if (process.env.NODE_ENV !== 'production') {
            logger.warn(`Cloudinary upload failed: ${error?.message || error}. Falling back to mock URL.`);
            resolve({
              secure_url: 'https://res.cloudinary.com/demo/image/upload/v1570979139/sample.jpg',
              public_id: `mock_${folder.replace('/', '_')}_${Date.now()}`,
            });
          } else {
            reject(error);
          }
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

/**
 * Delete an image from Cloudinary using its public_id.
 * @param {String} publicId - The Cloudinary public_id of the file.
 */
export const deleteImage = async (publicId) => {
  if (!publicId) return;
  if (publicId.startsWith('mock_')) {
    logger.info(`Bypassing deletion for mock public_id: ${publicId}`);
    return { result: 'ok' };
  }
  return await cloudinary.uploader.destroy(publicId);
};

/**
 * Replace an image (delete old + upload new).
 * @param {String} oldPublicId - The public_id of the old image (or null).
 * @param {Buffer} newFileBuffer - The memory buffer of the new file.
 * @param {String} folder - The Cloudinary folder.
 * @param {Object} options - Additional Cloudinary upload options.
 */
export const replaceImage = async (oldPublicId, newFileBuffer, folder = 'nexcart/misc', options = {}) => {
  if (oldPublicId) {
    await deleteImage(oldPublicId);
  }
  return await uploadImage(newFileBuffer, folder, options);
};


/**
 * Upload an image buffer to Cloudinary using streamifier.
 * @param {Buffer} fileBuffer - The memory buffer of the file.
 * @param {String} folder - The Cloudinary folder to upload into.
 * @returns {Promise<Object>} - Promise resolving to an object containing secure_url and public_id.
 */
export const uploadAadhaarImage = (fileBuffer, folder = 'nexcart/aadhaar') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
      },
      (error, result) => {
        if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          if (process.env.NODE_ENV !== 'production') {
            logger.warn(`Cloudinary upload failed: ${error?.message || error}. Falling back to mock URL for local development.`);
            resolve({
              secure_url: 'https://res.cloudinary.com/demo/image/upload/v1570979139/sample.jpg',
              public_id: `mock_aadhaar_${Date.now()}`,
            });
          } else {
            reject(error);
          }
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

/**
 * Delete an image from Cloudinary using its public_id.
 * @param {String} publicId - The Cloudinary public_id of the file.
 * @returns {Promise<Object>}
 */
export const deleteAadhaarImage = async (publicId) => {
  if (!publicId) return;
  if (publicId.startsWith('mock_')) {
    logger.info(`Bypassing deletion for mock public_id: ${publicId}`);
    return { result: 'ok' };
  }
  return await cloudinary.uploader.destroy(publicId);
};

/**
 * Replace an image in Cloudinary (deletes old, uploads new).
 * @param {String} oldPublicId - The Cloudinary public_id of the old file.
 * @param {Buffer} newFileBuffer - The memory buffer of the new file.
 * @param {String} folder - The Cloudinary folder to upload into.
 * @returns {Promise<Object>}
 */
export const replaceAadhaarImage = async (oldPublicId, newFileBuffer, folder = 'nexcart/aadhaar') => {
  if (oldPublicId) {
    await deleteAadhaarImage(oldPublicId);
  }
  return await uploadAadhaarImage(newFileBuffer, folder);
};

