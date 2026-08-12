// src/controllers/orderController.js
// HTTP handlers for Order Management.
// All business logic delegated to orderService.
// Preserves backward compat aliases for Main's existing route names.

import { asyncHandler } from '../utils/asyncHandler.js';
import * as orderService from '../services/orderService.js';
import { successResponse } from '../utils/ApiResponse.js';

// ─── Customer Order Controllers ────────────────────────────────────────────────

/**
 * POST /orders
 * Place a new order (customer only).
 */
export const placeOrder = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const order = await orderService.placeOrder(customerId, req.body);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: { order },
  });
});

/**
 * GET /orders/my
 * List orders for the authenticated customer.
 */
export const getCustomerOrders = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const result = await orderService.getCustomerOrders(customerId, req.query);
  return successResponse(res, 'Orders fetched successfully.', result);
});

/**
 * GET /orders/:orderId
 * Get full details of a specific order (customer-owned only).
 */
export const getOrderDetails = asyncHandler(async (req, res) => {
  const { orderId }    = req.params;
  const customerId     = req.user._id;
  const order = await orderService.getCustomerOrderDetails(orderId, customerId);
  return successResponse(res, 'Order details fetched successfully.', { order });
});

/**
 * PATCH /orders/:orderId/cancel
 * Cancel an eligible order (customer only).
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId }          = req.params;
  const { cancellationReason } = req.body;
  const customerId           = req.user._id;
  const updatedOrder = await orderService.cancelCustomerOrder(orderId, customerId, cancellationReason);
  return successResponse(res, 'Order cancelled successfully.', { order: updatedOrder });
});

// ─── Seller Order Controllers ──────────────────────────────────────────────────

/**
 * GET /seller/orders
 * List orders for the authenticated seller.
 */
export const getSellerOrders = asyncHandler(async (req, res) => {
  const sellerUserId = req.user._id;
  const result = await orderService.getSellerOrders(sellerUserId, req.query);
  return successResponse(res, 'Seller orders fetched successfully.', result);
});

/**
 * GET /seller/orders/:orderId
 * Get details of a specific seller-owned order.
 */
export const getSellerOrderDetails = asyncHandler(async (req, res) => {
  const { orderId }   = req.params;
  const sellerUserId  = req.user._id;
  const order = await orderService.getSellerOrderDetails(orderId, sellerUserId);
  return successResponse(res, 'Seller order details fetched successfully.', { order });
});

/**
 * PATCH /seller/orders/:orderId/status
 * Update an order status (seller only, follows transition rules).
 */
export const updateSellerOrderStatus = asyncHandler(async (req, res) => {
  const sellerUserId = req.user._id;
  const { orderId }  = req.params;
  const { status }   = req.body;
  const updatedOrder = await orderService.updateSellerOrderStatus(orderId, sellerUserId, status);
  return successResponse(res, 'Order status updated successfully.', { order: updatedOrder });
});

// ─── Backward Compatibility Aliases ───────────────────────────────────────────
// Main's original route used createOrder/getBuyerOrders naming.
// These aliases ensure any external references don't break.

export const createOrder   = placeOrder;
export const getBuyerOrders = getCustomerOrders;
