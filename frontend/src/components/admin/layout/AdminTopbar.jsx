import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../../../context/AppContext';
import {
  FiMenu, FiSearch, FiBell, FiChevronDown, FiChevronRight,
  FiUser, FiSettings, FiLogOut, FiSun, FiMoon, FiZap,
  FiPlus, FiAlertTriangle, FiX
} from 'react-icons/fi';
import { ADMIN_NOTIFICATIONS } from '../../../constants/adminDummyData';

const Breadcrumb = ({ location }) => {
  const parts = location.pathname.split('/').filter(Boolean);
  const labels = {
    admin: 'Admin',
    dashboard: 'Dashboard',
    users: 'Users',
    sellers: 'Sellers',
    products: 'Products',
    categories: 'Categories',
    orders: 'Orders',
    verification: 'Verification',
    reports: 'Reports',
    'csv-import': 'CSV Import',
    'audit-logs': 'Audit Logs',
    notifications: 'Notifications',
    analytics: 'Analytics',
    settings: 'Settings',
    profile: 'Profile',
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs">
      {parts.map((part, i) => (
        <React.Fragment key={part}>
          {i > 0 && <FiChevronRight size={11} className="text-gray-600" />}
          <span className={i === parts.length - 1 ? 'text-yellow-400 font-bold' : 'text-gray-500'}>
            {labels[part] || part}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

const AdminTopbar = ({ onMobileMenuOpen }) => {
  const { user, logoutUser, theme, toggleTheme } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = ADMIN_NOTIFICATIONS.filter((n) => !n.read).length;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const quickActions = [
    { label: 'Add User', icon: FiUser, path: '/admin/users' },
    { label: 'Verify Sellers', icon: FiAlertTriangle, path: '/admin/verification' },
    { label: 'View Reports', icon: FiSettings, path: '/admin/reports' },
  ];

  return (
    <header className="h-16 bg-[#111111]/95 backdrop-blur-xl border-b border-white/5 flex items-center gap-3 px-4 sticky top-0 z-30">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuOpen}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
      >
        <FiMenu size={20} />
      </button>

      {/* Breadcrumb + Date */}
      <div className="hidden md:flex flex-col">
        <Breadcrumb location={location} />
        <p className="text-[10px] text-gray-600 mt-0.5">{dateStr} · {timeStr}</p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Global Search */}
      <div className="relative hidden sm:block">
        <AnimatePresence>
          {searchOpen ? (
            <motion.div
              initial={{ width: 40, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 40, opacity: 0 }}
              className="flex items-center bg-white/5 border border-yellow-500/40 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,193,7,0.1)]"
            >
              <FiSearch size={15} className="ml-3 text-yellow-400 flex-shrink-0" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users, orders, products..."
                className="flex-1 h-9 px-3 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
                onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="mr-2 text-gray-500 hover:text-white">
                <FiX size={14} />
              </button>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-white/8 transition-all"
            >
              <FiSearch size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      <div className="relative hidden md:block">
        <button className="flex items-center gap-1.5 h-9 px-3 bg-white/5 border border-white/8 hover:border-yellow-500/30 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-all">
          <FiZap size={13} className="text-yellow-400" />
          Quick
        </button>
      </div>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-white/8 transition-all"
        >
          <FiBell size={17} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-500 ring-2 ring-[#111111]" />
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <h4 className="text-sm font-bold text-white">Notifications</h4>
                <span className="text-xs text-yellow-400 font-bold">{unreadCount} unread</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-white/3">
                {ADMIN_NOTIFICATIONS.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => { navigate(n.link); setNotifOpen(false); }}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-gray-600' : 'bg-yellow-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${n.read ? 'text-gray-400' : 'text-white'} truncate`}>{n.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    <span className="text-[10px] text-gray-600 whitespace-nowrap">{n.time}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { navigate('/admin/notifications'); setNotifOpen(false); }}
                className="w-full text-center py-3 text-xs font-bold text-yellow-400 hover:bg-yellow-500/5 border-t border-white/5 transition-colors"
              >
                View All Notifications →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile Dropdown */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
          className="flex items-center gap-2 h-9 pl-2 pr-3 bg-white/5 border border-white/8 hover:border-yellow-500/30 rounded-xl transition-all"
        >
          <img
            src={user?.avatar || `https://i.pravatar.cc/150?img=60`}
            alt="Admin"
            className="w-6 h-6 rounded-lg object-cover"
          />
          <span className="hidden sm:block text-xs font-bold text-white max-w-[80px] truncate">{user?.name?.split(' ')[0] || 'Admin'}</span>
          <FiChevronDown size={12} className={`text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 top-12 w-56 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* User info */}
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-xs font-bold text-white">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-gray-500">{user?.email || 'admin@nexcart.in'}</p>
                <span className="text-[9px] uppercase font-black text-yellow-400 tracking-widest">System Root</span>
              </div>
              <div className="py-1">
                <button onClick={() => { navigate('/admin/profile'); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                  <FiUser size={13} /> Profile Settings
                </button>
                <button onClick={() => { navigate('/admin/settings'); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                  <FiSettings size={13} /> Platform Settings
                </button>
                <button onClick={toggleTheme}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                  {theme === 'dark' ? <FiSun size={13} /> : <FiMoon size={13} />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
              <div className="border-t border-white/5 py-1">
                <button
                  onClick={() => { logoutUser(); navigate('/login'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <FiLogOut size={13} /> Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default AdminTopbar;
