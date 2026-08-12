// src/controllers/sellerController.js

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import * as sellerService from '../services/sellerService.js';
import Seller from '../models/Seller.js';
import Order from '../models/Order.js';
import * as sellerReputationService from '../services/sellerReputationService.js';

// ─── POST /api/seller/create ──────────────────────────────────────────────────

export const createSeller = asyncHandler(async (req, res) => {
  const seller = await sellerService.createSellerEntry(req.user._id);

  res.status(201).json({
    success: true,
    message: 'Seller account initialized successfully.',
    data: { seller },
  });
});

// ─── GET /api/seller/profile ──────────────────────────────────────────────────

export const getSellerProfile = asyncHandler(async (req, res) => {
  const seller = await sellerService.getSellerProfile(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Seller profile fetched successfully.',
    data: { seller },
  });
});

// ─── PUT /api/seller/onboarding/step-1 ───────────────────────────────────────

export const updateStep1 = asyncHandler(async (req, res) => {
  const seller = await sellerService.saveStep1(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Account info saved successfully.',
    data: { seller },
  });
});

// ─── PUT /api/seller/onboarding/step-2 ───────────────────────────────────────

export const updateStep2 = asyncHandler(async (req, res) => {
  const seller = await sellerService.saveStep2(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Shop profile saved successfully.',
    data: { seller },
  });
});

// ─── PUT /api/seller/onboarding/step-3 ───────────────────────────────────────

export const updateStep3 = asyncHandler(async (req, res) => {
  const frontFile = req.files?.frontImage?.[0];
  const backFile = req.files?.backImage?.[0];

  if (!frontFile) {
    throw new ApiError(400, 'Front Aadhaar image is required.');
  }

  const seller = await sellerService.saveStep3(
    req.user._id,
    req.body,
    frontFile.buffer,
    backFile?.buffer || null,
  );

  res.status(200).json({
    success: true,
    message: 'Identity documents uploaded successfully.',
    data: { seller },
  });
});

// ─── PUT /api/seller/onboarding/step-4 ───────────────────────────────────────

export const updateStep4 = asyncHandler(async (req, res) => {
  const seller = await sellerService.saveStep4(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Payment details saved successfully.',
    data: { seller },
  });
});

// ─── PUT /api/seller/onboarding/step-5 ───────────────────────────────────────

export const updateStep5 = asyncHandler(async (req, res) => {
  const seller = await sellerService.saveStep5(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Terms accepted. Your application is now pending review.',
    data: { seller },
  });
});

// ─── GET /api/seller/status ───────────────────────────────────────────────────

export const getSellerStatus = asyncHandler(async (req, res) => {
  const status = await sellerService.getSellerStatus(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Seller status fetched successfully.',
    data: status,
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 2B PART 1 — Dashboard Controllers
// ═══════════════════════════════════════════════════════════════════════════════

// ─── GET /api/seller/dashboard/profile ───────────────────────────────────────

export const getDashboardProfile = asyncHandler(async (req, res) => {
  const profile = await sellerService.getDashboardProfile(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Seller dashboard profile fetched successfully.',
    data: { seller: profile },
  });
});

// ─── PUT /api/seller/dashboard/profile ───────────────────────────────────────

export const updateSellerProfile = asyncHandler(async (req, res) => {
  const profile = await sellerService.updateSellerProfile(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Seller profile updated successfully.',
    data: { seller: profile },
  });
});

// ─── PATCH /api/seller/dashboard/profile/image ───────────────────────────────

export const updateProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Image file is required.');
  }

  const result = await sellerService.updateProfileImage(req.user._id, req.file.buffer);

  res.status(200).json({
    success: true,
    message: 'Profile image updated successfully.',
    data: result,
  });
});

// ─── PATCH /api/seller/dashboard/profile/banner ──────────────────────────────

export const updateBanner = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Banner image file is required.');
  }

  const result = await sellerService.updateBanner(req.user._id, req.file.buffer);

  res.status(200).json({
    success: true,
    message: 'Business banner updated successfully.',
    data: result,
  });
});

// ─── GET /api/seller/public/:identifier (optional auth) ───────────────────────

export const getPublicProfile = asyncHandler(async (req, res) => {
  const targetId = req.params.slug || req.params.identifier || req.params.id;
  const currentUserId = req.user?._id || null;

  const profile = await sellerService.getPublicSellerProfile(targetId, currentUserId);

  res.status(200).json({
    success: true,
    message: 'Public seller profile fetched successfully.',
    data: { seller: profile, profile },
  });
});

// ─── POST /api/seller/public/:identifier/follow (auth required) ──────────────

export const toggleFollow = asyncHandler(async (req, res) => {
  const targetId = req.params.slug || req.params.identifier || req.params.id;
  const result = await sellerService.toggleFollowSeller(targetId, req.user._id);

  res.status(200).json({
    success: true,
    message: result.isFollowing ? 'Seller followed successfully.' : 'Seller unfollowed successfully.',
    data: result,
  });
});

