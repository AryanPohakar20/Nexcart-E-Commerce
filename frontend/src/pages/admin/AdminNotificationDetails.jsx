import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiEdit2, FiTrash2, FiToggleRight, FiToggleLeft, FiClock, FiUser,
  FiLink2, FiImage, FiCalendar, FiMessageSquare, FiTag
} from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import adminService from '../../services/adminService';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import ConfirmDialog from '../../components/admin/shared/ConfirmDialog';

const detailItem = (label, value) => ({ label, value: value || '—' });

const AdminNotificationDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminService.getNotificationById(id);
        setNotification(res?.data?.notification || null);
      } catch (err) {
        showToast(err?.message || 'Failed to load notification.', 'error');
        navigate('/admin/notifications');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate, showToast]);

  const refresh = async () => {
    const res = await adminService.getNotificationById(id);
    setNotification(res?.data?.notification || null);
  };

  const handlePublishToggle = async () => {
    try {
      setActionLoading(true);
      const isPublished = notification.publishStatus === 'published';
      const res = isPublished
        ? await adminService.unpublishNotification(id)
        : await adminService.publishNotification(id);
      setNotification(res?.data?.notification || notification);
      showToast(`Notification ${isPublished ? 'unpublished' : 'published'} successfully.`, 'success');
    } catch (err) {
      showToast(err?.message || 'Failed to update publish status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = () => {
    setConfirmDialog({
      open: true,
      title: 'Delete Notification',
      message: 'This will permanently remove the notification from the system.',
      confirmLabel: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await adminService.deleteNotification(id);
          showToast('Notification deleted successfully.', 'success');
          navigate('/admin/notifications');
        } catch (err) {
          showToast(err?.message || 'Failed to delete notification.', 'error');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  if (loading) {
    return <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-12 text-center text-gray-400">Loading notification details...</div>;
  }

  if (!notification) {
    return <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-12 text-center text-gray-400">Notification not found.</div>;
  }

  const details = [
    detailItem('Notification Type', notification.notificationType),
    detailItem('Target Audience', notification.targetAudience),
    detailItem('Priority', notification.priority),
    detailItem('Publish Status', notification.publishStatus),
    detailItem('Scheduled At', notification.scheduledAt ? new Date(notification.scheduledAt).toLocaleString() : '—'),
    detailItem('Expires At', notification.expiresAt ? new Date(notification.expiresAt).toLocaleString() : '—'),
    detailItem('Created At', notification.createdAt ? new Date(notification.createdAt).toLocaleString() : '—'),
    detailItem('Updated At', notification.updatedAt ? new Date(notification.updatedAt).toLocaleString() : '—'),
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link to="/admin/notifications" className="hover:text-white flex items-center gap-1"><FiArrowLeft size={12} /> Back</Link>
            <span>/</span>
            <span>{notification.title}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Notification Details</h1>
            <StatusBadge status={notification.publishStatus} />
            <StatusBadge status={(notification.notificationType || '').toLowerCase()} />
          </div>
          <p className="text-sm text-gray-500 max-w-3xl">{notification.message}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => navigate('/admin/notifications')} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/10">Back to List</button>
          <button onClick={() => navigate(`/admin/notifications/${id}/edit`)} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/10 inline-flex items-center gap-2"><FiEdit2 size={14} /> Edit</button>
          <button onClick={handlePublishToggle} disabled={actionLoading} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/10 inline-flex items-center gap-2 disabled:opacity-60">
            {notification.publishStatus === 'published' ? <FiToggleLeft size={14} /> : <FiToggleRight size={14} />}
            {notification.publishStatus === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <button onClick={handleDelete} disabled={actionLoading} className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-300 hover:bg-red-500/20 inline-flex items-center gap-2 disabled:opacity-60"><FiTrash2 size={14} /> Delete</button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 space-y-6">
            {notification.image && (
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <img src={notification.image} alt={notification.title} className="w-full max-h-[360px] object-cover" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {details.map((item) => (
                <div key={item.label} className="rounded-xl border border-white/5 bg-white/3 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">{item.label}</p>
                  <p className="text-sm text-white font-semibold break-words">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/5 bg-white/3 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white mb-2"><FiUser className="text-yellow-400" /> Creator</div>
                <p className="text-sm text-gray-300">{notification.createdBy ? `${notification.createdBy.firstName || ''} ${notification.createdBy.lastName || ''}`.trim() || notification.createdBy.email : '—'}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/3 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white mb-2"><FiLink2 className="text-yellow-400" /> Action URL</div>
                {notification.actionUrl ? <a href={notification.actionUrl} target="_blank" rel="noreferrer" className="text-sm text-cyan-400 break-all hover:underline">{notification.actionUrl}</a> : <p className="text-sm text-gray-300">—</p>}
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><FiMessageSquare className="text-yellow-400" /> Message</h2>
            <p className="text-sm leading-7 text-gray-300 whitespace-pre-wrap">{notification.message}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white">Quick Summary</h2>
            <div className="space-y-3 text-sm text-gray-400">
              <p className="flex items-center gap-2"><FiTag className="text-yellow-400" /> {notification.notificationType}</p>
              <p className="flex items-center gap-2"><FiCalendar className="text-yellow-400" /> {notification.publishStatus}</p>
              <p className="flex items-center gap-2"><FiClock className="text-yellow-400" /> {notification.priority} priority</p>
              <p className="flex items-center gap-2"><FiImage className="text-yellow-400" /> {notification.image ? 'Image attached' : 'No image'}</p>
            </div>
          </div>

          <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 space-y-3">
            <h2 className="text-sm font-bold text-white">Lifecycle</h2>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Created: {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : '—'}</p>
              <p>Updated: {notification.updatedAt ? new Date(notification.updatedAt).toLocaleString() : '—'}</p>
              <p>Scheduled: {notification.scheduledAt ? new Date(notification.scheduledAt).toLocaleString() : '—'}</p>
              <p>Expires: {notification.expiresAt ? new Date(notification.expiresAt).toLocaleString() : '—'}</p>
            </div>
          </div>
        </div>
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

export default AdminNotificationDetails;