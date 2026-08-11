import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import logger from '../utils/logger.js';

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
        reject(error || new Error('Cloudinary upload failed with no error object'));
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });

export const deleteImage = async (publicId) => {
  if (!publicId) return;
  return cloudinary.uploader.destroy(publicId);
};

export const replaceImage = async (oldPublicId, newFileBuffer, folder = 'nexcart/misc', options = {}) => {
  if (oldPublicId) {
    await deleteImage(oldPublicId);
  }
  return uploadImage(newFileBuffer, folder, options);
};

export const uploadAadhaarImage = (fileBuffer, folder = 'nexcart/aadhaar') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (result) {
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
        return;
      }
      reject(error || new Error('Cloudinary upload failed with no error object'));
    });
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const deleteAadhaarImage = async (publicId) => {
  if (!publicId) return;
  return cloudinary.uploader.destroy(publicId);
};

export const replaceAadhaarImage = async (oldPublicId, newFileBuffer, folder = 'nexcart/aadhaar') => {
  if (oldPublicId) {
    await deleteAadhaarImage(oldPublicId);
  }
  return uploadAadhaarImage(newFileBuffer, folder);
};
