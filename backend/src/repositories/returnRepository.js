import Return from '../models/Return.js';

/**
 * Create a new return request.
 */
export const createReturn = async (data) => {
  const returnRequest = new Return(data);
  return returnRequest.save();
};

/**
 * Find return by Mongoose ObjectId.
 */
export const findById = async (id) => {
  return Return.findById(id);
};

/**
 * Find return by custom returnId string or Mongoose ObjectId.
 */
export const findByReturnId = async (returnId) => {
  return Return.findOne({
    $or: [
      { returnId },
      { _id: returnId }
    ]
  });
};

/**
 * List returns with filters, pagination, and sorting.
 */
export const listReturns = async ({
  filter = {},
  page = 1,
  limit = 10,
  sort = { createdAt: -1 }
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
 */
export const countReturns = async (filter = {}) => {
  return Return.countDocuments(filter);
};
