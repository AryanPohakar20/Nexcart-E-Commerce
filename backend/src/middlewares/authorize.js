import { ApiError } from '../utils/ApiError.js';

export const authorize = (...roles) => {
  const allowed = roles.flat().map((role) => String(role).toLowerCase());

  return (req, res, next) => {
    const userRole = req.user?.role ? String(req.user.role).toLowerCase() : '';

    if (!req.user || !allowed.includes(userRole)) {
      return next(
        new ApiError(
          403,
          `Forbidden: User role '${req.user?.role || 'unauthenticated'}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};
