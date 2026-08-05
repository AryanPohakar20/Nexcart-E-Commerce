import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({
  icon: Icon,
  title = 'Nothing here yet',
  description = 'No data to display.',
  action,
  actionLabel,
  size = 'md',
}) => {
  const sizeMap = {
    sm: { iconSize: 32, iconBox: 'w-14 h-14', titleClass: 'text-sm', descClass: 'text-xs', py: 'py-8' },
    md: { iconSize: 40, iconBox: 'w-20 h-20', titleClass: 'text-base', descClass: 'text-sm', py: 'py-16' },
    lg: { iconSize: 48, iconBox: 'w-24 h-24', titleClass: 'text-lg', descClass: 'text-sm', py: 'py-24' },
  };
  const s = sizeMap[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center ${s.py} text-center`}
    >
      {Icon && (
        <div className={`${s.iconBox} bg-white/3 border border-white/5 rounded-2xl flex items-center justify-center mb-4`}>
          <Icon size={s.iconSize} className="text-gray-600" />
        </div>
      )}
      <h4 className={`${s.titleClass} font-bold text-white mb-1.5`}>{title}</h4>
      <p className={`${s.descClass} text-gray-500 max-w-xs`}>{description}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="mt-5 px-5 py-2.5 bg-yellow-500 text-black text-sm font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_15px_rgba(255,193,7,0.3)]"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
