import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import logoImg from '../assets/logo.jpg';

const NexCartLogo = ({ size = 'md', animated = true, showText = true, className = '' }) => {
  const context = useContext(AppContext);
  const theme = context?.theme || 'dark';

  const sizeMap = {
    sm: { height: 'h-8 sm:h-9', font: 'text-base sm:text-lg', gap: 'gap-2' },
    md: { height: 'h-10 sm:h-11', font: 'text-xl sm:text-2xl', gap: 'gap-2.5' },
    lg: { height: 'h-12 sm:h-13', font: 'text-2xl sm:text-3xl', gap: 'gap-3' },
    xl: { height: 'h-14 sm:h-15', font: 'text-3xl sm:text-4xl', gap: 'gap-3.5' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center justify-start flex-shrink-0 ${currentSize.gap} ${className} transition-all duration-300`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0.8, scale: 0.98 }}
          animate={{ 
            opacity: 1, 
            scale: [1, 1.03, 1],
            boxShadow: theme === 'dark' 
              ? ['0 0 15px rgba(255,193,7,0.2)', '0 0 25px rgba(255,193,7,0.45)', '0 0 15px rgba(255,193,7,0.2)']
              : ['0 4px 10px rgba(0,0,0,0.05)', '0 6px 15px rgba(0,0,0,0.1)', '0 4px 10px rgba(0,0,0,0.05)']
          }}
          exit={{ opacity: 0.8, scale: 0.98 }}
          transition={{ 
            duration: 3.5, 
            repeat: Infinity, 
            repeatType: 'reverse', 
            ease: 'easeInOut' 
          }}
          className={`flex items-center justify-center ${currentSize.height} flex-shrink-0 py-0.5 relative group rounded-xl`}
        >
          {/* Subtle Ambient Glow for Dark Theme */}
          {theme === 'dark' && (
            <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse-glow" />
          )}

          <img
            src={logoImg}
            alt="NexCart Logo"
            className={`${currentSize.height} w-auto object-contain flex-shrink-0 rounded-xl shadow-md border ${
              theme === 'dark'
                ? 'border-amber-500/30 bg-[#0a0f1d] p-1'
                : 'border-gray-200 bg-white p-1'
            } transition-all duration-300`}
          />
        </motion.div>
      </AnimatePresence>

      {showText && (
        <span className="font-extrabold tracking-tight text-xl sm:text-2xl leading-none transition-colors flex-shrink-0 whitespace-nowrap flex items-center">
          <span className="text-primary">Nex</span>
          <span className="text-gray-900 dark:text-white">Cart</span>
        </span>
      )}
    </div>
  );
};

export default NexCartLogo;
