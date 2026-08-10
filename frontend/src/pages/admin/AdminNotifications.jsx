import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiCheckCircle, FiTrash2, FiFilter, FiCheck, FiX, FiLoader
} from 'react-icons/fi';
import NotificationCard from '../../components/admin/shared/NotificationCard';
import adminService from '../../services/adminService';

const TABS = [
  { id: 'all', label: 'All Alerts' },
  { id: 'unread', label: 'Unread Only' },
  { id: 'verification', label: 'KYC & Onboarding' },
  { id: 'report', label: 'Disputes' },
  { id: 'alert', label: 'Critical' },
];

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await adminService.getNotifications({ tab: activeTab });
      if (res && res.data && res.data.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const markAllAsRead = async () => {
    try {
      await adminService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await adminService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleClick = async (notif) => {
    try {
      if (!notif.read) {
        await adminService.markNotificationRead(notif._id || notif.id);
        setNotifications((prev) =>
          prev.map((n) => ((n._id || n.id) === (notif._id || notif.id) ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }

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
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
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
        {loading ? (
          <div className="text-center py-16 bg-[#1A1A1A] border border-white/5 rounded-2xl">
            <FiLoader className="animate-spin inline-block text-yellow-400 mb-2" size={24} />
            <p className="text-sm font-bold text-gray-400">Loading notifications...</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.length > 0 ? (
              notifications.map((notif, idx) => (
                <NotificationCard
                  key={notif._id || notif.id}
                  notification={notif}
                  index={idx}
                  onDismiss={handleDismiss}
                  onClick={() => handleClick(notif)}
                />
              ))
            ) : (
              <div className="text-center py-16 bg-[#1A1A1A] border border-white/5 rounded-2xl">
                <FiBell size={32} className="mx-auto text-gray-600 mb-3" />
                <p className="text-sm font-bold text-gray-400">No notifications found</p>
                <p className="text-xs text-gray-600 mt-1">Platform events and admin queue updates will appear here</p>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
