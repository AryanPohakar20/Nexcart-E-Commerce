import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info'
  loading = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const typeConfig = {
    danger: {
      icon: FiAlertTriangle,
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-400',
      btnClass: 'bg-red-500 hover:bg-red-600 text-white',
    },
    warning: {
      icon: FiAlertTriangle,
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-400',
      btnClass: 'bg-yellow-500 hover:bg-yellow-600 text-black font-bold',
    },
    info: {
      icon: FiAlertTriangle,
      iconBg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-400',
      btnClass: 'bg-cyan-500 hover:bg-cyan-600 text-black font-bold',
    },
  };

  const tc = typeConfig[type] || typeConfig.danger;
  const Icon = tc.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-cardBg border border-borderColor rounded-2xl p-6 shadow-2xl"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-textSecondary hover:text-textPrimary hover:bg-surface"
            >
              <FiX size={16} />
            </button>

            {/* Icon */}
            <div className={`w-12 h-12 ${tc.iconBg} rounded-xl flex items-center justify-center mb-4`}>
              <Icon size={24} className={tc.iconColor} />
            </div>

            <h3 className="text-lg font-bold text-textPrimary mb-2">{title}</h3>
            <p className="text-sm text-textSecondary mb-6">{message}</p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-textSecondary bg-surface hover:bg-surface border border-borderColor transition-all"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${tc.btnClass}`}
              >
                {loading ? 'Processing...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
