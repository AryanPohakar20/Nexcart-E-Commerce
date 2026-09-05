// src/services/subcategoryService.js
// Service implementation for Subcategory module.

import * as subcategoryRepository from '../repositories/subcategoryRepository.js';
import * as categoryRepository from '../repositories/categoryRepository.js';
import { ApiError } from '../utils/ApiError.js';
import Subcategory from '../models/Subcategory.js';

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

export const createSubcategory = async (data) => {
  const { name, category: categoryId } = data;
  if (!name) {
    throw new ApiError(400, 'Subcategory name is required');
  }
  if (!categoryId) {
    throw new ApiError(400, 'Parent category ID is required');
  }

  // Verify parent category exists
  const parentCategory = await categoryRepository.findById(categoryId);
  if (!parentCategory) {
    throw new ApiError(404, 'Parent category not found');
  }

  // Check if name is already taken within this parent category
  const nameConflict = await Subcategory.findOne({
    category: categoryId,
    name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, 'i') },
  });
  if (nameConflict) {
    throw new ApiError(400, 'Subcategory with this name already exists in this category');
  }

  // Generate unique slug
  const slug = data.slug ? slugify(data.slug) : slugify(name);
  if (!slug) {
    throw new ApiError(400, 'Could not generate a valid slug from the name');
  }

  // Check if slug is already taken globally
  const slugConflict = await subcategoryRepository.findBySlug(slug);
  if (slugConflict) {
    throw new ApiError(400, 'Subcategory with this slug already exists');
  }

  return subcategoryRepository.create({ ...data, slug });
};

export const getSubcategoryById = async (id) => {
  const subcategory = await subcategoryRepository.findById(id);
  if (!subcategory) {
    throw new ApiError(404, 'Subcategory not found');
  }
  return subcategory;
};

export const getSubcategoryBySlug = async (slug) => {
  if (!slug) {
    throw new ApiError(400, 'Subcategory slug is required');
  }
  const subcategory = await subcategoryRepository.findBySlug(slug);
  if (!subcategory) {
    throw new ApiError(404, 'Subcategory not found');
  }
  return subcategory;
};

export const getAllSubcategories = async (filter = {}) => {
  return subcategoryRepository.findAll(filter);
};

export const getSubcategoriesByCategory = async (categoryId) => {
  if (!categoryId) {
    throw new ApiError(400, 'Category ID is required');
  }
  
  // Verify category exists
  const parentCategory = await categoryRepository.findById(categoryId);
  if (!parentCategory) {
    throw new ApiError(404, 'Category not found');
  }
  
  return subcategoryRepository.findByCategory(categoryId);
};

export const updateSubcategory = async (id, updates) => {
  const subcategory = await subcategoryRepository.findById(id);
  if (!subcategory) {
    throw new ApiError(404, 'Subcategory not found');
  }

  // Determine the active parent category ID for conflict checking
  const activeCategoryId = updates.category || subcategory.category?._id || subcategory.category;

  if (updates.category && updates.category.toString() !== (subcategory.category?._id || subcategory.category).toString()) {
    // Verify new parent category exists
    const newParent = await categoryRepository.findById(updates.category);
    if (!newParent) {
      throw new ApiError(404, 'Parent category not found');
    }
  }

  // Check conflicts if name or parent category changes
  const nameChanged = updates.name && updates.name.trim() !== subcategory.name;
  const categoryChanged = updates.category && updates.category.toString() !== (subcategory.category?._id || subcategory.category).toString();

  if (nameChanged || categoryChanged) {
    const targetName = updates.name ? updates.name.trim() : subcategory.name;

    // Check if another subcategory already has this name under the target parent category
    const nameConflict = await Subcategory.findOne({
      _id: { $ne: id },
      category: activeCategoryId,
      name: { $regex: new RegExp(`^${escapeRegex(targetName)}$`, 'i') },
    });
    if (nameConflict) {
      throw new ApiError(400, 'Subcategory with this name already exists in this category');
    }

    // Regenerate slug
    const newSlug = updates.slug ? slugify(updates.slug) : slugify(targetName);
    if (!newSlug) {
      throw new ApiError(400, 'Could not generate a valid slug from the updated name');
    }

    // Check slug conflict globally
    const slugConflict = await Subcategory.findOne({
      _id: { $ne: id },
      slug: newSlug,
    });
    if (slugConflict) {
      throw new ApiError(400, 'Subcategory with this slug already exists');
    }

    updates.slug = newSlug;
  } else if (updates.slug && updates.slug.trim() !== subcategory.slug) {
    // If slug is changing directly, verify it doesn't conflict globally
    const newSlug = slugify(updates.slug);
    const slugConflict = await Subcategory.findOne({
      _id: { $ne: id },
      slug: newSlug,
    });
    if (slugConflict) {
      throw new ApiError(400, 'Subcategory with this slug already exists');
    }
    updates.slug = newSlug;
  }

  return subcategoryRepository.update(id, updates);
};

export const deleteSubcategory = async (id) => {
  const subcategory = await subcategoryRepository.findById(id);
  if (!subcategory) {
    throw new ApiError(404, 'Subcategory not found');
  }
  return subcategoryRepository.deleteById(id);
};
