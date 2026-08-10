// src/routes/searchHistoryRoutes.js
// Routes for Search History management.

import express from 'express';
import {
  saveSearchEntry,
  getSearchHistory,
  deleteSearchEntry,
  clearSearchHistory,
} from '../controllers/searchHistoryController.js';
import {
  validateSaveSearch,
  validateSearchHistoryId,
} from '../validations/searchHistoryValidation.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

// Enforce authentication middleware across all search history endpoints
router.use(authenticate);

// POST /api/search/history - Save a search entry
router.post('/', validateSaveSearch, saveSearchEntry);

// GET /api/search/history - View user's search history
router.get('/', getSearchHistory);

// DELETE /api/search/history/:id - Delete a specific search entry
router.delete('/:id', validateSearchHistoryId, deleteSearchEntry);

// DELETE /api/search/history - Clear all search history for the user
router.delete('/', clearSearchHistory);

export default router;
