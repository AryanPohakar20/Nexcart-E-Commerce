import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import NexCartLogo from './NexCartLogo';
import ThemeToggle from './ThemeToggle';
import { CATEGORIES } from '../constants/dummyData';
import { 
  FiSearch, FiHeart, FiShoppingCart, FiBell, FiUser, 
  FiMapPin, FiGlobe, FiChevronDown, FiMenu, FiX, FiBriefcase, FiLogOut, FiCheckCircle, FiZap, FiGrid
} from 'react-icons/fi';

const Navbar = () => {
  const { 
    user, cart, wishlist, notifications, markNotificationRead, clearNotifications, loginUser, logoutUser 
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

  // Premium UI scroll & focus states
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <motion.header 
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 glass-navbar transition-all duration-500 ${
        isScrolled ? 'backdrop-blur-2xl shadow-xl' : 'backdrop-blur-md shadow-sm'
      }`}
    >
      
      {/* Primary Main Navbar Header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-200/50 dark:border-white/5">
        <div className={`flex items-center justify-between transition-all duration-500 gap-4 sm:gap-6 ${
          isScrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
        }`}>
          
          {/* Left: Mobile Toggle & Floating Brand Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="lg:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </motion.button>
            
            <Link to="/" className="flex items-center hover:opacity-95 transition-opacity py-1">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.05 }}
              >
                <NexCartLogo size="md" />
              </motion.div>
            </Link>
          </div>

          {/* Center: Wide & Prominent Search Bar (Desktop & Tablet) */}
          <div className="hidden md:block flex-1 max-w-2xl relative">
            <motion.form 
              animate={{ maxWidth: isSearchFocused ? '800px' : '640px' }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onSubmit={handleSearch} 
              className="flex h-11 bg-gray-100/80 dark:bg-white/[0.06] rounded-full border border-gray-200 dark:border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-visible transition-all shadow-inner items-center px-1.5 group/search w-full"
            >
              {/* Inline Category Dropdown Selector */}
              <div className="relative flex-shrink-0">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10 hover:border-primary/50 transition-all"
                >
                  <span>{selectedCategory === 'All' ? 'All' : selectedCategory}</span>
                  <FiChevronDown className={`text-xs transition-transform duration-300 ${isCategoryOpen ? 'rotate-180 text-primary' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {isCategoryOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-52 py-2 bg-white dark:bg-[#0c111d] border border-gray-200 dark:border-white/15 rounded-2xl shadow-2xl z-50"
                    >
                      <button
                        type="button"
                        onClick={() => { setSelectedCategory('All'); setIsCategoryOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
                      >
                        <span>All Categories</span>
                        {selectedCategory === 'All' && <FiCheckCircle className="text-primary" />}
                      </button>
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => { setSelectedCategory(cat.name); setIsCategoryOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
                        >
                          <span>{cat.name}</span>
                          {selectedCategory === cat.name && <FiCheckCircle className="text-primary" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <input 
                type="text" 
                placeholder="Search AI recommendations, electronics, fashion..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="flex-grow bg-transparent text-xs sm:text-sm px-3 focus:outline-none text-gray-900 dark:text-white placeholder-gray-400"
              />
              
              <motion.button 
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                type="submit" 
                className="w-9 h-9 bg-gradient-to-r from-primary to-amber-400 text-black hover:brightness-110 rounded-full transition-all flex items-center justify-center font-bold flex-shrink-0 shadow-sm"
                aria-label="Search"
              >
                <FiSearch className="text-base stroke-[2.5] group-focus-within/search:rotate-12 transition-transform duration-300" />
              </motion.button>
            </motion.form>

            {/* Premium Sliding Suggestions / Recent Searches Dropdown */}
            <AnimatePresence>
              {isSearchFocused && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0c111d] border border-gray-200 dark:border-white/15 rounded-2xl shadow-2xl p-4 z-50 text-left space-y-3"
                >
                  <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    <span>Recent Searches</span>
                    <span className="cursor-pointer hover:text-primary transition-colors">Clear</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Smart Watch', 'Sony WH-1000XM5', 'Running Shoes', 'iPhone 15', 'MacBook Pro'].map(keyword => (
                      <button
                        key={keyword}
                        type="button"
                        onMouseDown={() => {
                          setSearchQuery(keyword);
                          navigate(`/search?q=${encodeURIComponent(keyword)}&cat=${selectedCategory}`);
                        }}
                        className="bg-gray-100 dark:bg-white/10 hover:bg-primary/20 hover:text-primary text-xs px-3 py-1.5 rounded-full transition-colors text-gray-700 dark:text-gray-200 font-medium"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Actions (Seller CTA, Theme, Wishlist, Cart, Notifications, Profile) */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
            
            {/* Become Seller Button */}
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/seller/dashboard"
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary hover:border-primary text-xs font-bold transition-all shadow-sm"
              >
                <FiBriefcase className="text-sm" />
                <span>Become Seller</span>
              </Link>
            </motion.div>

            {/* Clean Theme Toggle */}
            <ThemeToggle />

            {/* Wishlist Icon */}
            <motion.div 
              key={`wish-${wishlistCount}`}
              animate={{ scale: [1, 1.25, 1], rotate: wishlistCount > 0 ? [0, 8, -8, 0] : 0 }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.1, rotate: 6 }} 
              whileTap={{ scale: 0.9 }}
            >
              <Link
                to="/wishlist"
                className="relative p-2 sm:p-2.5 rounded-full text-gray-700 dark:text-gray-300 hover:text-red-500 hover:bg-red-500/10 transition-all group block"
                aria-label="Wishlist"
                title="Wishlist"
              >
                <FiHeart className="text-lg sm:text-xl transition-transform" />
                {wishlistCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 sm:w-5 h-4 sm:h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-md animate-pulse"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* Cart Icon */}
            <motion.div 
              key={`cart-${cartCount}`}
              animate={{ scale: [1, 1.25, 1], y: cartCount > 0 ? [0, -6, 0] : 0 }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }}
            >
              <Link
                to="/cart"
                className="relative p-2 sm:p-2.5 rounded-full text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/10 transition-all group block"
                aria-label="Shopping Cart"
                title="Shopping Cart"
              >
                <FiShoppingCart className="text-lg sm:text-xl transition-transform" />
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: [0.8, 1.25, 1] }}
                    transition={{ duration: 0.3 }}
                    className="absolute -top-0.5 -right-0.5 w-4 sm:w-5 h-4 sm:h-5 bg-gradient-to-r from-primary to-amber-400 text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-yellow-glow"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* Notifications Icon */}
            <div className="relative">
              <motion.button
                key={`notif-${unreadNotifications}`}
                animate={{ rotate: unreadNotifications > 0 ? [0, 15, -15, 10, -10, 0] : 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.1, rotate: 12 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 sm:p-2.5 rounded-full text-gray-700 dark:text-gray-300 hover:text-accentBlue hover:bg-accentBlue/10 transition-all group"
                aria-label="Notifications"
                title="Notifications"
              >
                <FiBell className="text-lg sm:text-xl transition-transform" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accentBlue rounded-full animate-ping" />
                )}
              </motion.button>

              {/* Notifications Popover */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white dark:bg-[#0c111d] border border-gray-200 dark:border-white/15 rounded-2xl shadow-2xl p-4 z-50 text-left"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Avatar */}
            <div className="relative">
              {user ? (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-0.5 rounded-full border-2 border-primary/60 hover:border-primary transition-all group focus:outline-none"
                  aria-label="User profile"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 sm:w-8 h-7 sm:h-8 rounded-full object-cover group-hover:scale-105 transition-transform"
                  />
                </motion.button>
              ) : (
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-black font-extrabold text-xs shadow-yellow-glow hover:shadow-yellow-glow-lg transition-all"
                  >
                    <FiUser className="text-sm" />
                    <span>Login</span>
                  </Link>
                </motion.div>
              )}

              {/* User Profile Popover */}
              <AnimatePresence>
                {isProfileOpen && user && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-[#0c111d] border border-gray-200 dark:border-white/15 rounded-2xl shadow-2xl p-4 z-50 text-left"
                  >
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
                              (user.role || '').toLowerCase() === r 
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>

      {/* Secondary Utility Navigation Strip (Desktop & Tablet) */}
      <div className="hidden md:block bg-gray-50/90 dark:bg-black/40 border-b border-gray-200/40 dark:border-white/5 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
          
          {/* Left: Location & Categories quick trigger */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer group">
              <FiMapPin className="text-primary text-sm flex-shrink-0 group-hover:bounce" />
              <span>Deliver to <strong className="text-gray-900 dark:text-white font-bold">Hyderabad 500081</strong></span>
            </div>

            <div className="h-3 w-px bg-gray-300 dark:bg-white/10" />

            <div className="flex items-center gap-4 font-semibold">
              <Link to="/products?cat=electronics" className="hover:text-primary transition-colors link-underline">Electronics</Link>
              <Link to="/products?cat=fashion" className="hover:text-primary transition-colors link-underline">Fashion</Link>
              <Link to="/products?cat=ai-gadgets" className="hover:text-primary transition-colors flex items-center gap-1 text-primary link-underline">
                <FiZap className="text-xs animate-pulse" />
                <span>AI Tech</span>
              </Link>
              <Link to="/products" className="hover:text-primary transition-colors flex items-center gap-1 link-underline">
                <FiGrid className="text-xs" />
                <span>Browse All</span>
              </Link>
            </div>
          </div>

          {/* Right: Language / Currency selector */}
          <div className="relative">
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="flex items-center gap-1.5 font-medium hover:text-primary transition-colors"
            >
              <FiGlobe className="text-xs text-accentBlue" />
              <span>{selectedLang}</span>
              <FiChevronDown className="text-[10px]" />
            </button>

            <AnimatePresence>
              {isLanguageOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-36 py-2 bg-white dark:bg-[#0c111d] border border-gray-200 dark:border-white/15 rounded-xl shadow-xl z-50 text-xs"
                >
                  {['EN / USD', 'IN / INR', 'EU / EUR', 'UK / GBP'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => { setSelectedLang(lang); setIsLanguageOpen(false); }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-primary/10 hover:text-primary text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      {lang}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden bg-white dark:bg-[#070B12] border-b border-gray-200 dark:border-white/10 px-4 py-4 space-y-4 shadow-2xl overflow-hidden"
          >
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

            {/* Location mobile */}
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
              <FiMapPin className="text-primary" />
              <span>Deliver to <strong className="text-gray-900 dark:text-white font-bold">Hyderabad 500081</strong></span>
            </div>

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
          </motion.div>
        )}
      </AnimatePresence>

    </motion.header>
  );
};

export default Navbar;
