import express from 'express';
import { getSellerOrders, getSellerOrderDetails, updateSellerOrderStatus } from '../controllers/orderController.js';
import { validateSellerOrderListing, validateOrderId, validateSellerOrderStatusUpdate } from '../validations/orderValidation.js';
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

// Update status for a specific order belonging to the seller
router.patch('/:orderId/status', validateSellerOrderStatusUpdate, updateSellerOrderStatus);

export default router;
