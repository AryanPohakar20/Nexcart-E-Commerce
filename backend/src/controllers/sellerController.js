// src/controllers/sellerController.js

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import * as sellerService from "../services/sellerService.js";

// ─── POST /api/seller/create ──────────────────────────────────────────────────

export const createSeller = asyncHandler(async (req, res) => {
  const seller = await sellerService.createSellerEntry(req.user._id);

  res.status(201).json({
    success: true,
    message: "Seller account initialized successfully.",
    data: { seller },
  });
});

// ─── GET /api/seller/profile ──────────────────────────────────────────────────

export const getSellerProfile = asyncHandler(async (req, res) => {
  const seller = await sellerService.getSellerProfile(req.user._id);

  res.status(200).json({
    success: true,
    message: "Seller profile fetched successfully.",
    data: { seller },
  });
});

// ─── PUT /api/seller/onboarding/step-1 ───────────────────────────────────────
// Body: { displayName, businessType, phone, email }

export const updateStep1 = asyncHandler(async (req, res) => {
  const seller = await sellerService.saveStep1(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: "Account info saved successfully.",
    data: { seller },
  });
});

// ─── PUT /api/seller/onboarding/step-2 ───────────────────────────────────────
// Body: { shopName, description, address, city, state, pincode }

export const updateStep2 = asyncHandler(async (req, res) => {
  const seller = await sellerService.saveStep2(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: "Shop profile saved successfully.",
    data: { seller },
  });
});

// ─── PUT /api/seller/onboarding/step-3 ───────────────────────────────────────
// Multipart: frontImage (required), backImage (optional)
// Body: { aadhaarNumber, pan, gst }

export const updateStep3 = asyncHandler(async (req, res) => {
  const frontFile = req.files?.frontImage?.[0];
  const backFile = req.files?.backImage?.[0];

  if (!frontFile) {
    throw new ApiError(400, "Front Aadhaar image is required.");
  }

  const seller = await sellerService.saveStep3(
    req.user._id,
    req.body,
    frontFile.buffer,
    backFile?.buffer || null,
  );

  res.status(200).json({
    success: true,
    message: "Identity documents uploaded successfully.",
    data: { seller },
  });
});

// ─── PUT /api/seller/onboarding/step-4 ───────────────────────────────────────
// Body: { accountHolder, accountNumber, ifsc, upiId }

export const updateStep4 = asyncHandler(async (req, res) => {
  const seller = await sellerService.saveStep4(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: "Payment details saved successfully.",
    data: { seller },
  });
});

// ─── PUT /api/seller/onboarding/step-5 ───────────────────────────────────────

export const updateStep5 = asyncHandler(async (req, res) => {
  const seller = await sellerService.saveStep5(req.user._id);

  res.status(200).json({
    success: true,
    message: "Terms accepted. Your application is now pending review.",
    data: { seller },
  });
});

// ─── GET /api/seller/status ───────────────────────────────────────────────────

export const getSellerStatus = asyncHandler(async (req, res) => {
  const status = await sellerService.getSellerStatus(req.user._id);

  res.status(200).json({
    success: true,
    message: "Seller status fetched successfully.",
    data: status,
  });
});
