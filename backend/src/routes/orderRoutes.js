// src/routes/orderRoutes.js
// Customer Order Management routes.
// All routes require authentication. Role-based authorization enforced per endpoint.

import express from 'express';
import {
  placeOrder,
  getCustomerOrders,
  getOrderDetails,
  cancelOrder,
} from '../controllers/orderController.js';
import {
  validateOrderPlacement,
  validateCustomerOrderListing,
  validateOrderId,
  validateOrderCancellation,
} from '../validations/orderValidation.js';
import { validateReturnRequest } from '../validations/returnValidation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { requestReturn } from '../controllers/returnController.js';

const router = express.Router();

// POST /orders — Place a new order (customers only)
router.post(
  '/',
  authenticate,
  authorize('customer'),
  validateOrderPlacement,
  placeOrder
);

// GET /orders — List authenticated customer's orders
router.get(
  '/',
  authenticate,
  authorize('customer'),
  validateCustomerOrderListing,
  getCustomerOrders
);

// GET /orders/:orderId — View specific order details (customer must own it)
router.get(
  '/:orderId',
  authenticate,
  authorize('customer'),
  validateOrderId,
  getOrderDetails
);

// PATCH /orders/:orderId/cancel — Cancel an eligible order
router.patch(
  '/:orderId/cancel',
  authenticate,
  authorize('customer'),
  validateOrderCancellation,
  cancelOrder
);

// POST /orders/:orderId/return — Request return for a delivered order
router.post(
  '/:orderId/return',
  authenticate,
  authorize('customer'),
  validateReturnRequest,
  requestReturn
);

export default router;
