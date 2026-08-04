import mongoose from 'mongoose';
import * as orderRepo from '../repositories/orderRepository.js';
import * as productRepo from '../repositories/productRepository.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';

/**
 * Place a new order with MongoDB transactions.
 */
export const placeOrder = async (customerId, orderData) => {
  const { items, shippingAddress, couponCode, orderNotes } = orderData;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let subtotal = 0;
    let sellerId = null;
    const orderItems = [];

    // Process and validate each item
    for (const item of items) {
      // 1. Fetch product with session (for transaction concurrency lock)
      const product = await productRepo.findProductById(item.product, session);
      if (!product) {
        throw new ApiError(404, `Product with ID ${item.product} not found`);
      }

      // 2. Prevent ordering inactive products
      if (!product.isActive) {
        throw new ApiError(400, `Product "${product.title}" is currently inactive and cannot be ordered.`);
      }

      // 3. Verify stock
      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for product "${product.title}". Available: ${product.stock}, Requested: ${item.quantity}`);
      }

      // 4. Verify seller exists
      const seller = await User.findById(product.seller).session(session);
      if (!seller || seller.role !== 'seller') {
        throw new ApiError(400, `Seller associated with product "${product.title}" does not exist.`);
      }

      // 5. Verify all products in this order belong to the same seller
      if (sellerId && sellerId.toString() !== product.seller.toString()) {
        throw new ApiError(400, 'Orders can only contain products from a single seller.');
      }
      sellerId = product.seller;

      // 6. Update product stock atomically and concurrently
      const updateResult = await productRepo.decreaseProductStock(
        item.product,
        item.quantity,
        session
      );

      if (updateResult.modifiedCount === 0) {
        throw new ApiError(
          400,
          `Failed to reserve stock for product "${product.title}". It may have run out of stock or become inactive concurrently.`
        );
      }

      // 7. Add snapshot to order items list
      orderItems.push({
        product: product._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        thumbnail: product.thumbnail || '',
        sku: product.brand || '',
      });

      // 8. Accumulate subtotal
      subtotal += product.price * item.quantity;
    }

    // Calculations:
    // Shipping: Flat ₹100, free for orders above ₹1,000
    const shippingCharges = subtotal >= 1000 ? 0 : 100;

    // Tax: 18% GST (rounded to 2 decimal places)
    const tax = Math.round(subtotal * 0.18 * 100) / 100;

    // Coupon discount logic matching dummyData.js codes
    let discount = 0;
    if (couponCode) {
      const codeUpper = couponCode.toUpperCase();
      if (codeUpper === 'NEXSTART20') {
        if (subtotal >= 5000) {
          discount = Math.round(subtotal * 0.20 * 100) / 100;
        } else {
          throw new ApiError(400, 'Min cart value for coupon NEXSTART20 is ₹5,000.');
        }
      } else if (codeUpper === 'FLASH50') {
        if (subtotal >= 15000) {
          discount = Math.round(subtotal * 0.50 * 100) / 100;
          if (discount > 10000) {
            discount = 10000; // Cap at ₹10,000 max discount
          }
        } else {
          throw new ApiError(400, 'Min cart value for coupon FLASH50 is ₹15,000.');
        }
      } else if (codeUpper === 'FREESHIP') {
        if (subtotal >= 1000) {
          discount = shippingCharges; // Discount matches shipping charges
        } else {
          throw new ApiError(400, 'Min cart value for coupon FREESHIP is ₹1,000.');
        }
      } else {
        throw new ApiError(400, 'Invalid coupon code.');
      }
    }

    const total = Math.round(Math.max(0, subtotal + shippingCharges + tax - discount) * 100) / 100;

    // Generate unique order number (e.g., ORD-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomHex}`;

    // Timeline initialization
    const timeline = [
      {
        status: ORDER_STATUS.PENDING,
        title: 'Order Placed',
        description: 'Order placed successfully and is pending confirmation.',
        timestamp: new Date(),
      },
    ];

    // Assemble payload
    const orderPayload = {
      orderNumber,
      customer: customerId,
      seller: sellerId,
      items: orderItems,
      pricing: {
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
      },
      shippingAddress,
      coupon: couponCode ? { code: couponCode, discountAmount: discount } : undefined,
      payment: {
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'pending',
      },
      orderStatus: ORDER_STATUS.PENDING,
      statusHistory: [
        {
          status: ORDER_STATUS.PENDING,
          updatedBy: customerId,
          comment: 'Order placed by customer.',
        },
      ],
      timeline,
      orderNotes: orderNotes || '',
    };

    // Save Order inside transaction session
    const savedOrder = await orderRepo.createOrder(orderPayload, { session });

    // Commit transaction
    await session.commitTransaction();

    // Populate and return final order
    const populatedOrder = await orderRepo.findById(savedOrder._id);
    return populatedOrder;

  } catch (error) {
    // Rollback changes on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Retrieve order details by ID, validating user authorization.
 * @param {string} orderId - Mongoose ID of the order
 * @param {string} userId - ID of the authenticated user
 */
export const getOrderDetails = async (orderId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, 'Invalid Order ID format');
  }

  const order = await orderRepo.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Authorization check: only customer who placed it or the seller who sells it
  const isCustomer = order.customer && order.customer._id.toString() === userId.toString();
  const isSeller = order.seller && order.seller._id.toString() === userId.toString();

  if (!isCustomer && !isSeller) {
    throw new ApiError(403, 'Not authorized to view this order');
  }

  return order;
};
