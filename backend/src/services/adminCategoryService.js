// src/services/adminCategoryService.js
// Business logic for Category management, parent-child hierarchies, and validation.

import slugify from 'slugify';
import * as categoryRepo from '../repositories/adminCategoryRepository.js';
import * as auditLogRepo from '../repositories/auditLogRepository.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { buildCategoryFilter } from '../utils/buildFilter.js';

/**
 * List categories with dynamic product count.
 */
export const listCategories = async (query = {}) => {
  const { page, limit } = parsePagination(query);
  const filter = buildCategoryFilter(query);

  let sort = { order: 1, createdAt: -1 };
  if (query.sortBy) {
    const order = query.sortOrder === 'asc' ? 1 : -1;
    sort = { [query.sortBy]: order };
  }

  const { categories, total } = await categoryRepo.listCategories({
    filter,
    page,
    limit,
    sort,
  });

  const pagination = buildPaginationMeta(total, page, limit);
  return { categories, pagination };
};

/**
 * Get Category Tree.
 */
export const getCategoryTree = async () => {
  return categoryRepo.getCategoryTree();
};

/**
 * Get category by ID.
 */
export const getCategory = async (id) => {
  const category = await categoryRepo.getCategoryById(id);
  if (!category) throw new ApiError(404, 'Category not found');
  return category;
};

/**
 * Create category.
 */
export const createCategory = async (data, adminUser, ip) => {
  if (!data.name) throw new ApiError(400, 'Category name is required');

  const slug = data.slug
    ? slugify(data.slug, { lower: true, strict: true })
    : slugify(data.name, { lower: true, strict: true });

  const existing = await Category.findOne({ slug, isDeleted: { $ne: true } });
  if (existing) {
    throw new ApiError(409, `Category with slug "${slug}" already exists`);
  }

  let level = 0;
  if (data.parent) {
    const parentCat = await Category.findById(data.parent);
    if (!parentCat) throw new ApiError(404, 'Parent category not found');
    level = (parentCat.level || 0) + 1;
  }

  const category = await categoryRepo.createCategory({
    ...data,
    slug,
    level,
  });

  await auditLogRepo.log({
    adminId: adminUser._id,
    adminEmail: adminUser.email,
    action: 'CREATE_CATEGORY',
    module: 'Categories',
    targetId: category._id,
    targetModel: 'Category',
    target: category.name,
    ip,
  });

  return category;
};

/**
 * Update category.
 */
export const updateCategory = async (id, data, adminUser, ip) => {
  const existing = await categoryRepo.getCategoryById(id);
  if (!existing) throw new ApiError(404, 'Category not found');

  if (data.slug && data.slug !== existing.slug) {
    const slug = slugify(data.slug, { lower: true, strict: true });
    const duplicate = await Category.findOne({
      slug,
      _id: { $ne: id },
      isDeleted: { $ne: true },
    });
    if (duplicate) throw new ApiError(409, `Category with slug "${slug}" already exists`);
    data.slug = slug;
  }

  if (data.parent) {
    if (data.parent.toString() === id.toString()) {
      throw new ApiError(400, 'Category cannot be its own parent');
    }
    const parentCat = await Category.findById(data.parent);
    if (!parentCat) throw new ApiError(404, 'Parent category not found');
    data.level = (parentCat.level || 0) + 1;
  } else if (data.parent === null || data.parent === '') {
    data.parent = null;
    data.level = 0;
  }

  const updated = await categoryRepo.updateCategory(id, data);

  await auditLogRepo.log({
    adminId: adminUser._id,
    adminEmail: adminUser.email,
    action: 'UPDATE_CATEGORY',
    module: 'Categories',
    targetId: id,
    targetModel: 'Category',
    target: updated.name,
    details: { updatedFields: Object.keys(data) },
    ip,
  });

  return updated;
};

/**
 * Delete category (soft delete).
 */
export const deleteCategory = async (id, adminUser, ip) => {
  const existing = await categoryRepo.getCategoryById(id);
  if (!existing) throw new ApiError(404, 'Category not found');

  // Check if there are active subcategories or products
  const [hasSubcategories, hasProducts] = await Promise.all([
    Category.countDocuments({ parent: id, isDeleted: { $ne: true } }),
    Product.countDocuments({ category: id, isDeleted: { $ne: true } }),
  ]);

  if (hasSubcategories > 0) {
    throw new ApiError(400, `Cannot delete category: Contains ${hasSubcategories} subcategories`);
  }

  const updated = await categoryRepo.updateCategory(id, {
    isDeleted: true,
    deletedAt: new Date(),
    status: 'Inactive',
  });

  await auditLogRepo.log({
    adminId: adminUser._id,
    adminEmail: adminUser.email,
    action: 'DELETE_CATEGORY',
    module: 'Categories',
    targetId: id,
    targetModel: 'Category',
    target: existing.name,
    details: { associatedProducts: hasProducts },
    ip,
  });

  return updated;
};
