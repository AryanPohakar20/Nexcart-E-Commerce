import React, { useEffect, useContext, useState } from 'react';
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

const ToastItem = ({ toast, removeToast }) => {
  const [timeLeft, setTimeLeft] = useState(3500);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    if (timeLeft <= 0) {
      removeToast(toast.id);
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 100);
    }, 100);
    return () => clearTimeout(timer);
  }, [isHovered, timeLeft, toast.id, removeToast]);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: toast.type === 'error' ? [-4, 4, -4, 4, 0] : 0
      }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 24,
        x: { duration: toast.type === 'error' ? 0.4 : 0.3 }
      }}
      className={`pointer-events-auto flex flex-col p-4 rounded-xl border glass-card shadow-2xl transition-all relative overflow-hidden ${
        toast.type === 'error'
          ? 'border-red-500/30 text-red-400 shadow-red-500/5'
          : toast.type === 'info'
          ? 'border-accentBlue/30 text-accentBlue shadow-blue-500/5'
          : 'border-primary/30 text-primary shadow-yellow-500/5'
      }`}
    >
      <div className="flex items-center gap-3">
        {toast.type === 'error' && (
          <div className="relative flex items-center justify-center w-6 h-6">
            <motion.div 
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-red-500/25 rounded-full blur-xs"
            />
            <FiAlertCircle className="text-red-500 text-xl z-10" />
          </div>
        )}
        {toast.type === 'info' && (
          <div className="relative flex items-center justify-center w-6 h-6">
            <FiInfo className="text-accentBlue text-xl" />
          </div>
        )}
        {toast.type === 'success' && (
          <div className="relative flex items-center justify-center w-6 h-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 bg-green-500/20 rounded-full"
            />
            <svg className="w-3.5 h-3.5 text-green-400 z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
              <motion.polyline 
                points="20 6 9 17 4 12" 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.08 }}
              />
            </svg>
          </div>
        )}
        <span className="text-sm font-medium text-foreground">{toast.message}</span>
      </div>
      <motion.div 
        animate={{ width: `${(timeLeft / 3500) * 100}%` }}
        transition={{ duration: 0.1, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-[2px] ${
          toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-accentBlue' : 'bg-primary'
        }`}
      />
    </motion.div>
  );
};

const RootLayout = () => {
  const { toasts, removeToast } = useContext(AppContext);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // State for simulated navigation progress bar
  const [navProgress, setNavProgress] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  // Mouse-interactive ambient light coordinates tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fly-to-Cart animation layer logic
  const [flyingItems, setFlyingItems] = useState([]);

  useEffect(() => {
    const handleFlyToCart = (e) => {
      const { startX, startY, image } = e.detail;
      const id = Date.now() + Math.random();
      
      const cartIconEl = document.querySelector('[title="Shopping Cart"]');
      const rect = cartIconEl ? cartIconEl.getBoundingClientRect() : { left: window.innerWidth - 120, top: 30 };
      const destX = rect.left + rect.width / 2;
      const destY = rect.top + rect.height / 2;

      setFlyingItems(prev => [...prev, { id, startX, startY, destX, destY, image }]);
      
      setTimeout(() => {
        setFlyingItems(prev => prev.filter(item => item.id !== id));
      }, 700);
    };

    window.addEventListener('fly-to-cart', handleFlyToCart);
    return () => window.removeEventListener('fly-to-cart', handleFlyToCart);
  }, []);

  useEffect(() => {
    setIsNavigating(true);
    setNavProgress(15);
    const t1 = setTimeout(() => setNavProgress(55), 100);
    const t2 = setTimeout(() => setNavProgress(85), 250);
    const t3 = setTimeout(() => {
      setNavProgress(100);
      setTimeout(() => {
        setIsNavigating(false);
      }, 150);
    }, 450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [location.pathname]);

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
      <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-black relative overflow-x-hidden mesh-gradient-bg">
        <ScrollToTop />
        
        {/* Top Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-amber-400 to-accentBlue origin-left z-[100]"
          style={{ scaleX }}
        />

        {/* Simulated navigation progress bar */}
        <AnimatePresence>
          {isNavigating && (
            <motion.div
              initial={{ width: '0%', opacity: 1 }}
              animate={{ width: `${navProgress}%` }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary via-amber-400 to-accentBlue z-[101]"
            />
          )}
        </AnimatePresence>

        <main className="min-h-screen w-full flex flex-col justify-between">
          <Outlet />
        </main>

        {/* Toast Alert System Stack (Top-Right) */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary selection:text-black transition-colors duration-400 relative overflow-x-hidden mesh-gradient-bg">
      {/* Scroll manager */}
      <ScrollToTop />
      
      {/* Top Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-amber-400 to-accentBlue origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Simulated navigation progress bar */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ width: '0%', opacity: 1 }}
            animate={{ width: `${navProgress}%` }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-primary via-amber-400 to-accentBlue z-[101]"
          />
        )}
      </AnimatePresence>

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
      
      {/* Floating Fly-to-Cart clones */}
      <AnimatePresence>
        {flyingItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ 
              position: 'fixed',
              left: item.startX - 20,
              top: item.startY - 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 0 15px rgba(255, 193, 7, 0.45)',
              border: '2px solid #FFC107',
              zIndex: 9999,
              scale: 1,
              opacity: 1
            }}
            animate={{
              left: item.destX - 12,
              top: item.destY - 12,
              width: 24,
              height: 24,
              scale: 0.25,
              opacity: 0.3,
              rotate: 360
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none"
          >
            <img src={item.image} alt="" className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Sticky Header */}
      <Navbar />

      {/* Main Page Content with Animated Page Transitions */}
      <main className="flex-grow pt-28 md:pt-32 pb-12 px-4 md:px-8 max-w-7xl mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20, scale: 0.97, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, scale: 0.97, filter: 'blur(10px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Alert System Stack (Top-Right) */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RootLayout;
