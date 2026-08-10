import React, { useState, useContext, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { SellerProvider, SellerContext } from '../context/SellerContext';
import sellerAuthService from '../services/sellerAuthService';
import logo from '../assets/logo.jpg';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiBarChart2, FiDollarSign, 
  FiArchive, FiSettings, FiUser, FiArrowLeft, FiLogOut, FiMenu, FiX,
  FiShield, FiTag, FiLayers, FiCheckCircle
} from 'react-icons/fi';

import { getSellerDisplayName, getSellerAvatar } from '../utils/sellerHelpers';
import SellerBadge from '../components/seller/SellerBadge';
import ThemeToggle from '../components/ThemeToggle';

const SellerHeader = ({ onOpenSidebar }) => {
  const { user } = useContext(AppContext);
  const { settings, stats } = useContext(SellerContext);

  const displayName = getSellerDisplayName({ accountInfo: { displayName: settings.displayName }, profile: { shopName: settings.businessName }, sellerType: settings.sellerType });
  const avatar = getSellerAvatar({ profile: { logo: { url: settings.avatar } }, userId: { avatar: user?.avatar } });

  return (
    <header className="h-20 bg-secondaryBg/80 backdrop-blur-md border-b border-borderColor px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden text-textPrimary hover:text-primary p-2 rounded-xl bg-surface"
          onClick={onOpenSidebar}
        >
          <FiMenu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-black hidden md:block text-textPrimary tracking-tight">
            NexCart <span className="text-primary">Seller Studio</span>
          </h1>
          <p className="text-[11px] text-textSecondary hidden md:block">
            {settings.sellerType === 'business' ? 'Retail & Small Business Commerce' : 'Peer-to-Peer C2C Marketplace'}
          </p>
        </div>
      </div>

      {/* Seller Header Indicators */}
      <div className="flex items-center gap-3">
        {/* Clean Theme Toggle */}
        <ThemeToggle className="mr-2" />

        {/* Marketplace Mode Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-surface border border-borderColor px-3 py-1.5 rounded-full text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-textSecondary font-bold text-[11px]">
            {settings.sellerType === 'business' ? 'Retail Storefront' : 'C2C Mode (OLX Model)'}
          </span>
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-3 bg-surface rounded-full px-3.5 py-1.5 border border-borderColor shadow-card-hover">
          <img 
            src={avatar} 
            alt={displayName} 
            className="w-8 h-8 rounded-full object-cover border border-primary/40"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold leading-tight text-textPrimary">{displayName}</p>
            <div className="mt-1">
              <SellerBadge sellerType={settings.sellerType} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );

};

const SellerNavigationSidebar = ({ isSidebarOpen, onCloseSidebar, onLogout }) => {
  const navigate = useNavigate();
  const { stats } = useContext(SellerContext);

  const navItems = [
    { name: 'Studio Home', path: '/seller/dashboard', icon: FiGrid },
    { name: 'Products Catalog', path: '/seller/products', icon: FiPackage, badge: stats.activeListings },
    { name: 'Orders Pipeline', path: '/seller/orders', icon: FiShoppingBag, badge: stats.processingOrdersCount, badgeColor: 'bg-primary text-black' },
    { name: 'Intelligence & Sales', path: '/seller/analytics', icon: FiBarChart2 },
    { name: 'Stock Inventory', path: '/seller/inventory', icon: FiArchive, badge: stats.lowStockCount > 0 ? `${stats.lowStockCount} low` : null, badgeColor: 'bg-amber-500 text-black' },
    { name: 'Studio Settings', path: '/seller/settings', icon: FiSettings },
    { name: 'Public Profile', path: '/seller/profile', icon: FiUser },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-secondaryBg border-r border-borderColor p-6 flex flex-col justify-between
      transition-transform duration-300 md:translate-x-0 md:static
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="Logo" className="w-8 h-8 rounded object-cover border border-primary/20" />
            <span className="text-xl font-bold tracking-wider text-primary">Nex<span className="text-textPrimary">Cart</span></span>
            <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded">Studio</span>
          </div>
          <button className="md:hidden text-textPrimary hover:text-primary" onClick={onCloseSidebar}>
            <FiX size={24} />
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
                onClick={onCloseSidebar}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all text-xs
                  ${isActive 
                    ? 'bg-primary text-black shadow-yellow-glow' 
                    : 'text-textSecondary hover:text-textPrimary hover:bg-surface'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge !== null && item.badge !== 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${item.badgeColor || 'bg-surface text-textPrimary border border-borderColor'}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-6 border-t border-borderColor text-xs font-bold">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-surface transition-all"
        >
          <FiArrowLeft size={16} />
          <span>Switch to Buyer Store</span>
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
        >
          <FiLogOut size={16} />
          <span>Exit Studio</span>
        </button>
      </div>
    </aside>
  );
};

const SellerLayoutContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logoutUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-darkBg text-textPrimary flex">
      {/* Sidebar Navigation */}
      <SellerNavigationSidebar
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <SellerHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

const SellerLayout = () => {
  const [isCheckingSeller, setIsCheckingSeller] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useContext(AppContext);

  useEffect(() => {
    const verifySellerAccount = async () => {
      try {
        await sellerAuthService.getProfile();
        setIsCheckingSeller(false);
      } catch (err) {
        console.warn('Seller profile verification:', err);
        if (err?.statusCode === 404 || err?.message?.toLowerCase().includes('not found')) {
          showToast('Please complete your seller onboarding first', 'info');
          navigate('/seller/onboarding', { replace: true });
        } else {
          setIsCheckingSeller(false);
        }
      }
    };

    verifySellerAccount();
  }, [navigate, showToast]);

  if (isCheckingSeller) {
    return (
      <div className="min-h-screen bg-darkBg text-textPrimary flex items-center justify-center">
        <div className="text-primary font-bold animate-pulse text-sm">Launching Seller Studio Workspace...</div>
      </div>
    );
  }

  return (
    <SellerProvider>
      <SellerLayoutContent />
    </SellerProvider>
  );
};

export default SellerLayout;
