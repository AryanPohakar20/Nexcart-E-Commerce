import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { SellerContext } from '../../context/SellerContext';
import SellerStatsCard from '../../components/seller/SellerStatsCard';
import { 
  FiBarChart2, FiDollarSign, FiShoppingBag, FiEye, 
  FiTrendingUp, FiPieChart, FiUsers, FiAward, FiArrowUpRight,
  FiXCircle, FiCheckCircle
} from 'react-icons/fi';

const SellerAnalytics = () => {
  const { stats, settings, c2cEarnings, c2cEarningsLoading, fetchC2CEarnings } = useContext(SellerContext);

  if (c2cEarningsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 text-left">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-textSecondary">Calculating studio C2C intelligence metrics...</p>
      </div>
    );
  }

  if (!c2cEarnings || c2cEarnings.sales?.length === 0) {
    return (
      <div className="bg-cardBg border border-borderColor rounded-3xl p-12 text-center space-y-4 text-left">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary mx-auto flex items-center justify-center border border-primary/20">
          <FiBarChart2 size={32} />
        </div>
        <h3 className="text-base font-bold text-textPrimary">No C2C Sales Yet</h3>
        <p className="text-xs text-textSecondary max-w-sm mx-auto">
          No sales data yet. Your analytics will appear here once you mark C2C listings as sold.
        </p>
      </div>
    );
  }

  const { earnings, sales } = c2cEarnings;

  return (
    <div className="space-y-8 text-left">
      {/* ── 1. Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-borderColor pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-textPrimary tracking-tight flex items-center gap-2.5">
            <FiBarChart2 className="text-primary" />
            <span>C2C Intelligence & Sales</span>
          </h1>
          <p className="text-xs text-textSecondary mt-1">
            Real-time analytics on your peer-to-peer used listings revenue and profit.
          </p>
        </div>
      </div>

      {/* ── 2. Top Performance Key Metrics ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <SellerStatsCard
          title="Total Revenue"
          value={earnings.totalRevenue}
          prefix="₹"
          formatter={(val) => val.toLocaleString('en-IN')}
          change="Gross Sales"
          isPositive={true}
          icon={FiDollarSign}
          accent="yellow"
          subtitle="All C2C sales"
        />

        <SellerStatsCard
          title="Total Profit"
          value={earnings.totalProfit}
          prefix="₹"
          formatter={(val) => val.toLocaleString('en-IN')}
          change="Net earnings"
          isPositive={earnings.totalProfit >= 0}
          icon={FiTrendingUp}
          accent="green"
          subtitle="Revenue minus Cost"
        />

        <SellerStatsCard
          title="Total Cost"
          value={earnings.totalCost}
          prefix="₹"
          formatter={(val) => val.toLocaleString('en-IN')}
          change="Acquisition Cost"
          isPositive={false}
          icon={FiPieChart}
          accent="blue"
          subtitle="Total spent on items"
        />

        <SellerStatsCard
          title="Items Sold"
          value={earnings.itemsSold}
          change="Total items"
          isPositive={true}
          icon={FiShoppingBag}
          accent="purple"
          subtitle="Successfully sold listings"
        />
      </div>

      {/* ── 3. C2C Sales History Leaderboard ─────────────────────────── */}
      <div className="bg-cardBg/90 backdrop-blur-sm border border-borderColor rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-borderColor pb-4">
          <div>
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
              <FiCheckCircle className="text-primary" />
              <span>C2C Sales History</span>
            </h3>
            <p className="text-xs text-textSecondary mt-0.5">Log of all your sold marketplace listings</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-surface text-textSecondary font-extrabold uppercase text-[10px] tracking-wider border-b border-borderColor">
                <th className="p-4">Item Details</th>
                <th className="p-4">Sold Date</th>
                <th className="p-4">Final Sale Price</th>
                <th className="p-4">Cost Price</th>
                <th className="p-4 text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderColor">
              {sales.map((p) => {
                const soldDate = p.soldAt ? new Date(p.soldAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                }) : 'Unknown';
                
                return (
                  <tr key={p.id} className="hover:bg-surface transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || p.images?.[0]?.url || 'https://via.placeholder.com/40'}
                          alt={p.title}
                          className="w-10 h-10 rounded-xl object-cover border border-borderColor"
                        />
                        <span className="font-bold text-textPrimary truncate max-w-[200px]">{p.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-textSecondary font-medium">
                      {soldDate}
                    </td>
                    <td className="p-4 font-black text-textPrimary">
                      ₹{(p.finalSalePrice || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-bold text-textSecondary">
                      ₹{(p.costPrice || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-black text-xs px-2.5 py-1 rounded-xl ${
                        (p.profit || 0) >= 0 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        ₹{(p.profit || 0).toLocaleString('en-IN')}
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
