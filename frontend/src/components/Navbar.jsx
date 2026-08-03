import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import NexCartLogo from './NexCartLogo';
import ThemeToggle from './ThemeToggle';
import { CATEGORIES } from '../constants/dummyData';
import { 
  FiSearch, FiHeart, FiShoppingCart, FiBell, FiUser, 
  FiMapPin, FiGlobe, FiChevronDown, FiMenu, FiX, FiBriefcase, FiLogOut, 
  FiCheckCircle, FiZap, FiGrid, FiMic, FiCamera, FiChevronRight, FiMaximize, FiHelpCircle, FiGift
} from 'react-icons/fi';

const MEGA_CATEGORIES = [
  {
    id: 'electronics',
    name: 'Electronics',
    subcategories: ['Laptops', 'Desktops', 'Monitors', 'Printers', 'Storage Devices', 'Computer Accessories']
  },
  {
    id: 'mobiles',
    name: 'Mobiles & Tablets',
    subcategories: ['Smartphones', 'Tablets', 'Power Banks', 'Cases & Covers', 'Chargers & Cables', 'Headphones']
  },
  {
    id: 'fashion',
    name: 'Fashion & Wear',
    subcategories: ["Men's Clothing", "Women's Clothing", 'Footwear', 'Watches', 'Sunglasses', 'Jewellery', 'Bags & Luggage']
  },
  {
    id: 'home',
    name: 'Home & Kitchen',
    subcategories: ['Decor & Furnishing', 'Kitchen Appliances', 'Cookware & Tableware', 'Storage & Organization', 'Home Lighting']
  },
  {
    id: 'furniture',
    name: 'Furniture',
    subcategories: ['Sofas & Recliners', 'Beds & Mattresses', 'Dining Tables', 'Office Chairs', 'Wardrobes', 'TV Units']
  },
  {
    id: 'beauty',
    name: 'Beauty & Grooming',
    subcategories: ['Skincare', 'Haircare', 'Makeup', 'Fragrances', 'Grooming Kits', 'Personal Care Appliances']
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    subcategories: ['Fitness Equipment', 'Outdoor Sports', 'Trekking & Camping', 'Athletic Shoes', 'Sports Apparel', 'Smart Fitness Bands']
  },
  {
    id: 'books',
    name: 'Books & Stationery',
    subcategories: ['Fiction', 'Non-Fiction', 'Academic & Test Prep', 'Children Books', 'Notebooks & Pens', 'Calculators']
  },
  {
    id: 'gaming',
    name: 'Gaming & Toys',
    subcategories: ['Gaming Consoles', 'Video Games', 'Gaming Accessories', 'Action Figures', 'Board Games', 'Puzzles']
  },
  {
    id: 'appliances',
    name: 'TVs & Appliances',
    subcategories: ['Television sets', 'Air Conditioners', 'Refrigerators', 'Washing Machines', 'Microwave Ovens', 'Water Purifiers']
  }
];

