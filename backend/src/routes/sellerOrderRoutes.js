import express from 'express';
import { getSellerOrders, getSellerOrderDetails } from '../controllers/orderController.js';
import { validateSellerOrderListing, validateOrderId } from '../validations/orderValidation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

// Apply authentication and seller authorization middleware to all seller order routes
router.use(authenticate);
router.use(authorize('seller'));

// Retrieve paginated list of orders containing seller's items
router.get('/', validateSellerOrderListing, getSellerOrders);

// Retrieve details for a specific order belonging to the seller
router.get('/:orderId', validateOrderId, getSellerOrderDetails);

export default router;
