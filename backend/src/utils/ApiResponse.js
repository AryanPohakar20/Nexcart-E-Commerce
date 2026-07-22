// src/utils/ApiResponse.js
// Centralized response helpers — all API responses use these functions
// to ensure a consistent JSON shape across the entire application.

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {*} data       - Optional payload (object, array, etc.)
 * @param {number} statusCode - HTTP status (default 200)
 */
export const successResponse = (res, message = 'Success', data = null, statusCode = 200) => {
  const payload = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {Array}  errors    - Optional array of field-level errors
 * @param {number} statusCode - HTTP status (default 400)
 */
export const errorResponse = (res, message = 'Something went wrong', errors = [], statusCode = 400) => {
  const payload = {
    success: false,
    message,
  };

  if (errors && errors.length > 0) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};
