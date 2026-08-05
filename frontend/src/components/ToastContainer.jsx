import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { FiCheckCircle, FiInfo, FiAlertCircle } from 'react-icons/fi';

const ToastContainer = () => {
  const { toasts } = useContext(AppContext);

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto flex flex-col p-4 rounded-xl border glass-card shadow-2xl transition-all relative overflow-hidden ${
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
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3.0, ease: 'linear' }}
              className={`absolute bottom-0 left-0 h-[2px] ${
                toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-accentBlue' : 'bg-primary'
              }`}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
