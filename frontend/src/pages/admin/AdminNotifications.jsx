import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiCheckCircle, FiTrash2, FiFilter, FiCheck, FiX
} from 'react-icons/fi';
import NotificationCard from '../../components/admin/shared/NotificationCard';
import { ADMIN_NOTIFICATIONS } from '../../constants/adminDummyData';

const TABS = [
  { id: 'all', label: 'All Alerts' },
  { id: 'unread', label: 'Unread Only' },
  { id: 'verification', label: 'KYC & Onboarding' },
  { id: 'report', label: 'Disputes' },
  { id: 'alert', label: 'Critical' },
];

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(ADMIN_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('all');

  const filtered = useMemo(() => {
    if (activeTab === 'unread') return notifications.filter((n) => !n.read);
    if (activeTab === 'all') return notifications;
    return notifications.filter((n) => n.type === activeTab);
  }, [notifications, activeTab]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClick = (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Notification Center</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time platform alerts, fraud triggers, transaction pings, and onboarding queue updates
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-bold rounded-xl transition-all"
        >
          <FiCheck size={14} className="text-yellow-400" />
          Mark All as Read
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-yellow-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length > 0 ? (
            filtered.map((notif, idx) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                index={idx}
                onDismiss={handleDismiss}
                onClick={() => handleClick(notif)}
              />
            ))
          ) : (
            <div className="text-center py-16 bg-[#1A1A1A] border border-white/5 rounded-2xl">
              <FiBell size={36} className="mx-auto text-gray-600 mb-2" />
              <h4 className="text-sm font-bold text-white">All caught up!</h4>
              <p className="text-xs text-gray-500 mt-1">No alerts matching current filter parameters.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminNotifications;
