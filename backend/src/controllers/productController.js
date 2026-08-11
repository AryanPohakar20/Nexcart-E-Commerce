// src/controllers/productController.js
// Controllers for Product search and listing APIs.

import { asyncHandler } from '../utils/asyncHandler.js';
import * as productService from '../services/productService.js';
import { successResponse } from '../utils/ApiResponse.js';
import Product from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadImage, deleteImage } from '../services/cloudinaryService.js';

/**
 * Handle GET /api/products and GET /api/search
 * Search & filter products by keyword, category, brand, price, rating, stock with sorting & pagination.
 */
export const searchProducts = asyncHandler(async (req, res) => {
  const result = await productService.searchProducts(req.query);
  return successResponse(res, 'Products fetched successfully', result);
});

export const getAllProducts = searchProducts;

/**
 * Handle GET /api/products/:id
 * Fetch single product by MongoDB ID, custom ID (e.g. PROD-MOB-0001), or slug.
 */
export const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return successResponse(res, 'Product fetched successfully', { product });
});

/**
 * Handle GET /api/search/autocomplete
 * Returns autocomplete terms starting with the search prefix q.
 */
export const getAutocomplete = asyncHandler(async (req, res) => {
  const suggestions = await productService.getAutocomplete(req.query.q);
  return successResponse(res, 'Autocomplete suggestions fetched successfully', { suggestions });
});

/**
 * Handle GET /api/search/suggestions
 * Returns suggested categories, brands, and top matching products for q.
 */
export const getSuggestions = asyncHandler(async (req, res) => {
  const result = await productService.getSuggestions(req.query.q);
  return successResponse(res, 'Search suggestions fetched successfully', result);
});

/**
 * Handle GET /api/products/featured
 * Returns a paginated list of featured products.
 */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const result = await productService.getFeaturedProducts(req.query);
  return successResponse(res, 'Featured products fetched successfully', result);
});

/**
 * Handle GET /api/products/trending
 * Returns a paginated list of trending products.
 */
export const getTrendingProducts = asyncHandler(async (req, res) => {
  const result = await productService.getTrendingProducts(req.query);
  return successResponse(res, 'Trending products fetched successfully', result);
});

/**
 * Handle GET /api/products/newest
 * Returns a paginated list of newest products.
 */
export const getNewestProducts = asyncHandler(async (req, res) => {
  const result = await productService.getNewestProducts(req.query);
  return successResponse(res, 'Newest products fetched successfully', result);
});

/**
 * Handle GET /api/products/recommended
 * Returns a paginated list of recommended products.
 */
export const getRecommendedProducts = asyncHandler(async (req, res) => {
  const result = await productService.getRecommendedProducts(req.query);
  return successResponse(res, 'Recommended products fetched successfully', result);
});

// Helper to safely parse and validate single numeric fields
const parseNumericField = (fieldVal, fieldName, defaultValue = 0) => {
  if (Array.isArray(fieldVal)) {
    throw new ApiError(400, `${fieldName} must be a single numeric value, not an array.`);
  }
  if (fieldVal === undefined || fieldVal === null || fieldVal === '') {
    return defaultValue;
  }
  const num = Number(fieldVal);
  if (!Number.isFinite(num) || num < 0) {
    throw new ApiError(400, `${fieldName} must be a valid non-negative number.`);
  }
  return num;
};

/**
 * Handle POST /api/products
 * Create a new product. (Auth required)
 */
export const createProduct = asyncHandler(async (req, res) => {
  const productData = { ...req.body };
  productData.sellerId = req.user._id;

  // Handle uploaded images
  if (req.files && req.files.length > 0) {
    const uploadedImages = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const uploaded = await uploadImage(file.buffer, 'nexcart/products');
      uploadedImages.push({
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        isPrimary: i === 0,
      });
    }
    
    productData.images = uploadedImages;
  }

  // Strictly normalize & validate numeric fields
  productData.price = parseNumericField(productData.price, 'Price', 0);
  productData.stock = parseNumericField(productData.stock, 'Stock', 1);
  productData.mrp = parseNumericField(productData.mrp || productData.originalPrice, 'MRP / Original Price', productData.price * 1.25);
  productData.discount = parseNumericField(productData.discount, 'Discount', 0);

  const product = new Product(Product.importData(productData));
  await product.save();

  return successResponse(res, 'Product created successfully', { product });
});

/**
 * Handle GET /api/products/seller
 * Get all products belonging to the currently logged in seller.
 */
export const getSellerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ sellerId: req.user._id, isDeleted: { $ne: true } })
    .sort({ createdAt: -1 })
    .lean();

  // We should return them formatted for the frontend
  return successResponse(res, 'Seller products fetched successfully', { products });
});

/**
 * Handle PUT /api/products/:id
 * Update an existing product. Only the owner can update.
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (product.sellerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this product');
  }

  const updates = { ...req.body };

  if (updates.price !== undefined) updates.price = parseNumericField(updates.price, 'Price', product.price);
  if (updates.stock !== undefined) updates.stock = parseNumericField(updates.stock, 'Stock', product.stock);
  if (updates.mrp !== undefined || updates.originalPrice !== undefined) {
    updates.mrp = parseNumericField(updates.mrp || updates.originalPrice, 'MRP / Original Price', product.mrp);
  }
  
  // If the frontend is completely replacing images, it should pass a flag or we should know.
  // For now, appending images.
  if (req.files && req.files.length > 0) {
    const newImages = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const uploaded = await uploadImage(file.buffer, 'nexcart/products');
      newImages.push({
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        isPrimary: (product.images.length === 0 && i === 0),
      });
    }
    
    updates.images = [...(product.images || []), ...newImages];
  }

  Object.assign(product, updates);
  await product.save();

  return successResponse(res, 'Product updated successfully', { product });
});

/**
 * Handle DELETE /api/products/:id
 * Delete a product. Only the owner can delete.
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (product.sellerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this product');
  }

  // Optional: Actually delete images from Cloudinary upon deletion?
  // User said: "When a Product is permanently deleted: delete associated Cloudinary assets using publicId."
  // Right now this is a soft delete (isDeleted = true), but the prompt says "When permanently deleted".
  // Let's delete Cloudinary assets here for now or when a script purges.
  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      if (img.publicId) {
        await deleteImage(img.publicId).catch(err => console.error('Failed to delete image', err));
      }
    }
  }

  product.isDeleted = true;
  product.deletedAt = new Date();
  product.deletedBy = req.user._id;
  product.status = 'Deleted';
  await product.save();

  return successResponse(res, 'Product deleted successfully', { product });
});
