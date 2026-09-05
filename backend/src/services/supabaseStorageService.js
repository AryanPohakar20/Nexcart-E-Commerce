import supabase from '../config/supabase.js';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import path from 'path';

const BUCKET_NAME = 'nexcart-images';
export const PRIVATE_BUCKET_NAME = 'nexcart-private';

/**
 * Helper to resolve MIME type from filename or extension or mime string.
 * @param {string} fileNameOrMime
 * @returns {string} MIME type string
 */
export const getMimeType = (fileNameOrMime = '') => {
  if (!fileNameOrMime) return 'application/octet-stream';
  if (fileNameOrMime.includes('/') && !fileNameOrMime.includes('.')) {
    return fileNameOrMime;
  }

  const ext = path.extname(fileNameOrMime).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.pdf':
      return 'application/pdf';
    case '.csv':
      return 'text/csv';
    case '.txt':
      return 'text/plain';
    case '.json':
      return 'application/json';
    case '.doc':
      return 'application/msword';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.xls':
      return 'application/vnd.ms-excel';
    case '.xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case '.mp3':
      return 'audio/mpeg';
    case '.mp4':
      return 'video/mp4';
    case '.wav':
      return 'audio/wav';
    case '.zip':
      return 'application/zip';
    default:
      return 'application/octet-stream';
  }
};

/**
 * Uploads a buffer directly to Supabase Storage.
 * @param {Buffer} buffer - The file buffer to upload.
 * @param {string} folder - The logical folder path (e.g., 'products/123').
 * @param {string} originalFileName - The original filename to extract extension.
 * @returns {Promise<{url: string, path: string}>}
 */
