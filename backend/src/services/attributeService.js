// src/services/attributeService.js
// Service implementation for Attribute module.

import mongoose from 'mongoose';
import * as attributeRepository from '../repositories/attributeRepository.js';
import * as categoryRepository from '../repositories/categoryRepository.js';
import * as subcategoryRepository from '../repositories/subcategoryRepository.js';
import { ApiError } from '../utils/ApiError.js';
import Attribute from '../models/Attribute.js';

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

/**
 * Validate that default values are consistent with the attribute's type and options
 */
const validateDefaultValue = (type, options, value) => {
  if (value === null || value === undefined) return;

  if (type === 'boolean') {
    if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
      throw new ApiError(400, 'Default value must be a boolean');
    }
  } else if (type === 'number') {
    if (isNaN(Number(value))) {
      throw new ApiError(400, 'Default value must be a valid number');
    }
  } else if (type === 'select') {
    if (!options.includes(value)) {
      throw new ApiError(400, `Default value "${value}" must be one of the specified options: [${options.join(', ')}]`);
    }
  } else if (type === 'multi-select') {
    if (!Array.isArray(value)) {
      throw new ApiError(400, 'Default value for multi-select type must be an array');
    }
    const invalidValues = value.filter((val) => !options.includes(val));
    if (invalidValues.length > 0) {
      throw new ApiError(
        400,
        `Default values [${invalidValues.join(', ')}] must be chosen from the specified options: [${options.join(', ')}]`
      );
    }
  }
};

export const createAttribute = async (data) => {
  const { name, category: categoryId, subcategory: subcategoryId, type, options, defaultValue } = data;

  // 1. Verify parent category exists
  const parentCategory = await categoryRepository.findById(categoryId);
  if (!parentCategory) {
    throw new ApiError(404, 'Parent category not found');
  }

  // 2. Verify subcategory exists and belongs to the parent category (if subcategory is specified)
  const targetSubcategory = subcategoryId || null;
  if (targetSubcategory) {
    const subcat = await subcategoryRepository.findById(targetSubcategory);
    if (!subcat) {
      throw new ApiError(404, 'Subcategory not found');
    }
    const subcatCategoryId = subcat.category?._id || subcat.category;
    if (subcatCategoryId.toString() !== categoryId.toString()) {
      throw new ApiError(400, 'The specified subcategory does not belong to the parent category');
    }
  }

  // 3. Format/validate options
  let formattedOptions = [];
  if (type === 'select' || type === 'multi-select') {
    if (!options || !Array.isArray(options) || options.length === 0) {
      throw new ApiError(400, 'At least one option is required for select/multi-select attributes');
    }
    formattedOptions = options.map((opt) => opt.trim()).filter((opt) => opt !== '');
    if (formattedOptions.length === 0) {
      throw new ApiError(400, 'Options cannot contain only blank values');
    }
  } else {
    if (options && options.length > 0) {
      throw new ApiError(400, `Options are not allowed for attribute type: "${type}"`);
    }
  }

  // 4. Validate default value consistency
  validateDefaultValue(type, formattedOptions, defaultValue);

  // 5. Check if name is already taken in this category/subcategory scope
  const nameConflict = await Attribute.findOne({
    category: categoryId,
    subcategory: targetSubcategory,
    name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, 'i') },
  });
  if (nameConflict) {
    throw new ApiError(400, 'An attribute with this name already exists in this scope');
  }

  // 6. Generate unique slug
  const slug = data.slug ? slugify(data.slug) : slugify(name);
  if (!slug) {
    throw new ApiError(400, 'Could not generate a valid slug from the attribute name');
  }

  // 7. Check if slug conflict exists in this category/subcategory scope
  const slugConflict = await Attribute.findOne({
    category: categoryId,
    subcategory: targetSubcategory,
    slug,
  });
  if (slugConflict) {
    throw new ApiError(400, 'An attribute with this slug already exists in this scope');
  }

  return attributeRepository.create({
    ...data,
    slug,
    subcategory: targetSubcategory,
    options: formattedOptions,
  });
};

