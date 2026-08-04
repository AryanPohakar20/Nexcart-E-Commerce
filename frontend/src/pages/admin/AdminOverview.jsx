import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers, FiShoppingBag, FiPackage, FiShoppingCart,
  FiDollarSign, FiCheckSquare, FiXCircle, FiAlertTriangle,
  FiArrowRight, FiActivity, FiZap, FiTrendingUp, FiBox
} from 'react-icons/fi';
import StatsCard from '../../components/admin/shared/StatsCard';
import DashboardChart, { ChartCard } from '../../components/admin/shared/DashboardChart';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import {
  PLATFORM_STATS, REVENUE_MONTHLY, USER_GROWTH_MONTHLY,
  ADMIN_USERS, ADMIN_ORDERS, ADMIN_SELLERS, ADMIN_PRODUCTS,
  RECENT_ACTIVITY, SYSTEM_ALERTS, ADMIN_VERIFICATIONS
} from '../../constants/adminDummyData';

const STATS_CARDS = [
  { label: 'Total Users', value: PLATFORM_STATS.totalUsers, icon: FiUsers, color: 'blue', trend: 12.4, trendLabel: '+2,840 this month', delay: 0 },
  { label: 'Total Sellers', value: PLATFORM_STATS.totalSellers, icon: FiShoppingBag, color: 'purple', trend: 8.7, trendLabel: '+124 this month', delay: 0.05 },
  { label: 'Products', value: PLATFORM_STATS.totalProducts, icon: FiPackage, color: 'yellow', trend: 5.2, trendLabel: '+1,240 this month', delay: 0.1 },
  { label: 'Orders', value: PLATFORM_STATS.totalOrders, icon: FiShoppingCart, color: 'green', trend: 15.6, trendLabel: '+4,120 this month', delay: 0.15 },
  { label: 'Revenue', value: PLATFORM_STATS.totalRevenue, icon: FiDollarSign, color: 'yellow', prefix: '₹', trend: 23.1, trendLabel: '+₹14.2L this month', delay: 0.2 },
  { label: 'Pending Verifications', value: PLATFORM_STATS.pendingVerifications, icon: FiCheckSquare, color: 'orange', trend: -5, trendLabel: '5 fewer than yesterday', delay: 0.25 },
  { label: 'Blocked Users', value: PLATFORM_STATS.blockedUsers, icon: FiXCircle, color: 'red', trend: 2.3, trendLabel: '+3 this week', delay: 0.3 },
  { label: 'Open Reports', value: PLATFORM_STATS.openReports, icon: FiAlertTriangle, color: 'red', trend: -12, trendLabel: '12 resolved today', delay: 0.35 },
];

const activityTypeIcon = {
  user: FiUsers,
  order: FiShoppingCart,
  verification: FiCheckSquare,
  product: FiPackage,
  seller: FiShoppingBag,
  category: FiBox,
};

const alertTypeConfig = {
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-500' },
  warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  info: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-500' },
  success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-500' },
};

