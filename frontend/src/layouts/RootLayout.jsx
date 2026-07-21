import React, { useEffect, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AppContext } from '../context/AppContext';
import { FiCheckCircle, FiInfo, FiAlertCircle } from 'react-icons/fi';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const RootLayout = () => {
  const { toasts } = useContext(AppContext);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Scroll Progress Bar calculation
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Background Particles (Subtle, pointer-events-none)
  const bgParticles = Array.from({ length: 8 });

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#070B12] text-white selection:bg-primary selection:text-black relative overflow-x-hidden">
        <ScrollToTop />
        
        {/* Top Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-amber-400 to-accentBlue origin-left z-[100]"
          style={{ scaleX }}
        />

        <main className="min-h-screen w-full flex flex-col justify-between">
          <Outlet />
        </main>

        {/* Toast Alert System Stack */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border glass-card shadow-2xl transition-all ${
                  toast.type === 'error'
                    ? 'border-red-500/30 text-red-400'
                    : toast.type === 'info'
                    ? 'border-accentBlue/30 text-accentBlue'
                    : 'border-primary/30 text-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  {toast.type === 'error' && <FiAlertCircle className="text-xl flex-shrink-0" />}
                  {toast.type === 'info' && <FiInfo className="text-xl flex-shrink-0" />}
                  {toast.type === 'success' && <FiCheckCircle className="text-xl flex-shrink-0" />}
                  <span className="text-sm font-medium text-white">{toast.message}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary selection:text-black transition-colors duration-400 relative overflow-x-hidden">
      {/* Scroll manager */}
      <ScrollToTop />
      
      {/* Top Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-amber-400 to-accentBlue origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Global Background Ambient Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 dark:opacity-40">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-[550px] h-[550px] bg-accentBlue/10 rounded-full blur-[160px]" />
        
        {bgParticles.map((_, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: (index % 3 + 2) + 'px',
              height: (index % 3 + 2) + 'px',
              backgroundColor: index % 2 === 0 ? '#FFC107' : '#00C8FF',
              left: `${(index * 13) % 100}%`,
              top: `${(index * 17) % 100}%`,
              boxShadow: index % 2 === 0 ? '0 0 8px #FFC107' : '0 0 8px #00C8FF'
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.15, 0.6, 0.15]
            }}
            transition={{
              duration: 5 + (index % 3),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.3
            }}
          />
        ))}
      </div>
      
      {/* Sticky Header */}
      <Navbar />

      {/* Main Page Content with Animated Page Transitions */}
      <main className="flex-grow pt-24 md:pt-32 pb-12 px-4 md:px-8 max-w-7xl mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Alert System Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border glass-card shadow-2xl transition-all ${
                toast.type === 'error'
                  ? 'border-red-500/30 text-red-400'
                  : toast.type === 'info'
                  ? 'border-accentBlue/30 text-accentBlue'
                  : 'border-primary/30 text-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                {toast.type === 'error' && <FiAlertCircle className="text-xl flex-shrink-0" />}
                {toast.type === 'info' && <FiInfo className="text-xl flex-shrink-0" />}
                {toast.type === 'success' && <FiCheckCircle className="text-xl flex-shrink-0" />}
                <span className="text-sm font-medium text-white">{toast.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RootLayout;
