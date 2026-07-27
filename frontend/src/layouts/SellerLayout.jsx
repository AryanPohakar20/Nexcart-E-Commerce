import React, { useState, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import logo from '../assets/logo.jpg';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiBarChart2, FiDollarSign, 
  FiArchive, FiSettings, FiUser, FiArrowLeft, FiLogOut, FiMenu, FiX,
  FiTag, FiMessageSquare, FiStar 
} from 'react-icons/fi';

const SellerLayout = () => {
  const { user, showToast } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Simple local mock logout wrapper since AppContext might not export logoutUser directly
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    showToast('Logged out of Seller Studio', 'info');
    navigate('/');
    window.location.reload(); // Reset state
  };

  const navItems = [
    { name: 'Dashboard', path: '/seller/dashboard', icon: FiGrid },
    { name: 'My Listings', path: '/seller/products', icon: FiPackage },
    { name: 'Orders Received', path: '/seller/orders', icon: FiShoppingBag },
    { name: 'Inventory Overview', path: '/seller/inventory', icon: FiArchive },
    { name: 'Sales Analytics', path: '/seller/analytics', icon: FiBarChart2 },
    { name: 'Store Coupons', path: '/seller/coupons', icon: FiTag },
    { name: 'Customer Messages', path: '/seller/messages', icon: FiMessageSquare },
    { name: 'Customer Reviews', path: '/seller/reviews', icon: FiStar },
    { name: 'Payouts & Ledger', path: '/seller/payouts', icon: FiDollarSign },
    { name: 'Seller Profile', path: '/seller/profile', icon: FiUser },
    { name: 'Studio Settings', path: '/seller/settings', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-darkBg text-white flex">
      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-secondaryBg border-r border-white/5 p-5 flex flex-col justify-between
        transition-transform duration-300 md:translate-x-0 md:static md:h-screen md:sticky md:top-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-6 overflow-y-auto max-h-[80vh] no-scrollbar">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
              <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg object-cover border border-primary/20" />
              <span className="text-lg font-black tracking-wider text-primary">NEX<span className="text-white">CART</span></span>
              <span className="bg-primary/10 border border-primary/20 text-primary text-[8px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded">Vendor</span>
            </div>
            <button className="md:hidden text-white hover:text-primary" onClick={() => setIsSidebarOpen(false)}>
              <FiX size={20} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => `
                    relative flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-xs group
                    ${isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,200,255,0.06)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* Left animated yellow bar */}
                      {isActive && (
                        <motion.span 
                          layoutId="active-indicator"
                          className="absolute left-0 w-1 h-5 bg-primary rounded-r-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      
                      <Icon size={16} />
                      <span>{item.name}</span>

                      {/* Right glowing blue dot */}
                      {isActive && (
                        <span className="absolute right-3.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00c8ff] animate-pulse" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1.5 pt-4 border-t border-white/5">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <FiArrowLeft size={16} />
            <span>Customer Shop</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs text-red-400 hover:bg-red-500/10 transition-all"
          >
            <FiLogOut size={16} />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-secondaryBg/80 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-white hover:text-primary" onClick={() => setIsSidebarOpen(true)}>
              <FiMenu size={20} />
            </button>
            <h1 className="text-sm font-black uppercase tracking-wider text-gray-400 hidden md:block">Seller Management Studio</h1>
          </div>

          {/* User Profile Summary */}
          <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-1.5 border border-white/5">
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'} 
              alt="Avatar" 
              className="w-7 h-7 rounded-full object-cover border border-primary/40"
            />
            <div className="hidden sm:block text-left">
              <p className="text-[11px] font-bold leading-tight text-white">{user?.name || 'Srushti Salunke'}</p>
              <p className="text-[9px] text-primary leading-none uppercase tracking-wider font-extrabold">Verified Merchant</p>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SellerLayout;
