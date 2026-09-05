import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiX, FiImage, FiClock, FiLink2, FiInfo, FiUsers, FiSearch } from 'react-icons/fi';
import StatusBadge from '../shared/StatusBadge';
import adminService from '../../../services/adminService';

const defaultValues = {
  title: '',
  message: '',
  notificationType: 'Announcement',
  targetAudience: 'all',
  priority: 'normal',
  publishStatus: 'published',
  scheduledAt: '',
  expiresAt: '',
  image: '',
  actionUrl: '',
  actionText: '',
};

const notificationTypes = ['Promotion', 'Offer', 'Discount', 'Recommendation', 'Announcement', 'Order Update', 'Seller Update', 'Product Update', 'Account Alert', 'System Alert', 'Custom', 'Success', 'Warning', 'Error', 'Information', 'Security Alert', 'Maintenance', 'System Update'];
const priorityOptions = ['low', 'normal', 'high', 'critical'];
const publishOptions = ['draft', 'scheduled', 'published', 'unpublished'];
const AUDIENCE_OPTIONS = ['all', 'all customers', 'all sellers', 'admins', 'customers', 'sellers', 'specific users'];

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const isValidInternalActionUrl = (value) => {
  const url = String(value || '').trim();
  if (!url) return true;
  if (!url.startsWith('/') || url.startsWith('//')) return false;
  if (url.includes('://') || url.includes('..') || /[\s<>"'\\]/.test(url)) return false;
  if (/(?:javascript|vbscript|data|mailto):/i.test(url)) return false;
  return true;
};

const NotificationForm = ({
  mode = 'create',
  initialValues = {},
  loading = false,
  submitting = false,
  errors = {},
  onSubmit,
  onCancel,
  submitLabel,
}) => {
  const initialValuesKey = JSON.stringify(initialValues || {});
  const mergedValues = useMemo(() => ({ ...defaultValues, ...initialValues }), [initialValuesKey]);
  const [values, setValues] = useState(mergedValues);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(mergedValues.image || '');
  const [localErrors, setLocalErrors] = useState({});
  const [recipientUsers, setRecipientUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    setValues(mergedValues);
    setImagePreview(mergedValues.image || '');
    setSelectedFile(null);
  }, [mergedValues]);

  const loadUserOptions = async () => {
    try {
      setUsersLoading(true);
      const res = await adminService.getUsers({ role: 'customer', status: 'Active', page: 1, limit: 200 });
      const users = res?.data?.users || [];
      setUserOptions(users.filter((user) => !['admin', 'super_admin', 'moderator', 'support_staff'].includes(user.role)));
    } catch {
      setUserOptions([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'create') {
      loadUserOptions();
    }
  }, [mode]);

  const handleChange = (field, fieldValue) => {
    setValues((prev) => ({ ...prev, [field]: fieldValue }));
    setLocalErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const toggleRecipient = (userId) => {
    setRecipientUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const filteredUserOptions = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return userOptions;
    return userOptions.filter((user) => {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      return name.includes(term) || (user.email || '').toLowerCase().includes(term);
    });
  }, [userOptions, userSearch]);

  const validate = () => {
    const nextErrors = {};

    if (!values.title.trim()) nextErrors.title = 'Title is required.';
    if (values.title.trim().length < 3) nextErrors.title = 'Title must be at least 3 characters.';
    if (!values.message.trim()) nextErrors.message = 'Message is required.';
    if (values.message.trim().length < 5) nextErrors.message = 'Message must be at least 5 characters.';
    if (!values.notificationType) nextErrors.notificationType = 'Notification type is required.';
    if (!values.targetAudience.trim()) nextErrors.targetAudience = 'Target audience is required.';
    if (!values.priority) nextErrors.priority = 'Priority is required.';
    if (!values.publishStatus) nextErrors.publishStatus = 'Publish status is required.';

    if (values.targetAudience === 'specific users' && recipientUsers.length === 0) {
      nextErrors.recipientUsers = 'Select at least one user when targeting specific users.';
    }

    if (values.scheduledAt && values.expiresAt) {
      const scheduled = new Date(values.scheduledAt);
      const expires = new Date(values.expiresAt);
      if (Number.isNaN(scheduled.getTime())) nextErrors.scheduledAt = 'Scheduled date must be valid.';
      if (Number.isNaN(expires.getTime())) nextErrors.expiresAt = 'Expiration date must be valid.';
      if (!nextErrors.scheduledAt && !nextErrors.expiresAt && expires <= scheduled) {
        nextErrors.expiresAt = 'Expiration date must be later than scheduled date.';
      }
    }

    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      nextErrors.image = 'Image must be smaller than 5 MB.';
    }

    if (!isValidInternalActionUrl(values.actionUrl)) {
      nextErrors.actionUrl = 'Action URL must be an internal route such as /promotion, /products/123, or /orders/123.';
    }

    if (values.publishStatus === 'scheduled' && !values.scheduledAt) {
      nextErrors.scheduledAt = 'Scheduled date is required when status is scheduled.';
    }

    setLocalErrors(nextErrors);
    return nextErrors;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLocalErrors((prev) => ({ ...prev, image: 'Please choose a valid image file.' }));
      return;
    }

    setSelectedFile(file);
    setLocalErrors((prev) => ({ ...prev, image: '' }));
    const preview = await readFileAsDataUrl(file);
    setImagePreview(preview);
    setValues((prev) => ({ ...prev, image: preview }));
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview(values.image || '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;
    if (submitting) return;

    const payload = { ...values };
    if (recipientUsers.length > 0) {
      payload.targetAudience = 'specific users';
      payload.recipientUsers = recipientUsers;
    }
    if (selectedFile) {
      payload.image = await readFileAsDataUrl(selectedFile);
    }

    await onSubmit(payload);
  };

  const fieldError = (field) => localErrors[field] || errors[field];

  if (loading) {
    return (
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 text-center text-gray-400">
        Loading notification form...
      </div>
    );
  }

  const selectedUsers = recipientUsers
    .map((id) => userOptions.find((user) => user._id === id))
    .filter(Boolean);

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 md:p-6 space-y-6 shadow-2xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {mode === 'create' ? 'Create Notification' : 'Edit Notification'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure platform notifications for admins, customers, and sellers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={values.publishStatus || 'draft'} />
          <StatusBadge status={(values.notificationType || 'custom').toLowerCase()} />
        </div>
      </div>

      {(Object.keys(localErrors).length > 0 || Object.keys(errors).length > 0) && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 space-y-1">
          {Object.values({ ...errors, ...localErrors }).filter(Boolean).slice(0, 4).map((message, index) => (
            <p key={index}>• {message}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Title</span>
              <input
                value={values.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full h-11 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
                placeholder="Announcement headline"
              />
              {fieldError('title') && <span className="text-xs text-red-400">{fieldError('title')}</span>}
            </label>

            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Notification Type</span>
              <select
                value={values.notificationType}
                onChange={(e) => handleChange('notificationType', e.target.value)}
                className="w-full h-11 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
              >
                {notificationTypes.map((type) => <option key={type} value={type} className="text-black">{type}</option>)}
              </select>
              {fieldError('notificationType') && <span className="text-xs text-red-400">{fieldError('notificationType')}</span>}
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Message</span>
            <textarea
              value={values.message}
              onChange={(e) => handleChange('message', e.target.value)}
              rows={6}
              className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50 resize-y"
              placeholder="Write the full notification message..."
            />
            {fieldError('message') && <span className="text-xs text-red-400">{fieldError('message')}</span>}
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Target Audience</span>
              <input
                list="notification-target-audience"
                value={values.targetAudience}
                onChange={(e) => handleChange('targetAudience', e.target.value)}
                className="w-full h-11 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
                placeholder="all customers"
              />
              <datalist id="notification-target-audience">
                {AUDIENCE_OPTIONS.map((option) => <option key={option} value={option} />)}
              </datalist>
              {fieldError('targetAudience') && <span className="text-xs text-red-400">{fieldError('targetAudience')}</span>}
            </label>

            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Priority</span>
              <select
                value={values.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full h-11 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
              >
                {priorityOptions.map((priority) => <option key={priority} value={priority} className="text-black">{priority}</option>)}
              </select>
              {fieldError('priority') && <span className="text-xs text-red-400">{fieldError('priority')}</span>}
            </label>
          </div>

          {values.targetAudience === 'specific users' && mode === 'create' && (
            <div className="rounded-2xl border border-white/10 bg-white/3 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 inline-flex items-center gap-2">
                  <FiUsers className="text-yellow-400" /> Specific Users ({recipientUsers.length} selected)
                </span>
                {usersLoading && <span className="text-[11px] text-gray-500">Loading users...</span>}
              </div>

              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search customers by name or email..."
                  className="w-full h-10 pl-9 pr-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50 text-sm"
                />
              </div>

              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <span key={user._id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[11px] font-semibold text-yellow-300">
                      {user.firstName} {user.lastName}
                      <button type="button" onClick={() => toggleRecipient(user._id)} className="hover:text-white"><FiX size={12} /></button>
                    </span>
                  ))}
                </div>
              )}

              <div className="max-h-44 overflow-y-auto space-y-1 rounded-xl border border-white/5 bg-black/20 p-2">
                {filteredUserOptions.length === 0 ? (
                  <p className="text-xs text-gray-500 p-3 text-center">{usersLoading ? 'Loading...' : 'No customers found.'}</p>
                ) : (
                  filteredUserOptions.map((user) => {
                    const selected = recipientUsers.includes(user._id);
                    return (
                      <label key={user._id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition text-sm ${selected ? 'bg-yellow-500/10 border border-yellow-500/20' : 'border border-transparent hover:bg-white/5'}`}>
                        <input type="checkbox" checked={selected} onChange={() => toggleRecipient(user._id)} className="accent-yellow-500" />
                        <span className="text-white font-medium">{user.firstName} {user.lastName}</span>
                        <span className="text-[11px] text-gray-500 truncate">{user.email}</span>
                      </label>
                    );
                  })
                )}
              </div>
              {fieldError('recipientUsers') && <span className="text-xs text-red-400">{fieldError('recipientUsers')}</span>}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Action URL (internal route)</span>
              <div className="relative">
                <FiLink2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={values.actionUrl}
                  onChange={(e) => handleChange('actionUrl', e.target.value)}
                  className="w-full h-11 pl-10 pr-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
                  placeholder="/promotion"
                />
              </div>
              {fieldError('actionUrl') && <span className="text-xs text-red-400">{fieldError('actionUrl')}</span>}
            </label>

            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Action Button Text (optional)</span>
              <input
                value={values.actionText}
                onChange={(e) => handleChange('actionText', e.target.value)}
                className="w-full h-11 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
                placeholder="e.g. View Sale"
              />
              {fieldError('actionText') && <span className="text-xs text-red-400">{fieldError('actionText')}</span>}
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Publish Status</span>
              <select
                value={values.publishStatus}
                onChange={(e) => handleChange('publishStatus', e.target.value)}
                className="w-full h-11 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
              >
                {publishOptions.map((status) => <option key={status} value={status} className="text-black">{status}</option>)}
              </select>
              {fieldError('publishStatus') && <span className="text-xs text-red-400">{fieldError('publishStatus')}</span>}
            </label>

            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Scheduled Date</span>
              <div className="relative">
                <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="datetime-local"
                  value={values.scheduledAt}
                  onChange={(e) => handleChange('scheduledAt', e.target.value)}
                  className="w-full h-11 pl-10 pr-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
                />
              </div>
              {fieldError('scheduledAt') && <span className="text-xs text-red-400">{fieldError('scheduledAt')}</span>}
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Expiration Date</span>
            <div className="relative">
              <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="datetime-local"
                value={values.expiresAt}
                onChange={(e) => handleChange('expiresAt', e.target.value)}
                className="w-full h-11 pl-10 pr-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
              />
            </div>
            {fieldError('expiresAt') && <span className="text-xs text-red-400">{fieldError('expiresAt')}</span>}
          </label>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-white/3 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <FiImage className="text-yellow-400" />
              Image Upload
            </div>
            <div className="border border-dashed border-white/10 rounded-2xl p-4 text-center bg-black/20">
              {imagePreview ? (
                <div className="space-y-3">
                  <img src={imagePreview} alt="Notification preview" className="w-full h-44 object-cover rounded-xl border border-white/10" />
                  <div className="flex items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 cursor-pointer hover:bg-white/10">
                      <FiUploadCloud size={14} />
                      Change
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={clearImage}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/10"
                    >
                      <FiX size={14} />
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-3 py-8 cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                    <FiUploadCloud size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Upload image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5 MB</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>
            {fieldError('image') && <span className="text-xs text-red-400">{fieldError('image')}</span>}
          </div>

          <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4 text-xs text-cyan-100 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <FiInfo />
              Notes
            </div>
            <p>Action URLs must be internal routes such as /promotion, /products/123, /orders/123, /account, or /notifications — never a full domain.</p>
            <p>Published notifications appear instantly in the target users' notification panel.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 border-t border-white/5 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(255,193,7,0.3)]"
        >
          {submitting ? 'Saving...' : submitLabel || (mode === 'create' ? 'Create Notification' : 'Save Changes')}
        </button>
      </div>
    </motion.form>
  );
};

export default NotificationForm;