const Navbar = () => {
  const { 
    user, cart, wishlist, notifications, markNotificationRead, clearNotifications, loginUser, logoutUser 
  } = useContext(AppContext);
  
  const navigate = useNavigate();
  const megaMenuRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [location, setLocation] = useState('Hyderabad 500081');
  const [pinInput, setPinInput] = useState('');
  const [selectedLang, setSelectedLang] = useState('EN / USD');
  
  // Interactive UI toggles
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  
  // Mega menu states
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState(MEGA_CATEGORIES[0]);

  // Voice & camera search feedback animation states
  const [isListening, setIsListening] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Scroll header locks
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close Mega Menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 700);
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&cat=${selectedCategory}`);
    } else {
      navigate('/products');
    }
  };

  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setSearchQuery('Sony WH-1000XM5');
      setIsListening(false);
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        navigate(`/search?q=Sony%20WH-1000XM5&cat=All`);
      }, 500);
    }, 2000);
  };

  const handleCameraSearch = () => {
    setIsCameraActive(true);
    setTimeout(() => {
      setIsCameraActive(false);
      setSearchQuery('iPhone 15 Pro Max');
      navigate(`/search?q=iPhone%2015%20Pro%20Max&cat=All`);
    }, 1500);
  };

  const handleLocationChange = (e) => {
    e.preventDefault();
    if (pinInput.trim()) {
      setLocation(`PIN: ${pinInput}`);
      setIsLocationOpen(false);
      setPinInput('');
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
    >
      {/* 1. Main Sticky Navbar (Top-most level z-index 1000) */}
      <div 
        className={`fixed top-0 left-0 right-0 z-[1000] bg-card border-b border-border transition-all duration-300 ease-in-out ${
          isScrolled ? 'shadow-md bg-card/95 backdrop-blur-md' : 'shadow-sm'
        }`}
      >
        <div className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ease-in-out gap-4 ${
          isScrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
        }`}>
          {/* LEFT: Logo & Location Select */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Navigation"
              >
                {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </motion.button>
              
              <Link to="/" className="flex items-center hover:opacity-95 transition-opacity">
                <NexCartLogo size="md" />
              </Link>
            </div>

            {/* Delivery Location Panel (Desktop Only) */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-border text-left relative">
              <FiMapPin className="text-primary text-lg flex-shrink-0" />
              <div className="flex flex-col text-[11px] leading-tight">
                <span className="text-muted-foreground font-semibold">Deliver to</span>
                <span className="font-bold text-foreground truncate max-w-[120px]">{location}</span>
                <button 
                  onClick={() => setIsLocationOpen(!isLocationOpen)} 
                  className="text-[10px] text-primary hover:underline font-bold text-left"
                >
                  Change Location
                </button>
              </div>

              {/* Pin Code Selector Popover */}
              <AnimatePresence>
                {isLocationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-3 w-64 p-4 bg-card border border-border rounded-2xl shadow-2xl z-50"
                  >
                    <form onSubmit={handleLocationChange} className="space-y-3">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Select Delivery Location</p>
                      <input 
                        type="text" 
                        placeholder="Enter 6-digit PIN code" 
                        value={pinInput}
                        maxLength={6}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                      <button 
                        type="submit"
                        className="w-full bg-primary text-black font-extrabold text-xs py-2 rounded-xl"
                      >
                        Apply PIN
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* CENTER: Large Multi-Element Search Bar */}
          <div className="hidden md:block flex-grow max-w-xl lg:max-w-2xl relative">
            <form 
              onSubmit={handleSearch}
              className={`flex h-11 bg-muted rounded-full border transition-all duration-300 items-center px-1.5 w-full ${
                isSearchFocused ? 'border-primary ring-2 ring-primary/10 shadow-md' : 'border-border'
              }`}
            >
              {/* Category selector dropdown */}
              <div className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-card text-foreground border border-border hover:border-primary/50 transition-all"
                >
                  <span className="truncate max-w-[80px]">{selectedCategory}</span>
                  <FiChevronDown className={`text-xs transition-transform duration-300 ${isCategoryOpen ? 'rotate-180 text-primary' : ''}`} />
                </button>

                <AnimatePresence>
                  {isCategoryOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-52 py-2 bg-card border border-border rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto"
                    >
                      <button
                        type="button"
                        onClick={() => { setSelectedCategory('All'); setIsCategoryOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
                      >
                        <span>All Categories</span>
                        {selectedCategory === 'All' && <FiCheckCircle className="text-primary" />}
                      </button>
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => { setSelectedCategory(cat.name); setIsCategoryOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
                        >
                          <span>{cat.name}</span>
                          {selectedCategory === cat.name && <FiCheckCircle className="text-primary" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Main Search Input */}
              <input 
                type="text" 
                placeholder="Search products, brands, sectors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                className="flex-grow bg-transparent text-xs sm:text-sm px-3 focus:outline-none text-foreground placeholder-muted-foreground"
              />

              {/* Icons & Action Button */}
              <div className="flex items-center gap-1">
                {/* Voice Search Mic */}
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors relative ${
                    isListening ? 'text-primary scale-110' : ''
                  }`}
                  title="Voice Search"
                >
                  <FiMic size={15} />
                  {isListening && (
                    <span className="absolute -inset-1 border border-primary rounded-full animate-ping" />
                  )}
                </button>

                {/* Camera Shutter Search */}
                <button
                  type="button"
                  onClick={handleCameraSearch}
                  className={`p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors ${
                    isCameraActive ? 'text-primary animate-pulse' : ''
                  }`}
                  title="Camera Search (Mock)"
                >
                  <FiCamera size={15} />
                </button>

                {/* Search submit trigger */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit" 
                  className="w-9 h-9 bg-primary hover:brightness-105 text-black rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-sm ml-1.5"
                >
                  <FiSearch className="text-sm stroke-[2.5]" />
                </motion.button>
              </div>
            </form>

            {/* Voice listening status indicator overlay */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-primary/95 text-black rounded-2xl p-4 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg z-50"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
                  <span>Listening... Try saying "Sony WH-1000XM5"</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Camera scanning visual indicator overlay */}
            <AnimatePresence>
              {isCameraActive && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-accentBlue text-white rounded-2xl p-4 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg z-50"
                >
                  <FiMaximize className="animate-spin" />
                  <span>Scanning image files for object matches...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search suggestions dropdown */}
            <AnimatePresence>
              {isSearchFocused && !isListening && !isCameraActive && (
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 text-left space-y-3"
                >
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    <span>Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Sony WH-1000XM5', 'Running Shoes', 'iPhone 15 Pro Max', 'Gaming Consoles', 'Home Decor'].map(keyword => (
                      <button
                        key={keyword}
                        type="button"
                        onMouseDown={() => {
                          setSearchQuery(keyword);
                          navigate(`/search?q=${encodeURIComponent(keyword)}&cat=All`);
                        }}
                        className="bg-muted hover:bg-primary/20 hover:text-primary text-xs px-3 py-1.5 rounded-full transition-colors text-foreground font-medium"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-border pt-3">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Popular Searches</p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-foreground">
                      <button onMouseDown={() => { setSearchQuery('Smartphones'); navigate('/products?cat=mobiles'); }} className="text-left py-1 hover:text-primary">🔥 Smartphones</button>
                      <button onMouseDown={() => { setSearchQuery('Laptops'); navigate('/products?cat=laptops'); }} className="text-left py-1 hover:text-primary">💻 Premium Laptops</button>
                      <button onMouseDown={() => { setSearchQuery('Fashion'); navigate('/products?cat=fashion'); }} className="text-left py-1 hover:text-primary">👗 Trending Wear</button>
                      <button onMouseDown={() => { setSearchQuery('Beauty'); navigate('/products?cat=beauty'); }} className="text-left py-1 hover:text-primary">💄 Skincare Kits</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Lang, Acc, Orders, Seller, Wish, Cart, Notifs, Avatar */}
          <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
            
            {/* Language Selector */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                <FiGlobe className="text-accentBlue text-sm" />
                <span>{selectedLang}</span>
                <FiChevronDown />
              </button>

              <AnimatePresence>
                {isLanguageOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-32 py-1 bg-card border border-border rounded-xl shadow-xl z-50 text-xs"
                  >
                    {['EN / USD', 'IN / INR', 'EU / EUR', 'UK / GBP'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => { setSelectedLang(lang); setIsLanguageOpen(false); }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                      >
                        {lang}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick role test switch switcher */}
            {user && (
              <div className="hidden xl:flex items-center gap-1 bg-muted p-1 rounded-full text-[10px] font-bold uppercase border border-border">
                {['customer', 'seller'].map(r => (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    className={`px-2 py-0.5 rounded-full transition-all ${
                      (user.role || '').toLowerCase() === r 
                        ? 'bg-primary text-black font-extrabold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Become Seller */}
            <Link
              to="/seller/become-seller"
              className="hidden lg:inline-flex text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              Become Seller
            </Link>

            {/* Orders link */}
            <Link
              to="/orders"
              className="hidden md:inline-flex text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              Orders
            </Link>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Wishlist"
            >
              <FiHeart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Link */}
            <Link
              to="/cart"
              className="relative p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Shopping Cart"
            >
              <FiShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-black text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-yellow-glow">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notifications Panel */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-full text-muted-foreground hover:text-accentBlue hover:bg-accentBlue/10 transition-colors"
                title="Notifications"
              >
                <FiBell size={18} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accentBlue rounded-full animate-ping" />
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 text-left"
                  >
                    <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                      <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                        <FiBell className="text-accentBlue" />
                        <span>Notifications</span>
                      </h3>
                      {notifications.length > 0 && (
                        <button onClick={clearNotifications} className="text-[10px] text-primary hover:underline font-bold">Clear All</button>
                      )}
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-6 text-center">No new notifications</p>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                              n.read ? 'bg-muted/40 border-transparent text-muted-foreground' : 'bg-primary/5 border-primary/20 text-foreground font-bold'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-primary font-bold">{n.title}</span>
                              <span className="text-[9px] text-muted-foreground">{n.time}</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-muted-foreground">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clean Theme Toggle */}
            <ThemeToggle />

            {/* User Profile Avatar Popover */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-0.5 rounded-full border border-primary hover:border-primary/80 transition-all focus:outline-none"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn-glow-yellow py-1.5 px-3.5 text-xs text-black font-extrabold rounded-lg shadow-sm"
                >
                  Login
                </Link>
              )}

              <AnimatePresence>
                {isProfileOpen && user && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-3 w-60 bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 text-left"
                  >
                    <div className="flex items-center gap-3 border-b border-border pb-3 mb-3">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-primary" />
                      <div>
                        <h4 className="text-xs font-bold text-foreground truncate">{user.name}</h4>
                        <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-primary/20 text-primary">
                          {user.role} view
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs font-semibold">
                      <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-muted text-foreground">My Profile</Link>
                      <Link to="/orders" onClick={() => setIsProfileOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-muted text-foreground">My Orders</Link>
                      <Link to="/addresses" onClick={() => setIsProfileOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-muted text-foreground">Saved Addresses</Link>
                      <button
                        onClick={() => { logoutUser(); setIsProfileOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 font-bold transition-colors flex items-center justify-between border-t border-border mt-2 pt-2"
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

      {/* 2. Category Navigation Bar (Z-index 999, placed directly below main navbar) */}
      <div 
        ref={megaMenuRef}
        className={`fixed left-0 right-0 z-[999] bg-muted border-b border-border py-1 px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out ${
          isScrolled ? 'top-14 sm:top-16 shadow-md' : 'top-16 sm:top-20 shadow-sm'
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          
          {/* Left: Mega Menu Toggle & Categories list */}
          <div className="flex items-center gap-4 flex-grow overflow-hidden">
            {/* Mega Menu Toggle */}
            <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-primary/10 hover:text-primary text-xs font-bold text-foreground border border-border transition-colors flex-shrink-0"
            >
              <FiMenu className="text-sm text-primary" />
              <span>All Categories</span>
            </button>

            {/* Horizontal Scroll Links */}
            <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground whitespace-nowrap overflow-x-auto pb-1 scrollbar-none scroll-smooth">
              <Link to="/products?cat=electronics" className="hover:text-foreground">Electronics</Link>
              <Link to="/products?cat=mobiles" className="hover:text-foreground">Mobiles</Link>
              <Link to="/products?cat=fashion" className="hover:text-foreground">Fashion</Link>
              <Link to="/products?cat=home" className="hover:text-foreground">Home & Kitchen</Link>
              <Link to="/products?cat=furniture" className="hover:text-foreground">Furniture</Link>
              <Link to="/products?cat=beauty" className="hover:text-foreground">Beauty</Link>
              <Link to="/products?cat=sports" className="hover:text-foreground">Sports</Link>
              <Link to="/products?cat=books" className="hover:text-foreground">Books</Link>
              <Link to="/products?cat=gaming" className="hover:text-foreground">Gaming</Link>
              <Link to="/products?cat=appliances" className="hover:text-foreground">Appliances</Link>
              
              <div className="h-4 w-px bg-border flex-shrink-0" />
              
              <Link to="/products" className="text-primary hover:underline flex items-center gap-1">
                <FiZap className="animate-pulse" /> Today's Deals
              </Link>
              <Link to="/products?deal=best" className="hover:text-foreground">Best Sellers</Link>
              <Link to="/contact" className="hover:text-foreground flex items-center gap-1"><FiHelpCircle /> Customer Service</Link>
              <Link to="/products" className="hover:text-foreground flex items-center gap-1"><FiGift /> Gift Cards</Link>
              <Link to="/seller/become-seller" className="text-accentBlue hover:underline">Sell on NexCart</Link>
            </div>
          </div>

          {/* Right: Location shortcut for mobile/tablet */}
          <div className="hidden sm:flex lg:hidden items-center gap-1.5 text-xs text-muted-foreground font-semibold flex-shrink-0 pl-4 border-l border-border">
            <FiMapPin className="text-primary text-sm" />
            <span className="truncate max-w-[120px]">{location}</span>
          </div>

        </div>

        {/* 3. Multi-Column Mega Menu Panel */}
        <AnimatePresence>
          {isMegaMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-2xl z-40 max-w-[1440px] mx-auto grid grid-cols-4"
            >
              {/* Left sidebar: categories list */}
              <div className="col-span-1 border-r border-border bg-muted/40 py-4 max-h-[400px] overflow-y-auto">
                <div className="px-3 mb-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Main Sectors</p>
                </div>
                <div className="space-y-1">
                  {MEGA_CATEGORIES.map((mcat) => (
                    <button
                      key={mcat.id}
                      onMouseEnter={() => setActiveMegaCategory(mcat)}
                      onClick={() => { setActiveMegaCategory(mcat); navigate(`/products?cat=${mcat.id}`); setIsMegaMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between border-l-2 transition-all ${
                        activeMegaCategory.id === mcat.id 
                          ? 'bg-card border-primary text-primary' 
                          : 'border-transparent text-foreground hover:bg-muted/80'
                      }`}
                    >
                      <span>{mcat.name}</span>
                      <FiChevronRight className={`text-xs ${activeMegaCategory.id === mcat.id ? 'text-primary' : 'text-muted-foreground/50'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right panel: Subcategories detailed grid map */}
              <div className="col-span-3 p-6 grid grid-cols-3 gap-6 max-h-[400px] overflow-y-auto">
                <div className="col-span-3 border-b border-border pb-2 mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-black text-foreground uppercase tracking-wider">{activeMegaCategory.name} Collection</h4>
                  <Link 
                    to={`/products?cat=${activeMegaCategory.id}`} 
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    View All {activeMegaCategory.name} Products &rarr;
                  </Link>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4 text-left">
                  <div>
                    <h5 className="text-[10px] text-muted-foreground uppercase font-black tracking-wider mb-2">Browse Sub-Sectors</h5>
                    <div className="space-y-2 text-xs font-semibold text-foreground">
                      {activeMegaCategory.subcategories.slice(0, 3).map((sub) => (
                        <Link 
                          key={sub} 
                          to={`/products?cat=${activeMegaCategory.id}`}
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="block hover:text-primary transition-colors py-0.5"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[10px] text-muted-foreground uppercase font-black tracking-wider mb-2">Popular Filters</h5>
                    <div className="space-y-2 text-xs font-semibold text-foreground">
                      {activeMegaCategory.subcategories.slice(3).map((sub) => (
                        <Link 
                          key={sub} 
                          to={`/products?cat=${activeMegaCategory.id}`}
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="block hover:text-primary transition-colors py-0.5"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Promotional Card */}
                <div className="col-span-1 bg-gradient-to-br from-primary/10 to-amber-500/10 border border-primary/20 rounded-2xl p-4 flex flex-col justify-between text-left h-full min-h-[160px]">
                  <div className="space-y-1">
                    <span className="bg-primary/20 border border-primary/30 text-primary text-[8px] font-black uppercase px-2 py-0.5 rounded">NexCart Recommend</span>
                    <h5 className="text-xs font-bold text-foreground leading-tight mt-1.5">Up to 40% Off New {activeMegaCategory.name}</h5>
                    <p className="text-[10px] text-muted-foreground">Certified brands with free express shipping.</p>
                  </div>
                  <button 
                    onClick={() => { navigate(`/products?cat=${activeMegaCategory.id}`); setIsMegaMenuOpen(false); }}
                    className="bg-primary text-black font-extrabold text-[10px] py-1.5 px-3 rounded-lg w-fit mt-3 hover:brightness-105"
                  >
                    Explore Deals
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Drawer Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 right-0 z-[998] bg-background border-t border-border px-4 py-4 space-y-4 shadow-2xl overflow-hidden text-left"
            style={{ top: isScrolled ? '94px' : '102px' }}
          >
            {/* Mobile Location Selector */}
            <div className="flex items-center justify-between text-xs text-muted-foreground p-3 rounded-xl bg-muted border border-border/50">
              <div className="flex items-center gap-2">
                <FiMapPin className="text-primary" />
                <span>Deliver to: <strong className="text-foreground font-bold">{location}</strong></span>
              </div>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setIsLocationOpen(true); }} 
                className="text-primary font-bold hover:underline"
              >
                Edit
              </button>
            </div>

            {/* Mobile categories scroll links */}
            <div className="space-y-1">
              <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-2">Category Portals</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {CATEGORIES.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-card border border-border text-foreground hover:border-primary/40 block text-center"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* General links */}
            <div className="space-y-1 text-xs font-bold pt-2 border-t border-border">
              <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-foreground">Explore All Products</Link>
              <Link to="/seller/become-seller" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-accentBlue">Become a NexCart Seller</Link>
              <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-foreground">Track My Orders</Link>
              <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-foreground">My Wishlist ({wishlistCount})</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
