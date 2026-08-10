import React, { useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import profileService from '../services/profileService';
import { 
  FiUser, FiMail, FiPhone, FiCalendar, FiEdit2, FiCheck, 
  FiUpload, FiLock, FiX, FiShield, FiClock, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';

const UserProfile = () => {
  const { user, setUser, showToast } = useContext(AppContext);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    gender: '',
    bio: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordError, setPasswordError] = useState('');

  // ─── Fetch profile from server on mount ──────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const fetchLatestProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const res = await profileService.getProfile();
        if (res?.data?.user && isMounted) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error('Failed to fetch live profile data:', err);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };

    fetchLatestProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Sync form state when user changes ───────────────────────────────────
  useEffect(() => {
    if (user) {
      const rawDob = user.dob || user.profile?.dob;
      let formattedDob = '';
      if (rawDob) {
        try {
          formattedDob = new Date(rawDob).toISOString().split('T')[0];
        } catch {
          formattedDob = '';
        }
      }

      setFormData({
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || (user.name?.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '') || '',
        phone: user.phone || '',
        dob: formattedDob,
        gender: user.gender || user.profile?.gender || '',
        bio: user.bio || user.profile?.bio || '',
      });
    }
  }, [user]);

  // ─── Save Profile ─────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender || undefined,
        bio: formData.bio.trim(),
      };
      if (formData.dob) {
        payload.dob = formData.dob;
      }

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
        setUser((prev) => ({
          ...prev,
          avatar: res.data.avatar,
          profile: { ...(prev?.profile || {}), avatar: res.data.avatar },
        }));
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

  // Calculate dynamic completion if not already saved
  const calculateDynamicCompletion = () => {
    if (user?.profileCompletion !== undefined && user?.profileCompletion !== null && user?.profileCompletion > 0) {
      return user.profileCompletion;
    }
    let score = 20; // Base score for account
    if (user?.avatar || user?.profile?.avatar) score += 15;
    if (user?.phone) score += 15;
    if (user?.dob || user?.profile?.dob) score += 10;
    if (user?.gender || user?.profile?.gender) score += 10;
    if (user?.bio || user?.profile?.bio) score += 10;
    if (user?.isVerified) score += 20;
    return Math.min(score, 100);
  };

  const completion = calculateDynamicCompletion();
  const avatarUrl = user?.avatar || user?.profile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80';
  const fullName = [user?.firstName || '', user?.lastName || ''].filter(Boolean).join(' ') || user?.name || user?.username || 'User';

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="border-b border-white/5 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Profile</h1>
          <p className="text-xs text-gray-400 mt-1">Manage personal details, security credentials, and preferences.</p>
        </div>
        
        {/* Profile Completion Badge */}
        <div className="bg-cardBg border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3">
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Profile Strength</div>
            <div className="text-xs font-black text-primary">{completion}% Completed</div>
          </div>
          <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 shadow-yellow-glow"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      {isLoadingProfile && !user ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-medium">Loading user profile details...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Column: Avatar & Account Summary Card ──────────────────── */}
          <div className="lg:col-span-1 bg-cardBg border border-white/10 p-6 rounded-3xl flex flex-col items-center text-center space-y-5 h-fit shadow-lg shadow-black/20">
            {/* Avatar with upload overlay */}
            <div className="relative group">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-28 h-28 rounded-full object-cover border-2 border-primary/50 shadow-yellow-glow bg-secondaryBg"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                title="Change avatar photo"
              >
                {isUploadingAvatar ? (
                  <span className="text-white text-[10px] font-bold animate-pulse">Uploading…</span>
                ) : (
                  <>
                    <FiUpload className="text-primary mb-1" size={20} />
                    <span className="text-white text-[10px] font-semibold">Change Photo</span>
                  </>
                )}
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
              <h2 className="text-lg font-bold text-white tracking-wide">
                {fullName}
              </h2>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-primary/10 border border-primary/30 text-primary px-3 py-0.5 rounded-full inline-block">
                  {user?.role === 'admin' ? 'Admin' : user?.role === 'seller' ? 'Verified Seller' : 'Elite Customer'}
                </span>
              </div>
            </div>

            {formData.bio ? (
              <p className="text-xs text-gray-300 leading-relaxed font-normal italic px-2 bg-white/[0.02] py-2 rounded-xl border border-white/5 w-full">
                "{formData.bio}"
              </p>
            ) : (
              <p className="text-xs text-gray-500 italic">No bio added yet.</p>
            )}

            <div className="w-full border-t border-white/10 pt-4 text-xs space-y-3 text-gray-400">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5"><FiShield size={13} className="text-primary/70" /> Account Role</span>
                <span className="text-white font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md text-[11px]">
                  {user?.role || 'Customer'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5"><FiClock size={13} className="text-primary/70" /> Member Since</span>
                <span className="text-gray-200 font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recent'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5"><FiCheckCircle size={13} className="text-primary/70" /> Email Verified</span>
                <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${user?.isVerified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                  {user?.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Change Password toggle button */}
            <button
              type="button"
              onClick={() => setIsChangingPassword((p) => !p)}
              className="w-full flex items-center justify-center gap-2 text-xs text-primary hover:text-white hover:bg-primary/20 font-bold border border-primary/30 rounded-xl py-2.5 transition-all cursor-pointer"
            >
              <FiLock size={13} />
              {isChangingPassword ? 'Cancel Password Change' : 'Change Password'}
            </button>
          </div>

          {/* ── Right Column: Account Details & Password ────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Account Details Form */}
            <div className="bg-cardBg border border-white/10 p-6 md:p-8 rounded-3xl space-y-6 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FiUser className="text-primary" /> Personal Information
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Your official account profile details</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                    isEditing 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
                      : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                  }`}
                >
                  {isEditing ? <><FiX size={13} /><span>Cancel</span></> : <><FiEdit2 size={13} /><span>Edit Profile</span></>}
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* First Name */}
                  <div>
                    <label className="block text-gray-300 mb-1.5 font-bold">First Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                          placeholder="First Name"
                          className="w-full bg-secondaryBg border border-primary/40 rounded-xl p-3 pl-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                        />
                      ) : (
                        <div className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 pl-10 text-xs text-white font-medium">
                          {formData.firstName || <span className="text-gray-500 italic">Not specified</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-gray-300 mb-1.5 font-bold">Last Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                          placeholder="Last Name"
                          className="w-full bg-secondaryBg border border-primary/40 rounded-xl p-3 pl-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                        />
                      ) : (
                        <div className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 pl-10 text-xs text-white font-medium">
                          {formData.lastName || <span className="text-gray-500 italic">Not specified</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-gray-300 mb-1.5 font-bold">Email Address</label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <div className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-3 pl-10 text-xs text-gray-300 font-medium flex items-center justify-between">
                        <span>{user?.email || 'N/A'}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">Primary</span>
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-gray-300 mb-1.5 font-bold">Contact Phone Number</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="10-digit phone number"
                          className="w-full bg-secondaryBg border border-primary/40 rounded-xl p-3 pl-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                        />
                      ) : (
                        <div className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 pl-10 text-xs text-white font-medium">
                          {formData.phone || <span className="text-gray-500 italic">Not specified</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-gray-300 mb-1.5 font-bold">Date of Birth</label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="date"
                          value={formData.dob}
                          onChange={(e) => setFormData((p) => ({ ...p, dob: e.target.value }))}
                          className="w-full bg-secondaryBg border border-primary/40 rounded-xl p-3 pl-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                        />
                      ) : (
                        <div className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 pl-10 text-xs text-white font-medium">
                          {formData.dob ? new Date(formData.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : <span className="text-gray-500 italic">Not specified</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-gray-300 mb-1.5 font-bold">Gender</label>
                    {isEditing ? (
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value }))}
                        className="w-full bg-secondaryBg border border-primary/40 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                      >
                        <option value="" className="bg-[#121212] text-gray-300">Select gender</option>
                        <option value="Male" className="bg-[#121212] text-white">Male</option>
                        <option value="Female" className="bg-[#121212] text-white">Female</option>
                        <option value="Other" className="bg-[#121212] text-white">Other</option>
                      </select>
                    ) : (
                      <div className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-white font-medium">
                        {formData.gender ? (
                          <span className="bg-primary/15 text-primary border border-primary/20 px-2.5 py-1 rounded-lg font-semibold">
                            {formData.gender}
                          </span>
                        ) : (
                          <span className="text-gray-500 italic">Not specified</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-gray-300 mb-1.5 font-bold">Short Bio</label>
                  {isEditing ? (
                    <>
                      <textarea
                        rows="3"
                        value={formData.bio}
                        onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                        maxLength={500}
                        placeholder="Tell us a little bit about yourself..."
                        className="w-full bg-secondaryBg border border-primary/40 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 resize-none transition-all"
                      />
                      <p className="text-[10px] text-gray-400 mt-1 text-right font-medium">{formData.bio.length}/500</p>
                    </>
                  ) : (
                    <div className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-white font-medium min-h-[70px]">
                      {formData.bio || <span className="text-gray-500 italic">No bio provided. Click 'Edit Profile' to introduce yourself!</span>}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="btn-glow-yellow !py-2.5 !px-6 text-xs text-black font-bold flex items-center gap-2 btn-premium-interactive disabled:opacity-60 cursor-pointer"
                    >
                      <FiCheck size={14} />
                      <span>{isSaving ? 'Saving Changes…' : 'Save Profile Changes'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className="px-5 py-2.5 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all border border-white/10 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
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
                  className="bg-cardBg border border-white/10 p-6 md:p-8 rounded-3xl space-y-5 shadow-lg shadow-black/20"
                >
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <FiLock className="text-primary" size={14} /> Update Security Password
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Ensure your account is protected with a strong passphrase</p>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
                    {passwordError && (
                      <div className="text-rose-400 text-xs font-medium bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-2">
                        <FiAlertCircle size={14} className="shrink-0" />
                        <span>{passwordError}</span>
                      </div>
                    )}
                    <div>
                      <label className="block text-gray-300 mb-1.5 font-bold">Current Password</label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
                        className="w-full bg-secondaryBg border border-white/15 focus:border-primary rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-1.5 font-bold">New Password</label>
                        <input
                          type="password"
                          placeholder="At least 6 characters"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                          className="w-full bg-secondaryBg border border-white/15 focus:border-primary rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1.5 font-bold">Confirm New Password</label>
                        <input
                          type="password"
                          placeholder="Re-type new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                          className="w-full bg-secondaryBg border border-white/15 focus:border-primary rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="btn-glow-yellow !py-2.5 !px-6 text-xs text-black font-bold flex items-center gap-2 btn-premium-interactive disabled:opacity-60 cursor-pointer"
                      >
                        <FiCheck size={14} />
                        <span>{isSaving ? 'Updating Password…' : 'Save New Password'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsChangingPassword(false)}
                        className="px-5 py-2.5 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all border border-white/10 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;

