import React from 'react';
import { motion } from 'framer-motion';
import { FiSlash, FiX, FiAlertTriangle } from 'react-icons/fi';

const BlockUserModal = ({ isOpen, onClose, onConfirmBlock, partner, isBlocked }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-sm bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 relative text-center"
      >
        <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl ${
          isBlocked ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
        }`}>
          <FiSlash />
        </div>

        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
          {isBlocked ? `Unblock ${partner.name}?` : `Block ${partner.name}?`}
        </h3>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          {isBlocked
            ? `Unblocking will allow ${partner.name} to send you messages and view your marketplace listings again.`
            : `Blocked users will no longer be able to message you or view your active marketplace listings.`}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmBlock(!isBlocked);
              onClose();
            }}
            className={`flex-1 py-3 text-white font-bold text-xs rounded-2xl transition-all shadow-md ${
              isBlocked
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
            }`}
          >
            {isBlocked ? 'Unblock User' : 'Block User'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BlockUserModal;
