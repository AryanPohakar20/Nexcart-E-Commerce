import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { createOrder, getBuyerOrders } from '../controllers/orderController.js';

const router = Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/', getBuyerOrders);

export default router;
