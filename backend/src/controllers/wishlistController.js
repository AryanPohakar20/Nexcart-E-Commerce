import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { DUMMY_PRODUCTS } from '../config/seed.js';
import { getMockCart } from './cartController.js';
import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// In-memory mock storage
const MOCK_WISHLISTS = {};

const getMockWishlist = (userId) => {
  if (!MOCK_WISHLISTS[userId]) {
    MOCK_WISHLISTS[userId] = [];
  }
  return MOCK_WISHLISTS[userId];
};

// GET /api/wishlist or /api/wishlist/:userId
export const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user._id;

  // Authorization check: User can only access their own wishlist unless they are admin
  if (req.user._id.toString() !== userId.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to view this wishlist');
  }

  if (process.env.MOCK_DB === 'true') {
    const list = getMockWishlist(userId);
    return successResponse(res, 'Wishlist fetched successfully (Mock)', list);
  }

  const wishlist = await Wishlist.find({ userId });

  return successResponse(res, 'Wishlist fetched successfully', wishlist);
});

// POST /api/wishlist/add
export const addToWishlist = asyncHandler(async (req, res) => {
  const { userId, userEmail, productId, productInformation } = req.body;
  const currentUserId = req.user._id;
  const targetUserId = userId || currentUserId;
  const targetUserEmail = userEmail || req.user.email;

  if (process.env.MOCK_DB === 'true') {
    const list = getMockWishlist(targetUserId);
    const existing = list.find(item => item.productId === productId);
    if (existing) {
      return successResponse(res, 'Product already in wishlist (Mock)', existing);
    }

    const newEntry = {
      _id: `mock_wish_${Date.now()}`,
      userId: targetUserId,
      userEmail: targetUserEmail,
      productId,
      productInformation,
      addedAt: new Date()
    };
    list.push(newEntry);
    return successResponse(res, 'Product added to wishlist (Mock)', newEntry, 201);
  }

  const existing = await Wishlist.findOne({ userId: targetUserId, productId });
  if (existing) {
    return successResponse(res, 'Product already in wishlist', existing);
  }

  const product = await Product.findOne({ _id: productId, isDeleted: false });
  const sellerId = product ? product.sellerId : null;

  const wishlistEntry = await Wishlist.create({
    userId: targetUserId,
    userEmail: targetUserEmail,
    productId,
    sellerId,
    productInformation
  });

  return successResponse(res, 'Product added to wishlist', wishlistEntry, 201);
});

// DELETE /api/wishlist/remove/:productId
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  if (process.env.MOCK_DB === 'true') {
    const list = getMockWishlist(userId);
    const index = list.findIndex(item => item.productId._id === productId);
    if (index === -1) {
      throw new ApiError(404, 'Product not found in wishlist');
    }
    list.splice(index, 1);
    return successResponse(res, 'Product removed from wishlist (Mock)');
  }

  const result = await Wishlist.findOneAndDelete({ userId, productId });
  if (!result) {
    throw new ApiError(404, 'Product not found in wishlist');
  }

  return successResponse(res, 'Product removed from wishlist');
});

// POST /api/wishlist/move-to-cart
export const moveToCartFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  if (process.env.MOCK_DB === 'true') {
    const list = getMockWishlist(userId);
    const wishIndex = list.findIndex(item => item.productId._id === productId);
    if (wishIndex === -1) {
      throw new ApiError(404, 'Product not found in wishlist');
    }

    const product = DUMMY_PRODUCTS.find(p => p._id === productId);
    if (!product || product.stock <= 0) {
      throw new ApiError(400, 'Product is out of stock or unavailable');
    }

    // Remove from Wishlist
    list.splice(wishIndex, 1);

    // Add to Mock Cart
    const cart = getMockCart(userId);
    const existingIndex = cart.items.findIndex(item => item.productId._id === productId);
    if (existingIndex > -1) {
      const nextQty = cart.items[existingIndex].quantity + 1;
      cart.items[existingIndex].quantity = Math.min(nextQty, product.stock);
    } else {
      cart.items.push({
        productId: product,
        sellerId: null,
        productSnapshot: {
          title: product.title,
          image: product.image,
          priceAtAddition: product.price
        },
        quantity: 1,
        priceAtAddition: product.price,
        currentPrice: product.price,
        subtotal: product.price,
        stock: product.stock,
        isAvailable: true
      });
    }

    return successResponse(res, 'Item moved from wishlist to cart successfully (Mock)');
  }

  // Database Flow
  const wishlistEntry = await Wishlist.findOne({ userId, productId });
  if (!wishlistEntry) {
    throw new ApiError(404, 'Product not found in wishlist');
  }

  const product = await Product.findOne({ _id: productId, isDeleted: false });
  if (!product || product.stock <= 0) {
    throw new ApiError(400, 'Product is out of stock or unavailable');
  }

  await Wishlist.deleteOne({ _id: wishlistEntry._id });

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [], saveForLater: [] });
  }

  const existingIndex = cart.items.findIndex(item => item.productId === productId);
  if (existingIndex > -1) {
    const nextQty = cart.items[existingIndex].quantity + 1;
    cart.items[existingIndex].quantity = Math.min(nextQty, product.stock);
    cart.items[existingIndex].currentPrice = product.price;
  } else {
    cart.items.push({
      productId,
      sellerId: product.sellerId,
      productSnapshot: {
        title: product.title,
        image: product.image,
        priceAtAddition: product.price
      },
      quantity: 1,
      priceAtAddition: product.price,
      currentPrice: product.price,
      subtotal: product.price,
      stock: product.stock,
      isAvailable: true
    });
  }

  await cart.save();

  return successResponse(res, 'Item moved from wishlist to cart successfully');
});

// POST /api/wishlist/clear
export const clearWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (process.env.MOCK_DB === 'true') {
    MOCK_WISHLISTS[userId] = [];
    return successResponse(res, 'Wishlist cleared successfully (Mock)');
  }

  await Wishlist.deleteMany({ userId });
  return successResponse(res, 'Wishlist cleared successfully');
});
