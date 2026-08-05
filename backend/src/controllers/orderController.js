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

/**
 * Handle requests to list the logged-in seller's orders.
 */
export const getSellerOrders = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const result = await orderService.getSellerOrders(sellerId, req.query);

  return successResponse(res, 'Seller orders fetched successfully.', result);
});

/**
 * Handle requests to get details of a specific seller order.
 */
export const getSellerOrderDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const sellerId = req.user._id;

  const order = await orderService.getSellerOrderDetails(orderId, sellerId);

  return successResponse(res, 'Seller order details fetched successfully.', { order });
});

/**
 * Handle seller request to update the status of an order they own.
 */
export const updateSellerOrderStatus = asyncHandler(async (req, res) => {
  const sellerUserId = req.user._id;
  const { orderId } = req.params;
  const { status } = req.body;

  const updatedOrder = await orderService.updateSellerOrderStatus(orderId, sellerUserId, status);

  return successResponse(res, 'Order status updated successfully.', { order: updatedOrder });
});
