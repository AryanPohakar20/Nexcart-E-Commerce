import express from 'express';
import { placeOrder, getOrderDetails, getCustomerOrders, cancelOrder } from '../controllers/orderController.js';
import { validateOrderPlacement, validateCustomerOrderListing, validateOrderId, validateOrderCancellation } from '../validations/orderValidation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

// Only authenticated customers can place orders
router.post(
  '/',
  authenticate,
  authorize('customer'),
  validateOrderPlacement,
  placeOrder
);

// Authenticated customers can retrieve their order history
router.get(
  '/my',
  authenticate,
  authorize('customer'),
  validateCustomerOrderListing,
  getCustomerOrders
);

// Authenticated customers can view details of their own orders
router.get(
  '/:orderId',
  authenticate,
  authorize('customer'),
  validateOrderId,
  getOrderDetails
);

// Authenticated customers can cancel their own eligible orders
router.patch(
  '/:orderId/cancel',
  authenticate,
  authorize('customer'),
  validateOrderCancellation,
  cancelOrder
);

export default router;
