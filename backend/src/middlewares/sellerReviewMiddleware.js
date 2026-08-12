import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';

/**
 * Pre-processes the create seller review request.
 * Resolves customerId from authenticated req.user and sellerId from req.params,
 * placing them on req.body for validation.
 */
export const preProcessCreateSellerReview = (req, res, next) => {
  try {
    const { sellerId } = req.params;

    if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
      throw new ApiError(400, 'Invalid Seller ID format.');
    }

    if (!req.user || !req.user._id) {
      throw new ApiError(401, 'Unauthorized: User is not authenticated.');
    }

    // Populate body for express-validator schema checks
    req.body.sellerId = sellerId;
    req.body.customerId = req.user._id.toString();

    next();
  } catch (error) {
    next(error);
  }
};
