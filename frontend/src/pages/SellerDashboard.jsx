import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { SELLER_STATS, CATEGORIES } from '../constants/dummyData';

import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

import {
  FiDollarSign, FiShoppingBag, FiUsers, FiArchive, FiPlus, FiCheck, FiPackage,
  FiBarChart2, FiTrendingUp, FiEye, FiHeart, FiMessageSquare, FiTag, FiStar,
  FiEdit, FiPause, FiTrash2, FiZap, FiCheckCircle, FiClock, FiFilter, FiSearch
} from 'react-icons/fi';

const CountUp = ({ to, duration = 1.2, formatter = (val) => val }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = to;
    if (start === end) return;

    const totalMiliseconds = duration * 1000;
    const intervalTime = 30;
    const totalSteps = Math.round(totalMiliseconds / intervalTime);
    const increment = (end - start) / totalSteps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setCount(() => {
        const nextVal = Math.round(start + increment * currentStep);
        if (currentStep >= totalSteps) {
          clearInterval(timer);
          return end;
        }
        return nextVal;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [to, duration]);

  return <span>{formatter(count)}</span>;
};

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

const SellerDashboard = () => {
  const { showToast } = useContext(AppContext);
  const location = useLocation();

  const getInitialTab = () => {
    if (location.pathname.includes('/seller/products')) return 'products';
    if (location.pathname.includes('/seller/orders')) return 'orders';
    if (location.pathname.includes('/seller/performance')) return 'performance';
    return 'products';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  // Summary Metrics State
  const [summaryStats, setSummaryStats] = useState({
    totalSales: 84,
    revenue: 142500,
    activeListings: 12,
    soldProducts: 48,
    pendingOrders: 3,
    averageRating: 4.9,
    totalViews: 3840,
    wishlistCount: 520,
  });

  // Listing Performance State
  const [performanceListings, setPerformanceListings] = useState([]);
  const [dailyPerformance, setDailyPerformance] = useState([]);
  const [performanceSearch, setPerformanceSearch] = useState('');

  // Local state for products vendor manages
  const [vendorProducts, setVendorProducts] = useState([
    { id: 'vp1', title: 'Apple iPhone 15 Pro Max', price: 1399, stock: 12, category: 'mobiles', status: 'available' },
    { id: 'vp2', title: 'Sony WH-1000XM5 Wireless Headphones', price: 280, stock: 8, category: 'electronics', status: 'available' },
    { id: 'vp3', title: 'Nike Air Max Pulse Lifestyle Sneakers', price: 190, stock: 25, category: 'fashion', status: 'available' },
  ]);

  // Add Product Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProd, setNewProd] = useState({ title: '', price: '', stock: '', category: 'electronics' });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (newProd.title && newProd.price && newProd.stock) {
      const added = {
        id: `vp-${Date.now()}`,
        title: newProd.title,
        price: Number(newProd.price),
        stock: Number(newProd.stock),
        category: newProd.category,
        status: 'available',
      };
      setVendorProducts((prev) => [...prev, added]);
      setNewProd({ title: '', price: '', stock: '', category: 'electronics' });
      setIsAddOpen(false);
      showToast('Product Listing Published successfully!', 'success');
    }
  };

  const handleToggleListingStatus = (id) => {
    setVendorProducts(prev =>
      prev.map(p => p.id === id ? { ...p, status: p.status === 'paused' ? 'available' : 'paused' } : p)
    );
    showToast('Listing status updated!', 'info');
  };

  const handleDeleteListing = (id) => {
    setVendorProducts(prev => prev.filter(p => p.id !== id));
    showToast('Listing deleted successfully!', 'error');
  };

  // Filtered Listings for Performance Tab
  const filteredListings = performanceListings.filter(p =>
    p.title.toLowerCase().includes(performanceSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left max-w-[1440px] mx-auto px-2">
      
      {/* Top Header */}
      <div className="border-b border-gray-200 dark:border-white/10 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <FiPackage className="text-amber-500" /> Seller Operations Studio
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your store listings, listing performance scorecards, and customer orders.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'performance'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Listing Performance
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            My Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Vendor Orders
          </button>
        </div>
      </div>

      {/* ─── 1. SELLER DASHBOARD CARDS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Sales */}
        <div className="bg-white dark:bg-[#161618] border border-gray-200/80 dark:border-white/10 p-5 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
            <span>Total Sales</span>
            <FiShoppingBag className="text-amber-500 text-base" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            <CountUp to={summaryStats.totalSales} />
          </p>
          <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
            <FiTrendingUp /> +14% vs last period
          </span>
        </div>

        {/* Revenue */}
        <div className="bg-white dark:bg-[#161618] border border-gray-200/80 dark:border-white/10 p-5 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
            <span>Revenue</span>
            <FiDollarSign className="text-emerald-500 text-base" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            <CountUp to={summaryStats.revenue} formatter={(v) => '$' + v.toLocaleString()} />
          </p>
          <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
            <FiTrendingUp /> Gross income earned
          </span>
        </div>

        {/* Active Listings */}
        <div className="bg-white dark:bg-[#161618] border border-gray-200/80 dark:border-white/10 p-5 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
            <span>Active Listings</span>
            <FiPackage className="text-blue-500 text-base" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            <CountUp to={summaryStats.activeListings} />
          </p>
          <span className="text-[10px] text-blue-500 font-bold">
            {summaryStats.soldProducts} Products Sold
          </span>
        </div>

        {/* Total Views & Rating */}
        <div className="bg-white dark:bg-[#161618] border border-gray-200/80 dark:border-white/10 p-5 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
            <span>Views & Wishlists</span>
            <FiEye className="text-purple-500 text-base" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            <CountUp to={summaryStats.totalViews} />
          </p>
          <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
            <FiStar className="fill-amber-500" /> {summaryStats.averageRating} Rating ({summaryStats.wishlistCount} wishlists)
          </span>
        </div>
      </div>

      {/* ─── TAB 2: LISTING PERFORMANCE ───────────────────────────────────────────── */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          
          {/* Daily Trend Chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#161618] border border-gray-200/80 dark:border-white/10 space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-gray-800 dark:text-white tracking-wider flex items-center gap-2">
              <FiEye className="text-amber-500" /> Daily Impressions, Clicks & Engagement Trend
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="day" stroke="#888" fontSize={11} />
                  <YAxis stroke="#888" fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="views" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} name="Views" />
                  <Area type="monotone" dataKey="clicks" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Clicks" />
                  <Area type="monotone" dataKey="wishlists" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} name="Wishlists" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Search Input for Performance Table */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={performanceSearch}
                onChange={(e) => setPerformanceSearch(e.target.value)}
                placeholder="Search listings..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Performance Table */}
          <div className="bg-white dark:bg-[#161618] rounded-3xl border border-gray-200/80 dark:border-white/10 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-white/10">
                    <th className="p-4">Listing Product</th>
                    <th className="p-4">Views</th>
                    <th className="p-4">Clicks</th>
                    <th className="p-4">CTR</th>
                    <th className="p-4">Wishlists</th>
                    <th className="p-4">Offers</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Performance Badge</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredListings.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={item.image} alt={item.title} className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white truncate max-w-[180px]">{item.title}</h4>
                          <span className="text-[10px] text-amber-500 font-bold">${item.price}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-800 dark:text-gray-200">{item.views}</td>
                      <td className="p-4 font-semibold text-gray-800 dark:text-gray-200">{item.clicks}</td>
                      <td className="p-4 font-bold text-blue-500">{item.ctr}</td>
                      <td className="p-4 font-semibold text-purple-400">{item.wishlistCount}</td>
                      <td className="p-4 font-semibold text-emerald-500">{item.offersReceived}</td>
                      <td className="p-4 font-black text-amber-500">{item.popularityScore}/100</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          item.performanceBadge === 'Excellent'
                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                            : item.performanceBadge === 'Good'
                            ? 'bg-blue-500/15 text-blue-500 border border-blue-500/20'
                            : 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                        }`}>
                          {item.performanceBadge}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleListingStatus(item.id)}
                            className="p-1.5 bg-gray-100 dark:bg-white/5 hover:bg-amber-500/20 text-gray-500 hover:text-amber-500 rounded-lg transition-all"
                            title="Pause/Resume"
                          >
                            <FiPause className="text-xs" />
                          </button>
                          <button
                            onClick={() => handleDeleteListing(item.id)}
                            className="p-1.5 bg-gray-100 dark:bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-500 rounded-lg transition-all"
                            title="Delete"
                          >
                            <FiTrash2 className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: MY PRODUCTS ─────────────────────────────────────────────────── */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-white/10 pb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FiPackage className="text-amber-500" />
              <span>Published Listings ({vendorProducts.length})</span>
            </h3>
            <button
              onClick={() => setIsAddOpen(!isAddOpen)}
              className="bg-amber-500 text-black font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 hover:bg-amber-400 transition-all shadow-md"
            >
              <FiPlus /> Add New Product
            </button>
          </div>

          {/* Add Product Form */}
          {isAddOpen && (
            <form onSubmit={handleAddProduct} className="bg-white dark:bg-[#161618] border border-gray-200 dark:border-white/10 p-6 rounded-3xl grid grid-cols-2 gap-4 text-xs">
              <div className="col-span-2">
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Publish New Product Listing</h4>
              </div>
              <div className="col-span-2">
                <label className="block text-gray-500 mb-1 font-bold">Product Title</label>
                <input
                  type="text"
                  value={newProd.title}
                  onChange={(e) => setNewProd((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Sony Wireless Headphones"
                  className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Price ($)</label>
                <input
                  type="number"
                  value={newProd.price}
                  onChange={(e) => setNewProd((p) => ({ ...p, price: e.target.value }))}
                  placeholder="199"
                  className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Stock</label>
                <input
                  type="number"
                  value={newProd.stock}
                  onChange={(e) => setNewProd((p) => ({ ...p, stock: e.target.value }))}
                  placeholder="10"
                  className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                  required
                />
              </div>
              <button type="submit" className="col-span-2 py-3 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition-all shadow-md">
                Publish Product Listing
              </button>
            </form>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vendorProducts.map((p) => (
              <div key={p.id} className="bg-white dark:bg-[#161618] border border-gray-200/80 dark:border-white/10 p-5 rounded-3xl text-xs space-y-3 relative">
                <span className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full">
                  {p.category}
                </span>
                <h4 className="font-extrabold text-gray-900 dark:text-white text-sm truncate pr-16">{p.title}</h4>
                <div className="flex justify-between items-center text-gray-400 font-bold border-t border-gray-100 dark:border-white/5 pt-3">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Price</p>
                    <p className="text-amber-500 text-sm font-extrabold">${p.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Stock</p>
                    <p className="text-emerald-500 text-sm font-extrabold">{p.stock} units</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: VENDOR ORDERS ───────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-[#161618] rounded-3xl border border-gray-200/80 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 font-bold border-b border-gray-200 dark:border-white/10">
                  <th className="p-4">OrderID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Listing Title</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {SELLER_STATS.recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-gray-900 dark:text-white">{ord.id}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 font-medium">{ord.customer}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 truncate max-w-[150px] font-medium">{ord.product}</td>
                    <td className="p-4 text-gray-400">{ord.date}</td>
                    <td className="p-4 font-extrabold text-amber-500">${ord.amount}</td>
                    <td className="p-4 text-right">
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
