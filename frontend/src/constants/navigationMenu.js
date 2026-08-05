import {
  FiUser,
  FiShoppingBag,
  FiMapPin,
  FiHeart,
  FiSettings,
  FiGrid,
  FiPackage,
  FiBarChart2,
  FiCheckCircle,
  FiSliders,
  FiUsers,
  FiBriefcase,
  FiBox,
  FiTrendingUp,
  FiFileText,
  FiShield,
} from 'react-icons/fi';

export const ROLE_CONFIGS = {
  customer: {
    roleLabel: 'Customer Account',
    badgeClass: 'bg-amber-500/10 text-primary border-primary/30',
    dotColor: 'bg-primary',
    menu: [
      { name: 'My Profile', path: '/profile', icon: FiUser },
      { name: 'My Orders', path: '/orders', icon: FiShoppingBag },
      { name: 'Saved Addresses', path: '/addresses', icon: FiMapPin },
      { name: 'Account Settings', path: '/profile', icon: FiSettings },
    ],
  },
  seller: {
    roleLabel: 'Seller Account',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dotColor: 'bg-emerald-400',
    menu: [
      { name: 'Seller Dashboard', path: '/seller/dashboard', icon: FiGrid },
      { name: 'My Products', path: '/seller/products', icon: FiPackage },
      { name: 'Orders', path: '/seller/orders', icon: FiShoppingBag },
      { name: 'Analytics', path: '/seller/analytics', icon: FiBarChart2 },
      { name: 'Store Settings', path: '/seller/settings', icon: FiSettings },
      { name: 'Verification', path: '/seller/verification-status', icon: FiCheckCircle },
    ],
  },
  marketplace_seller: {
    roleLabel: 'Seller Account',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dotColor: 'bg-emerald-400',
    menu: [
      { name: 'Seller Dashboard', path: '/seller/dashboard', icon: FiGrid },
      { name: 'My Products', path: '/seller/products', icon: FiPackage },
      { name: 'Orders', path: '/seller/orders', icon: FiShoppingBag },
      { name: 'Analytics', path: '/seller/analytics', icon: FiBarChart2 },
      { name: 'Store Settings', path: '/seller/settings', icon: FiSettings },
      { name: 'Verification', path: '/seller/verification-status', icon: FiCheckCircle },
    ],
  },
  admin: {
    roleLabel: 'Administrator Account',
    badgeClass: 'bg-accentBlue/10 text-accentBlue border-accentBlue/30',
    dotColor: 'bg-accentBlue',
    menu: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: FiSliders },
      { name: 'Users', path: '/admin/users', icon: FiUsers },
      { name: 'Marketplace Sellers', path: '/admin/dashboard', icon: FiBriefcase },
      { name: 'Products', path: '/admin/products', icon: FiBox },
      { name: 'Orders', path: '/admin/orders', icon: FiTrendingUp },
      { name: 'Reports', path: '/admin/reports', icon: FiFileText },
      { name: 'Settings', path: '/admin/settings', icon: FiSettings },
      { name: 'Audit Logs', path: '/admin/reports', icon: FiShield },
    ],
  },
};

/**
 * Get the standardized role navigation configuration for a given role.
 * Falls back to 'customer' if role is unrecognized or undefined.
 *
 * @param {string} role - The user's role from JWT/backend
 * @returns {object} Role configuration object containing roleLabel, badgeClass, and menu items
 */
export const getRoleConfig = (role) => {
  const normalizedRole = (role || 'customer').toLowerCase();
  return ROLE_CONFIGS[normalizedRole] || ROLE_CONFIGS.customer;
};
