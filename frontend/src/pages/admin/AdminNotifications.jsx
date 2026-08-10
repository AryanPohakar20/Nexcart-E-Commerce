import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiEye, FiEdit2, FiPlus, FiTrash2, FiSearch, FiSliders,
  FiClock, FiSend, FiToggleRight, FiToggleLeft, FiRefreshCw
} from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import adminService from '../../services/adminService';
import TableToolbar from '../../components/admin/shared/TableToolbar';
import Pagination from '../../components/admin/shared/Pagination';
import ConfirmDialog from '../../components/admin/shared/ConfirmDialog';
import EmptyState from '../../components/admin/shared/EmptyState';
import SkeletonLoader from '../../components/admin/shared/SkeletonLoader';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import ActionDropdown from '../../components/admin/shared/ActionDropdown';

const TYPE_OPTIONS = ['All Types', 'Promotion', 'Offer', 'Discount', 'Recommendation', 'Announcement', 'Order Update', 'System Alert', 'Custom', 'Success', 'Warning', 'Error', 'Information', 'Security Alert', 'Maintenance', 'System Update'];
const STATUS_OPTIONS = ['All Statuses', 'draft', 'scheduled', 'published', 'unpublished'];
const AUDIENCE_OPTIONS = ['All Audiences', 'all', 'all customers', 'all sellers', 'customers', 'sellers', 'admins'];
const PRIORITY_OPTIONS = ['All Priorities', 'low', 'normal', 'high', 'critical'];
const SORT_OPTIONS = [
  { label: 'Newest first', value: 'createdAt:desc' },
  { label: 'Oldest first', value: 'createdAt:asc' },
  { label: 'Scheduled date', value: 'scheduledAt:asc' },
  { label: 'Priority', value: 'priority:desc' },
];

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '—');

