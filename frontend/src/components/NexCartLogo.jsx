import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import logoImg from '../assets/logo.jpg';

const NexCartLogo = ({ size = 'md', animated = true, showText = true, className = '' }) => {
  const context = useContext(AppContext);
  const theme = context?.theme || 'dark';

  const sizeMap = {
    sm: { height: 'h-9', font: 'text-lg', gap: 'gap-2' },
    md: { height: 'h-12', font: 'text-2xl', gap: 'gap-3' },
    lg: { height: 'h-14', font: 'text-3xl', gap: 'gap-3.5' },
    xl: { height: 'h-16', font: 'text-4xl', gap: 'gap-4' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center justify-center ${currentSize.gap} ${className} transition-all duration-300`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0.8, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.8, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className={`flex items-center justify-center ${currentSize.height} py-0.5 relative group`}
        >
          {/* Subtle Ambient Glow for Dark Theme */}
          {theme === 'dark' && (
            <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-xl opacity-60 group-hover:opacity-100 transition-opacity" />
          )}

          <img
            src={logoImg}
            alt="NexCart Logo"
            className={`${currentSize.height} w-auto object-contain rounded-xl shadow-md border ${
              theme === 'dark'
                ? 'border-amber-500/30 bg-[#0a0f1d] p-1 shadow-[0_0_15px_rgba(255,193,7,0.25)]'
                : 'border-gray-200 bg-white p-1'
            } transition-all duration-300`}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default NexCartLogo;
