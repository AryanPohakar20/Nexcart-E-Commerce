// src/middlewares/requirePermission.js
// Verifies fine-grained permissions for specific modules and actions.

import { ApiError } from '../utils/ApiError.js';
import { checkUserPermission } from '../services/rolePermissionService.js';

export const requirePermission = (module, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required to perform this action.'));
    }

    const isAuthorized = checkUserPermission(req.user, module, action);

    if (!isAuthorized) {
      return next(
        new ApiError(
          403,
          `Access Denied: You lack the '${action}' permission for the '${module}' module.`
        )
      );
    }

    next();
  };
};
