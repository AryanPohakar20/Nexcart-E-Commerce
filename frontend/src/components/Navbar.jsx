import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import NexCartLogo from './NexCartLogo';
import ThemeToggle from './ThemeToggle';
import { CATEGORIES } from '../constants/dummyData';
import { getRoleConfig } from '../constants/navigationMenu';
import { 
  FiSearch, FiHeart, FiShoppingCart, FiBell, FiUser, 
  FiMapPin, FiGlobe, FiChevronDown, FiMenu, FiX, FiBriefcase, FiLogOut, FiCheckCircle, FiZap, FiGrid, FiSliders,
  FiMessageSquare, FiCpu, FiShoppingBag, FiPackage, FiSmartphone, FiHome, FiSmile, FiActivity, FiBook, FiTv, FiTag, FiHelpCircle, FiPercent, FiCreditCard
} from 'react-icons/fi';

const Navbar = () => {
  const { 
    user, cart, wishlist, notifications, markNotificationRead, clearNotifications, logoutUser, unreadChatCount,
    language, setLanguage, t 
  } = useContext(AppContext);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Popover state toggles
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const userName = user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.username || user?.email?.split('@')[0] || 'User');
  const userInitial = (userName.trim()[0] || 'U').toUpperCase();
  const roleConfig = getRoleConfig(user?.role);
  const isCustomerOrGuest = !user || (user.role || '').toLowerCase() === 'customer';
  const isSeller = (user?.role || '').toLowerCase() === 'seller' || (user?.role || '').toLowerCase() === 'marketplace_seller';
  const isAdmin = (user?.role || '').toLowerCase() === 'admin';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&cat=${selectedCategory}`);
    } else {
      navigate('/products');
    }
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
          
          {/* Left: Mobile Toggle & NexCart Brand Logo + Name */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </motion.button>

            {/* NexCart Logo + Brand Name */}
            <NexCartLogo />
          </div>

          {/* Center: Wider Search Bar (Without All Categories Dropdown) */}
          <div className="hidden lg:flex flex-1 max-w-3xl mx-auto relative">
            <form 
              onSubmit={handleSearch}
              className={`w-full flex items-center h-11 bg-gray-50/80 dark:bg-white/5 border rounded-full transition-all duration-300 relative px-4 ${
                isSearchFocused 
                  ? 'border-primary shadow-yellow-glow bg-white dark:bg-black/80' 
                  : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
              }`}
            >
              {/* Input Area */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder={t('Search products, brands...')}
                className="w-full bg-transparent text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none pr-2"
              />

              {/* Search Icon Button */}
              <button
                type="submit"
                className="p-2 rounded-full hover:bg-primary/20 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors flex items-center justify-center flex-shrink-0"
                aria-label="Submit search"
              >
                <FiSearch className="text-lg" />
              </button>
            </form>

            {/* Smart Suggestions on focus */}
            <AnimatePresence>
              {isSearchFocused && !searchQuery && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#0c111d] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 z-40 text-left"
                >
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Trending Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {['iPhone 15 Pro Max', 'Sony WH-1000XM5', 'MacBook Air M3', 'Nike Air Max', 'Rolex Submariner'].map((keyword) => (
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

          {/* Right: Actions (Role-aware actions, Theme, Wishlist/Cart/Dashboard, Notifications, Profile) */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
            
            {/* Language / Currency Selector */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
              >
                <FiGlobe className="text-xs text-accentBlue" />
                <span>{language}</span>
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
                        type="button"
                        onClick={() => { setLanguage(lang); setIsLanguageOpen(false); }}
                        className={`w-full text-left px-3.5 py-1.5 hover:bg-primary/10 hover:text-primary transition-colors ${
                          language === lang ? 'text-primary font-bold bg-primary/5' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Single Role-Aware Dashboard Action CTA */}
            {isAdmin ? (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/admin/dashboard"
                  className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-accentBlue/40 bg-accentBlue/10 hover:bg-accentBlue/20 text-accentBlue hover:border-accentBlue text-xs font-bold transition-all shadow-sm"
                >
                  <FiSliders className="text-sm" />
                  <span>{t('Admin Portal')}</span>
                </Link>
              </motion.div>
            ) : isSeller ? (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/seller/dashboard"
                  className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:border-emerald-500 text-xs font-bold transition-all shadow-sm"
                >
                  <FiGrid className="text-sm" />
                  <span>Seller Dashboard</span>
                </Link>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/seller/become-seller"
                  className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary hover:border-primary text-xs font-bold transition-all shadow-sm"
                >
                  <FiBriefcase className="text-sm" />
                  <span>{t('Become Seller')}</span>
                </Link>
              </motion.div>
            )}

            {/* Customer-only Wishlist Icon */}
            {isCustomerOrGuest && (
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
            )}

            {/* Customer-only Cart Icon */}
            {isCustomerOrGuest && (
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
            )}

            {/* Messages Chat Icon */}
            {user && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link
                  to="/messages"
                  className="relative p-2 sm:p-2.5 rounded-full text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/10 transition-all group block"
                  aria-label="Messages"
                  title="Messages"
                >
                  <FiMessageSquare className="text-lg sm:text-xl transition-transform" />
                  {unreadChatCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4 sm:w-5 h-4 sm:h-5 bg-primary text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-yellow-glow"
                    >
                      {unreadChatCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            )}

            {/* Clean Theme Toggle */}
            <ThemeToggle />

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

            {/* User Profile Avatar & Dropdown Menu */}
            <div className="relative">
              {user ? (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-0.5 rounded-full border-2 border-primary/60 hover:border-primary transition-all group focus:outline-none bg-primary/10"
                  aria-label="User profile"
                  title={userName}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={userName}
                      className="w-7 sm:w-8 h-7 sm:h-8 rounded-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-gradient-to-tr from-primary to-amber-400 text-black font-extrabold flex items-center justify-center text-xs sm:text-sm shadow-sm border border-primary/40">
                      {userInitial}
                    </div>
                  )}
                </motion.button>
              ) : (
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-black font-extrabold text-xs shadow-yellow-glow hover:shadow-yellow-glow-lg transition-all"
                  >
                    <FiUser className="text-sm" />
                    <span>{t('Login')}</span>
                  </Link>
                </motion.div>
              )}

              {/* Redesigned Dynamic Role-Based Profile Popover */}
              <AnimatePresence>
                {isProfileOpen && user && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-3 w-72 bg-white dark:bg-[#0c111d] border border-gray-200 dark:border-white/15 rounded-2xl shadow-2xl p-4 z-50 text-left"
                  >
                    {/* User Identity Header */}
                    <div className="flex items-center gap-3 border-b border-gray-200 dark:border-white/10 pb-3 mb-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={userName} className="w-11 h-11 rounded-full object-cover border-2 border-primary flex-shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary to-amber-400 text-black font-black flex items-center justify-center text-base shadow-md border-2 border-primary flex-shrink-0">
                          {userInitial}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{userName}</h4>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        <span className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${roleConfig.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${roleConfig.dotColor}`} />
                          {roleConfig.roleLabel}
                        </span>
                      </div>
                    </div>

                    {/* Centralized Dynamic Role Menu */}
                    <div className="space-y-1 text-xs">
                      {roleConfig.menu.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-gray-700 dark:text-gray-300 font-medium transition-all group"
                          >
                            <IconComponent className="text-sm text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
                            <span className="truncate">{t(item.name)}</span>
                          </Link>
                        );
                      })}
                      <Link
                        to="/addresses"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-gray-700 dark:text-gray-300 font-medium transition-all group"
                      >
                        <FiMapPin className="text-sm text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
                        <span className="truncate">{t('Saved Addresses')}</span>
                      </Link>

                      {/* Divider & Logout Action */}
                      <div className="pt-2 mt-1 border-t border-gray-200 dark:border-white/10">
                        <button
                          onClick={() => { logoutUser(); setIsProfileOpen(false); }}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 font-bold transition-all flex items-center justify-between group"
                        >
                          <span className="flex items-center gap-2.5">
                            <FiLogOut className="text-sm flex-shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                            <span>{t('Logout')}</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>

      {/* Second Navigation Row */}
      <div className="bg-[#F8FAFC]/95 dark:bg-[#0a0e17]/95 border-b border-gray-200/60 dark:border-white/5 py-1.5 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none transition-all duration-300">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between text-xs sm:text-sm text-gray-700 dark:text-gray-300 gap-4">
          
          {/* Marketplace Navigation Links Sequence: Browse All -> Deals -> Electronics -> Fashion -> AI Tech -> Coupons -> Cards */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 font-semibold whitespace-nowrap overflow-x-auto py-0.5 scrollbar-none">
            
            {/* 1. Browse All (Subtle Primary Highlight) */}
            <Link 
              to="/products" 
              className={`hover:text-primary transition-all flex items-center gap-1 py-1 px-2.5 rounded-md text-xs sm:text-sm ${
                location.pathname === '/products' && (!location.search || location.search === '') 
                  ? 'text-primary bg-primary/10 font-bold shadow-sm' 
                  : 'bg-primary/10 text-primary font-semibold hover:bg-primary/20'
              }`}
            >
              <FiMenu className="text-sm flex-shrink-0" />
              <span>{t('Browse All')}</span>
            </Link>

            {/* 2. Deals */}
            <Link 
              to="/products?sort=discount" 
              className={`hover:text-primary transition-all flex items-center gap-1 py-1 px-2.5 rounded-md text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 ${
                location.search.includes('sort=discount') 
                  ? 'text-primary bg-primary/10 font-bold shadow-sm' 
                  : 'hover:bg-gray-200/60 dark:hover:bg-white/5'
              }`}
            >
              <FiTag className="text-sm flex-shrink-0" />
              <span>{t('Deals')}</span>
            </Link>

            {/* 3. Electronics */}
            <Link 
              to="/products?cat=electronics" 
              className={`hover:text-primary transition-all flex items-center gap-1 py-1 px-2.5 rounded-md text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 ${
                location.search.includes('cat=electronics') 
                  ? 'text-primary bg-primary/10 font-bold shadow-sm' 
                  : 'hover:bg-gray-200/60 dark:hover:bg-white/5'
              }`}
            >
              <FiCpu className="text-sm flex-shrink-0" />
              <span>{t('Electronics')}</span>
            </Link>

            {/* 4. Fashion */}
            <Link 
              to="/products?cat=fashion" 
              className={`hover:text-primary transition-all flex items-center gap-1 py-1 px-2.5 rounded-md text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 ${
                location.search.includes('cat=fashion') 
                  ? 'text-primary bg-primary/10 font-bold shadow-sm' 
                  : 'hover:bg-gray-200/60 dark:hover:bg-white/5'
              }`}
            >
              <FiShoppingBag className="text-sm flex-shrink-0" />
              <span>{t('Fashion')}</span>
            </Link>

            {/* 5. AI Tech */}
            <Link 
              to="/products?cat=ai-gadgets" 
              className={`hover:text-primary transition-all flex items-center gap-1 py-1 px-2.5 rounded-md text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 ${
                location.search.includes('cat=ai-gadgets') 
                  ? 'text-primary bg-primary/10 font-bold shadow-sm' 
                  : 'hover:bg-gray-200/60 dark:hover:bg-white/5'
              }`}
            >
              <FiZap className="text-sm flex-shrink-0" />
              <span>{t('AI Tech')}</span>
            </Link>

            {/* 6. Coupons */}
            <Link 
              to="/products?sort=popular" 
              className={`hover:text-primary transition-all flex items-center gap-1 py-1 px-2.5 rounded-md text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 ${
                location.search.includes('sort=popular') 
                  ? 'text-primary bg-primary/10 font-bold shadow-sm' 
                  : 'hover:bg-gray-200/60 dark:hover:bg-white/5'
              }`}
            >
              <FiPercent className="text-sm flex-shrink-0" />
              <span>{t('Coupons')}</span>
            </Link>

            {/* 7. Cards */}
            <Link 
              to="/products?cat=gift-cards" 
              className={`hover:text-primary transition-all flex items-center gap-1 py-1 px-2.5 rounded-md text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 ${
                location.search.includes('cat=gift-cards') 
                  ? 'text-primary bg-primary/10 font-bold shadow-sm' 
                  : 'hover:bg-gray-200/60 dark:hover:bg-white/5'
              }`}
            >
              <FiCreditCard className="text-sm flex-shrink-0" />
              <span>{t('Cards')}</span>
            </Link>
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

              {isCustomerOrGuest && (
                <>
                  <Link to="/seller/become-seller" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold">
                    Become Seller
                  </Link>
                  <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 flex items-center justify-between">
                    <span>Wishlist</span>
                    <span className="text-primary font-extrabold">{wishlistCount}</span>
                  </Link>
                </>
              )}

              {isSeller && (
                <>
                  <Link to="/seller/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                    Seller Dashboard
                  </Link>
                  <Link to="/seller/products" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200">
                    My Products
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentBlue font-bold">
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200">
                    Manage Users
                  </Link>
                </>
              )}

              {user ? (
                <Link 
                  to={isSeller ? "/seller/dashboard" : isAdmin ? "/admin/dashboard" : "/profile"} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 flex items-center gap-2 col-span-2 border border-gray-200 dark:border-white/10"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={userName} className="w-6 h-6 rounded-full object-cover border border-primary" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary text-black font-bold flex items-center justify-center text-[10px]">
                      {userInitial}
                    </div>
                  )}
                  <div className="flex items-center justify-between w-full overflow-hidden">
                    <span className="truncate">{userName}</span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${roleConfig.badgeClass}`}>
                      {roleConfig.roleLabel}
                    </span>
                  </div>
                </Link>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-primary text-black font-extrabold flex items-center gap-1.5 justify-center col-span-2 shadow-yellow-glow">
                  <FiUser />
                  <span>Login / Register</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.header>
  );
};

export default Navbar;
