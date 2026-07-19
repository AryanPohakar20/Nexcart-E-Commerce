import React, { useEffect, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AppContext } from '../context/AppContext';
import { FiCheckCircle, FiInfo, FiAlertCircle, FiX } from 'react-icons/fi';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const RootLayout = () => {
  const { toasts } = useContext(AppContext);

  return (
    <div className="min-h-screen flex flex-col bg-darkBg text-white selection:bg-primary selection:text-black">
      {/* Scroll manager */}
      <ScrollToTop />
      
      {/* Sticky Header */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-grow pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Alert System Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border glass-card shadow-2xl animate-slide-up transition-all ${
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default RootLayout;
