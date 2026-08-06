import { asyncHandler } from '../utils/asyncHandler.js';
import * as returnService from '../services/returnService.js';
import { successResponse } from '../utils/ApiResponse.js';

/**
 * Handle customer return request.
 */
export const requestReturn = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const customerId = req.user._id;
  const { reason, description } = req.body;

  const returnRequest = await returnService.requestReturn(orderId, customerId, {
    reason,
    description,
  });

  return successResponse(res, 'Return requested successfully.', returnRequest, 201);
});

/**
 * Handle admin listing of all return requests.
 */
export const listReturns = asyncHandler(async (req, res) => {
  const result = await returnService.listReturns(req.query);
  return successResponse(res, 'Return requests retrieved successfully.', result);
});

/**
 * Handle admin fetching details of a return request.
 */
export const getReturnDetails = asyncHandler(async (req, res) => {
  const { returnId } = req.params;
  const result = await returnService.getReturnDetails(returnId);
  return successResponse(res, 'Return request details retrieved successfully.', result);
});

/**
 * Handle admin review of a return request (approve, reject, refund completion).
 */
export const reviewReturn = asyncHandler(async (req, res) => {
  const { returnId } = req.params;
  const result = await returnService.reviewReturn(returnId, req.body);
  return successResponse(res, 'Return request reviewed successfully.', result);
});
