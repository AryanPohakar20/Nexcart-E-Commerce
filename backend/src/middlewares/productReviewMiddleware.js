import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Pre-processes the create product review request.
 * Resolves customerId from authenticated req.user, productId from req.params,
 * and sellerId by fetching the product document.
 */
export const preProcessCreateReview = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      throw new ApiError(400, 'Invalid Product ID format.');
    }

    if (!req.user || !req.user._id) {
      throw new ApiError(401, 'Unauthorized: User is not authenticated.');
    }

    const product = await Product.findById(productId);
    if (!product || product.isDeleted) {
      throw new ApiError(404, 'Product not found.');
    }

    // Populate body for express-validator schema checks
    req.body.productId = productId;
    req.body.customerId = req.user._id.toString();
    req.body.sellerId = product.sellerId ? product.sellerId.toString() : undefined;

    next();
  } catch (error) {
    next(error);
  }
};
