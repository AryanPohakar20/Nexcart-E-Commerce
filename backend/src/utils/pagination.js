// src/utils/pagination.js
// Reusable pagination helpers used by all admin list endpoints.

/**
 * Parse and validate pagination query params from an Express request.
 * @param {Object} query  - req.query
 * @param {number} [defaultLimit=10]
 * @returns {{ page, limit, skip, sort, search }}
 */
export const parsePagination = (query, defaultLimit = 10) => {
  const page  = Math.max(1, parseInt(query.page, 10)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip  = (page - 1) * limit;
  const search = (query.search || query.q || '').trim();

  // sort format: "field:asc" or "field:desc"  (default: createdAt desc)
  let sort = { createdAt: -1 };
  if (query.sort) {
    const [field, dir] = query.sort.split(':');
    if (field) sort = { [field]: dir === 'asc' ? 1 : -1 };
  }

  return { page, limit, skip, sort, search };
};

/**
 * Build a consistent pagination metadata envelope.
 * @param {number} total      - Total matching documents count
 * @param {number} page       - Current page
 * @param {number} limit      - Items per page
 * @returns {Object}  pagination metadata
 */
export const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    currentPage:  page,
    totalPages,
    totalItems:   total,
    itemsPerPage: limit,
    hasNext:      page < totalPages,
    hasPrevious:  page > 1,
  };
};
