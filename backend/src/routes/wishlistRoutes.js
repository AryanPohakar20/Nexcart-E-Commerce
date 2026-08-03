import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCartFromWishlist,
  clearWishlist,
} from '../controllers/wishlistController.js';
import {
  validateAddToWishlist,
  validateWishlistParamProductId,
} from '../validations/wishlistValidation.js';

const router = Router();

// Protect all wishlist routes with JWT authentication
router.use(authenticate);

router.get('/', getWishlist);
router.get('/:userId', getWishlist);
router.post('/add', validateAddToWishlist, addToWishlist);
router.delete('/remove/:productId', validateWishlistParamProductId, removeFromWishlist);
router.post('/move-to-cart', validateAddToWishlist, moveToCartFromWishlist);
router.post('/clear', clearWishlist);

export default router;
