import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useContext(AppContext);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center w-14 h-7 rounded-full p-0.5 transition-all duration-300 select-none group focus:outline-none focus:ring-2 focus:ring-primary/50 flex-shrink-0 ${
        isDark
          ? 'bg-[#0f172a] border border-amber-500/30 shadow-[0_0_12px_rgba(255,193,7,0.15)] hover:border-amber-400/60'
          : 'bg-slate-200 border border-slate-300 shadow-inner hover:border-amber-500/40'
      } ${className}`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      {/* Background Track Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5 text-[11px] pointer-events-none">
        <FiSun className={`text-amber-500 transition-opacity duration-200 ${!isDark ? 'opacity-0' : 'opacity-40'}`} />
        <FiMoon className={`text-primary transition-opacity duration-200 ${isDark ? 'opacity-0' : 'opacity-40'}`} />
      </div>

      {/* Animated Sliding Circular Thumb */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md relative z-10 ${
          isDark
            ? 'bg-gradient-to-r from-primary to-amber-400 text-slate-950 translate-x-7 shadow-amber-500/30'
            : 'bg-white text-amber-500 translate-x-0 border border-slate-200'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? 'dark' : 'light'}
            initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center w-full h-full"
          >
            {isDark ? (
              <FiMoon className="text-xs font-bold" />
            ) : (
              <FiSun className="text-xs font-bold animate-spin-slow" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
