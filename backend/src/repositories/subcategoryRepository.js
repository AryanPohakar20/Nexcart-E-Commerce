// src/repositories/subcategoryRepository.js
// Data-access layer for Subcategory model.

import Subcategory from '../models/Subcategory.js';

export const create = async (data) => {
  const subcategory = new Subcategory(data);
  return (await subcategory.save()).populate('category');
};

export const findById = async (id) => {
  return Subcategory.findById(id).populate('category');
};

export const findBySlug = async (slug) => {
  return Subcategory.findOne({ slug: slug.toLowerCase().trim() }).populate('category');
};

export const findAll = async (filter = {}) => {
  return Subcategory.find(filter).populate('category');
};

export const findByCategory = async (categoryId) => {
  return Subcategory.find({ category: categoryId }).populate('category');
};

export const update = async (id, updates) => {
  return Subcategory.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate('category');
};

export const deleteById = async (id) => {
  return Subcategory.findByIdAndDelete(id);
};
