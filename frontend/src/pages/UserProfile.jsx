import React, { useContext, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import profileService from '../services/profileService';
import { FiUser, FiMail, FiPhone, FiCalendar, FiEdit2, FiCheck, FiUpload, FiLock, FiX } from 'react-icons/fi';

const UserProfile = () => {
  const { user, setUser, showToast } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    gender: user?.gender || '',
    bio: user?.bio || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordError, setPasswordError] = useState('');

  // ─── Sync form when user changes ──────────────────────────────────────────
  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        bio: user.bio || '',
      });
    }
  }, [user?._id]);

  // ─── Save Profile ─────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {};
      if (formData.firstName.trim()) payload.firstName = formData.firstName.trim();
      if (formData.lastName.trim()) payload.lastName = formData.lastName.trim();
      if (formData.phone.trim()) payload.phone = formData.phone.trim();
      if (formData.dob) payload.dob = formData.dob;
      if (formData.gender) payload.gender = formData.gender;
      if (formData.bio !== undefined) payload.bio = formData.bio;

      const res = await profileService.updateProfile(payload);
      if (res?.data?.user) {
        setUser(res.data.user);
        showToast('Profile Updated Successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      showToast(err?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Avatar Upload ────────────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      showToast('Only JPEG, PNG and WEBP images are allowed', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be smaller than 5 MB', 'error');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const res = await profileService.uploadAvatar(file);
      if (res?.data?.avatar) {
        setUser((prev) => ({ ...prev, avatar: res.data.avatar }));
        showToast('Avatar updated successfully!');
      }
    } catch (err) {
      showToast(err?.message || 'Failed to upload avatar', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ─── Change Password ──────────────────────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setIsSaving(true);
    try {
      await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showToast('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err?.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Completion badge ─────────────────────────────────────────────────────
  const completion = user?.profileCompletion ?? 0;

  return (
    <div className="space-y-8 text-left">
      <div className="border-b border-white/5 pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">My Profile</h1>
          <p className="text-xs text-gray-500 mt-1">Manage user information, contact data, and vendor memberships.</p>
        </div>
        {/* Profile Completion Badge */}
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1 font-bold">Profile Completion</div>
          <div className="flex items-center gap-2">
            <div className="w-28 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-xs font-bold text-primary">{completion}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Avatar & Summary Box */}
        <div className="lg:col-span-1 bg-cardBg border border-white/5 p-6 rounded-3xl flex flex-col items-center text-center space-y-4 h-fit">
          {/* Avatar with upload overlay */}
          <div className="relative group">
            <motion.img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'}
              alt="Avatar"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-full object-cover border-2 border-primary/40 shadow-yellow-glow"
            />
            {/* Upload overlay */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              title="Upload avatar"
            >
              {isUploadingAvatar
                ? <span className="text-white text-[10px] font-bold">Uploading…</span>
                : <FiUpload className="text-white" size={18} />
              }
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div>
            <h2 className="text-base font-bold text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            <span className="text-[9px] font-extrabold uppercase tracking-widest bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full inline-block mt-1">
              Member Level: Elite
            </span>
          </div>
          {user?.bio && (
            <p className="text-xs text-gray-400 leading-relaxed font-medium italic">"{user.bio}"</p>
          )}

          <div className="w-full border-t border-white/5 pt-4 text-xs space-y-2 text-gray-400">
            <div className="flex justify-between">
              <span>Account Role:</span>
              <span className="text-white font-bold uppercase">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span>Joined on:</span>
              <span className="text-white font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Email Verified:</span>
              <span className={`font-bold ${user?.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                {user?.isVerified ? 'Yes' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Change Password toggle */}
          <button
            onClick={() => setIsChangingPassword((p) => !p)}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-primary/80 hover:text-primary font-bold border border-primary/20 rounded-xl py-2 transition-all"
          >
            <FiLock size={12} />
            {isChangingPassword ? 'Cancel Password Change' : 'Change Password'}
          </button>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Account Details Form */}
          <div className="bg-cardBg border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Account Details</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5"
              >
                {isEditing ? <><FiX size={12} /><span>Cancel</span></> : <><FiEdit2 size={12} /><span>Edit Profile</span></>}
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">First Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 pl-10 text-xs text-white focus:outline-none focus:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-bold">Last Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 pl-10 text-xs text-white focus:outline-none focus:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-bold">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 pl-10 text-xs text-white opacity-40 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-bold">Contact Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 pl-10 text-xs text-white focus:outline-none focus:border-primary/50 disabled:opacity-40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-bold">Date of Birth</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData(p => ({ ...p, dob: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 pl-10 text-xs text-white focus:outline-none focus:border-primary/50 disabled:opacity-40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-bold">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(p => ({ ...p, gender: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50 disabled:opacity-40"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-500 mb-1 font-bold">Short Bio</label>
                <textarea
                  rows="3"
                  value={formData.bio}
                  onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                  disabled={!isEditing}
                  maxLength={500}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50 disabled:opacity-40 resize-none"
                />
                {isEditing && (
                  <p className="text-[10px] text-gray-600 mt-1 text-right">{formData.bio.length}/500</p>
                )}
              </div>

              {isEditing && (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-glow-yellow !py-2.5 text-xs text-black font-bold flex items-center gap-1.5 btn-premium-interactive disabled:opacity-60"
                >
                  <FiCheck />
                  <span>{isSaving ? 'Saving…' : 'Save Changes'}</span>
                </button>
              )}
            </form>
          </div>

          {/* Change Password Panel */}
          <AnimatePresence>
            {isChangingPassword && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-cardBg border border-white/5 p-6 md:p-8 rounded-3xl space-y-4"
              >
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FiLock size={13} /> Change Password
                  </h3>
                </div>
                <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
                  {passwordError && (
                    <p className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      {passwordError}
                    </p>
                  )}
                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-glow-yellow !py-2.5 text-xs text-black font-bold flex items-center gap-1.5 btn-premium-interactive disabled:opacity-60"
                  >
                    <FiCheck />
                    <span>{isSaving ? 'Changing…' : 'Change Password'}</span>
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
