// src/routes/sellerOrderRoutes.js
// Seller Order Management routes.
// All routes require authentication and seller role authorization (via Main's middleware).

import express from 'express';
import {
  getSellerOrders,
  getSellerOrderDetails,
  updateSellerOrderStatus,
} from '../controllers/orderController.js';
import {
  validateSellerOrderListing,
  validateOrderId,
  validateSellerOrderStatusUpdate,
} from '../validations/orderValidation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

// Apply authentication and seller authorization to all seller order routes
router.use(authenticate);
router.use(authorize('seller'));

// GET /seller/orders — List orders belonging to the authenticated seller
router.get('/', validateSellerOrderListing, getSellerOrders);

// GET /seller/orders/:orderId — Detailed view of a specific seller-owned order
router.get('/:orderId', validateOrderId, getSellerOrderDetails);

// PATCH /seller/orders/:orderId/status — Update status of a seller-owned order
router.patch('/:orderId/status', validateSellerOrderStatusUpdate, updateSellerOrderStatus);

export default router;
