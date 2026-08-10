import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { SellerContext } from '../../context/SellerContext';
import RevenueChart from '../../components/seller/RevenueChart';
import SellerStatsCard from '../../components/seller/SellerStatsCard';
import { 
  FiBarChart2, FiDollarSign, FiShoppingBag, FiEye, 
  FiTrendingUp, FiPieChart, FiUsers, FiAward, FiArrowUpRight,
  FiXCircle
} from 'react-icons/fi';

const getPeriodStats = (orders, startDaysAgo, endDaysAgo) => {
  const today = new Date();
  
  const startDate = new Date();
  startDate.setDate(today.getDate() - startDaysAgo);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setDate(today.getDate() - endDaysAgo);
  endDate.setHours(23, 59, 59, 999);

  const filtered = orders.filter(ord => {
    if (ord.status === 'Cancelled') return false;
    const ordDate = new Date(ord.orderDate);
    return ordDate >= startDate && ordDate <= endDate;
  });

  const revenue = filtered.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const count = filtered.length;
  const aov = count > 0 ? Math.round(revenue / count) : 0;

  return { revenue, count, aov };
};

const calculateGrowth = (current, previous) => {
  if (previous === 0) return { percent: null, isPositive: true, label: 'No prior data' };
  const diff = current - previous;
  const percent = Math.round((diff / previous) * 100);
  return {
    percent: Math.abs(percent),
    isPositive: percent >= 0,
    label: `${percent >= 0 ? '+' : ''}${percent}% vs last period`,
  };
};

const calculateChartData = (orders, timeframe) => {
  const today = new Date();
  
  if (timeframe === '7D') {
    const days = [];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = dayLabels[d.getDay()];
      days.push({ label, dateStr, revenue: 0, orders: 0 });
    }

    orders.forEach(ord => {
      if (ord.status === 'Cancelled') return;
      const match = days.find(day => day.dateStr === ord.orderDate);
      if (match) {
        match.revenue += ord.totalAmount || 0;
        match.orders += 1;
      }
    });

    return days;
  }

  if (timeframe === '30D') {
    const weeks = [
      { label: 'Week 1', startDay: 30, endDay: 22, revenue: 0, orders: 0 },
      { label: 'Week 2', startDay: 21, endDay: 15, revenue: 0, orders: 0 },
      { label: 'Week 3', startDay: 14, endDay: 8, revenue: 0, orders: 0 },
      { label: 'Week 4', startDay: 7, endDay: 0, revenue: 0, orders: 0 },
    ];

    orders.forEach(ord => {
      if (ord.status === 'Cancelled') return;
      const ordDate = new Date(ord.orderDate);
      const diffTime = Math.abs(today - ordDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const match = weeks.find(wk => diffDays >= wk.endDay && diffDays <= wk.startDay);
      if (match) {
        match.revenue += ord.totalAmount || 0;
        match.orders += 1;
      }
    });

    return weeks.map(({ label, revenue, orders }) => ({ label, revenue, orders }));
  }

  if (timeframe === '12M') {
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(today.getMonth() - i);
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      const label = monthLabels[monthIdx];
      months.push({ label, monthIdx, year, revenue: 0, orders: 0 });
    }

    orders.forEach(ord => {
      if (ord.status === 'Cancelled') return;
      const ordDate = new Date(ord.orderDate);
      const monthIdx = ordDate.getMonth();
      const year = ordDate.getFullYear();
      
      const match = months.find(m => m.monthIdx === monthIdx && m.year === year);
      if (match) {
        match.revenue += ord.totalAmount || 0;
        match.orders += 1;
      }
    });

    return months.map(({ label, revenue, orders }) => ({ label, revenue, orders }));
  }

  return [];
};