const AdminOverview = () => {
  const navigate = useNavigate();
  const [chartRange, setChartRange] = useState('monthly');

  return (
    <div className="space-y-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Control Center</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time marketplace intelligence dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">Platform Operational</span>
          </div>
          <button
            onClick={() => navigate('/admin/analytics')}
            className="flex items-center gap-2 h-9 px-4 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_15px_rgba(255,193,7,0.3)]"
          >
            <FiTrendingUp size={14} />
            Analytics
          </button>
        </div>
      </motion.div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS_CARDS.map((card) => (
          <StatsCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart - 2 cols */}
        <div className="xl:col-span-2">
          <ChartCard
            title="Revenue Overview"
            subtitle="Monthly revenue trends (₹)"
            actions={
              <div className="flex bg-white/5 rounded-lg p-0.5">
                {['monthly', 'weekly'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setChartRange(r)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md capitalize transition-all
                      ${chartRange === r ? 'bg-yellow-500 text-black' : 'text-gray-500 hover:text-white'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            }
          >
            <DashboardChart
              data={REVENUE_MONTHLY}
              dataKey="revenue"
              color="#FFC107"
              type="area"
              height={220}
            />
          </ChartCard>
        </div>

        {/* User Growth - 1 col */}
        <div>
          <ChartCard title="User Growth" subtitle="New registrations per month">
            <DashboardChart
              data={USER_GROWTH_MONTHLY}
              dataKey="users"
              color="#00CFFF"
              type="bar"
              height={220}
              prefix=""
              formatK={false}
            />
          </ChartCard>
        </div>
      </div>

      {/* Second chart row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Orders Trend" subtitle="Monthly order volume">
          <DashboardChart
            data={REVENUE_MONTHLY}
            dataKey="orders"
            color="#A855F7"
            type="area"
            height={180}
            prefix=""
            formatK={false}
          />
        </ChartCard>
        <ChartCard title="Seller Growth" subtitle="New sellers per month">
          <DashboardChart
            data={USER_GROWTH_MONTHLY}
            dataKey="sellers"
            color="#10B981"
            type="bar"
            height={180}
            prefix=""
            formatK={false}
          />
        </ChartCard>
      </div>

      {/* Bottom section: Tables + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Users */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-bold text-white">Recent Users</h3>
            <button onClick={() => navigate('/admin/users')} className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
              View all <FiArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-white/3">
            {ADMIN_USERS.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-colors">
                <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{u.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                </div>
                <StatusBadge status={u.status} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-bold text-white">Latest Orders</h3>
            <button onClick={() => navigate('/admin/orders')} className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
              View all <FiArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-white/3">
            {ADMIN_ORDERS.map((o) => (
              <div key={o.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-colors">
                <div className="w-8 h-8 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiShoppingCart size={13} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{o.id}</p>
                  <p className="text-[10px] text-gray-500 truncate">{o.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">₹{o.total.toLocaleString('en-IN')}</p>
                  <StatusBadge status={o.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Activity + Alerts */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FiActivity size={14} className="text-yellow-400" />
                Recent Activity
              </h3>
            </div>
            <div className="divide-y divide-white/3 max-h-48 overflow-y-auto">
              {RECENT_ACTIVITY.map((a) => {
                const Icon = activityTypeIcon[a.type] || FiActivity;
                return (
                  <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                    <div className="w-6 h-6 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={11} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-white truncate">{a.event}</p>
                      <p className="text-[10px] text-gray-500 truncate">{a.detail}</p>
                    </div>
                    <span className="text-[9px] text-gray-600 whitespace-nowrap">{a.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FiAlertTriangle size={14} className="text-red-400" />
                System Alerts
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {SYSTEM_ALERTS.map((alert) => {
                const ac = alertTypeConfig[alert.type];
                return (
                  <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-xl border ${ac.bg} ${ac.border}`}>
                    <div className={`w-2 h-2 rounded-full ${ac.dot} flex-shrink-0 mt-1.5`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${ac.text}`}>{alert.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{alert.desc}</p>
                    </div>
                    <span className="text-[9px] text-gray-600 whitespace-nowrap">{alert.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Verifications + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-bold text-white">Pending Verifications</h3>
            <button onClick={() => navigate('/admin/verification')} className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
              Manage <FiArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-white/3">
            {ADMIN_VERIFICATIONS.filter(v => v.status === 'pending').map((v) => (
              <div key={v.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-colors">
                <img src={v.logo} alt={v.seller} className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{v.seller}</p>
                  <p className="text-[10px] text-gray-500">{v.documentType}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={v.status} size="sm" />
                  <button
                    onClick={() => navigate('/admin/verification')}
                    className="text-[10px] font-bold text-yellow-400 hover:text-yellow-300 px-2.5 py-1 bg-yellow-500/10 rounded-lg"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <FiZap size={14} className="text-yellow-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Manage Users', desc: 'View & manage all accounts', path: '/admin/users', icon: FiUsers, color: 'blue' },
              { label: 'Verify Sellers', desc: 'Review pending documents', path: '/admin/verification', icon: FiCheckSquare, color: 'orange' },
              { label: 'View Reports', desc: 'Revenue & sales data', path: '/admin/reports', icon: FiAlertTriangle, color: 'purple' },
              { label: 'Platform Settings', desc: 'Configure marketplace', path: '/admin/settings', icon: FiZap, color: 'yellow' },
              { label: 'Analytics', desc: 'Deep dive into data', path: '/admin/analytics', icon: FiTrendingUp, color: 'green' },
              { label: 'Import CSV', desc: 'Bulk data import tool', path: '/admin/csv-import', icon: FiBox, color: 'blue' },
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-start p-4 bg-white/3 border border-white/5 hover:border-yellow-500/20 hover:bg-white/6 rounded-xl transition-all text-left group"
              >
                <action.icon size={18} className="text-yellow-400 mb-2" />
                <p className="text-xs font-bold text-white">{action.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