const AdminNotifications = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(AppContext);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [audienceFilter, setAudienceFilter] = useState('All Audiences');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const [actionLoading, setActionLoading] = useState(false);

  const queryParams = useMemo(() => ({
    page,
    limit,
    sort,
    ...(search.trim() && { search: search.trim() }),
    ...(typeFilter !== 'All Types' && { notificationType: typeFilter }),
    ...(statusFilter !== 'All Statuses' && { publishStatus: statusFilter }),
    ...(audienceFilter !== 'All Audiences' && { targetAudience: audienceFilter }),
    ...(priorityFilter !== 'All Priorities' && { priority: priorityFilter }),
    ...(dateFrom && { startDate: dateFrom }),
    ...(dateTo && { endDate: dateTo }),
  }), [page, limit, sort, search, typeFilter, statusFilter, audienceFilter, priorityFilter, dateFrom, dateTo]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminService.getNotifications(queryParams);
      const data = res?.data || {};
      setNotifications(data.notifications || []);
      setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: limit });
    } catch (err) {
      setError(err?.message || 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [queryParams]);

  const updateRow = (updated) => {
    setNotifications((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
  };

  const handlePublishToggle = async (notification) => {
    try {
      setActionLoading(true);
      const isPublished = notification.publishStatus === 'published';
      const res = isPublished
        ? await adminService.unpublishNotification(notification._id)
        : await adminService.publishNotification(notification._id);
      const updated = res?.data?.notification;
      if (updated) {
        updateRow(updated);
        showToast(`Notification ${isPublished ? 'unpublished' : 'published'} successfully.`, 'success');
      }
    } catch (err) {
      showToast(err?.message || 'Failed to update publish status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (notification) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Notification',
      message: `Delete "${notification.title}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await adminService.deleteNotification(notification._id);
          setNotifications((prev) => prev.filter((item) => item._id !== notification._id));
          setConfirmDialog({ open: false });
          showToast('Notification deleted successfully.', 'success');
        } catch (err) {
          showToast(err?.message || 'Failed to delete notification.', 'error');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const actionsFor = (notification) => [
    { label: 'View Details', icon: FiEye, onClick: () => navigate(`/admin/notifications/${notification._id}`) },
    { label: 'Edit', icon: FiEdit2, onClick: () => navigate(`/admin/notifications/${notification._id}/edit`) },
    { type: 'divider' },
    notification.publishStatus === 'published'
      ? { label: 'Unpublish', icon: FiToggleLeft, onClick: () => handlePublishToggle(notification), warning: true, disabled: actionLoading }
      : { label: 'Publish', icon: FiToggleRight, onClick: () => handlePublishToggle(notification), success: true, disabled: actionLoading },
    { label: 'Delete', icon: FiTrash2, onClick: () => handleDelete(notification), danger: true, disabled: actionLoading },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Notification Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create, schedule, publish, and manage platform notifications from one place.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-gray-300 hover:bg-white/10"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={14} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/admin/notifications/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500 text-black text-xs font-bold hover:bg-yellow-400 transition-all shadow-[0_0_15px_rgba(255,193,7,0.3)]"
          >
            <FiPlus size={14} />
            Create Notification
          </button>
        </div>
      </motion.div>

      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
        <TableToolbar
          search={search}
          onSearch={setSearch}
          onSearchClear={() => setSearch('')}
          searchPlaceholder="Search title or message..."
          onCreate={() => navigate('/admin/notifications/new')}
          createLabel="Create"
          filters={
            <div className="flex flex-wrap items-center gap-2">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
                {TYPE_OPTIONS.map((option) => <option key={option} value={option} className="text-black">{option}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
                {STATUS_OPTIONS.map((option) => <option key={option} value={option} className="text-black">{option}</option>)}
              </select>
              <select value={audienceFilter} onChange={(e) => setAudienceFilter(e.target.value)} className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
                {AUDIENCE_OPTIONS.map((option) => <option key={option} value={option} className="text-black">{option}</option>)}
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
                {PRIORITY_OPTIONS.map((option) => <option key={option} value={option} className="text-black">{option}</option>)}
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
                {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value} className="text-black">{option.label}</option>)}
              </select>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none" />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none" />
            </div>
          }
        />

        {error && (
          <div className="px-4 py-3 border-b border-red-500/20 bg-red-500/10 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-4">
            <SkeletonLoader type="table" count={6} />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={FiBell}
            title="No notifications found"
            description="Create a new notification or adjust your filters to see matching records."
            action={() => navigate('/admin/notifications/new')}
            actionLabel="Create Notification"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-white/3 border-b border-white/5 text-gray-500 uppercase tracking-wider font-bold">
                  <th className="p-4">Title</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 hidden lg:table-cell">Audience</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 hidden xl:table-cell">Scheduled</th>
                  <th className="p-4 hidden xl:table-cell">Expires</th>
                  <th className="p-4 hidden md:table-cell">Creator</th>
                  <th className="p-4 hidden md:table-cell">Created</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <tr key={notification._id} className="hover:bg-white/3 transition-colors">
                    <td className="p-4 max-w-[260px]">
                      <div className="space-y-1">
                        <button
                          onClick={() => navigate(`/admin/notifications/${notification._id}`)}
                          className="text-sm font-bold text-white hover:text-yellow-400 text-left line-clamp-1"
                        >
                          {notification.title}
                        </button>
                        <p className="text-[10px] text-gray-500 line-clamp-2">{notification.message}</p>
                      </div>
                    </td>
                    <td className="p-4"><StatusBadge status={(notification.notificationType || '').toLowerCase()} /></td>
                    <td className="p-4 hidden lg:table-cell text-gray-400">{notification.targetAudience || 'all'}</td>
                    <td className="p-4"><StatusBadge status={notification.priority} /></td>
                    <td className="p-4"><StatusBadge status={notification.publishStatus} /></td>
                    <td className="p-4 hidden xl:table-cell text-gray-400">{formatDate(notification.scheduledAt)}</td>
                    <td className="p-4 hidden xl:table-cell text-gray-400">{formatDate(notification.expiresAt)}</td>
                    <td className="p-4 hidden md:table-cell text-gray-400">{notification.createdBy ? `${notification.createdBy.firstName || ''} ${notification.createdBy.lastName || ''}`.trim() || notification.createdBy.email : '—'}</td>
                    <td className="p-4 hidden md:table-cell text-gray-500">{formatDate(notification.createdAt)}</td>
                    <td className="p-4 text-right">
                      <ActionDropdown actions={actionsFor(notification)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <Pagination
            currentPage={pagination.currentPage || page}
            totalPages={pagination.totalPages || 1}
            onPageChange={setPage}
            itemsPerPage={limit}
            totalItems={pagination.totalItems || 0}
            onItemsPerPageChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        type={confirmDialog.type}
        loading={actionLoading}
      />
    </div>
  );
};

export default AdminNotifications;
