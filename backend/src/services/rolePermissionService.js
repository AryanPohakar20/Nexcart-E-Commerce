// src/services/rolePermissionService.js
// Enterprise Role-Based Access Control (RBAC) and Permission matrix engine.

import { ROLES } from '../constants/roles.js';

export const MODULES = [
  'users',
  'sellers',
  'products',
  'categories',
  'orders',
  'verification',
  'reports',
  'settings',
  'imports',
  'export',
  'audit',
  'system',
  'notifications',
  'analytics',
];

export const ACTIONS = [
  'read',
  'create',
  'update',
  'delete',
  'approve',
  'reject',
  'suspend',
  'export',
  'import',
];

// Default Permission Matrix for each administrative tier
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    all: ['*'],
  },
  [ROLES.ADMIN]: {
    users: ['read', 'create', 'update', 'delete', 'suspend', 'export', 'import'],
    sellers: ['read', 'create', 'update', 'delete', 'approve', 'reject', 'suspend', 'export'],
    products: ['read', 'create', 'update', 'delete', 'approve', 'reject', 'export', 'import'],
    categories: ['read', 'create', 'update', 'delete', 'export'],
    orders: ['read', 'update', 'export'],
    verification: ['read', 'approve', 'reject', 'update'],
    reports: ['read', 'create', 'update', 'delete', 'export'],
    settings: ['read', 'update'],
    imports: ['read', 'create', 'import'],
    export: ['read', 'export'],
    audit: ['read', 'export'],
    system: ['read'],
    notifications: ['read', 'update', 'delete'],
    analytics: ['read', 'export'],
  },
  [ROLES.MODERATOR]: {
    users: ['read'],
    sellers: ['read', 'approve', 'reject', 'suspend'],
    products: ['read', 'approve', 'reject'],
    categories: ['read'],
    orders: ['read'],
    verification: ['read', 'approve', 'reject'],
    reports: ['read', 'update'],
    settings: ['read'],
    imports: ['read'],
    export: ['read', 'export'],
    audit: ['read'],
    system: ['read'],
    notifications: ['read', 'update'],
    analytics: ['read'],
  },
  [ROLES.SUPPORT_STAFF]: {
    users: ['read'],
    sellers: ['read'],
    products: ['read'],
    categories: ['read'],
    orders: ['read', 'update'],
    verification: ['read'],
    reports: ['read', 'update'],
    settings: [],
    imports: [],
    export: ['read'],
    audit: [],
    system: ['read'],
    notifications: ['read', 'update'],
    analytics: ['read'],
  },
};

/**
 * Check if a given user object has permission for a specific module and action.
 * @param {Object} user - The authenticated user document/payload
 * @param {string} module - The target module name (e.g. 'products')
 * @param {string} action - The requested action (e.g. 'approve')
 * @returns {boolean}
 */
export const checkUserPermission = (user, module, action) => {
  if (!user || !user.role) return false;

  const role = String(user.role).toLowerCase();

  // Super Admin has unrestricted access to everything
  if (role === ROLES.SUPER_ADMIN) return true;

  // Check Custom Permissions override if defined on the user model
  if (user.customPermissions && user.customPermissions instanceof Map) {
    const customModPerms = user.customPermissions.get(module);
    if (customModPerms && (customModPerms.includes('*') || customModPerms.includes(action))) {
      return true;
    }
  } else if (user.customPermissions && typeof user.customPermissions === 'object') {
    const customModPerms = user.customPermissions[module];
    if (Array.isArray(customModPerms) && (customModPerms.includes('*') || customModPerms.includes(action))) {
      return true;
    }
  }

  // Fallback to default role matrix
  const roleRules = ROLE_PERMISSIONS[role];
  if (!roleRules) {
    // If legacy 'admin' role was passed and not in map, treat as ADMIN
    if (role === 'admin') {
      const adminRules = ROLE_PERMISSIONS[ROLES.ADMIN];
      const modPerms = adminRules[module];
      return Boolean(modPerms && (modPerms.includes('*') || modPerms.includes(action)));
    }
    return false;
  }

  if (roleRules.all && roleRules.all.includes('*')) {
    return true;
  }

  const allowedActions = roleRules[module];
  if (!allowedActions) return false;

  return allowedActions.includes('*') || allowedActions.includes(action);
};

/**
 * Get all available roles, modules, actions, and default permission sets.
 */
export const getRolesAndPermissions = () => {
  return {
    roles: [
      { id: ROLES.SUPER_ADMIN, name: 'Super Administrator', description: 'Full unrestricted platform and infrastructure access' },
      { id: ROLES.ADMIN, name: 'Administrator', description: 'Complete marketplace operations, user governance, and configurations' },
      { id: ROLES.MODERATOR, name: 'Marketplace Moderator', description: 'Catalog oversight, seller approvals, and dispute management' },
      { id: ROLES.SUPPORT_STAFF, name: 'Support Staff', description: 'Order assistance, customer inquiries, and ticket triage' },
    ],
    modules: MODULES,
    actions: ACTIONS,
    permissionsMatrix: ROLE_PERMISSIONS,
  };
};
