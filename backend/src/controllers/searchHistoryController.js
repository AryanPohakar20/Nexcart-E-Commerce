// src/controllers/searchHistoryController.js
// Controllers for managing User Search History in NexCart.

import { asyncHandler } from '../utils/asyncHandler.js';
import * as searchHistoryService from '../services/searchHistoryService.js';
import { successResponse } from '../utils/ApiResponse.js';

/**
 * Handle POST /api/search/history
 * Save a search query history entry for the authenticated user.
 */
export const saveSearchEntry = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { entry, created } = await searchHistoryService.saveSearchEntry(userId, req.body);
  const statusCode = created ? 201 : 200;
  return successResponse(res, 'Search history entry saved successfully', { entry }, statusCode);
});

/**
 * Handle GET /api/search/history
 * Fetch the authenticated user's search history ordered by newest first.
 */
export const getSearchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const history = await searchHistoryService.getUserSearchHistory(userId);
  return successResponse(res, 'Search history fetched successfully', { history });
});

/**
 * Handle DELETE /api/search/history/:id
 * Delete a single search history item.
 */
export const deleteSearchEntry = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const entryId = req.params.id;
  await searchHistoryService.deleteSearchEntry(userId, entryId);
  return successResponse(res, 'Search history entry deleted successfully');
});

/**
 * Handle DELETE /api/search/history
 * Clear all search history entries for the authenticated user.
 */
export const clearSearchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await searchHistoryService.clearUserSearchHistory(userId);
  return successResponse(res, 'All search history cleared successfully');
});
