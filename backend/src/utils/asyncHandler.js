// src/utils/asyncHandler.js
// Higher-order function that wraps async route handlers and automatically
// forwards any rejected promise or thrown error to Express's next() function,
// eliminating the need for repetitive try/catch blocks in every controller.

/**
 * @param {Function} fn - An async Express route handler
 * @returns {Function}  - Wrapped handler that catches errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
