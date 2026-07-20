import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import NexCartLogo from './NexCartLogo';
import ThemeToggle from './ThemeToggle';
import { CATEGORIES } from '../constants/dummyData';
import { 
  FiSearch, FiHeart, FiShoppingCart, FiBell, FiUser, 
  FiMapPin, FiGlobe, FiChevronDown, FiMenu, FiX, FiBriefcase, FiSliders, FiLogOut, FiCheckCircle
} from 'react-icons/fi';

const Navbar = () => {
  const { 
    user, cart, wishlist, notifications, markNotificationRead, clearNotifications, loginUser, logoutUser, theme 
  } = useContext(AppContext);
  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Popover state toggles
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN / USD');

  // Stats
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&cat=${selectedCategory}`);
    } else {
      navigate('/products');
    }
  };

  const switchRole = (role) => {
    loginUser(user?.email || 'user@nexcart.com', '123456', role);
    setIsProfileOpen(false);
    if (role === 'seller') navigate('/seller/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-navbar transition-all duration-400">
      <div className="max-w-[1440px] mx-auto px-4 md:px-5 lg:px-8">
        <div className="flex items-center justify-between h-[80px] gap-3 lg:gap-5">
          
          {/* 1. Mobile Menu Toggle & NexCart Logo (Left) */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button 
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-primary hover:bg-white/5 transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            
            <Link to="/" className="flex items-center hover:opacity-95 transition-opacity py-1">
              <NexCartLogo size="md" />
            </Link>
          </div>

          {/* 2. Delivery Location Selector (Desktop) */}
          <div className="hidden xl:flex items-center gap-2 text-xs cursor-pointer px-3 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex-shrink-0">
            <FiMapPin className="text-primary text-base flex-shrink-0 animate-bounce" style={{ animationDuration: '3s' }} />
            <div className="text-left">
              <p className="text-[10px] text-gray-400 dark:text-gray-400 uppercase tracking-wider font-semibold">Deliver to</p>
              <p className="font-bold text-gray-900 dark:text-white truncate max-w-[110px]">Hyderabad 500081</p>
            </div>
          </div>

          {/* 3. Category Dropdown Button (Desktop) */}
          <div className="relative hidden xl:block flex-shrink-0">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-primary/50 text-gray-800 dark:text-gray-200 transition-all"
            >
              <span>{selectedCategory === 'All' ? 'All Categories' : selectedCategory}</span>
              <FiChevronDown className={`text-xs transition-transform ${isCategoryOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {isCategoryOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 py-2 bg-white dark:bg-[#0c111d] border border-gray-200 dark:border-white/15 rounded-2xl shadow-2xl z-50">
                <button
                  onClick={() => { setSelectedCategory('All'); setIsCategoryOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
                >
                  <span>All Categories</span>
                  {selectedCategory === 'All' && <FiCheckCircle className="text-primary" />}
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.name); setIsCategoryOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    {selectedCategory === cat.name && <FiCheckCircle className="text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Rounded Search Bar (Center / Desktop & Tablet) */}
          <form 
            onSubmit={handleSearch} 
            className="hidden md:flex flex-grow max-w-md lg:max-w-lg h-11 bg-gray-100 dark:bg-white/[0.06] rounded-full border border-gray-300 dark:border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden transition-all shadow-inner"
          >
            <input 
              type="text" 
              placeholder="Search AI recommendations, gadgets, luxury items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow bg-transparent text-xs sm:text-sm px-5 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500"
            />
            <button 
              type="submit" 
              className="px-5 bg-gradient-to-r from-primary to-amber-400 text-black hover:brightness-110 transition-all flex items-center justify-center font-bold"
              aria-label="Search"
            >
              <FiSearch className="text-lg stroke-[2.5]" />
            </button>
          </form>

          {/* 5. Quick Category Links (Desktop Wide) */}
          <div className="hidden 2xl:flex items-center gap-4 text-xs font-semibold text-gray-600 dark:text-gray-300 flex-shrink-0">
            <Link to="/products?cat=electronics" className="hover:text-primary transition-colors">Electronics</Link>
            <Link to="/products?cat=fashion" className="hover:text-primary transition-colors">Fashion</Link>
            <Link to="/products?cat=ai-gadgets" className="hover:text-primary transition-colors flex items-center gap-1 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span>AI Tech</span>
            </Link>
          </div>

          {/* Right Navigation Actions Container */}
          <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
            
            {/* 6. Language & Currency Selector */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-primary px-2.5 py-1.5 rounded-full hover:bg-white/5 transition-all"
              >
                <FiGlobe className="text-sm text-accentBlue" />
                <span>{selectedLang}</span>
                <FiChevronDown className="text-[10px]" />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 py-2 bg-white dark:bg-[#0c111d] border border-gray-200 dark:border-white/15 rounded-xl shadow-xl z-50 text-xs">
                  {['EN / USD', 'IN / INR', 'EU / EUR', 'UK / GBP'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => { setSelectedLang(lang); setIsLanguageOpen(false); }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-primary/10 hover:text-primary text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 7. Become Seller Button */}
            <Link
              to="/seller/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary hover:border-primary text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <FiBriefcase className="text-sm" />
              <span>Become Seller</span>
            </Link>

            {/* 8. 🌞 Animated Theme Toggle (EXACTLY Positioned Between "Become Seller" and Wishlist) */}
            <ThemeToggle />

            {/* 9. Wishlist Icon (❤️) */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-full text-gray-700 dark:text-gray-300 hover:text-red-500 hover:bg-red-500/10 transition-all group"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <FiHeart className="text-xl group-hover:scale-110 transition-transform" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* 10. Cart Icon (🛒) */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/10 transition-all group"
              aria-label="Shopping Cart"
              title="Shopping Cart"
            >
              <FiShoppingCart className="text-xl group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-primary to-amber-400 text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-yellow-glow">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* 11. Notifications Icon (🔔) */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2.5 rounded-full text-gray-700 dark:text-gray-300 hover:text-accentBlue hover:bg-accentBlue/10 transition-all group"
                aria-label="Notifications"
                title="Notifications"
              >
                <FiBell className="text-xl group-hover:scale-110 transition-transform" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accentBlue rounded-full animate-ping" />
                )}
              </button>

              {/* Notifications Popover Drawer */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white dark:bg-[#0c111d] border border-gray-200 dark:border-white/15 rounded-2xl shadow-2xl p-4 z-50 text-left">
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-3 mb-3">
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiBell className="text-accentBlue" />
                      <span>Notifications</span>
                    </h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-[11px] text-primary hover:underline font-semibold"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-500 py-6 text-center">No new notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            n.read
                              ? 'bg-gray-50 dark:bg-white/[0.02] border-transparent text-gray-500'
                              : 'bg-primary/5 dark:bg-primary/10 border-primary/30 text-gray-900 dark:text-white font-medium'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-primary">{n.title}</span>
                            <span className="text-[10px] text-gray-400">{n.time}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 12. User Profile Avatar (👤) */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border-2 border-primary/60 hover:border-primary transition-all group focus:outline-none"
                  aria-label="User profile"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover group-hover:scale-105 transition-transform"
                  />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-black font-extrabold text-xs shadow-yellow-glow hover:shadow-yellow-glow-lg transition-all"
                >
                  <FiUser className="text-sm" />
                  <span>Login</span>
                </Link>
              )}

              {/* User Profile Popover */}
              {isProfileOpen && user && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-[#0c111d] border border-gray-200 dark:border-white/15 rounded-2xl shadow-2xl p-4 z-50 text-left">
                  <div className="flex items-center gap-3 border-b border-gray-200 dark:border-white/10 pb-3 mb-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-primary" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</h4>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-primary/20 text-primary">
                        {user.role} Account
                      </span>
                    </div>
                  </div>

                  {/* Switch Role Quick Tester */}
                  <div className="mb-3 space-y-1">
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-semibold">Switch View Mode</p>
                    <div className="grid grid-cols-3 gap-1 text-[10px] font-bold uppercase">
                      {['customer', 'seller', 'admin'].map(r => (
                        <button
                          key={r}
                          onClick={() => switchRole(r)}
                          className={`py-1 rounded border transition-all ${
                            user.role === r 
                              ? 'bg-primary text-black border-primary font-black'
                              : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-primary'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs border-t border-gray-200 dark:border-white/10 pt-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary text-gray-700 dark:text-gray-300 font-medium transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary text-gray-700 dark:text-gray-300 font-medium transition-colors"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/addresses"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary text-gray-700 dark:text-gray-300 font-medium transition-colors"
                    >
                      Saved Addresses
                    </Link>
                    <button
                      onClick={() => { logoutUser(); setIsProfileOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 font-bold transition-colors flex items-center justify-between"
                    >
                      <span>Logout</span>
                      <FiLogOut />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#070B12] border-b border-gray-200 dark:border-white/10 px-4 py-4 space-y-4 animate-slide-down shadow-2xl">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="flex h-10 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden border border-gray-300 dark:border-white/10">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow bg-transparent text-xs px-4 text-gray-900 dark:text-white focus:outline-none"
            />
            <button type="submit" className="px-4 bg-primary text-black font-bold">
              <FiSearch />
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200">
              All Products
            </Link>
            <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200">
              Categories
            </Link>
            <Link to="/seller/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold">
              Become Seller
            </Link>
            <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 flex items-center justify-between">
              <span>Wishlist</span>
              <span className="text-primary font-extrabold">{wishlistCount}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
