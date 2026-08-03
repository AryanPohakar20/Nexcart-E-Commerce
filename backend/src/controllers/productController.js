import Product from '../models/Product.js';
import { DUMMY_PRODUCTS } from '../config/seed.js';
import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/products
export const getProducts = asyncHandler(async (req, res) => {
  if (process.env.MOCK_DB === 'true') {
    return successResponse(res, 'Products fetched successfully (Mock)', DUMMY_PRODUCTS);
  }
  const products = await Product.find({ isDeleted: false });
  return successResponse(res, 'Products fetched successfully', products);
});

// GET /api/products/:id
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (process.env.MOCK_DB === 'true') {
    const product = DUMMY_PRODUCTS.find(p => p._id === id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    return successResponse(res, 'Product fetched successfully (Mock)', product);
  }
  const product = await Product.findOne({ _id: id, isDeleted: false });
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  return successResponse(res, 'Product fetched successfully', product);
});
