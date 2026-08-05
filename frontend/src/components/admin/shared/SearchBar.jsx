import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar = ({ 
  placeholder = 'Search...', 
  value, 
  onChange, 
  onClear,
  className = ''
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={{ width: focused ? '280px' : '220px' }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <FiSearch
          size={15}
          className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focused ? 'text-yellow-400' : 'text-gray-500'}`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={`
            w-full h-9 pl-9 pr-8 bg-white/5 border rounded-xl text-sm text-white 
            placeholder:text-gray-500 outline-none transition-all
            ${focused
              ? 'border-yellow-500/50 bg-white/8 shadow-[0_0_0_3px_rgba(255,193,7,0.1)]'
              : 'border-white/8 hover:border-white/15'
            }
          `}
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={onClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <FiX size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SearchBar;
