import { asyncHandler } from '../utils/asyncHandler.js';
import * as orderService from '../services/orderService.js';
import { successResponse } from '../utils/ApiResponse.js';

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
  const { orderId } = req.params;
  const customerId = req.user._id;

  const order = await orderService.getCustomerOrderDetails(orderId, customerId);

  return successResponse(res, 'Order details fetched successfully.', { order });
});

/**
 * Handle requests to list the logged-in customer's orders.
 */
export const getCustomerOrders = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const result = await orderService.getCustomerOrders(customerId, req.query);

  return successResponse(res, 'Orders fetched successfully.', result);
});

/**
 * Handle order cancellation requests by a customer.
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { cancellationReason } = req.body;
  const customerId = req.user._id;

  const updatedOrder = await orderService.cancelCustomerOrder(orderId, customerId, cancellationReason);

  return successResponse(res, 'Order cancelled successfully.', { order: updatedOrder });
});
