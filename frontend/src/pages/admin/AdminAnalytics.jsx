import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiBarChart2, FiTrendingUp, FiDollarSign, FiShoppingBag,
  FiUsers, FiCalendar, FiDownload, FiStar, FiLoader
} from 'react-icons/fi';
import DashboardChart, { ChartCard } from '../../components/admin/shared/DashboardChart';
import StatsCard from '../../components/admin/shared/StatsCard';
import adminService from '../../services/adminService';
import { AppContext } from '../../context/AppContext';

const RANGES = ['7 Days', '30 Days', '90 Days', '12 Months'];

const AdminAnalytics = () => {
  const { formatCurrency } = React.useContext(AppContext);
  const [activeRange, setActiveRange] = useState('12 Months');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await adminService.getMarketplaceAnalytics(activeRange);
        if (res && res.data) {
          setAnalyticsData(res.data);
        }
      } catch (err) {
        console.error('Failed to load marketplace analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [activeRange]);

  const handleExport = async () => {
    try {
      setExporting(true);
      await adminService.exportData('orders', 'xlsx');
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const kpi = analyticsData?.kpi || {
    gmvFormatted: '₹84,20,000',
    platformCommissionFormatted: '₹8,42,000',
    commissionRate: 10,
    averageOrderValueFormatted: '₹3,480',
    merchantRepeatRate: '87.4%',
    trends: { gmvTrend: 18.4, commissionTrend: 22.1, aovTrend: 6.5, repeatTrend: 4.2 },
  };

  const charts = analyticsData?.charts || {
    revenueMonthly: [],
    userGrowthMonthly: [],
  };

  const topSellers = analyticsData?.leaderboards?.topSellers || [];
  const bestProducts = analyticsData?.leaderboards?.bestProducts || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Marketplace Analytics & BI</h1>
          <p className="text-sm text-gray-500 mt-1">
            Executive revenue analytics, GMV trends, merchant performance metrics, and transaction volume
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 border border-white/5 rounded-xl p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setActiveRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeRange === r
                    ? 'bg-yellow-500 text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 h-9 px-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 rounded-xl transition-all cursor-pointer"
          >
            {exporting ? <FiLoader className="animate-spin" size={13} /> : <FiDownload size={13} />}
            {exporting ? 'Generating...' : 'Export BI Report'}
          </button>
        </div>
      </motion.div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Gross Merchandise Value"
          value={kpi.gmvFormatted}
          icon={FiDollarSign}
          color="yellow"
          trend={kpi.trends?.gmvTrend || 18.4}
          trendLabel={`+${kpi.trends?.gmvTrend || 18.4}% vs last period`}
        />
        <StatsCard
          label={`Platform Commission (${kpi.commissionRate || 10}%)`}
          value={kpi.platformCommissionFormatted}
          icon={FiDollarSign}
          color="blue"
          trend={kpi.trends?.commissionTrend || 22.1}
          trendLabel={`+${kpi.trends?.commissionTrend || 22.1}% net profit`}
        />
        <StatsCard
          label="Average Order Value"
          value={kpi.averageOrderValueFormatted}
          icon={FiShoppingBag}
          color="purple"
          trend={kpi.trends?.aovTrend || 6.5}
          trendLabel={`+${kpi.trends?.aovTrend || 6.5}% per cart`}
        />
        <StatsCard
          label="Merchant Repeat Rate"
          value={kpi.merchantRepeatRate}
          icon={FiTrendingUp}
          color="green"
          trend={kpi.trends?.repeatTrend || 4.2}
          trendLabel="High merchant retention"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard
          title="Marketplace Revenue Velocity"
          subtitle="Monthly GMV growth across all seller categories (₹)"
        >
          <DashboardChart
            data={charts.revenueMonthly}
            dataKey="revenue"
            color="#FFC107"
            type="area"
            height={260}
          />
        </ChartCard>

        <ChartCard
          title="Monthly Completed Orders"
          subtitle="Order fulfillment volume over time"
        >
          <DashboardChart
            data={charts.revenueMonthly}
            dataKey="orders"
            color="#00CFFF"
            type="bar"
            height={260}
            prefix=""
            formatK={false}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard
          title="Customer Registrations vs Merchant Onboarding"
          subtitle="Platform expansion rate"
        >
          <DashboardChart
            data={charts.userGrowthMonthly}
            dataKey="users"
            color="#A855F7"
            type="area"
            height={220}
            prefix=""
            formatK={false}
          />
        </ChartCard>

        <ChartCard
          title="Active Sellers Trajectory"
          subtitle="Total verified storefronts joining NexCart"
        >
          <DashboardChart
            data={charts.userGrowthMonthly}
            dataKey="sellers"
            color="#10B981"
            type="bar"
            height={220}
            prefix=""
            formatK={false}
          />
        </ChartCard>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Merchants */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4">Top Performing Merchants</h3>
          <div className="divide-y divide-white/5">
            {topSellers.length === 0 ? (
              <p className="text-xs text-gray-500 py-4">No merchant activity recorded yet.</p>
            ) : (
              topSellers.map((s, idx) => (
                <div key={s.id || idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-500 text-xs w-4">#{idx + 1}</span>
                    <img src={s.logo} alt={s.businessName} className="w-8 h-8 rounded-lg object-cover bg-white/5" />
                    <div>
                      <p className="font-bold text-white text-xs">{s.businessName}</p>
                      <p className="text-[10px] text-gray-500">{s.totalOrders || 0} orders completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-400 text-xs">₹{((s.totalRevenue || 0) / 100000).toFixed(1)}L</p>
                    <span className="text-[10px] text-gray-500">Gross Sales</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4">Bestselling Products</h3>
          <div className="divide-y divide-white/5">
            {bestProducts.length === 0 ? (
              <p className="text-xs text-gray-500 py-4">No products recorded yet.</p>
            ) : (
              bestProducts.map((p, idx) => (
                <div key={p.id || idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-500 text-xs w-4">#{idx + 1}</span>
                    <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover bg-white/5" />
                    <div>
                      <p className="font-bold text-white text-xs max-w-[180px] truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-500">{p.category} • {p.seller}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-xs">{formatCurrency(p.price || 0)}</p>
                    <div className="flex items-center gap-1 justify-end text-yellow-400 text-[10px] font-bold">
                      <FiStar size={10} className="fill-yellow-400" />
                      <span>{p.rating}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
