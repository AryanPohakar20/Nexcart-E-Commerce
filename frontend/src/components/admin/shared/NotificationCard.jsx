import React from 'react';
import { motion } from 'framer-motion';
import {
  FiBell, FiAlertTriangle, FiCheckCircle, FiShoppingBag, FiUser,
  FiFileText, FiSettings, FiX
} from 'react-icons/fi';

const typeConfig = {
  verification: { icon: FiCheckCircle, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/15' },
  report: { icon: FiFileText, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/15' },
  alert: { icon: FiAlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/15' },
  order: { icon: FiShoppingBag, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/15' },
  seller: { icon: FiUser, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/15' },
  platform: { icon: FiSettings, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/15' },
  default: { icon: FiBell, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/15' },
};

const priorityMap = {
  critical: 'border-l-4 border-l-red-500',
  high: 'border-l-4 border-l-yellow-500',
  medium: 'border-l-4 border-l-blue-500',
  normal: '',
};

const NotificationCard = ({ notification, onDismiss, onClick, index = 0 }) => {
  const { type, title, message, time, createdAt, read, priority } = notification;
  const tc = typeConfig[type] || typeConfig.default;
  const Icon = tc.icon;

  const displayTime = time || (createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently');

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`
        relative flex gap-3 p-4 rounded-xl border cursor-pointer transition-all
        ${read ? 'bg-surface border-borderColor opacity-70' : `bg-cardBg border-borderColor ${priorityMap[priority] || ''}`}
        hover:bg-surface hover:border-borderColor group
      `}
    >
      {/* Icon */}
      <div className={`w-9 h-9 ${tc.bg} rounded-xl flex-shrink-0 flex items-center justify-center`}>
        <Icon size={16} className={tc.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h5 className={`text-sm font-bold ${read ? 'text-textSecondary' : 'text-textPrimary'} truncate`}>{title}</h5>
          <span className="text-[10px] text-textSecondary whitespace-nowrap flex-shrink-0">{displayTime}</span>
        </div>
        <p className="text-xs text-textSecondary mt-0.5 line-clamp-2">{message}</p>
      </div>

      {/* Unread dot */}
      {!read && (
        <div className="absolute top-4 right-12 w-2 h-2 rounded-full bg-yellow-500" />
      )}

      {/* Dismiss */}
      {onDismiss && (
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(notification._id || notification.id); }}
          className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-lg text-textSecondary hover:text-textPrimary hover:bg-surface transition-all"
        >
          <FiX size={12} />
        </button>
      )}
    </motion.div>
  );
};

export default NotificationCard;
