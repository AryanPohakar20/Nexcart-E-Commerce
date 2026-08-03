import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  saveForLater,
  moveToCart,
  applyCoupon,
  removeCoupon,
  mergeCart,
} from '../controllers/cartController.js';
import {
  validateAddToCart,
  validateUpdateCart,
  validateApplyCoupon,
  validateProductIdOnly,
} from '../validations/cartValidation.js';

const router = Router();

// Protect all cart routes with JWT authentication
router.use(authenticate);

router.get('/', getCart);
router.post('/add', validateAddToCart, addToCart);
router.patch('/update/:productId', validateUpdateCart, updateCartItem);
router.delete('/remove/:productId', removeCartItem);
router.delete('/clear', clearCart);
router.post('/save-for-later', validateProductIdOnly, saveForLater);
router.post('/move-to-cart', validateProductIdOnly, moveToCart);
router.post('/apply-coupon', validateApplyCoupon, applyCoupon);
router.post('/remove-coupon', removeCoupon);
router.post('/merge', mergeCart);

export default router;
