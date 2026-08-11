import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import Order from '../models/Order.js';

/**
 * Create a new order (buyer checkout)
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, seller, totalAmount, shippingAddress, paymentInfo } = req.body;

  if (!items || items.length === 0) {
    throw new ApiError(400, 'Order items are required');
  }
  if (!seller) {
    throw new ApiError(400, 'Seller is required');
  }

  const itemCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const order = await Order.create({
    customer: req.user._id,
    seller,
    items: items.map(item => ({
      product: item.product,
      name: item.name,
      image: item.image || '',
      price: item.price,
      quantity: item.quantity,
      sku: item.sku || '',
      subtotal: item.price * item.quantity,
    })),
    totalAmount,
    itemCount,
    shippingAddress,
    paymentInfo: {
      method: paymentInfo?.method || 'UPI',
      status: paymentInfo?.status || 'paid',
      transactionId: paymentInfo?.transactionId || `TXN-${Date.now().toString().slice(-6)}`,
      paidAt: paymentInfo?.status === 'paid' ? new Date() : null,
    },
    orderStatus: 'processing',
    statusHistory: [
      {
        status: 'processing',
        timestamp: new Date(),
        note: 'Order placed and payment verified.',
      }
    ]
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order }
  });
});

/**
 * Get orders placed by the current logged-in buyer
 */
export const getBuyerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id, isDeleted: { $ne: true } })
    .populate({ path: 'customer', select: 'firstName lastName email phone avatar' })
    .populate({
      path: 'seller',
      select: 'business individual accountInfo sellerType slug',
    })
    .populate({ path: 'items.product', select: 'name slug images thumbnail sku price' })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    message: 'Orders fetched successfully',
    data: { orders }
  });
});
