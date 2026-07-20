import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import logoImg from '../assets/logo.jpg';

const NexCartLogo = ({ size = 'md', animated = true, showText = true, className = '' }) => {
  const context = useContext(AppContext);
  const theme = context?.theme || 'dark';

  const sizeMap = {
    sm: { icon: 32, height: 'h-8', font: 'text-lg', gap: 'gap-2' },
    md: { icon: 44, height: 'h-11', font: 'text-2xl', gap: 'gap-3' },
    lg: { icon: 56, height: 'h-14', font: 'text-3xl', gap: 'gap-3.5' },
    xl: { icon: 72, height: 'h-18', font: 'text-4xl', gap: 'gap-4' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center justify-center ${currentSize.gap} ${className} transition-all duration-400`}>
      <AnimatePresence mode="wait">
        {theme === 'light' ? (
          /* Light Theme Logo Image */
          <motion.div
            key="light-logo"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className={`flex items-center justify-center ${currentSize.height} py-0.5`}
          >
            <img
              src={logoImg}
              alt="NexCart Logo"
              className={`${currentSize.height} w-auto object-contain rounded-xl shadow-sm border border-gray-200/80 bg-white p-1`}
            />
          </motion.div>
        ) : (
          /* Dark Theme Futuristic Emblem + Brand Text */
          <motion.div
            key="dark-logo"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className={`inline-flex items-center ${currentSize.gap}`}
          >
            {/* Futuristic Emblem */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accentBlue to-primary opacity-40 blur-lg rounded-full animate-pulse" />

              <motion.svg
                width={currentSize.icon}
                height={currentSize.icon}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 filter drop-shadow-[0_0_12px_rgba(255,193,7,0.5)]"
                animate={animated ? { scale: [1, 1.03, 1] } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <defs>
                  <linearGradient id="nexCartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFC107" />
                    <stop offset="50%" stopColor="#FFD54F" />
                    <stop offset="100%" stopColor="#00C8FF" />
                  </linearGradient>

                  <linearGradient id="circuitGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00C8FF" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>

                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke="url(#circuitGrad)"
                  strokeWidth="1.5"
                  strokeDasharray="4 6 12 6"
                  className="opacity-40 animate-spin"
                  style={{ transformOrigin: '50px 50px', animationDuration: '24s' }}
                />

                <motion.path
                  d="M 30 50 C 15 35 15 65 30 50 C 42 38 58 62 70 50 C 85 35 85 65 70 50 C 58 38 42 62 30 50 Z"
                  fill="none"
                  stroke="url(#nexCartGrad)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#neonGlow)"
                />

                <path
                  d="M 22 64 L 32 74 H 68 L 78 64"
                  fill="none"
                  stroke="#00C8FF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="opacity-80"
                />

                <circle cx="36" cy="78" r="4" fill="#FFC107" />
                <circle cx="36" cy="78" r="1.5" fill="#070B12" />

                <circle cx="64" cy="78" r="4" fill="#00C8FF" />
                <circle cx="64" cy="78" r="1.5" fill="#070B12" />

                <line x1="50" y1="12" x2="50" y2="24" stroke="#00C8FF" strokeWidth="2" strokeDasharray="2 2" />
                <circle cx="50" cy="12" r="2.5" fill="#00C8FF" />

                <path
                  d="M 52 35 L 43 51 H 51 L 47 65 L 58 47 H 50 L 52 35 Z"
                  fill="#FFC107"
                  stroke="#070B12"
                  strokeWidth="1"
                  className="filter drop-shadow-[0_0_8px_rgba(255,193,7,0.8)]"
                />
              </motion.svg>
            </div>

            {/* Brand Text */}
            {showText && (
              <div className="flex flex-col text-left">
                <span className={`${currentSize.font} font-black tracking-wider uppercase font-sans leading-none flex items-center`}>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-300 to-yellow-400 drop-shadow-[0_0_12px_rgba(255,193,7,0.3)]">
                    NEX
                  </span>
                  <span className="text-white dark:text-white tracking-widest ml-0.5">
                    CART
                  </span>
                </span>
                <span className="text-[9px] tracking-[0.25em] text-accentBlue/90 uppercase font-semibold font-mono mt-0.5">
                  AI SHOPPING PLATFORM
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NexCartLogo;
