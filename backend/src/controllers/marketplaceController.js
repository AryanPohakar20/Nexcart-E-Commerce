import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import MarketplaceListing from '../models/MarketplaceListing.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/ApiResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../public/uploads/products');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const parseNumericField = (fieldVal, fieldName, defaultValue = 0) => {
  if (Array.isArray(fieldVal)) {
    throw new ApiError(400, `${fieldName} must be a single numeric value, not an array.`);
  }
  if (fieldVal === undefined || fieldVal === null || fieldVal === '') {
    return defaultValue;
  }
  const num = Number(fieldVal);
  if (!Number.isFinite(num) || num < 0) {
    throw new ApiError(400, `${fieldName} must be a valid non-negative number.`);
  }
  return num;
};

/**
 * POST /api/marketplace/listings
 * Create a new C2C Marketplace Listing
 */
export const createListing = asyncHandler(async (req, res) => {
  const listingData = { ...req.body };
  
  // Set seller details from authenticated user
  listingData.sellerId = req.user._id;
  listingData.sellerName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.username;

  // Handle image files
  if (req.files && req.files.length > 0) {
    const uploadedImages = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname || '.jpg')}`;
      const filepath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(filepath, file.buffer);
      uploadedImages.push({
        url: `${process.env.API_URL || 'http://localhost:5000'}/uploads/products/${filename}`,
        publicId: filename,
        isPrimary: i === 0,
      });
    }
    listingData.images = uploadedImages;
  }

  // Parse numeric values
  listingData.price = parseNumericField(listingData.price, 'Price', 0);
  listingData.stock = parseNumericField(listingData.stock, 'Stock', 1);
  listingData.originalPrice = parseNumericField(listingData.originalPrice || listingData.mrp, 'Original Price', listingData.price * 1.25);
  listingData.mrp = listingData.originalPrice;
  listingData.status = 'active';

  const listing = new MarketplaceListing(listingData);
  await listing.save();

  return successResponse(res, 'Marketplace listing published successfully', { listing });
});

/**
 * GET /api/marketplace/listings
 * Fetch active C2C Marketplace Listings
 */
export const getAllListings = asyncHandler(async (req, res) => {
  const { category, search, q, minPrice, maxPrice, limit = 100 } = req.query;

  const query = { isDeleted: { $ne: true }, status: 'active' };

  if (category && category !== 'All' && category !== 'all') {
    query.category = { $regex: new RegExp(category, 'i') };
  }

  const searchKeyword = search || q;
  if (searchKeyword && searchKeyword.trim()) {
    const regex = new RegExp(searchKeyword.trim(), 'i');
    query.$or = [
      { title: regex },
      { description: regex },
      { category: regex },
      { brand: regex },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
  }

  const listings = await MarketplaceListing.find(query)
    .populate('sellerId', '_id firstName lastName username avatar email phone location')
    .sort({ createdAt: -1 })
    .limit(Math.min(100, Number(limit) || 100))
    .lean({ virtuals: true });

  // Ensure `id` field is always present as string (lean() may omit the Mongoose id virtual)
  const normalized = listings.map(l => ({ ...l, id: l.id || (l._id ? l._id.toString() : undefined) }));

  return successResponse(res, 'Marketplace listings fetched successfully', { listings: normalized });
});

/**
 * GET /api/marketplace/listings/my
 * Fetch listings owned by currently authenticated seller
 */
export const getMyListings = asyncHandler(async (req, res) => {
  const listings = await MarketplaceListing.find({ sellerId: req.user._id, isDeleted: { $ne: true } })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });

  const normalized = listings.map(l => ({ ...l, id: l.id || (l._id ? l._id.toString() : undefined) }));

  return successResponse(res, 'My marketplace listings fetched successfully', { listings: normalized });
});

/**
 * GET /api/marketplace/listings/:id
 * Fetch single listing by ID
 */
export const getListingById = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
    .populate('sellerId', '_id firstName lastName username avatar email phone location')
    .lean({ virtuals: true });

  if (!listing) {
    throw new ApiError(404, 'Marketplace listing not found');
  }

  // Ensure id field is present
  const normalized = { ...listing, id: listing.id || (listing._id ? listing._id.toString() : undefined) };

  return successResponse(res, 'Marketplace listing details fetched', { listing: normalized });
});

/**
 * PUT /api/marketplace/listings/:id
 * Update seller's own listing
 */
export const updateListing = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findById(req.params.id);

  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  if (listing.sellerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this listing');
  }

  const updates = { ...req.body };

  if (updates.price !== undefined) updates.price = parseNumericField(updates.price, 'Price', listing.price);
  if (updates.stock !== undefined) updates.stock = parseNumericField(updates.stock, 'Stock', listing.stock);

  if (req.files && req.files.length > 0) {
    const newImages = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname || '.jpg')}`;
      const filepath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(filepath, file.buffer);
      newImages.push({
        url: `${process.env.API_URL || 'http://localhost:5000'}/uploads/products/${filename}`,
        publicId: filename,
        isPrimary: listing.images.length === 0 && i === 0,
      });
    }
    updates.images = [...(listing.images || []), ...newImages];
  }

  Object.assign(listing, updates);
  await listing.save();

  return successResponse(res, 'Listing updated successfully', { listing });
});

/**
 * DELETE /api/marketplace/listings/:id
 * Delete seller's own listing
 */
export const deleteListing = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findById(req.params.id);

  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  if (listing.sellerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this listing');
  }

  listing.isDeleted = true;
  listing.deletedAt = new Date();
  listing.status = 'deleted';
  await listing.save();

  return successResponse(res, 'Listing deleted successfully', { listing });
});

/**
 * PATCH /api/marketplace/listings/:id/sold
 * Mark seller's own listing as sold
 */
export const markListingAsSold = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findById(req.params.id);

  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  if (listing.sellerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this listing');
  }

  if (listing.status === 'sold') {
    throw new ApiError(400, 'Listing is already marked as sold.');
  }
  
  if (listing.status !== 'active') {
    throw new ApiError(400, 'Only active listings can be marked as sold.');
  }

  let { finalSalePrice, costPrice } = req.body;
  
  finalSalePrice = parseNumericField(finalSalePrice, 'Final Sale Price', listing.price);
  costPrice = parseNumericField(costPrice, 'Cost Price', listing.costPrice || 0);

  const profit = finalSalePrice - costPrice;

  listing.status = 'sold';
  listing.stock = 0;
  listing.finalSalePrice = finalSalePrice;
  listing.costPrice = costPrice;
  listing.profit = profit;
  listing.soldAt = new Date();

  await listing.save();

  return successResponse(res, 'Listing marked as sold successfully', { listing });
});

/**
 * GET /api/marketplace/earnings
 * Get C2C marketplace earnings for the seller
 */
export const getMarketplaceEarnings = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const soldListings = await MarketplaceListing.find({
    sellerId,
    status: 'sold'
  }).sort({ soldAt: -1 }).lean({ virtuals: true });

  let totalRevenue = 0;
  let totalCost = 0;
  let totalProfit = 0;
  const itemsSold = soldListings.length;

  soldListings.forEach(listing => {
    totalRevenue += (listing.finalSalePrice || 0);
    totalCost += (listing.costPrice || 0);
    totalProfit += (listing.profit || 0);
  });

  // Ensure `id` field is always present
  const normalized = soldListings.map(l => ({ ...l, id: l.id || (l._id ? l._id.toString() : undefined) }));

  return successResponse(res, 'Marketplace earnings fetched successfully', {
    earnings: {
      totalRevenue,
      totalCost,
      totalProfit,
      itemsSold
    },
    sales: normalized
  });
});
