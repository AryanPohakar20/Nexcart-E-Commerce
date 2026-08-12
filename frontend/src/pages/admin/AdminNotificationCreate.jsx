import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import adminService from '../../services/adminService';
import NotificationForm from '../../components/admin/notifications/NotificationForm';

const AdminNotificationCreate = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(AppContext);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setErrors({});
      await adminService.createNotification(payload);
      showToast('Notification created successfully.', 'success');
      navigate('/admin/notifications');
    } catch (err) {
      const message = err?.message || 'Failed to create notification.';
      const nextErrors = err?.errors?.length ? { form: err.errors.join(', ') } : { form: message };
      setErrors(nextErrors);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <NotificationForm
      mode="create"
      submitting={submitting}
      errors={errors}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/admin/notifications')}
      submitLabel="Create Notification"
    />
  );
};

export default AdminNotificationCreate;