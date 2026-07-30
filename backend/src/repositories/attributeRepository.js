// src/repositories/attributeRepository.js
// Data-access layer for Attribute model.

import Attribute from '../models/Attribute.js';

export const create = async (data) => {
  const attribute = new Attribute(data);
  return (await attribute.save()).populate(['category', 'subcategory']);
};

export const findById = async (id) => {
  return Attribute.findById(id).populate(['category', 'subcategory']);
};

export const findBySlug = async (category, subcategory, slug) => {
  const targetSubcategory = subcategory || null;
  return Attribute.findOne({
    category,
    subcategory: targetSubcategory,
    slug: slug.toLowerCase().trim(),
  }).populate(['category', 'subcategory']);
};

export const findAll = async (filter = {}) => {
  return Attribute.find(filter).populate(['category', 'subcategory']);
};

export const findByCategory = async (categoryId, subcategoryFilter = undefined) => {
  const query = { category: categoryId };
  if (subcategoryFilter !== undefined) {
    query.subcategory = subcategoryFilter;
  }
  return Attribute.find(query).populate(['category', 'subcategory']);
};

export const findActiveFilters = async (categoryId, subcategoryId = null) => {
  const query = {
    category: categoryId,
    isActive: true,
  };
  if (subcategoryId) {
    query.subcategory = { $in: [null, subcategoryId] };
  } else {
    query.subcategory = null;
  }
  return Attribute.find(query).populate(['category', 'subcategory']);
};


export const update = async (id, updates) => {
  return Attribute.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate(['category', 'subcategory']);
};

export const deleteById = async (id) => {
  return Attribute.findByIdAndDelete(id);
};
