// src/routes/index.js
// Root API router — mounts all feature routers under their respective prefixes.
// As new modules are added (Products, Orders, Cart, etc.), register them here.

import { Router } from 'express';
import authRoutes from './authRoutes.js';
import healthRoute from './healthRoute.js';

const router = Router();

// ── Core ──────────────────────────────────────────────────────────────────────
router.use('/health', healthRoute);
router.use('/auth', authRoutes);

// ── Future Modules (Phase 2+) ─────────────────────────────────────────────────
// router.use('/products', productRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/cart', cartRoutes);
// router.use('/wishlist', wishlistRoutes);
// router.use('/orders', orderRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/admin', adminRoutes);
// router.use('/seller', sellerRoutes);

export default router;
