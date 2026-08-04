import express from 'express';
import { placeOrder, getOrderDetails, getCustomerOrders } from '../controllers/orderController.js';
import { validateOrderPlacement, validateCustomerOrderListing } from '../validations/orderValidation.js';
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

// Authenticated customers and sellers can view order details
router.get(
  '/:id',
  authenticate,
  getOrderDetails
);

export default router;
