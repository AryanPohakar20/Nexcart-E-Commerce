// src/repositories/returnRepository.js
// Data-access layer for the Return entity.
// All Mongoose queries for Return documents are centralized here.

import Return from '../models/Return.js';

/**
 * Create a new return request document.
 * @param {Object} data - Return creation payload
 */
export const createReturn = async (data) => {
  const returnRequest = new Return(data);
  return returnRequest.save();
};

/**
 * Find a return by its Mongoose ObjectId.
 */
export const findById = async (id) => {
  return Return.findById(id);
};

/**
 * Find a return by its custom returnId string OR Mongoose ObjectId.
 * Supports both RET-XXXXXX format and MongoDB _id format.
 */
export const findByReturnId = async (returnId) => {
  return Return.findOne({
    $or: [
      { returnId },
      { _id: Return.base.Types.ObjectId.isValid(returnId) ? returnId : null },
    ].filter(Boolean),
  });
};

/**
 * List returns with filters, pagination, and sorting.
 * Populates customer and order references for display.
 * @param {Object} options.filter  - MongoDB filter object
 * @param {number} options.page    - Page number (1-indexed)
 * @param {number} options.limit   - Items per page
 * @param {Object} options.sort    - Sort descriptor
 */
export const listReturns = async ({
  filter = {},
  page = 1,
  limit = 10,
  sort = { createdAt: -1 },
} = {}) => {
  const skip = (page - 1) * limit;

  return Return.find(filter)
    .populate({ path: 'customerId', select: 'firstName lastName email phone' })
    .populate({
      path: 'orderId',
      select: 'orderId orderNumber orderStatus totalAmount pricing seller customer items',
    })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
};

/**
 * Count total returns matching the filter.
 * @param {Object} filter - MongoDB filter object
 */
export const countReturns = async (filter = {}) => {
  return Return.countDocuments(filter);
};
