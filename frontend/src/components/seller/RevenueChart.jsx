import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';

const DATA_7D = [
  { label: 'Mon', revenue: 14200, orders: 3 },
  { label: 'Tue', revenue: 28500, orders: 6 },
  { label: 'Wed', revenue: 19800, orders: 4 },
  { label: 'Thu', revenue: 42000, orders: 9 },
  { label: 'Fri', revenue: 51200, orders: 12 },
  { label: 'Sat', revenue: 68900, orders: 15 },
  { label: 'Sun', revenue: 58400, orders: 11 },
];

const DATA_30D = [
  { label: 'Week 1', revenue: 124000, orders: 28 },
  { label: 'Week 2', revenue: 168500, orders: 36 },
  { label: 'Week 3', revenue: 195000, orders: 42 },
  { label: 'Week 4', revenue: 242000, orders: 54 },
];

const DATA_12M = [
  { label: 'Jan', revenue: 120000, orders: 25 },
  { label: 'Feb', revenue: 150000, orders: 32 },
  { label: 'Mar', revenue: 180000, orders: 38 },
  { label: 'Apr', revenue: 240000, orders: 49 },
  { label: 'May', revenue: 310000, orders: 62 },
  { label: 'Jun', revenue: 420000, orders: 84 },
  { label: 'Jul', revenue: 489000, orders: 98 },
  { label: 'Aug', revenue: 530000, orders: 110 },
  { label: 'Sep', revenue: 460000, orders: 92 },
  { label: 'Oct', revenue: 590000, orders: 125 },
  { label: 'Nov', revenue: 670000, orders: 140 },
  { label: 'Dec', revenue: 780000, orders: 165 },
];

const RevenueChart = ({ title = 'Studio Revenue Trends', initialTimeframe = '7D', className = '' }) => {
  const { formatCurrency } = useContext(AppContext);
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const data = timeframe === '7D' ? DATA_7D : timeframe === '30D' ? DATA_30D : DATA_12M;
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000);
  const totalPeriodRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalPeriodOrders = data.reduce((acc, curr) => acc + curr.orders, 0);

  return (
    <div className={`bg-cardBg border border-borderColor p-6 rounded-3xl space-y-6 ${className}`}>
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FiTrendingUp size={16} />
            </span>
            <h3 className="text-base font-bold text-textPrimary tracking-tight">{title}</h3>
          </div>
          <p className="text-xs text-textSecondary mt-1">
            Total for period: <span className="text-primary font-bold">{formatCurrency(totalPeriodRevenue)}</span> across {totalPeriodOrders} orders
          </p>
        </div>

        {/* Timeframe Switcher */}
        <div className="flex items-center bg-surface border border-borderColor p-1 rounded-xl self-start sm:self-auto text-xs">
          {[
            { key: '7D', label: 'Last 7 Days' },
            { key: '30D', label: 'Last 30 Days' },
            { key: '12M', label: '12 Months' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTimeframe(t.key)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeframe === t.key
                  ? 'bg-primary text-black shadow-yellow-glow'
                  : 'text-textSecondary hover:text-textPrimary hover:bg-surface'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Bar & Curve Chart Visualizer */}
      <div className="relative h-64 sm:h-72 pt-8 pb-4 flex items-end justify-between gap-2 sm:gap-4 border-b border-borderColor">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-borderColor border-dashed w-full" />
          <div className="border-b border-borderColor border-dashed w-full" />
          <div className="border-b border-borderColor border-dashed w-full" />
          <div className="border-b border-borderColor border-dashed w-full" />
        </div>

        {data.map((item, index) => {
          const heightPercent = (item.revenue / maxRevenue) * 100;
          const isHovered = hoveredPoint?.label === item.label;

          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredPoint(item)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
            >
              {/* Tooltip */}
              <div
                className={`
                  absolute -top-12 z-20 bg-secondaryBg border border-borderColor text-textPrimary text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-card-hover whitespace-nowrap pointer-events-none transition-all duration-200
                  ${isHovered ? 'opacity-100 scale-100 -translate-y-1' : 'opacity-0 scale-95 pointer-events-none'}
                `}
              >
                <div className="text-primary">{formatCurrency(item.revenue)}</div>
                <div className="text-[9px] text-textSecondary font-medium">{item.orders} orders</div>
              </div>

              {/* Bar Fill with Motion */}
              <div className="w-full max-w-[48px] bg-surface rounded-t-xl overflow-hidden relative flex items-end h-full">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className={`
                    w-full rounded-t-xl transition-all duration-200
                    ${isHovered 
                      ? 'bg-gradient-to-t from-primary to-yellow-300 shadow-[0_0_20px_rgba(255,193,7,0.5)]' 
                      : 'bg-gradient-to-t from-primary/30 to-primary/80 group-hover:from-primary/50 group-hover:to-primary'}
                  `}
                />
              </div>

              {/* Label */}
              <span className="text-[11px] font-semibold text-textSecondary mt-2 truncate w-full text-center group-hover:text-textPrimary transition-colors">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="bg-surface border border-borderColor p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-textSecondary tracking-wider block">Peak Period</span>
          <span className="text-sm font-black text-textPrimary mt-0.5 block">
            {formatCurrency(maxRevenue)}
          </span>
        </div>
        <div className="bg-surface border border-borderColor p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-textSecondary tracking-wider block">Avg per Entry</span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {formatCurrency(Math.round(totalPeriodRevenue / data.length))}
          </span>
        </div>
        <div className="bg-surface border border-borderColor p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-textSecondary tracking-wider block">Total Volume</span>
          <span className="text-sm font-black text-blue-600 dark:text-accentBlue mt-0.5 block">
            {totalPeriodOrders} Units
          </span>
        </div>
        <div className="bg-surface border border-borderColor p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-textSecondary tracking-wider block">Growth Velocity</span>
          <span className="text-sm font-black text-primary mt-0.5 block">
            +24.6% YoY
          </span>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
