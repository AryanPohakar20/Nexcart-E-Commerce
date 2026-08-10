import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

import {
  FiSliders, FiUsers, FiBox, FiTrendingUp, FiSettings, FiCheckCircle, FiActivity,
  FiXCircle, FiDollarSign, FiShield, FiDownload, FiFileText, FiRefreshCw, FiPieChart, FiUserCheck, FiUserX, FiAward
} from 'react-icons/fi';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const AdminDashboard = () => {
  const { showToast } = useContext(AppContext);
  const location = useLocation();

  const getInitialTab = () => {
    if (location.pathname.includes('/admin/overview')) return 'overview';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  // Admin Top Statistics State
  const [adminStats, setAdminStats] = useState({
    totalUsers: 12480,
    buyersCount: 10600,
    sellersCount: 1880,
    totalProducts: 4850,
    activeListings: 3920,
    soldListings: 930,
    revenue: 489200,
    transactionsCount: 3840,
    pendingReports: 4,
    blockedUsers: 12,
  });

  // Recent Activity Feed State
  const [recentActivities, setRecentActivities] = useState([
    { id: 'act-1', type: 'user_registered', message: 'New customer account "Rohan Sharma" registered', time: '10 mins ago' },
    { id: 'act-2', type: 'product_listed', message: 'Seller TechVault listed "MacBook Pro M3 Max"', time: '25 mins ago' },
    { id: 'act-3', type: 'order_completed', message: 'Order #TXN-98421 completed ($1,299.00)', time: '1 hour ago' },
    { id: 'act-4', type: 'listing_removed', message: 'Moderator removed flagged listing #PROD-88', time: '2 hours ago' },
    { id: 'act-5', type: 'user_reported', message: 'User report submitted for improper listing price', time: '3 hours ago' },
  ]);

  // Platform Charts State
  const [chartData, setChartData] = useState({
    userGrowth: [
      { period: 'Jan', buyers: 1200, sellers: 180, dau: 3400 },
      { period: 'Feb', buyers: 1900, sellers: 260, dau: 4800 },
      { period: 'Mar', buyers: 2700, sellers: 390, dau: 6900 },
      { period: 'Apr', buyers: 3800, sellers: 520, dau: 8900 },
      { period: 'May', buyers: 5200, sellers: 680, dau: 12400 },
      { period: 'Jun', buyers: 6900, sellers: 890, dau: 16800 },
    ],
    revenueTrend: [
      { day: 'Mon', revenue: 14200, orders: 128 },
      { day: 'Tue', revenue: 19800, orders: 174 },
      { day: 'Wed', revenue: 26400, orders: 230 },
      { day: 'Thu', revenue: 22100, orders: 192 },
      { day: 'Fri', revenue: 34500, orders: 298 },
      { day: 'Sat', revenue: 41200, orders: 360 },
      { day: 'Sun', revenue: 48900, orders: 420 },
    ],
    categoryDistribution: [
      { name: 'Mobiles & Tech', value: 42 },
      { name: 'Laptops & Computers', value: 24 },
      { name: 'Audio & Accessories', value: 16 },
      { name: 'Fashion & Sneakers', value: 12 },
      { name: 'Home & Lifestyle', value: 6 },
    ],
  });

  // Top Leaderboards State
  const [topSellers, setTopSellers] = useState([
    { id: 'ts-1', name: 'TechVault Outlet', revenue: 148900, sales: 142, rating: 4.9, listings: 38 },
    { id: 'ts-2', name: 'Alex Rivera Mobiles', revenue: 98400, sales: 89, rating: 4.8, listings: 24 },
    { id: 'ts-3', name: 'Sophia Chen Audio', revenue: 64200, sales: 74, rating: 5.0, listings: 18 },
    { id: 'ts-4', name: 'Marcus Vance Laptops', revenue: 182000, sales: 62, rating: 4.9, listings: 15 },
    { id: 'ts-5', name: 'UrbanSneakers Outlet', revenue: 42500, sales: 51, rating: 4.7, listings: 29 },
  ]);

  const [topProducts, setTopProducts] = useState([
    { id: 'tp-1', title: 'Apple iPhone 15 Pro 256GB - Natural Titanium', views: 4820, sales: 64, revenue: 60800 },
    { id: 'tp-2', title: 'Sony WH-1000XM5 Wireless Headphones', views: 3910, sales: 88, revenue: 24640 },
    { id: 'tp-3', title: 'MacBook Pro 16" M3 Max (36GB RAM, 1TB SSD)', views: 2840, sales: 22, revenue: 52800 },
    { id: 'tp-4', title: 'Nike Air Jordan 1 Retro High OG', views: 2150, sales: 42, revenue: 7980 },
    { id: 'tp-5', title: 'Custom Gaming PC i7 14700K / RTX 4080', views: 1980, sales: 18, revenue: 33300 },
  ]);

  // Export Summary Report to CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['Metric', 'Value'],
      ['Total Users', adminStats.totalUsers],
      ['Buyers Count', adminStats.buyersCount],
      ['Sellers Count', adminStats.sellersCount],
      ['Total Products', adminStats.totalProducts],
      ['Active Listings', adminStats.activeListings],
      ['Sold Listings', adminStats.soldListings],
      ['Total Revenue', `$${adminStats.revenue}`],
      ['Transactions Count', adminStats.transactionsCount],
      ['Pending Reports', adminStats.pendingReports],
      ['Blocked Users', adminStats.blockedUsers],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NexCart_Admin_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Admin CSV report downloaded!', 'success');
  };

  return (
    <div className="space-y-8 text-left max-w-[1440px] mx-auto px-2">
      
      {/* Top Header */}
      <div className="border-b border-gray-200 dark:border-white/10 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <FiSliders className="text-blue-500" /> Root Administrator Hub
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Global marketplace management, core services status, and administrative operations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <FiDownload className="text-xs" /> Export CSV Report
          </button>
        </div>
      </div>

      {/* ─── 1. TOP 10 STATISTICS CARDS GRID ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#161618] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Users</span>
          <span className="text-2xl font-black text-gray-900 dark:text-white">{adminStats.totalUsers.toLocaleString()}</span>
          <span className="text-[10px] text-blue-500 font-bold block">{adminStats.buyersCount} Buyers • {adminStats.sellersCount} Sellers</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#161618] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Products</span>
          <span className="text-2xl font-black text-gray-900 dark:text-white">{adminStats.totalProducts.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-500 font-bold block">{adminStats.activeListings} Active</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#161618] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Sold Listings</span>
          <span className="text-2xl font-black text-gray-900 dark:text-white">{adminStats.soldListings.toLocaleString()}</span>
          <span className="text-[10px] text-purple-400 font-bold block">Marketplace exchanges</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#161618] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Revenue</span>
          <span className="text-2xl font-black text-amber-500">${adminStats.revenue.toLocaleString()}</span>
          <span className="text-[10px] text-amber-500 font-bold block">{adminStats.transactionsCount} Transactions</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#161618] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Moderation</span>
          <span className="text-2xl font-black text-red-500">{adminStats.pendingReports} Reports</span>
          <span className="text-[10px] text-red-400 font-bold block">{adminStats.blockedUsers} Blocked Accounts</span>
        </div>
      </div>

      {/* ─── SYSTEM OVERVIEW ──────────────────────────────────────────────── */}

      {/* ─── TAB 2: SYSTEM OVERVIEW ──────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="p-8 rounded-3xl bg-white dark:bg-[#161618] border border-gray-200/80 dark:border-white/10 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto text-2xl">
            <FiCheckCircle />
          </div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">NexCart Core Services Operational</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            MongoDB database replica set, Socket.IO WebSocket cluster, and API gateways operating at peak performance.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
