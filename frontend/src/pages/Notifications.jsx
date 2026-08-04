import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiChevronRight, FiTrash2, FiCheckCircle, FiRefreshCw, FiFilter } from 'react-icons/fi';
import notificationService from '../services/notificationService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const loadNotifications = async (nextPage = 1, nextStatus = status, nextSearch = search) => {
    try {
      setLoading(true);
      const params = {
        page: nextPage,
        limit: 8,
        sortBy: 'newest',
      };

      if (nextStatus !== 'all') params.status = nextStatus;
      if (nextSearch.trim()) params.search = nextSearch.trim();

      const response = await notificationService.getNotifications(params);

      if (response.success) {
        setNotifications(response.data || []);
        setTotalPages(response.meta?.pagination?.totalPages || 1);
      } else {
        setError(response.message || 'Unable to load notifications.');
      }
    } catch (err) {
      setError(err.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(1, status, search);
    setPage(1);
  }, [status, search]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  const handleMarkRead = async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        setNotifications((prev) => prev.map((item) => (item._id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item)));
      }
    } catch (err) {
      setError(err.message || 'Unable to mark notification as read.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await notificationService.deleteNotification(id);
      if (response.success) {
        setNotifications((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      setError(err.message || 'Unable to delete notification.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true, readAt: new Date().toISOString() })));
      }
    } catch (err) {
      setError(err.message || 'Unable to update notifications.');
    }
  };

  const handleClearRead = async () => {
    try {
      const response = await notificationService.deleteReadNotifications();
      if (response.success) {
        setNotifications((prev) => prev.filter((item) => !item.isRead));
      }
    } catch (err) {
      setError(err.message || 'Unable to clear notifications.');
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div className="border-b border-white/5 pb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-2">
            <Link to="/" className="hover:underline">Home</Link>
            <FiChevronRight />
            <span className="text-white">Notifications</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FiBell className="text-primary" />
            <span>Alerts & Notifications</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Stay updated with recent account, order, and system activity.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadNotifications(page, status, search)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200 transition hover:bg-white/10"
          >
            <span className="inline-flex items-center gap-2">
              <FiRefreshCw size={13} />
              Refresh
            </span>
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20">
              Mark all read
            </button>
          )}
          {notifications.some((item) => item.isRead) && (
            <button onClick={handleClearRead} className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20">
              Clear read
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-cardBg px-3 py-2">
          <FiFilter className="text-primary" size={14} />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-transparent text-sm text-white outline-none">
            <option value="all" className="text-black">All</option>
            <option value="unread" className="text-black">Unread</option>
            <option value="read" className="text-black">Read</option>
          </select>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notifications"
          className="w-full rounded-2xl border border-white/10 bg-cardBg px-3 py-2 text-sm text-white outline-none md:max-w-xs"
        />
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-cardBg p-10 text-center text-sm text-gray-400">Loading notifications…</div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-10 text-center text-sm text-red-400">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-white/5 shadow-2xl">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20 mb-4">
              <FiBell size={28} />
            </div>
            <h2 className="text-sm font-bold text-white mb-1">No alerts yet</h2>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">New updates, order activity, and account messages will appear here.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif._id} className={`rounded-2xl border p-5 transition-all ${notif.isRead ? 'border-white/10 bg-cardBg/80 opacity-80' : 'border-primary/20 bg-cardBg shadow-lg'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {!notif.isRead && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    <h4 className="text-sm font-semibold text-white">{notif.title}</h4>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{notif.message}</p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                    <span>{notif.category || 'general'}</span>
                    <span>•</span>
                    <span>{notif.priority || 'medium'}</span>
                    <span>•</span>
                    <span>{new Date(notif.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!notif.isRead && (
                    <button onClick={() => handleMarkRead(notif._id)} className="rounded-lg p-2 text-primary transition hover:bg-primary/10" title="Mark as read">
                      <FiCheckCircle size={16} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(notif._id)} className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10" title="Delete notification">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page === 1} onClick={() => { const nextPage = page - 1; setPage(nextPage); loadNotifications(nextPage, status, search); }} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 disabled:opacity-50">
            Previous
          </button>
          <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => { const nextPage = page + 1; setPage(nextPage); loadNotifications(nextPage, status, search); }} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
