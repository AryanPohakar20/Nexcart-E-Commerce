// src/repositories/searchHistoryRepository.js
// Data-access layer for the SearchHistory model in NexCart.

import SearchHistory from '../models/SearchHistory.js';

/**
 * Save a search history entry.
 */
export const create = async (data) => {
  const entry = new SearchHistory(data);
  return entry.save();
};

/**
 * Retrieve recent search entries for a user, sorted by searchedAt descending.
 */
export const findByUser = async (userId, limit = 50) => {
  return SearchHistory.find({ user: userId })
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .sort({ searchedAt: -1 })
    .limit(limit);
};

/**
 * Find a specific search history entry by its ID.
 */
export const findById = async (id) => {
  return SearchHistory.findById(id);
};

/**
 * Delete a specific search history entry.
 */
export const deleteById = async (id) => {
  return SearchHistory.findByIdAndDelete(id);
};

/**
 * Delete all search history entries for a specific user.
 */
export const clearByUser = async (userId) => {
  return SearchHistory.deleteMany({ user: userId });
};
