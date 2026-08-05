import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const StatsCard = ({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  color = 'yellow',
  prefix = '',
  suffix = '',
  delay = 0,
}) => {
  const colorMap = {
    yellow: {
      iconBg: 'bg-yellow-500/15',
      iconColor: 'text-yellow-400',
      glow: 'hover:shadow-[0_0_25px_rgba(255,193,7,0.15)]',
      accent: 'from-yellow-500',
      border: 'hover:border-yellow-500/30',
    },
    blue: {
      iconBg: 'bg-cyan-500/15',
      iconColor: 'text-cyan-400',
      glow: 'hover:shadow-[0_0_25px_rgba(0,207,255,0.15)]',
      accent: 'from-cyan-500',
      border: 'hover:border-cyan-500/30',
    },
    green: {
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      glow: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]',
      accent: 'from-emerald-500',
      border: 'hover:border-emerald-500/30',
    },
    red: {
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-400',
      glow: 'hover:shadow-[0_0_25px_rgba(239,68,68,0.15)]',
      accent: 'from-red-500',
      border: 'hover:border-red-500/30',
    },
    purple: {
      iconBg: 'bg-purple-500/15',
      iconColor: 'text-purple-400',
      glow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]',
      accent: 'from-purple-500',
      border: 'hover:border-purple-500/30',
    },
    orange: {
      iconBg: 'bg-orange-500/15',
      iconColor: 'text-orange-400',
      glow: 'hover:shadow-[0_0_25px_rgba(249,115,22,0.15)]',
      accent: 'from-orange-500',
      border: 'hover:border-orange-500/30',
    },
  };

  const c = colorMap[color] || colorMap.yellow;
  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const trendAbs = Math.abs(trend);

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
      if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
      return val.toLocaleString('en-IN');
    }
    return val;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`
        relative overflow-hidden bg-[#1A1A1A] border border-white/5 rounded-2xl p-5
        transition-all duration-300 cursor-default group
        ${c.glow} ${c.border}
      `}
    >
      {/* Accent gradient line at top */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${c.accent} to-transparent opacity-60 group-hover:opacity-100 transition-opacity`} />

      {/* Background glow blob */}
      <div className={`absolute -top-8 -right-8 w-28 h-28 ${c.iconBg} rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity`} />

      <div className="relative z-10">
        {/* Icon + Label row */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 ${c.iconBg} rounded-xl flex items-center justify-center`}>
            {Icon && <Icon size={20} className={c.iconColor} />}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full
              ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : isNegative ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400'}`}>
              {isPositive ? <FiTrendingUp size={11} /> : isNegative ? <FiTrendingDown size={11} /> : <FiMinus size={11} />}
              {trendAbs}%
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-1">
          <span className="text-2xl font-black text-white tracking-tight">
            {prefix}{formatValue(value)}{suffix}
          </span>
        </div>

        {/* Label */}
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</p>

        {/* Trend label */}
        {trendLabel && (
          <p className={`text-[11px] mt-2 font-medium
            ${isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-gray-500'}`}>
            {trendLabel}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
