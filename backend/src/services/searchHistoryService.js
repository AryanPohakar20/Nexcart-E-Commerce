// src/services/searchHistoryService.js
// Service implementation for the SearchHistory module in NexCart.

import * as searchHistoryRepository from '../repositories/searchHistoryRepository.js';
import SearchHistory from '../models/SearchHistory.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Save a search entry. If an identical entry exists, update the timestamp to float it to the top.
 */
export const saveSearchEntry = async (userId, data) => {
  const { keyword = null, category = null, brand = null } = data;

  const normalizedKeyword = keyword && keyword.trim() !== '' ? keyword.trim() : null;
  const normalizedCategory = category || null;
  const normalizedBrand = brand || null;

  // 1. Verify existence of Category if provided
  if (normalizedCategory) {
    const categoryDoc = await Category.findById(normalizedCategory);
    if (!categoryDoc) {
      throw new ApiError(404, 'Category not found');
    }
  }

  // 2. Verify existence of Brand if provided
  if (normalizedBrand) {
    const brandDoc = await Brand.findById(normalizedBrand);
    if (!brandDoc) {
      throw new ApiError(404, 'Brand not found');
    }
  }

  // 3. Check for duplicates under the user
  const matchCriteria = {
    user: userId,
    keyword: normalizedKeyword,
    category: normalizedCategory,
    brand: normalizedBrand,
  };

  let existingEntry = await SearchHistory.findOne(matchCriteria);

  if (existingEntry) {
    existingEntry.searchedAt = new Date();
    const updatedEntry = await existingEntry.save();
    return { entry: updatedEntry, created: false };
  }

  // 4. Create new entry if no duplicate
  const newEntry = await searchHistoryRepository.create({
    user: userId,
    keyword: normalizedKeyword,
    category: normalizedCategory,
    brand: normalizedBrand,
    searchedAt: new Date(),
  });
  return { entry: newEntry, created: true };
};

/**
 * Fetch search history for the authenticated user.
 */
export const getUserSearchHistory = async (userId) => {
  return searchHistoryRepository.findByUser(userId);
};

/**
 * Delete a single search history item, enforcing user ownership.
 */
export const deleteSearchEntry = async (userId, entryId) => {
  const entry = await searchHistoryRepository.findById(entryId);

  if (!entry) {
    throw new ApiError(404, 'Search history entry not found');
  }

  // Enforce boundary check: Must belong to the authenticated user
  if (entry.user.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to access this search history entry');
  }

  return searchHistoryRepository.deleteById(entryId);
};

/**
 * Clear all search history entries for the authenticated user.
 */
export const clearUserSearchHistory = async (userId) => {
  return searchHistoryRepository.clearByUser(userId);
};
