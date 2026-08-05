import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { SellerContext } from '../../context/SellerContext';
import RevenueChart from '../../components/seller/RevenueChart';
import SellerStatsCard from '../../components/seller/SellerStatsCard';
import { 
  FiBarChart2, FiDollarSign, FiShoppingBag, FiEye, 
  FiTrendingUp, FiPieChart, FiUsers, FiAward, FiArrowUpRight 
} from 'react-icons/fi';

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
  const { stats, settings, products, orders } = useContext(SellerContext);
  const isBusiness = settings?.sellerType === 'business';

  const avgOrderValue = orders.length > 0 ? Math.round(stats.totalRevenue / orders.length) : 0;

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
          value={stats.totalRevenue}
          prefix="₹"
          formatter={(val) => val.toLocaleString('en-IN')}
          change="+24.8% YoY"
          isPositive={true}
          icon={FiDollarSign}
          accent="yellow"
          subtitle="All finalized orders"
        />

        <SellerStatsCard
          title="Average Order Value"
          value={avgOrderValue}
          prefix="₹"
          formatter={(val) => val.toLocaleString('en-IN')}
          change="+12.4% this week"
          isPositive={true}
          icon={FiTrendingUp}
          accent="blue"
          subtitle="Across C2C & Retail items"
        />

        <SellerStatsCard
          title="Listing Views & CTR"
          value={stats.totalViews}
          change="3.8% Conversion Rate"
          isPositive={true}
          icon={FiEye}
          accent="green"
          subtitle="Above industry benchmark"
        />

        <SellerStatsCard
          title="Customer Retention"
          value={94}
          suffix="%"
          change="4.9 ★ Rating Score"
          isPositive={true}
          icon={FiAward}
          accent="purple"
          subtitle="142 positive feedbacks"
        />
      </div>

      {/* ── 3. Main Trajectory Chart ────────────────────────────────────────── */}
      <RevenueChart title="Financial Growth & Order Volume Trends" />

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
            {CATEGORY_SHARE.map((cat) => (
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
              <strong className="text-primary font-black text-sm">60% of Gross Revenue</strong>
            </div>
            <div>
              <span className="text-textSecondary block">Retail Brand Share:</span>
              <strong className="text-accentBlue font-black text-sm">40% of Gross Revenue</strong>
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
            <p className="text-xs text-gray-400 mt-0.5">Ranked by impressions, demand velocity, and converted sales</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-white/5">
                <th className="p-4">Rank & Item</th>
                <th className="p-4">Format</th>
                <th className="p-4">Price</th>
                <th className="p-4">Total Impressions</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4 text-right">Performance Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.slice(0, 5).map((p, idx) => (
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
                    {p.views || 320} views
                  </td>
                  <td className="p-4">
                    <span className={p.stock <= 5 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="bg-primary/10 text-primary border border-primary/20 font-black text-xs px-2.5 py-1 rounded-xl">
                      {(98 - idx * 4)}% High
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
