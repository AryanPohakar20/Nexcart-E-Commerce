import React, { useState, useContext } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import logo from '../assets/logo.jpg';
import { 
  FiSliders, FiUsers, FiBox, FiTrendingUp, FiFolder, 
  FiBookmark, FiFileText, FiSettings, FiArrowLeft, FiLogOut, FiMenu, FiX, FiStar 
} from 'react-icons/fi';

const AdminLayout = () => {
  const { user, logoutUser } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FiSliders },
    { name: 'Users', path: '/admin/users', icon: FiUsers },
    { name: 'Products', path: '/admin/products', icon: FiBox },
    { name: 'Orders', path: '/admin/orders', icon: FiTrendingUp },
    { name: 'Categories', path: '/admin/categories', icon: FiFolder },
    { name: 'Brands', path: '/admin/brands', icon: FiBookmark },
    { name: 'Review Moderation', path: '/admin/reviews', icon: FiStar },
    { name: 'Reports', path: '/admin/reports', icon: FiFileText },
    { name: 'Settings', path: '/admin/settings', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-500">
      {/* Sidebar Panel */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border p-6 flex flex-col justify-between
        transition-all duration-500 md:translate-x-0 md:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <img src={logo} alt="Logo" className="w-8 h-8 rounded object-cover border border-accentBlue/20" />
              <span className="text-xl font-bold tracking-wider text-primary">NEX<span className="text-foreground">CART</span></span>
              <span className="bg-accentBlue/10 border border-accentBlue/20 text-accentBlue text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded">Admin</span>
            </div>
            <button className="md:hidden text-foreground hover:text-primary transition-colors duration-500" onClick={() => setIsSidebarOpen(false)}>
              <FiX size={24} />
            </button>
          </div>

          {/* Links list */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => `
                    relative flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm
                    ${isActive 
                      ? 'text-black z-10 font-extrabold' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="admin-active-bg"
                          className="absolute inset-0 bg-accentBlue rounded-xl -z-10 shadow-[0_0_15px_rgba(0,194,255,0.3)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-2 pt-6 border-t border-border">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <FiArrowLeft size={18} />
            <span>Storefront</span>
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

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Header */}
        <header className="h-20 bg-card/85 backdrop-blur-md border-b border-border px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-500">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-foreground hover:text-primary transition-colors duration-500" onClick={() => setIsSidebarOpen(true)}>
              <FiMenu size={24} />
            </button>
            <h1 className="text-xl font-bold hidden md:block">Master Administrator Hub</h1>
          </div>
 
          <div className="flex items-center gap-3 bg-muted rounded-full px-4 py-1.5 border border-border transition-colors duration-500">
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full object-cover border border-accentBlue/40"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-tight text-foreground">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-accentBlue leading-none uppercase tracking-wider font-bold">System Root</p>
            </div>
          </div>
        </header>

        {/* Dynamic content page with transitions */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, scale: 0.98, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, scale: 0.98, filter: 'blur(8px)' }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Backdrop for screens <= 768px */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
