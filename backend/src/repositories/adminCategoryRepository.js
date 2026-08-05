// src/repositories/adminCategoryRepository.js
// Data access layer for Category entity with aggregation for dynamic product counts.

import mongoose from 'mongoose';
import Category from '../models/Category.js';

/**
 * List categories with parent population, filtering, and real product count calculation.
 */
export const listCategories = async ({
  filter = {},
  page = 1,
  limit = 50,
  sort = { order: 1, createdAt: -1 },
} = {}) => {
  const skip = (page - 1) * limit;

  // Use aggregation pipeline to automatically calculate dynamic product counts
  const pipeline = [
    { $match: filter },
    {
      $lookup: {
        from: 'products',
        let: { catId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$category', '$$catId'] },
                  { $ne: ['$isDeleted', true] },
                ],
              },
            },
          },
          { $count: 'count' },
        ],
        as: 'productCountData',
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'parent',
        foreignField: '_id',
        as: 'parentData',
      },
    },
    {
      $addFields: {
        productCount: {
          $ifNull: [{ $arrayElemAt: ['$productCountData.count', 0] }, 0],
        },
        parentCategory: { $arrayElemAt: ['$parentData', 0] },
      },
    },
    {
      $project: {
        productCountData: 0,
        parentData: 0,
      },
    },
    { $sort: sort },
    {
      $facet: {
        categories: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ];

  const [result] = await Category.aggregate(pipeline);
  const categories = result?.categories || [];
  const total = result?.totalCount?.[0]?.count || 0;

  return { categories, total };
};

/**
 * Get category by ID with populated parent and product count.
 */
export const getCategoryById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const [category] = await Category.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'products',
        let: { catId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$category', '$$catId'] },
                  { $ne: ['$isDeleted', true] },
                ],
              },
            },
          },
          { $count: 'count' },
        ],
        as: 'productCountData',
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'parent',
        foreignField: '_id',
        as: 'parentData',
      },
    },
    {
      $addFields: {
        productCount: {
          $ifNull: [{ $arrayElemAt: ['$productCountData.count', 0] }, 0],
        },
        parentCategory: { $arrayElemAt: ['$parentData', 0] },
      },
    },
    {
      $project: {
        productCountData: 0,
        parentData: 0,
      },
    },
  ]);

  return category || null;
};

/**
 * Create a category.
 */
export const createCategory = async (data) => {
  const category = new Category(data);
  return category.save();
};

/**
 * Update category.
 */
export const updateCategory = async (id, data) => {
  return Category.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
};

/**
 * Bulk write operations for categories.
 */
export const bulkWriteCategories = async (operations) => {
  return Category.bulkWrite(operations);
};

/**
 * Get full hierarchical tree of categories.
 */
export const getCategoryTree = async () => {
  const allCategories = await Category.find({ isDeleted: { $ne: true } })
    .sort({ order: 1, name: 1 })
    .lean();

  const roots = allCategories.filter((c) => !c.parent);
  const buildSubtree = (parentId) => {
    return allCategories
      .filter((c) => c.parent && c.parent.toString() === parentId.toString())
      .map((child) => ({
        ...child,
        children: buildSubtree(child._id),
      }));
  };

  return roots.map((root) => ({
    ...root,
    children: buildSubtree(root._id),
  }));
};
