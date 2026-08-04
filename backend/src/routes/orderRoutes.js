import express from 'express';
import { placeOrder, getOrderDetails } from '../controllers/orderController.js';
import { validateOrderPlacement } from '../validations/orderValidation.js';
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

// Authenticated customers and sellers can view order details
router.get(
  '/:id',
  authenticate,
  getOrderDetails
);

export default router;
