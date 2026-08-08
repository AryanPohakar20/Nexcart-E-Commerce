// src/repositories/categoryRepository.js
// Data-access layer for Category model.

import Category from '../models/Category.js';

export const create = async (data) => {
  const category = new Category(data);
  return category.save();
};

export const findById = async (id) => {
  return Category.findById(id);
};

export const findBySlug = async (slug) => {
  return Category.findOne({ slug: slug.toLowerCase().trim() });
};

export const findAll = async (filter = {}) => {
  return Category.find(filter);
};

export const update = async (id, updates) => {
  return Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
};

export const deleteById = async (id) => {
  return Category.findByIdAndDelete(id);
};
