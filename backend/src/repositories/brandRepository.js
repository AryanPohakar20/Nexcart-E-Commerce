// src/repositories/brandRepository.js
// Data-access layer for Brand model.

import Brand from '../models/Brand.js';

export const create = async (data) => {
  const brand = new Brand(data);
  return brand.save();
};

export const findById = async (id) => {
  return Brand.findById(id);
};

export const findBySlug = async (slug) => {
  return Brand.findOne({ slug: slug.toLowerCase().trim() });
};

export const findAll = async (filter = {}) => {
  return Brand.find(filter);
};

export const update = async (id, updates) => {
  return Brand.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
};

export const deleteById = async (id) => {
  return Brand.findByIdAndDelete(id);
};
