import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CountUp = ({ to, duration = 1.2, prefix = '', suffix = '', formatter }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(to) || 0;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMilliseconds = duration * 1000;
    const intervalTime = 25;
    const totalSteps = Math.max(1, Math.round(totalMilliseconds / intervalTime));
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

  const formatted = formatter ? formatter(count) : count.toLocaleString('en-IN');
  return <span>{prefix}{formatted}{suffix}</span>;
};

const SellerStatsCard = ({
  title,
  value,
  prefix = '',
  suffix = '',
  formatter,
  change,
  isPositive = true,
  icon: Icon,
  accent = 'yellow', // 'yellow', 'green', 'blue', 'purple', 'amber'
  subtitle,
}) => {
  const accentColors = {
    yellow: {
      border: 'hover:border-primary/40',
      bg: 'bg-primary/10',
      text: 'text-primary',
      glow: 'group-hover:shadow-[0_0_20px_rgba(255,193,7,0.15)]',
    },
    green: {
      border: 'hover:border-emerald-500/40',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    blue: {
      border: 'hover:border-accentBlue/40',
      bg: 'bg-accentBlue/10',
      text: 'text-accentBlue',
      glow: 'group-hover:shadow-[0_0_20px_rgba(0,207,255,0.15)]',
    },
    purple: {
      border: 'hover:border-purple-500/40',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
  };

  const style = accentColors[accent] || accentColors.yellow;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        group relative bg-cardBg/90 backdrop-blur-sm border border-white/5 
        ${style.border} ${style.glow}
        p-5 md:p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            {title}
          </span>
          <div className="text-2xl md:text-3xl font-black text-white mt-1.5 tracking-tight flex items-baseline">
            <CountUp to={value} prefix={prefix} suffix={suffix} formatter={formatter} />
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-2xl ${style.bg} ${style.text} border border-white/5 transition-transform duration-300 group-hover:scale-110`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        {change !== undefined && (
          <span className={`font-bold flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            <span>{isPositive ? '↑' : '↓'} {change}</span>
          </span>
        )}
        {subtitle && (
          <span className="text-gray-400 text-[11px] font-medium truncate">
            {subtitle}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default SellerStatsCard;