export const getAttributeById = async (id) => {
  const attribute = await attributeRepository.findById(id);
  if (!attribute) {
    throw new ApiError(404, 'Attribute not found');
  }
  return attribute;
};

export const getAllAttributes = async (filter = {}) => {
  return attributeRepository.findAll(filter);
};

export const getAttributesByCategory = async (categoryId, subcategoryFilter = undefined) => {
  if (!categoryId) {
    throw new ApiError(400, 'Category ID is required');
  }

  // Verify category exists
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Verify subcategory (if filter is specified)
  if (subcategoryFilter) {
    const subcat = await subcategoryRepository.findById(subcategoryFilter);
    if (!subcat) {
      throw new ApiError(404, 'Subcategory not found');
    }
    const subcatCategoryId = subcat.category?._id || subcat.category;
    if (subcatCategoryId.toString() !== categoryId.toString()) {
      throw new ApiError(400, 'The specified subcategory does not belong to the category');
    }
  }

  return attributeRepository.findByCategory(categoryId, subcategoryFilter);
};

export const updateAttribute = async (id, updates) => {
  const attribute = await attributeRepository.findById(id);
  if (!attribute) {
    throw new ApiError(404, 'Attribute not found');
  }

  // Resolve target scope values
  const activeCategoryId = updates.category || attribute.category?._id || attribute.category;
  const activeSubcategoryId = updates.subcategory !== undefined ? updates.subcategory : (attribute.subcategory?._id || attribute.subcategory || null);

  // Validate parent-child category-subcategory constraint if category or subcategory changes
  const categoryChanged = updates.category && updates.category.toString() !== (attribute.category?._id || attribute.category).toString();
  const subcategoryChanged = updates.subcategory !== undefined && String(updates.subcategory) !== String(attribute.subcategory?._id || attribute.subcategory || null);

  if (categoryChanged || subcategoryChanged) {
    // Check if new category exists
    const cat = await categoryRepository.findById(activeCategoryId);
    if (!cat) {
      throw new ApiError(404, 'Parent category not found');
    }

    // Check subcategory relationship if specified
    if (activeSubcategoryId) {
      const subcat = await subcategoryRepository.findById(activeSubcategoryId);
      if (!subcat) {
        throw new ApiError(404, 'Subcategory not found');
      }
      const subcatCategoryId = subcat.category?._id || subcat.category;
      if (subcatCategoryId.toString() !== activeCategoryId.toString()) {
        throw new ApiError(400, 'The specified subcategory does not belong to the parent category');
      }
    }
  }

  // Perform conflict checks for name and slug changes
  const nameChanged = updates.name && updates.name.trim() !== attribute.name;
  const targetName = updates.name ? updates.name.trim() : attribute.name;

  if (nameChanged || categoryChanged || subcategoryChanged) {
    // Check name conflict
    const nameConflict = await Attribute.findOne({
      _id: { $ne: id },
      category: activeCategoryId,
      subcategory: activeSubcategoryId,
      name: { $regex: new RegExp(`^${escapeRegex(targetName)}$`, 'i') },
    });
    if (nameConflict) {
      throw new ApiError(400, 'An attribute with this name already exists in this scope');
    }

    // Generate new slug
    const newSlug = updates.slug ? slugify(updates.slug) : slugify(targetName);
    if (!newSlug) {
      throw new ApiError(400, 'Could not generate a valid slug from the attribute name');
    }

    // Check slug conflict
    const slugConflict = await Attribute.findOne({
      _id: { $ne: id },
      category: activeCategoryId,
      subcategory: activeSubcategoryId,
      slug: newSlug,
    });
    if (slugConflict) {
      throw new ApiError(400, 'An attribute with this slug already exists in this scope');
    }

    updates.slug = newSlug;
  } else if (updates.slug && updates.slug.trim() !== attribute.slug) {
    // Direct slug update case
    const targetSlug = slugify(updates.slug);
    const slugConflict = await Attribute.findOne({
      _id: { $ne: id },
      category: activeCategoryId,
      subcategory: activeSubcategoryId,
      slug: targetSlug,
    });
    if (slugConflict) {
      throw new ApiError(400, 'An attribute with this slug already exists in this scope');
    }
    updates.slug = targetSlug;
  }

  // Validate type, options, and defaultValue consistency after merging
  const finalType = updates.type || attribute.type;
  
  let finalOptions = attribute.options || [];
  if (updates.options !== undefined) {
    finalOptions = updates.options;
  }

  if (finalType === 'select' || finalType === 'multi-select') {
    if (!finalOptions || !Array.isArray(finalOptions) || finalOptions.length === 0) {
      throw new ApiError(400, 'At least one option is required for select/multi-select attributes');
    }
    finalOptions = finalOptions.map((opt) => opt.trim()).filter((opt) => opt !== '');
    if (finalOptions.length === 0) {
      throw new ApiError(400, 'Options cannot contain only blank values');
    }
    updates.options = finalOptions;
  } else {
    // For other types, empty the options array if the type was changed or options were passed
    if (updates.type && updates.type !== attribute.type) {
      updates.options = [];
      finalOptions = [];
    } else if (updates.options && updates.options.length > 0) {
      throw new ApiError(400, `Options are not allowed for attribute type: "${finalType}"`);
    }
  }

  // Validate default value consistency
  const finalDefaultValue = updates.defaultValue !== undefined ? updates.defaultValue : attribute.defaultValue;
  validateDefaultValue(finalType, finalOptions, finalDefaultValue);

  return attributeRepository.update(id, updates);
};

