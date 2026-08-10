import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import adminService from '../../services/adminService';
import NotificationForm from '../../components/admin/notifications/NotificationForm';

const AdminNotificationEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadNotification = async () => {
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

    loadNotification();
  }, [id, navigate, showToast]);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setErrors({});
      await adminService.updateNotification(id, payload);
      showToast('Notification updated successfully.', 'success');
      navigate(`/admin/notifications/${id}`);
    } catch (err) {
      const message = err?.message || 'Failed to update notification.';
      setErrors(err?.errors?.length ? { form: err.errors.join(', ') } : { form: message });
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = notification ? {
    title: notification.title || '',
    message: notification.message || '',
    notificationType: notification.notificationType || 'Announcement',
    targetAudience: notification.targetAudience || 'all',
    priority: notification.priority || 'normal',
    publishStatus: notification.publishStatus || 'draft',
    scheduledAt: notification.scheduledAt ? new Date(notification.scheduledAt).toISOString().slice(0, 16) : '',
    expiresAt: notification.expiresAt ? new Date(notification.expiresAt).toISOString().slice(0, 16) : '',
    image: notification.image || '',
    actionUrl: notification.actionUrl || notification.link || '',
  } : {};

  return (
    <NotificationForm
      mode="edit"
      loading={loading}
      submitting={submitting}
      initialValues={initialValues}
      errors={errors}
      onSubmit={handleSubmit}
      onCancel={() => navigate(`/admin/notifications/${id}`)}
      submitLabel="Save Notification"
    />
  );
};

export default AdminNotificationEdit;