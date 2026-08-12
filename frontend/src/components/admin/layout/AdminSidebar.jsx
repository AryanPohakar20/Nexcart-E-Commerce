import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiUsers, FiShoppingBag, FiPackage, FiTag, FiShoppingCart,
  FiCheckSquare, FiFileText, FiUploadCloud, FiActivity,
  FiBell, FiBarChart2, FiSettings, FiUser, FiLogOut,
  FiChevronLeft, FiChevronRight, FiArrowLeft, FiX,
  FiZap
} from 'react-icons/fi';
import logo from '../../../assets/logo.jpg';

const NAV_SECTIONS = [
  {
    id: 'core',
    label: 'Core',
    items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
      { name: 'Notifications', path: '/admin/notifications', icon: FiBell },
    ]
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    items: [
      { name: 'Users', path: '/admin/users', icon: FiUsers, badge: null },
      { name: 'Sellers', path: '/admin/sellers', icon: FiShoppingBag },
      { name: 'Products', path: '/admin/products', icon: FiPackage },
      { name: 'Categories', path: '/admin/categories', icon: FiTag },
      { name: 'Orders', path: '/admin/orders', icon: FiShoppingCart },
    ]
  },
  {
    id: 'tools',
    label: 'Operations',
    items: [
      { name: 'Verification', path: '/admin/verification', icon: FiCheckSquare, badge: 47 },
      { name: 'Reports', path: '/admin/reports', icon: FiFileText },
      { name: 'CSV Import', path: '/admin/csv-import', icon: FiUploadCloud },
      { name: 'Audit Logs', path: '/admin/audit-logs', icon: FiActivity },
    ]
  },
  {
    id: 'analytics',
    label: 'Insights',
    items: [
      { name: 'Analytics', path: '/admin/analytics', icon: FiBarChart2 },
      { name: 'Settings', path: '/admin/settings', icon: FiSettings },
    ]
  }
];

const AdminSidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose, user, onLogout }) => {
  const navigate = useNavigate();

  const sidebarContent = (isMobile = false) => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : 'justify-between'} px-4 py-5 border-b border-borderColor`}>
        {(!collapsed || isMobile) && (
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src={logo} alt="NexCart" className="w-8 h-8 rounded-lg object-cover" />
            <div>
              <span className="text-sm font-black tracking-wider text-yellow-400">Nex</span>
              <span className="text-sm font-black tracking-wider text-textPrimary">Cart</span>
              <span className="ml-1.5 bg-yellow-500/15 border border-yellow-500/20 text-yellow-400 text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded-md">Admin</span>
            </div>
          </div>
        )}
        {collapsed && !isMobile && (
          <img src={logo} alt="NexCart" className="w-8 h-8 rounded-lg object-cover cursor-pointer" onClick={() => navigate('/')} />
        )}
        {isMobile && (
          <button onClick={onMobileClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-textSecondary hover:text-textPrimary hover:bg-surface">
            <FiX size={18} />
          </button>
        )}
        {!isMobile && (
          <button
            onClick={onToggle}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-textSecondary hover:text-textPrimary hover:bg-surface transition-all"
          >
            {collapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-thin">
        {NAV_SECTIONS.map((section) => (
          <div key={section.id} className="mb-2">
            {(!collapsed || isMobile) && (
              <p className="text-[9px] font-black uppercase tracking-widest text-textSecondary px-3 py-2 mb-1">
                {section.label}
              </p>
            )}
            {collapsed && !isMobile && (
              <div className="h-px bg-borderColor mx-2 my-2" />
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={isMobile ? onMobileClose : undefined}
                  title={collapsed && !isMobile ? item.name : undefined}
                  className={({ isActive }) => `
                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm
                    transition-all duration-200 group
                    ${isActive
                      ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(255,193,7,0.3)]'
                      : 'text-textSecondary hover:text-textPrimary hover:bg-surface'
                    }
                    ${collapsed && !isMobile ? 'justify-center' : ''}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} className="flex-shrink-0" />
                      {(!collapsed || isMobile) && (
                        <>
                          <span className="flex-1 truncate">{item.name}</span>
                          {item.badge && (
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full
                              ${isActive ? 'bg-black/20 text-black' : 'bg-yellow-500/15 text-yellow-400'}`}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {/* Tooltip for collapsed */}
                      {collapsed && !isMobile && (
                        <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-cardBg border border-borderColor rounded-lg text-xs font-semibold text-textPrimary whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 z-50 transition-opacity">
                          {item.name}
                          {item.badge && <span className="ml-2 text-yellow-400">({item.badge})</span>}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={`px-3 py-3 border-t border-borderColor space-y-1`}>
        {/* Admin profile */}
        {(!collapsed || isMobile) && user && (
          <NavLink
            to="/admin/profile"
            onClick={isMobile ? onMobileClose : undefined}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${isActive ? 'bg-yellow-500 text-black' : 'text-textSecondary hover:text-textPrimary hover:bg-surface'}
            `}
          >
            {({ isActive }) => (
              <>
                <img
                  src={user.avatar || `https://i.pravatar.cc/150?u=${user.email}`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-borderColor"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${isActive ? 'text-black' : 'text-textPrimary'}`}>{user.name || 'Administrator'}</p>
                  <p className={`text-[10px] truncate ${isActive ? 'text-black/70' : 'text-textSecondary'}`}>System Root</p>
                </div>
              </>
            )}
          </NavLink>
        )}
        {(collapsed && !isMobile) && (
          <NavLink to="/admin/profile" title="Admin Profile"
            className={({ isActive }) => `flex justify-center items-center p-2.5 rounded-xl transition-all ${isActive ? 'bg-yellow-500 text-black' : 'text-textSecondary hover:bg-surface hover:text-textPrimary'}`}
          >
            <FiUser size={18} />
          </NavLink>
        )}

        {/* Storefront link */}
        <button
          onClick={() => navigate('/')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-textSecondary hover:text-textPrimary hover:bg-surface transition-all ${collapsed && !isMobile ? 'justify-center' : ''}`}
        >
          <FiArrowLeft size={16} className="flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Storefront</span>}
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all ${collapsed && !isMobile ? 'justify-center' : ''}`}
        >
          <FiLogOut size={16} className="flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-secondaryBg border-r border-borderColor h-screen sticky top-0 overflow-hidden flex-shrink-0"
      >
        {sidebarContent(false)}
      </motion.aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-secondaryBg border-r border-borderColor z-50 md:hidden"
            >
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
