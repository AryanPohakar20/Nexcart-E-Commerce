// src/routes/searchRoutes.js
// Routes for Search features (Core Search, Autocomplete, Suggestions).

import express from 'express';
import {
  searchProducts,
  getAutocomplete,
  getSuggestions,
} from '../controllers/productController.js';
import {
  validateSearchQuery,
  validateQueryText,
} from '../validations/searchValidation.js';

const router = express.Router();

// GET /api/search - Core search API with filters, sorting, and pagination
router.get('/', validateSearchQuery, searchProducts);

// GET /api/search/autocomplete - Predict titles matching input query q
router.get('/autocomplete', validateQueryText, getAutocomplete);

// GET /api/search/suggestions - Get categories, brands, and product suggestions matching q
router.get('/suggestions', validateQueryText, getSuggestions);

export default router;
