import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useContext(AppContext);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center w-16 h-8 rounded-full p-1 transition-all duration-400 select-none group focus:outline-none focus:ring-2 focus:ring-primary/50 ${
        isDark
          ? 'bg-black/60 border border-white/15 shadow-[0_0_15px_rgba(255,193,7,0.25)] hover:shadow-[0_0_20px_rgba(0,200,255,0.4)]'
          : 'bg-gray-200/90 border border-gray-300 shadow-[0_2px_10px_rgba(0,0,0,0.08)] hover:border-primary/50'
      } ${className}`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      {/* Background Icons (Sun & Moon) */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-xs pointer-events-none">
        {/* Sun Icon (Light Mode indicator) */}
        <FiSun
          className={`text-amber-500 transition-all duration-300 ${
            !isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-40 scale-75 -rotate-45'
          }`}
        />
        {/* Moon Icon (Dark Mode indicator) */}
        <FiMoon
          className={`text-primary transition-all duration-300 ${
            isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-40 scale-75 rotate-45'
          }`}
        />
      </div>

      {/* Animated Sliding Circular Thumb */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md relative z-10 ${
          isDark
            ? 'bg-gradient-to-r from-primary to-amber-400 text-black translate-x-8 shadow-yellow-glow'
            : 'bg-white text-amber-500 translate-x-0 border border-gray-200'
        }`}
      >
        {isDark ? (
          <FiMoon className="text-xs font-bold" />
        ) : (
          <FiSun className="text-xs font-bold animate-spin" style={{ animationDuration: '12s' }} />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