// ─── POST /api/seller/public/:identifier/review (auth required) ──────────────

export const createReview = asyncHandler(async (req, res) => {
  const targetId = req.params.slug || req.params.identifier || req.params.id;
  const review = await sellerService.createSellerReview(targetId, req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully.',
    data: { review },
  });
});

// ─── GET /api/seller/dashboard/settings ──────────────────────────────────────

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await sellerService.getSettings(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Seller settings fetched successfully.',
    data: { settings },
  });
});

// ─── PUT /api/seller/dashboard/settings ──────────────────────────────────────

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await sellerService.updateSettings(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Seller settings updated successfully.',
    data: { settings },
  });
});

// ─── PATCH /api/seller/dashboard/settings/password ───────────────────────────

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await sellerService.changePassword(req.user._id, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully.',
  });
});

// ─── PATCH /api/seller/dashboard/settings/deactivate ─────────────────────────

export const deactivateStore = asyncHandler(async (req, res) => {
  const result = await sellerService.deactivateStore(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Your store has been deactivated.',
    data: result,
  });
});

// ─── DELETE /api/seller/dashboard/settings/delete ────────────────────────────

export const deleteStore = asyncHandler(async (req, res) => {
  await sellerService.deleteStore(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Your seller store has been permanently deleted.',
  });
});

// ─── GET /api/seller/dashboard/summary ───────────────────────────────────────

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const { timeframe } = req.query;
  const summary = await sellerService.getDashboardSummary(req.user._id, timeframe);

  res.status(200).json({
    success: true,
    message: 'Dashboard summary fetched successfully.',
    data: { summary },
  });
});

// ─── GET /api/seller/dashboard/orders ────────────────────────────────────────

export const getSellerOrders = asyncHandler(async (req, res) => {
  let seller = await Seller.findOne({ userId: req.user._id });
  if (!seller) {
    if (process.env.MOCK_DB === 'true') {
      seller = { _id: req.user._id };
    } else {
      throw new ApiError(404, 'Seller profile not found.');
    }
  }

  const orders = await Order.find({ seller: seller._id, isDeleted: { $ne: true } })
    .populate({ path: 'customer', select: 'firstName lastName email phone avatar' })
    .populate({ path: 'items.product', select: 'title name slug images thumbnail sku price' })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    message: 'Seller orders fetched successfully.',
    data: { orders },
  });
});

// ─── PATCH /api/seller/dashboard/orders/:id/status ───────────────────────────

export const updateSellerOrderStatus = asyncHandler(async (req, res) => {
  let seller = await Seller.findOne({ userId: req.user._id });
  if (!seller) {
    if (process.env.MOCK_DB === 'true') {
      seller = { _id: req.user._id };
    } else {
      throw new ApiError(404, 'Seller profile not found.');
    }
  }

  const { status, carrier, trackingNumber } = req.body;
  if (!status) {
    throw new ApiError(400, 'Status is required.');
  }

  const order = await Order.findOne({ _id: req.params.id, seller: seller._id });
  if (!order) {
    throw new ApiError(404, 'Order not found or access denied.');
  }

  const oldStatus = order.orderStatus;
  order.orderStatus = status.toLowerCase();

  if (carrier) order.shippingCarrier = carrier;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status.toLowerCase() === 'delivered') {
    order.deliveredDate = new Date();
  }

  order.statusHistory.push({
    status: status.toLowerCase(),
    timestamp: new Date(),
    note: req.body.note || `Order status updated from ${oldStatus} to ${status} by Seller.`,
  });

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully.',
    data: { order },
  });
});

// ─── PATCH /api/seller/dashboard/orders/:id/cancel ───────────────────────────

export const cancelSellerOrder = asyncHandler(async (req, res) => {
  let seller = await Seller.findOne({ userId: req.user._id });
  if (!seller) {
    if (process.env.MOCK_DB === 'true') {
      seller = { _id: req.user._id };
    } else {
      throw new ApiError(404, 'Seller profile not found.');
    }
  }

  const { reason } = req.body;

  const order = await Order.findOne({ _id: req.params.id, seller: seller._id });
  if (!order) {
    throw new ApiError(404, 'Order not found or access denied.');
  }

  const oldStatus = order.orderStatus;
  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = reason || 'Cancelled by seller';
  order.paymentInfo.status = 'refunded';
  order.refundInfo = {
    amount: order.totalAmount,
    status: 'refunded',
    reason: reason || 'Seller cancellation refund',
    processedAt: new Date(),
  };

  order.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: `Order cancelled by seller. Reason: ${reason || 'No reason provided'}`,
  });

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully.',
    data: { order },
  });
});

// ─── GET /api/sellers/:sellerId/reputation (no auth) ───────────────────────────
export const getSellerReputation = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const reputation = await sellerReputationService.getSellerReputation(sellerId);

  res.status(200).json({
    success: true,
    message: 'Seller reputation fetched successfully.',
    data: { reputation },
  });
});