export const deleteAttribute = async (id) => {
  const attribute = await attributeRepository.findById(id);
  if (!attribute) {
    throw new ApiError(404, 'Attribute not found');
  }
  return attributeRepository.deleteById(id);
};

export const generateFilters = async (categoryIdentifier, subcategoryIdentifier = null) => {
  if (!categoryIdentifier) {
    throw new ApiError(400, 'Category identifier is required');
  }

  // 1. Resolve Category (by ObjectId or Slug)
  let category = null;
  if (mongoose.isValidObjectId(categoryIdentifier)) {
    category = await categoryRepository.findById(categoryIdentifier);
  }
  if (!category) {
    category = await categoryRepository.findBySlug(categoryIdentifier);
  }
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // 2. Resolve Subcategory if provided
  let subcategory = null;
  if (subcategoryIdentifier) {
    if (mongoose.isValidObjectId(subcategoryIdentifier)) {
      subcategory = await subcategoryRepository.findById(subcategoryIdentifier);
    }
    if (!subcategory) {
      subcategory = await subcategoryRepository.findBySlug(subcategoryIdentifier);
    }
    if (!subcategory) {
      throw new ApiError(404, 'Subcategory not found');
    }

    // 3. Verify subcategory belongs to the category
    const subcatCategoryId = subcategory.category?._id || subcategory.category;
    if (subcatCategoryId.toString() !== category._id.toString()) {
      throw new ApiError(400, 'The specified subcategory does not belong to the category');
    }
  }

  // 4. Retrieve matching active attributes
  const attributes = await attributeRepository.findActiveFilters(
    category._id,
    subcategory ? subcategory._id : null
  );

  // 5. Structure and return dynamic filter metadata
  return {
    category: {
      _id: category._id,
      name: category.name,
      slug: category.slug,
    },
    subcategory: subcategory
      ? {
          _id: subcategory._id,
          name: subcategory.name,
          slug: subcategory.slug,
        }
      : null,
    filters: attributes.map((attr) => ({
      name: attr.name,
      slug: attr.slug,
      type: attr.type,
      options: attr.options,
      isRequired: attr.isRequired,
      defaultValue: attr.defaultValue,
    })),
  };
};

