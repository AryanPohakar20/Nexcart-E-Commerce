import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

/**
 * Upload an image buffer to Cloudinary using streamifier.
 * @param {Buffer} fileBuffer - The memory buffer of the file.
 * @param {String} folder - The Cloudinary folder to upload into.
 * @returns {Promise<Object>} - Promise resolving to an object containing secure_url and public_id.
 */
export const uploadAadhaarImage = (fileBuffer, folder = 'nexcart/aadhaar') => {
  const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'mock_cloud';

  if (!isCloudinaryConfigured) {
    return Promise.resolve({
      secure_url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg',
      public_id: `mock_aadhaar_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    });
  }

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
          reject(error);
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
  if (!publicId || publicId.startsWith('mock_')) return;
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
