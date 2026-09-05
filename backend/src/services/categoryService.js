// src/services/categoryService.js
// Service implementation for Category module.

import * as categoryRepository from '../repositories/categoryRepository.js';
import { ApiError } from '../utils/ApiError.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const createCategory = async (data) => {
  const { name } = data;
  if (!name) {
    throw new ApiError(400, 'Category name is required');
  }

  // Check if name is already taken (case-insensitive check)
  const existingName = await Category.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, 'i') },
  });
  if (existingName) {
    throw new ApiError(400, 'Category with this name already exists');
  }

  // Generate slug
  const slug = data.slug ? slugify(data.slug) : slugify(name);
  if (!slug) {
    throw new ApiError(400, 'Could not generate a valid slug from the name');
  }

  // Check if slug is already taken
  const existingSlug = await categoryRepository.findBySlug(slug);
  if (existingSlug) {
    throw new ApiError(400, 'Category with this slug already exists');
  }

  return categoryRepository.create({ ...data, slug });
};

export const getCategoryById = async (id) => {
  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  return category;
};

export const getCategoryBySlug = async (slug) => {
  if (!slug) {
    throw new ApiError(400, 'Category slug is required');
  }
  const category = await categoryRepository.findBySlug(slug);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  return category;
};

export const getAllCategories = async (filter = {}) => {
  const categories = await categoryRepository.findAll(filter);

  // Build category name → count mapping from products
  // Product model stores category as a String (e.g. "Beauty & Personal Care")
  // Apply same visibility rules as elsewhere: exclude deleted, only active/visible
  const pipeline = [
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ];
  const productCounts = {};
  const countResults = await Product.aggregate(pipeline);
  countResults.forEach((r) => {
    productCounts[r._id] = r.count;
  });

  // Attach productCount to each category
  const mapped = categories.map((c) => {
    const count = productCounts[c.name] || 0;
    return {
      ...c.toObject(),
      productCount: count,
    };
  });

  return mapped;
};

export const updateCategory = async (id, updates) => {
  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // If name is changing, check for duplicates and regenerate slug
  if (updates.name && updates.name.trim() !== category.name) {
    const newName = updates.name.trim();

    // Check if another category already has this name
    const nameConflict = await Category.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(newName)}$`, 'i') },
      _id: { $ne: id },
    });
    if (nameConflict) {
      throw new ApiError(400, 'Category with this name already exists');
    }

    // Regenerate slug
    const newSlug = updates.slug ? slugify(updates.slug) : slugify(newName);
    if (!newSlug) {
      throw new ApiError(400, 'Could not generate a valid slug from the updated name');
    }

    // Check slug conflict
    const slugConflict = await Category.findOne({
      slug: newSlug,
      _id: { $ne: id },
    });
    if (slugConflict) {
      throw new ApiError(400, 'Category with this slug already exists');
    }

    updates.slug = newSlug;
  } else if (updates.slug && updates.slug.trim() !== category.slug) {
    // If slug is changing directly, verify it doesn't conflict
    const newSlug = slugify(updates.slug);
    const slugConflict = await Category.findOne({
      slug: newSlug,
      _id: { $ne: id },
    });
    if (slugConflict) {
      throw new ApiError(400, 'Category with this slug already exists');
    }
    updates.slug = newSlug;
  }

  return categoryRepository.update(id, updates);
};

export const deleteCategory = async (id) => {
  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  return categoryRepository.deleteById(id);
};
