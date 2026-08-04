import { asyncHandler } from '../utils/asyncHandler.js';
import * as orderService from '../services/orderService.js';

/**
 * Handle order placement requests.
 */
export const placeOrder = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const order = await orderService.placeOrder(customerId, req.body);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: order,
  });
});

/**
 * Handle requests to get a single order's details.
 */
export const getOrderDetails = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user._id;

  const order = await orderService.getOrderDetails(orderId, userId);

  res.status(200).json({
    success: true,
    data: order,
  });
});
