import { Router } from 'express';
import {
  createListing,
  getAllListings,
  getMyListings,
  getListingById,
  updateListing,
  deleteListing,
  markListingAsSold,
  getMarketplaceEarnings,
} from '../controllers/marketplaceController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// GET /api/marketplace/listings - Public list of active C2C listings
router.get('/listings', getAllListings);

// GET /api/marketplace/listings/my - Authenticated seller's listings
router.get('/listings/my', authenticate, getMyListings);

// GET /api/marketplace/listings/:id - Single C2C listing details
router.get('/listings/:id', getListingById);

// POST /api/marketplace/listings - Create C2C listing (Protected)
router.post('/listings', authenticate, upload.array('images', 5), createListing);

// PUT /api/marketplace/listings/:id - Update C2C listing (Protected)
router.put('/listings/:id', authenticate, upload.array('images', 5), updateListing);

// DELETE /api/marketplace/listings/:id - Delete C2C listing (Protected)
router.delete('/listings/:id', authenticate, deleteListing);

// PATCH /api/marketplace/listings/:id/sold - Mark C2C listing as sold (Protected)
router.patch('/listings/:id/sold', authenticate, markListingAsSold);

// GET /api/marketplace/earnings - Get C2C marketplace earnings (Protected)
router.get('/earnings', authenticate, getMarketplaceEarnings);

export default router;
