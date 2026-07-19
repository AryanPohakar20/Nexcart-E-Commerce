import React, { useState, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import logo from '../assets/logo.jpg';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiBarChart2, FiDollarSign, 
  FiUsers, FiArchive, FiSettings, FiUser, FiArrowLeft, FiLogOut, FiMenu, FiX 
} from 'react-icons/fi';

const SellerLayout = () => {
  const { user, logoutUser, showToast } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/seller/dashboard', icon: FiGrid },
    { name: 'Products', path: '/seller/products', icon: FiPackage },
    { name: 'Orders', path: '/seller/orders', icon: FiShoppingBag },
    { name: 'Analytics', path: '/seller/analytics', icon: FiBarChart2 },
    { name: 'Inventory', path: '/seller/inventory', icon: FiArchive },
    { name: 'Settings', path: '/seller/settings', icon: FiSettings },
    { name: 'Profile', path: '/seller/profile', icon: FiUser },
  ];

  return (
    <div className="min-h-screen bg-darkBg text-white flex">
      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-secondaryBg border-r border-white/5 p-6 flex flex-col justify-between
        transition-transform duration-300 md:translate-x-0 md:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <img src={logo} alt="Logo" className="w-8 h-8 rounded object-cover border border-primary/20" />
              <span className="text-xl font-bold tracking-wider text-primary">NEX<span className="text-white">CART</span></span>
              <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded">Seller</span>
            </div>
            <button className="md:hidden text-white hover:text-primary" onClick={() => setIsSidebarOpen(false)}>
              <FiX size={24} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm
                    ${isActive 
                      ? 'bg-primary text-black shadow-yellow-glow' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-6 border-t border-white/5">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <FiArrowLeft size={18} />
            <span>Customer Shop</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-400 hover:bg-red-500/10 transition-all"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-secondaryBg/80 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-white hover:text-primary" onClick={() => setIsSidebarOpen(true)}>
              <FiMenu size={24} />
            </button>
            <h1 className="text-xl font-bold hidden md:block">Seller Management Studio</h1>
          </div>

          {/* User Profile Summary */}
          <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-1.5 border border-white/5">
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full object-cover border border-primary/40"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-tight text-white">{user?.name || 'Seller Inc'}</p>
              <p className="text-[10px] text-primary leading-none uppercase tracking-wider font-bold">Premium Vendor</p>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
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
