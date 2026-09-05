// src/controllers/returnController.js
// HTTP handlers for Return Management.
// Customer-facing: requestReturn
// Admin-facing:    listReturns, getReturnDetails, reviewReturn

import { asyncHandler } from '../utils/asyncHandler.js';
import * as returnService from '../services/returnService.js';
import { successResponse } from '../utils/ApiResponse.js';

/**
 * POST /orders/:orderId/return
 * Customer requests a return for a delivered order.
 */
export const requestReturn = asyncHandler(async (req, res) => {
  const { orderId }          = req.params;
  const customerId           = req.user._id;
  const { reason, description } = req.body;

  const returnRequest = await returnService.requestReturn(orderId, customerId, {
    reason,
    description,
  });

  return successResponse(res, 'Return requested successfully.', returnRequest, 201);
});

/**
 * GET /admin/returns
 * Admin lists all return requests with filtering and pagination.
 */
export const listReturns = asyncHandler(async (req, res) => {
  const result = await returnService.listReturns(req.query);
  return successResponse(res, 'Return requests retrieved successfully.', result);
});

/**
 * GET /admin/returns/:returnId
 * Admin fetches full details of a specific return request.
 */
export const getReturnDetails = asyncHandler(async (req, res) => {
  const { returnId } = req.params;
  const result = await returnService.getReturnDetails(returnId);
  return successResponse(res, 'Return request details retrieved successfully.', result);
});

/**
 * PATCH /admin/returns/:returnId
 * Admin approves, rejects, or marks refund complete for a return request.
 */
export const reviewReturn = asyncHandler(async (req, res) => {
  const { returnId } = req.params;
  const result = await returnService.reviewReturn(returnId, req.body);
  return successResponse(res, 'Return request reviewed successfully.', result);
});
