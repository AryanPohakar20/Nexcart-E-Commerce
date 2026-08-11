import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Seller from '../models/Seller.js';
import * as productReviewRepository from '../repositories/productReviewRepository.js';
import * as sellerReviewRepository from '../repositories/sellerReviewRepository.js';

/**
 * Validate that MongoDB ObjectIds are properly formatted.
 */
export const validateObjectId = (id, name = 'ID') => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${name} format.`);
  }
};

/**
 * Validate common order properties (existence, completion, and buyer ownership).
 */
export const validateCompletedOrder = async (orderId, customerId) => {
  validateObjectId(orderId, 'Order ID');
  validateObjectId(customerId, 'Customer ID');

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  // Verify buyer ownership
  if (order.customer.toString() !== customerId.toString()) {
    throw new ApiError(403, 'Access denied. User is not the buyer of this order.');
  }

  // Validate order status
  if (order.orderStatus === 'cancelled') {
    throw new ApiError(400, 'Cannot review items from a cancelled order.');
  }

  if (order.orderStatus !== 'delivered') {
    throw new ApiError(400, 'Cannot review items from an incomplete order. Only delivered orders are eligible for review.');
  }

  return order;
};

/**
 * Prevent a user from reviewing their own products or services.
 */
export const preventSelfReview = (customerId, sellerUserId) => {
  if (customerId.toString() === sellerUserId.toString()) {
    throw new ApiError(400, 'Self-review is not allowed. You cannot review your own product or store.');
  }
};

/**
 * Determine if a customer is eligible to review a product.
 * Returns order, product, and seller documents if eligible, otherwise throws ApiError.
 */
export const canReviewProduct = async ({ customerId, productId, orderId, orderItemId }) => {
  try {
    validateObjectId(productId, 'Product ID');
    validateObjectId(orderItemId, 'Order Item ID');

    // 1. Fetch and validate completed order ownership
    const order = await validateCompletedOrder(orderId, customerId);

    // 2. Verify that the requested order item and product exist and match within the order
    const orderItem = order.items.find(
      (item) =>
        item.product.toString() === productId.toString() &&
        item._id.toString() === orderItemId.toString()
    );

    if (!orderItem) {
      throw new ApiError(400, 'Product and order item combination not found in this order.');
    }

    // 3. Fetch product details
    const product = await Product.findById(productId);
    if (!product || product.isDeleted) {
      throw new ApiError(404, 'Product not found.');
    }

    // 4. Prevent self-review (seller reviewing their own product)
    preventSelfReview(customerId, product.sellerId);

    // 5. Fetch and validate transaction seller
    const seller = await Seller.findById(order.seller);
    if (!seller) {
      throw new ApiError(404, 'Seller details not found for this transaction.');
    }

    // Ensure the seller of the product matches the seller involved in this order transaction
    if (seller.userId.toString() !== product.sellerId.toString()) {
      throw new ApiError(400, 'Seller not associated with this transaction.');
    }

    // 6. Check for duplicate product reviews (already reviewed this order item)
    const existingReview = await productReviewRepository.findExistingReview({
      customerId,
      orderItemId,
      productId,
    });
    if (existingReview) {
      throw new ApiError(400, 'Duplicate review: You have already reviewed this product for this order item.');
    }

    return { eligible: true, order, product, seller };
  } catch (error) {
    logger.warn('Product review eligibility check failed', {
      reason: error.message,
      customerId,
      productId,
      orderId,
      orderItemId,
    });
    throw error;
  }
};

/**
 * Determine if a customer is eligible to review a seller.
 * Returns order and seller documents if eligible, otherwise throws ApiError.
 */
export const canReviewSeller = async ({ customerId, sellerId, orderId }) => {
  try {
    validateObjectId(sellerId, 'Seller User ID');

    // 1. Fetch and validate completed order ownership
    const order = await validateCompletedOrder(orderId, customerId);

    // 2. Fetch the Seller document for this order
    const seller = await Seller.findById(order.seller);
    if (!seller) {
      throw new ApiError(404, 'Seller details not found for this transaction.');
    }

    // 3. Prevent self-review (seller reviewing themselves)
    preventSelfReview(customerId, seller.userId);

    // 4. Verify that the requested seller matches the order's seller
    if (seller.userId.toString() !== sellerId.toString()) {
      throw new ApiError(400, 'Seller not associated with this transaction.');
    }

    // 5. Check for duplicate seller reviews (already reviewed this seller for this order)
    const existingReview = await sellerReviewRepository.findExistingSellerReview({
      customerId,
      orderId,
      sellerId,
    });
    if (existingReview) {
      throw new ApiError(400, 'Duplicate review: You have already reviewed this seller for this order.');
    }

    return { eligible: true, order, seller };
  } catch (error) {
    logger.warn('Seller review eligibility check failed', {
      reason: error.message,
      customerId,
      sellerId,
      orderId,
    });
    throw error;
  }
};