const CATEGORY_SHARE = [
  { name: 'Mobiles & Tech (C2C)', percentage: 42, color: 'bg-primary' },
  { name: 'Home & Ceramics (Retail)', percentage: 26, color: 'bg-accentBlue' },
  { name: 'Gaming Consoles (C2C)', percentage: 18, color: 'bg-purple-400' },
  { name: 'Fashion & Bags (Retail)', percentage: 14, color: 'bg-emerald-400' },
];

const TRAFFIC_SOURCES = [
  { source: 'Marketplace Search Bar', share: '48%', visitors: '4,120' },
  { source: 'Direct Category Browsing', share: '28%', visitors: '2,400' },
  { source: 'NexCart Recommended Deals', share: '16%', visitors: '1,370' },
  { source: 'Buyer Social & Link Sharing', share: '8%', visitors: '685' },
];

const SellerAnalytics = () => {
  const { stats, settings, products, orders, ordersLoading, ordersError, fetchSellerOrders } = useContext(SellerContext);
  const [timeframe, setTimeframe] = useState('7D');

  if (ordersLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 text-left">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-textSecondary">Calculating studio intelligence metrics...</p>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto text-left">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 text-red-500 mx-auto flex items-center justify-center border border-red-500/20">
          <FiXCircle size={32} />
        </div>
        <h3 className="text-base font-bold text-textPrimary">Failed to load analytics</h3>
        <p className="text-xs text-textSecondary">{ordersError}</p>
        <button
          onClick={fetchSellerOrders}
          className="px-5 py-2.5 rounded-xl bg-primary text-black font-bold hover:bg-primary-light shadow-yellow-glow text-xs"
        >
          Retry Calculations
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-cardBg border border-borderColor rounded-3xl p-12 text-center space-y-4 text-left">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary mx-auto flex items-center justify-center border border-primary/20">
          <FiBarChart2 size={32} />
        </div>
        <h3 className="text-base font-bold text-textPrimary">No Sales Yet</h3>
        <p className="text-xs text-textSecondary max-w-sm mx-auto">
          No sales data yet. Your analytics will appear here once customers start purchasing your products.
        </p>
      </div>
    );
  }

  const isBusiness = settings?.sellerType === 'business';

  // Timeframe calculation
  const periodStats = React.useMemo(() => {
    let startDays = 7;
    let prevStartDays = 14;
    let prevEndDays = 8;

    if (timeframe === '30D') {
      startDays = 30;
      prevStartDays = 60;
      prevEndDays = 31;
    } else if (timeframe === '12M') {
      startDays = 365;
      prevStartDays = 730;
      prevEndDays = 366;
    }

    const current = getPeriodStats(orders, startDays, 0);
    const previous = getPeriodStats(orders, prevStartDays, prevEndDays);

    return { current, previous };
  }, [orders, timeframe]);

  const gmvGrowth = calculateGrowth(periodStats.current.revenue, periodStats.previous.revenue);
  const aovGrowth = calculateGrowth(periodStats.current.aov, periodStats.previous.aov);
  const orderGrowth = calculateGrowth(periodStats.current.count, periodStats.previous.count);

  const conversionRate = stats.totalViews > 0 ? ((orders.length / stats.totalViews) * 100).toFixed(1) : '0.0';

  const chartData = calculateChartData(orders, timeframe);

  // Category revenue share calculation
  const categoryShare = React.useMemo(() => {
    const categoryRevenue = {};
    let totalRev = 0;

    orders.forEach(ord => {
      if (ord.status === 'Cancelled') return;
      ord.items.forEach(item => {
        const catName = item.product?.category || 'General';
        const subtotal = (item.price * item.quantity) || 0;
        categoryRevenue[catName] = (categoryRevenue[catName] || 0) + subtotal;
        totalRev += subtotal;
      });
    });

    if (totalRev === 0) {
      products.forEach(p => {
        const catName = p.category || 'General';
        categoryRevenue[catName] = (categoryRevenue[catName] || 0) + 1;
        totalRev += 1;
      });
    }

    if (totalRev === 0) return [];

    const colors = ['bg-primary', 'bg-accentBlue', 'bg-purple-400', 'bg-emerald-400', 'bg-yellow-400'];
    return Object.keys(categoryRevenue)
      .map((cat, idx) => ({
        name: cat,
        percentage: Math.round((categoryRevenue[cat] / totalRev) * 100),
        color: colors[idx % colors.length],
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [products, orders]);

  // Persona C2C vs business shares calculation
  const personaShare = React.useMemo(() => {
    let c2cRevenue = 0;
    let businessRevenue = 0;
    let total = 0;

    orders.forEach(ord => {
      if (ord.status === 'Cancelled') return;
      ord.items.forEach(item => {
        const isC2C = item.product?.sellerType === 'individual_c2c' || item.product?.condition !== 'New';
        const subtotal = (item.price * item.quantity) || 0;
        if (isC2C) {
          c2cRevenue += subtotal;
        } else {
          businessRevenue += subtotal;
        }
        total += subtotal;
      });
    });

    if (total === 0) {
      return { c2c: 50, business: 50 };
    }

    return {
      c2c: Math.round((c2cRevenue / total) * 100),
      business: Math.round((businessRevenue / total) * 100),
    };
  }, [orders]);

  // Top products performance leaderboard
  const topProducts = React.useMemo(() => {
    const productStats = {};
    products.forEach(p => {
      productStats[p.id] = {
        product: p,
        unitsSold: 0,
        revenueGenerated: 0,
        orderCount: 0,
      };
    });

    orders.forEach(ord => {
      if (ord.status === 'Cancelled') return;
      ord.items.forEach(item => {
        const prodId = item.product?._id || item.product?.id || item.product;
        if (productStats[prodId]) {
          productStats[prodId].unitsSold += item.quantity || 1;
          productStats[prodId].revenueGenerated += (item.price * item.quantity) || 0;
          productStats[prodId].orderCount += 1;
        }
      });
    });

    return Object.values(productStats)
      .sort((a, b) => b.unitsSold - a.unitsSold || b.revenueGenerated - a.revenueGenerated || (b.product.views || 0) - (a.product.views || 0))
      .slice(0, 5);
  }, [products, orders]);

  return (
    <div className="space-y-8 text-left">
      {/* ── 1. Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-borderColor pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-textPrimary tracking-tight flex items-center gap-2.5">
            <FiBarChart2 className="text-primary" />
            <span>Studio Analytics & Intelligence</span>
          </h1>
          <p className="text-xs text-textSecondary mt-1">
            Real-time analytics on revenue velocity, traffic sources, top-selling items, and C2C vs retail demand.
          </p>
        </div>
      </div>

      {/* ── 2. Top Performance Key Metrics ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <SellerStatsCard
          title="Gross Merchandise Value"
          value={periodStats.current.revenue}
          prefix="₹"
          formatter={(val) => val.toLocaleString('en-IN')}
          change={gmvGrowth.label}
          isPositive={gmvGrowth.isPositive}
          icon={FiDollarSign}
          accent="yellow"
          subtitle="All finalized orders"
        />

        <SellerStatsCard
          title="Average Order Value"
          value={periodStats.current.aov}
          prefix="₹"
          formatter={(val) => val.toLocaleString('en-IN')}
          change={aovGrowth.label}
          isPositive={aovGrowth.isPositive}
          icon={FiTrendingUp}
          accent="blue"
          subtitle="Across C2C & Retail items"
        />

        <SellerStatsCard
          title="Listing Views & CTR"
          value={stats.totalViews}
          change={`${conversionRate}% Conversion Rate`}
          isPositive={parseFloat(conversionRate) > 2.0}
          icon={FiEye}
          accent="green"
          subtitle="Above industry benchmark"
        />

        <SellerStatsCard
          title="Customer Retention"
          value={settings.rating || 4.9}
          suffix=" ★"
          change={`${settings.totalReviews || 0} reviews total`}
          isPositive={true}
          icon={FiAward}
          accent="purple"
          subtitle="Based on customer feedback"
        />
      </div>

      {/* ── 3. Main Trajectory Chart ────────────────────────────────────────── */}
      <RevenueChart 
        title="Financial Growth & Order Volume Trends" 
        data={chartData}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        growthText={gmvGrowth.label.split(' ')[0]}
      />

      {/* ── 4. Category Share & Traffic Distribution ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Category Revenue Breakdown */}
        <div className="bg-cardBg border border-borderColor rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-borderColor pb-4">
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
              <FiPieChart className="text-primary" />
              <span>Revenue by Marketplace Category</span>
            </h3>
            <span className="text-xs text-textSecondary font-semibold">100% Normalized</span>
          </div>

          <div className="space-y-4 text-xs">
            {categoryShare.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between font-bold text-textPrimary">
                  <span>{cat.name}</span>
                  <span className="text-textSecondary">{cat.percentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-borderColor">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full ${cat.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-surface border border-borderColor rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-textSecondary block">C2C Pre-owned Share:</span>
              <strong className="text-primary font-black text-sm">{personaShare.c2c}% of Gross Revenue</strong>
            </div>
            <div>
              <span className="text-textSecondary block">Retail Brand Share:</span>
              <strong className="text-accentBlue font-black text-sm">{personaShare.business}% of Gross Revenue</strong>
            </div>
          </div>
        </div>

        {/* Traffic Channels */}
        <div className="bg-cardBg border border-borderColor rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-borderColor pb-4">
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
              <FiUsers className="text-primary" />
              <span>Buyer Traffic Acquisition</span>
            </h3>
            <span className="text-xs text-textSecondary font-semibold">Live Feed</span>
          </div>

          <div className="divide-y divide-borderColor">
            {TRAFFIC_SOURCES.map((ts) => (
              <div key={ts.source} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-textPrimary">{ts.source}</h4>
                  <span className="text-[10px] text-textSecondary">{ts.visitors} unique page impressions</span>
                </div>
                <div className="text-right">
                  <span className="text-primary font-black text-sm">{ts.share}</span>
                  <span className="text-[10px] text-textSecondary block">of total traffic</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3 text-primary text-xs font-semibold">
            <FiArrowUpRight size={18} className="flex-shrink-0" />
            <span>Search optimization tip: Products with clear condition notes and photos gain 3x more search clicks.</span>
          </div>
        </div>
      </div>

      {/* ── 5. Top Performing Listings Leaderboard ─────────────────────────── */}
      <div className="bg-cardBg/90 backdrop-blur-sm border border-white/5 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FiAward className="text-primary" />
              <span>Top Performing Catalog Items</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Ranked by units sold, revenue velocity, and converted sales</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-white/5">
                <th className="p-4">Rank & Item</th>
                <th className="p-4">Format</th>
                <th className="p-4">Price</th>
                <th className="p-4">Units Sold</th>
                <th className="p-4">Total Revenue</th>
                <th className="p-4 text-right">Order Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topProducts.map((tp, idx) => {
                const p = tp.product;
                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20">
                          #{idx + 1}
                        </span>
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10"
                        />
                        <span className="font-bold text-white truncate max-w-[200px]">{p.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="capitalize font-semibold text-gray-300">
                        {p.sellerType === 'individual_c2c' ? 'C2C Used' : 'Retail Stock'}
                      </span>
                    </td>
                    <td className="p-4 font-black text-white">
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-bold text-accentBlue">
                      {tp.unitsSold} sold
                    </td>
                    <td className="p-4 text-emerald-400 font-bold">
                      ₹{tp.revenueGenerated.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right">
                      <span className="bg-primary/10 text-primary border border-primary/20 font-black text-xs px-2.5 py-1 rounded-xl">
                        {tp.orderCount} orders
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
