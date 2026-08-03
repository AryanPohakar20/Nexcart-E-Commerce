// src/repositories/brandRepository.js
// Data-access layer for Brand model.

import mongoose from 'mongoose';
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

/**
 * Find popular brands by aggregation on product counts in the Product collection.
 */
export const findPopularBrands = async (limit = 6) => {
  const Product = mongoose.model('Product');
  const Brand = mongoose.model('Brand');

  const popular = await Product.aggregate([
    {
      $group: {
        _id: '$brand',
        productCount: { $sum: 1 },
      },
    },
    { $sort: { productCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'brands',
        localField: '_id',
        foreignField: '_id',
        as: 'brandInfo',
      },
    },
    { $unwind: '$brandInfo' },
    {
      $project: {
        _id: '$brandInfo._id',
        name: '$brandInfo.name',
        slug: '$brandInfo.slug',
        description: '$brandInfo.description',
        logo: '$brandInfo.logo',
        status: '$brandInfo.status',
        productCount: 1,
      },
    },
  ]);

  // Filter to active brands
  let results = popular.filter((b) => b.status === 'active');

  // Backfill with other active brands if count is less than limit
  if (results.length < limit) {
    const existingIds = results.map((b) => b._id.toString());
    const additionalBrands = await Brand.find({
      _id: { $nin: existingIds },
      status: 'active',
    }).limit(limit - results.length);

    results = results.concat(
      additionalBrands.map((b) => ({
        _id: b._id,
        name: b.name,
        slug: b.slug,
        description: b.description,
        logo: b.logo,
        status: b.status,
        productCount: 0,
      }))
    );
  }

  return results;
};
