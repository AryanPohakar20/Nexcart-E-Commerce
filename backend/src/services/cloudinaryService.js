import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import logger from '../utils/logger.js';

const getMockImage = (prefix) => ({
  secure_url: 'https://res.cloudinary.com/demo/image/upload/v1570979139/sample.jpg',
  public_id: `mock_${prefix}_${Date.now()}`,
});

export const uploadImage = (fileBuffer, folder = 'nexcart/misc', options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, ...options },
      (error, result) => {
        if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
          return;
        }

        if (process.env.NODE_ENV !== 'production') {
          logger.warn(`Cloudinary upload failed: ${error?.message || error}. Falling back to mock URL.`);
          resolve(getMockImage(folder.replace(/[\\/]/g, '_')));
          return;
        }

        reject(error);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });

export const deleteImage = async (publicId) => {
  if (!publicId) return;
  if (publicId.startsWith('mock_')) {
    logger.info(`Bypassing deletion for mock public_id: ${publicId}`);
    return { result: 'ok' };
  }
  return cloudinary.uploader.destroy(publicId);
};

export const replaceImage = async (oldPublicId, newFileBuffer, folder = 'nexcart/misc', options = {}) => {
  if (oldPublicId) {
    await deleteImage(oldPublicId);
  }

  return uploadImage(newFileBuffer, folder, options);
};

export const uploadAadhaarImage = (fileBuffer, folder = 'nexcart/aadhaar') => {
  const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'mock_cloud';

  if (!isCloudinaryConfigured && process.env.NODE_ENV !== 'production') {
    return Promise.resolve(getMockImage('aadhaar'));
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (result) {
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
        return;
      }

      if (process.env.NODE_ENV !== 'production') {
        logger.warn(
          `Cloudinary upload failed: ${error?.message || error}. Falling back to mock URL for local development.`
        );
        resolve(getMockImage('aadhaar'));
        return;
      }

      reject(error);
    });

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const deleteAadhaarImage = async (publicId) => {
  if (!publicId) return;
  if (publicId.startsWith('mock_')) {
    logger.info(`Bypassing deletion for mock public_id: ${publicId}`);
    return { result: 'ok' };
  }
  return cloudinary.uploader.destroy(publicId);
};

export const replaceAadhaarImage = async (oldPublicId, newFileBuffer, folder = 'nexcart/aadhaar') => {
  if (oldPublicId) {
    await deleteAadhaarImage(oldPublicId);
  }

  return uploadAadhaarImage(newFileBuffer, folder);
};
