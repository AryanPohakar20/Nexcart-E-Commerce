import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiBarChart2, FiTrendingUp, FiDollarSign, FiShoppingBag,
  FiUsers, FiCalendar, FiDownload, FiStar
} from 'react-icons/fi';
import DashboardChart, { ChartCard } from '../../components/admin/shared/DashboardChart';
import StatsCard from '../../components/admin/shared/StatsCard';
import {
  REVENUE_MONTHLY, USER_GROWTH_MONTHLY, ADMIN_PRODUCTS,
  ADMIN_SELLERS
} from '../../constants/adminDummyData';

const RANGES = ['7 Days', '30 Days', '90 Days', '12 Months'];

const AdminAnalytics = () => {
  const [activeRange, setActiveRange] = useState('12 Months');

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
          <button className="flex items-center gap-2 h-9 px-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 rounded-xl">
            <FiDownload size={13} />
            Export BI Report
          </button>
        </div>
      </motion.div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Gross Merchandise Value"
          value="₹84,20,000"
          icon={FiDollarSign}
          color="yellow"
          trend={18.4}
          trendLabel="+18.4% vs last period"
        />
        <StatsCard
          label="Platform Commission (10%)"
          value="₹8,42,000"
          icon={FiDollarSign}
          color="blue"
          trend={22.1}
          trendLabel="+22.1% net profit"
        />
        <StatsCard
          label="Average Order Value"
          value="₹3,480"
          icon={FiShoppingBag}
          color="purple"
          trend={6.5}
          trendLabel="₹210 growth per cart"
        />
        <StatsCard
          label="Merchant Repeat Rate"
          value="87.4%"
          icon={FiTrendingUp}
          color="green"
          trend={4.2}
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
            data={REVENUE_MONTHLY}
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
            data={REVENUE_MONTHLY}
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
            data={USER_GROWTH_MONTHLY}
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
            data={USER_GROWTH_MONTHLY}
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
            {ADMIN_SELLERS.slice(0, 4).map((s, idx) => (
              <div key={s.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-500 text-xs w-4">#{idx + 1}</span>
                  <img src={s.logo} alt={s.businessName} className="w-8 h-8 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold text-white text-xs">{s.businessName}</p>
                    <p className="text-[10px] text-gray-500">{s.totalOrders} orders completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-400 text-xs">₹{(s.totalRevenue / 100000).toFixed(1)}L</p>
                  <span className="text-[10px] text-gray-500">Gross Sales</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4">Bestselling Products</h3>
          <div className="divide-y divide-white/5">
            {ADMIN_PRODUCTS.slice(0, 4).map((p, idx) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-500 text-xs w-4">#{idx + 1}</span>
                  <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold text-white text-xs max-w-[180px] truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-500">{p.category} • {p.seller}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white text-xs">₹{p.price.toLocaleString('en-IN')}</p>
                  <div className="flex items-center gap-1 justify-end text-yellow-400 text-[10px] font-bold">
                    <FiStar size={10} className="fill-yellow-400" />
                    <span>{p.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
