// src/repositories/productRepository.js
// Data-access layer for the Product entity.

import Product from '../models/Product.js';

/**
 * Find a product by its MongoDB ID.
 * Optionally accepts a database transaction session.
 */
export const findProductById = async (id, session = null) => {
  const query = Product.findById(id);
  if (session) {
    query.session(session);
  }
  return query;
};

/**
 * Update the stock of a product.
 * Optionally accepts a database transaction session.
 */
export const updateProductStock = async (id, quantityChange, session = null) => {
  return Product.findByIdAndUpdate(
    id,
    { $inc: { stock: quantityChange } },
    { new: true, runValidators: true, session }
  );
};

/**
 * Atomically decrease the stock of a product.
 * Returns the write result containing modifiedCount.
 */
export const decreaseProductStock = async (id, quantity, session = null) => {
  return Product.updateOne(
    { _id: id, stock: { $gte: quantity }, isActive: true },
    { $inc: { stock: -quantity } },
    { session }
  );
};
