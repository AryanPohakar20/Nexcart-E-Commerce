// src/services/brandService.js
// Service implementation for Brand module.

import * as brandRepository from '../repositories/brandRepository.js';
import { ApiError } from '../utils/ApiError.js';
import Brand from '../models/Brand.js';

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

export const createBrand = async (data) => {
  const { name } = data;
  if (!name) {
    throw new ApiError(400, 'Brand name is required');
  }

  // Check name conflict case-insensitively
  const nameConflict = await Brand.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, 'i') },
  });
  if (nameConflict) {
    throw new ApiError(400, 'Brand with this name already exists');
  }

  // Generate unique slug
  const slug = data.slug ? slugify(data.slug) : slugify(name);
  if (!slug) {
    throw new ApiError(400, 'Could not generate a valid slug from the name');
  }

  // Check slug conflict globally
  const slugConflict = await brandRepository.findBySlug(slug);
  if (slugConflict) {
    throw new ApiError(400, 'Brand with this slug already exists');
  }

  return brandRepository.create({ ...data, slug });
};

export const getBrandById = async (id) => {
  const brand = await brandRepository.findById(id);
  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }
  return brand;
};

export const getBrandBySlug = async (slug) => {
  if (!slug) {
    throw new ApiError(400, 'Brand slug is required');
  }
  const brand = await brandRepository.findBySlug(slug);
  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }
  return brand;
};

export const getAllBrands = async (filter = {}) => {
  return brandRepository.findAll(filter);
};

export const updateBrand = async (id, updates) => {
  const brand = await brandRepository.findById(id);
  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }

  const nameChanged = updates.name && updates.name.trim() !== brand.name;

  if (nameChanged) {
    const targetName = updates.name.trim();

    // Check name conflict
    const nameConflict = await Brand.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${escapeRegex(targetName)}$`, 'i') },
    });
    if (nameConflict) {
      throw new ApiError(400, 'Brand with this name already exists');
    }

    // Generate and verify slug
    const newSlug = updates.slug ? slugify(updates.slug) : slugify(targetName);
    if (!newSlug) {
      throw new ApiError(400, 'Could not generate a valid slug from the name');
    }

    const slugConflict = await Brand.findOne({
      _id: { $ne: id },
      slug: newSlug,
    });
    if (slugConflict) {
      throw new ApiError(400, 'Brand with this slug already exists');
    }

    updates.slug = newSlug;
  } else if (updates.slug && updates.slug.trim() !== brand.slug) {
    const targetSlug = slugify(updates.slug);
    const slugConflict = await Brand.findOne({
      _id: { $ne: id },
      slug: targetSlug,
    });
    if (slugConflict) {
      throw new ApiError(400, 'Brand with this slug already exists');
    }
    updates.slug = targetSlug;
  }

  return brandRepository.update(id, updates);
};

export const deleteBrand = async (id) => {
  const brand = await brandRepository.findById(id);
  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }
  return brandRepository.deleteById(id);
};
