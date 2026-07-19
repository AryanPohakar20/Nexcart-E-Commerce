import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import logo from '../assets/logo.jpg';
import { CATEGORIES } from '../constants/dummyData';
import { 
  FiSearch, FiHeart, FiShoppingCart, FiBell, FiUser, 
  FiMapPin, FiGlobe, FiChevronDown, FiMenu, FiX, FiBriefcase, FiSliders, FiLogOut 
} from 'react-icons/fi';

const Navbar = () => {
  const { 
    user, cart, wishlist, notifications, markNotificationRead, clearNotifications, loginUser, logoutUser 
  } = useContext(AppContext);
  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Popovers
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <header className="fixed top-0 left-0 right-0 z-50 glass-navbar shadow-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile Hamburguer & Brand Logo */}
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden text-white hover:text-primary transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src={logo} alt="NexCart" className="h-10 w-10 object-cover rounded-lg border border-primary/20" />
              <span className="text-2xl font-bold tracking-wider text-primary">NEX<span className="text-white">CART</span></span>
            </Link>
          </div>

          {/* Location Delivery Selector (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 text-xs cursor-pointer hover:text-primary transition-all max-w-[150px]">
            <FiMapPin className="text-primary text-base flex-shrink-0" />
            <div className="truncate">
              <p className="text-[10px] text-gray-400">Deliver to</p>
              <p className="font-semibold text-white truncate">Mumbai 400001</p>
            </div>
          </div>

          {/* Search Form Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-grow max-w-xl h-11 bg-secondaryBg rounded-lg border border-white/10 focus-within:border-primary/50 overflow-hidden transition-all">
            <div className="relative flex items-center border-r border-white/10 bg-black/20">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs text-gray-300 px-3 pr-8 focus:outline-none appearance-none cursor-pointer h-full"
              >
                <option value="All" className="bg-cardBg text-white">All categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-cardBg text-white">{cat.name}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-2 text-gray-400 pointer-events-none text-xs" />
            </div>
            
            <input 
              type="text" 
              placeholder="Search premium electronics, shoes, laptops..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow bg-transparent text-sm px-4 focus:outline-none text-white placeholder-gray-500"
            />
            
            <button type="submit" className="bg-primary text-black px-5 hover:bg-primary-dark transition-all flex items-center justify-center">
              <FiSearch size={18} />
            </button>
          </form>

          {/* Nav Icons Right Area */}
          <div className="flex items-center gap-4 lg:gap-6">
            
            {/* Mega Menu Toggle Link */}
            <Link 
              to="/categories"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              className="hidden lg:flex items-center gap-1 text-sm font-semibold hover:text-primary transition-all py-2"
            >
              <span>Categories</span>
              <FiChevronDown className={`transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
            </Link>

            {/* Language dropdown Selector (Desktop) */}
            <div className="hidden lg:flex items-center gap-1 text-xs text-gray-300 hover:text-white cursor-pointer py-2">
              <FiGlobe className="text-primary text-sm" />
              <span className="font-medium">EN</span>
            </div>

            {/* Seller Quick Navigation */}
            <Link 
              to={user?.role === 'seller' ? '/seller/dashboard' : '/seller/dashboard'} 
              onClick={() => {
                if (user?.role !== 'seller') switchRole('seller');
              }}
              className="hidden xl:flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 hover:border-primary/30 px-3 py-1.5 rounded-lg transition-all"
            >
              <FiBriefcase className="text-primary" />
              <span className="font-medium">Become Seller</span>
            </Link>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="relative hover:text-primary transition-all py-2">
              <FiHeart size={22} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center badge-glow">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="relative hover:text-primary transition-all py-2 flex items-center gap-1">
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center badge-glow">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notifications Popover */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="relative hover:text-primary transition-all py-2"
              >
                <FiBell size={22} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-accentBlue text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 glass-card rounded-xl border border-white/10 p-4 shadow-2xl z-50">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                    <span className="font-bold text-sm">Notifications ({notifications.length})</span>
                    <button 
                      onClick={clearNotifications}
                      className="text-xs text-primary hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">No new updates.</p>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                      {notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 rounded-lg text-xs cursor-pointer transition-all hover:bg-white/5 ${n.read ? 'opacity-60' : 'border-l-2 border-primary pl-2'}`}
                        >
                          <p className="font-semibold text-white">{n.title}</p>
                          <p className="text-gray-400 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-gray-500 block mt-1">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile / Auth Settings Dropdown */}
            <div className="relative">
              {user ? (
                <button 
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className="flex items-center gap-1.5 hover:text-primary transition-all"
                >
                  <img 
                    src={user.avatar} 
                    alt="User" 
                    className="w-8 h-8 rounded-full object-cover border border-primary/30"
                  />
                  <FiChevronDown className="hidden sm:block text-xs text-gray-400" />
                </button>
              ) : (
                <Link to="/login" className="btn-glow-yellow !px-4 !py-2 text-xs flex items-center gap-1.5">
                  <FiUser />
                  <span>Login</span>
                </Link>
              )}

              {/* Profile drop list */}
              {isProfileOpen && user && (
                <div className="absolute right-0 mt-3 w-56 glass-card rounded-xl border border-white/10 p-3 shadow-2xl z-50">
                  <div className="px-3 py-2 border-b border-white/5 mb-2">
                    <p className="font-bold text-sm text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-extrabold bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded">
                      Role: {user.role}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-sm">
                    <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5 flex items-center gap-2.5">
                      <FiUser size={16} className="text-primary" />
                      <span>My Profile</span>
                    </Link>
                    <Link to="/orders" onClick={() => setIsProfileOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5 flex items-center gap-2.5">
                      <FiShoppingCart size={16} className="text-primary" />
                      <span>My Orders</span>
                    </Link>

                    {/* Quick Demo Switcher */}
                    <div className="border-t border-white/5 my-2 pt-2">
                      <p className="text-[10px] uppercase font-bold text-gray-500 px-3 mb-1">Developer Role Switch</p>
                      <button onClick={() => switchRole('customer')} className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 ${user.role === 'customer' ? 'text-primary bg-primary/10' : 'text-gray-400 hover:bg-white/5'}`}>
                        Customer Shop
                      </button>
                      <button onClick={() => switchRole('seller')} className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 ${user.role === 'seller' ? 'text-primary bg-primary/10' : 'text-gray-400 hover:bg-white/5'}`}>
                        Seller Dashboard
                      </button>
                      <button onClick={() => switchRole('admin')} className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 ${user.role === 'admin' ? 'text-accentBlue bg-accentBlue/10' : 'text-gray-400 hover:bg-white/5'}`}>
                        Admin Control
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        logoutUser();
                        setIsProfileOpen(false);
                      }}
                      className="px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 mt-1 flex items-center gap-2.5 w-full text-left"
                    >
                      <FiLogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Mega Category Menu Hover Dropdown */}
      {isMegaMenuOpen && (
        <div 
          className="absolute left-0 right-0 top-20 bg-secondaryBg border-b border-white/10 shadow-2xl z-40 p-8 hidden lg:block"
          onMouseLeave={() => setIsMegaMenuOpen(false)}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-5 gap-6">
            <div className="col-span-1 border-r border-white/5 pr-6">
              <h3 className="text-primary font-bold text-base mb-3">Trending Deals</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">Explore high-end electronics, sports kits, and the latest premium arrivals.</p>
              <Link to="/products" className="btn-glow-yellow !py-1.5 text-xs text-center block">View All Items</Link>
            </div>
            
            <div className="col-span-4 grid grid-cols-4 gap-6">
              {CATEGORIES.slice(0, 8).map((cat) => (
                <div key={cat.id} className="group">
                  <Link 
                    to={`/category/${cat.id}`}
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="flex items-center gap-3 cursor-pointer group-hover:text-primary transition-all mb-2"
                  >
                    <img src={cat.image} alt={cat.name} className="w-12 h-8 rounded object-cover border border-white/10" />
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-primary">{cat.name}</h4>
                      <span className="text-[10px] text-gray-400">{cat.count} listings</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-20 bg-darkBg/95 backdrop-blur-md z-40 lg:hidden p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            {/* Mobile Search Bar */}
            <form onSubmit={handleSearch} className="flex h-11 bg-secondaryBg rounded-lg border border-white/10 overflow-hidden">
              <input 
                type="text" 
                placeholder="Search catalog..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow bg-transparent text-sm px-4 focus:outline-none text-white placeholder-gray-500"
              />
              <button type="submit" className="bg-primary text-black px-4 flex items-center justify-center">
                <FiSearch size={16} />
              </button>
            </form>

            {/* Mobile Nav Links */}
            <div>
              <h3 className="text-primary font-bold text-xs uppercase tracking-wider mb-3">Shop Categories</h3>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary/40 flex flex-col gap-1 transition-all text-xs"
                  >
                    <span className="font-semibold">{cat.name}</span>
                    <span className="text-[10px] text-gray-400">{cat.count} Items</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions at footer of mobile drawer */}
          <div className="pt-6 border-t border-white/5 space-y-3">
            <Link 
              to="/seller/dashboard"
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (user?.role !== 'seller') switchRole('seller');
              }}
              className="w-full btn-outline-yellow text-xs text-center py-2.5 block"
            >
              Become a Seller
            </Link>
            {user ? (
              <button 
                onClick={() => {
                  logoutUser();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-red-500/10 text-red-400 rounded-lg text-xs py-2.5"
              >
                Sign Out
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full btn-glow-yellow text-xs text-center py-2.5 block">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