export const uploadImage = async (buffer, folder, originalFileName = 'upload.jpg') => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  if (!buffer) {
    throw new Error('No file buffer provided for upload.');
  }

  // SECURITY: Only allow a known-safe set of extensions for the storage path.
  // The filename itself is a server-generated UUID — client cannot influence it.
  // The extension is sanitized to prevent path traversal via crafted filenames.
  const SAFE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt']);
  const rawExt = path.extname(originalFileName).toLowerCase();
  const extension = SAFE_EXTENSIONS.has(rawExt) ? rawExt : '.bin';

  // Sanitize folder: strip any path traversal sequences and non-alphanumeric characters
  const safeFolder = String(folder)
    .replace(/\.\./g, '')       // Strip directory traversal
    .replace(/[^a-zA-Z0-9/_-]/g, '')  // Keep only safe path chars
    .replace(/\/+/g, '/');      // Collapse duplicate slashes

  const uniqueFileName = `${crypto.randomUUID()}${extension}`;
  const filePath = `${safeFolder}/${uniqueFileName}`.replace(/^\//, ''); // Remove leading slash

  const mimeType = getMimeType(originalFileName);

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: false
    });

  if (error) {
    logger.error(`Supabase upload error: ${error.message}`, error);
    if (error.message.includes('row-level security') || error.message.includes('RLS')) {
      throw new Error(`Failed to upload image: Row-Level Security (RLS) policy error. Please use a valid SUPABASE_SERVICE_ROLE_KEY in backend/.env or configure storage bucket policies in your Supabase Dashboard.`);
    }
    if (error.message.toLowerCase().includes('bucket not found')) {
      throw new Error(`Failed to upload image: Storage bucket '${BUCKET_NAME}' not found. Please create bucket '${BUCKET_NAME}' in your Supabase Dashboard.`);
    }
    throw new Error(`Failed to upload image to Supabase: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    url: publicUrlData.publicUrl,
    path: filePath
  };
};

/**
 * Deletes a file from Supabase Storage.
 * @param {string} filePath - The path of the file to delete (publicId equivalent).
 */
export const deleteImage = async (filePath) => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please check credentials.');
  }
  if (!filePath) return;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    logger.error(`Supabase delete error for ${filePath}: ${error.message}`, error);
    throw new Error(`Failed to delete image from Supabase: ${error.message}`);
  }

  return { success: true };
};

/**
 * Replaces an existing image by deleting it and uploading a new one.
 * @param {string} oldPath - The path of the file to delete.
 * @param {Buffer} newBuffer - The new file buffer.
 * @param {string} folder - The logical folder path.
 * @param {string} originalFileName - The original filename.
 */
export const replaceImage = async (oldPath, newBuffer, folder, originalFileName) => {
  if (oldPath) {
    try {
      await deleteImage(oldPath);
    } catch (err) {
      logger.warn(`Could not delete old image at ${oldPath} during replacement: ${err.message}`);
    }
  }
  return uploadImage(newBuffer, folder, originalFileName);
};

/**
 * Uploads a private document (e.g. Aadhaar) to a private Supabase Storage bucket.
 */
export const uploadPrivateDocument = async (buffer, folder, originalFileName = 'doc.pdf') => {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  if (!buffer) throw new Error('No file buffer provided for private upload.');

  const extension = path.extname(originalFileName) || '.pdf';
  const uniqueFileName = `${crypto.randomUUID()}${extension}`;
  const filePath = `${folder}/${uniqueFileName}`.replace(/\/+/g, '/');

  const mimeType = getMimeType(originalFileName);

  let bucketToUse = PRIVATE_BUCKET_NAME;
  let { error } = await supabase.storage
    .from(bucketToUse)
    .upload(filePath, buffer, { contentType: mimeType, upsert: false });

  // If private bucket is not found, fallback to main bucket
  if (error && error.message && error.message.toLowerCase().includes('bucket not found')) {
    logger.warn(`Supabase bucket '${PRIVATE_BUCKET_NAME}' not found. Falling back to '${BUCKET_NAME}'...`);
    bucketToUse = BUCKET_NAME;
    const fallback = await supabase.storage
      .from(bucketToUse)
      .upload(filePath, buffer, { contentType: mimeType, upsert: false });
    error = fallback.error;
  }

  if (error) {
    logger.error(`Supabase private upload error: ${error.message}`, error);
    if (error.message.includes('row-level security') || error.message.includes('RLS')) {
      throw new Error(`Failed to upload document: Row-Level Security (RLS) policy error. Please use a valid SUPABASE_SERVICE_ROLE_KEY in backend/.env or configure storage policies in your Supabase Dashboard.`);
    }
    if (error.message.toLowerCase().includes('bucket not found')) {
      throw new Error(`Failed to upload document: Neither bucket '${PRIVATE_BUCKET_NAME}' nor '${BUCKET_NAME}' was found in Supabase. Please create bucket '${PRIVATE_BUCKET_NAME}' in your Supabase Dashboard.`);
    }
    throw new Error(`Failed to upload private document: ${error.message}`);
  }

  // Return object with file path and privacy indicator
  return { path: filePath, bucket: bucketToUse, isPrivate: bucketToUse === PRIVATE_BUCKET_NAME };
};

export const deletePrivateDocument = async (filePath) => {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  if (!filePath) return;
  const { error } = await supabase.storage.from(PRIVATE_BUCKET_NAME).remove([filePath]);
  if (error) throw new Error(`Failed to delete private document: ${error.message}`);
  return { success: true };
};

export const replacePrivateDocument = async (oldPath, newBuffer, folder, originalFileName) => {
  if (oldPath) {
    try { await deletePrivateDocument(oldPath); } catch (err) { logger.warn(`Could not delete old doc: ${err.message}`); }
  }
  return uploadPrivateDocument(newBuffer, folder, originalFileName);
};

export const getSignedUrl = async (filePath, expiresIn = 3600) => {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  if (!filePath) return null;
  const { data, error } = await supabase.storage
    .from(PRIVATE_BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn);
    
  if (error) throw new Error(`Failed to generate signed URL: ${error.message}`);
  return data.signedUrl;
};

/**
 * Wrapper for chat attachments to maintain compatibility if needed.
 */
export const uploadStreamToSupabase = async (buffer, folder, resourceType, originalFileName) => {
  return uploadImage(buffer, folder, originalFileName || 'attachment.bin');
};
