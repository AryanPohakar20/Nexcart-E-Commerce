import React, { useContext, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiCalendar, FiEdit2, FiCheck, FiCamera, FiUploadCloud } from 'react-icons/fi';

const UserProfile = () => {
  const { showToast } = useContext(AppContext);
  const { user, updateUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.name || user?.username || 'User'),
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || user?.profilePicture || ''
  });

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result;
      setFormData((prev) => ({ ...prev, avatar: imageUrl }));
      if (updateUser) {
        updateUser({ avatar: imageUrl });
      }
      showToast('Profile photo updated successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      if (updateUser) {
        updateUser({
          firstName: formData.name.split(' ')[0],
          lastName: formData.name.split(' ').slice(1).join(' '),
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          avatar: formData.avatar
        });
      }
      setIsEditing(false);
      setIsSavedAlert(true);
      showToast('Profile changes saved successfully!', 'success');

      setTimeout(() => {
        setIsSavedAlert(false);
      }, 4000);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const currentAvatar = formData.avatar || user?.avatar || user?.profilePicture;

  return (
    <div className="space-y-8 text-left">
      {/* Hidden File Input for Image Upload */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-black text-white tracking-tight">My Profile</h1>
        <p className="text-xs text-gray-500 mt-1">Manage your account information, profile picture, and contact details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar Upload & Summary Box */}
        <div className="lg:col-span-1 bg-cardBg border border-white/5 p-6 rounded-3xl flex flex-col items-center text-center space-y-4 h-fit">
          
          {/* Avatar Upload Container */}
          <div className="relative group cursor-pointer" onClick={handleAvatarClick} title="Click to upload profile photo">
            {currentAvatar ? (
              <motion.img 
                src={currentAvatar} 
                alt="Avatar" 
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-28 h-28 rounded-full object-cover border-2 border-primary/50 shadow-yellow-glow"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-dashed border-primary/50 flex flex-col items-center justify-center text-primary font-black text-2xl shadow-yellow-glow">
                <span>{getInitials(formData.name)}</span>
                <span className="text-[9px] font-medium text-gray-400 mt-1 flex items-center gap-1">
                  <FiUploadCloud /> Upload
                </span>
              </div>
            )}

            {/* Hover Camera Overlay Badge */}
            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white text-xs font-bold gap-1">
              <FiCamera className="text-xl text-primary" />
              <span className="text-[10px]">Change Photo</span>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-white">{formData.name || user?.name || 'User'}</h2>
            <button 
              type="button" 
              onClick={handleAvatarClick}
              className="text-[10px] font-semibold text-primary hover:underline mt-1 flex items-center gap-1 mx-auto"
            >
              <FiCamera className="text-xs" />
              <span>{currentAvatar ? 'Change Photo' : 'Upload Photo'}</span>
            </button>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-medium italic">
            {formData.bio ? `"${formData.bio}"` : 'No bio added yet.'}
          </p>
          
          <div className="w-full border-t border-white/5 pt-4 text-xs space-y-2 text-gray-400">
            <div className="flex justify-between">
              <span>Account Role:</span>
              <span className="text-white font-bold uppercase">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span>Joined on:</span>
              <span className="text-white font-medium">{user?.joined || 'Jan 2026'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Information form fields */}
        <div className="lg:col-span-2 bg-cardBg border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Account Details</h3>
            <button 
              onClick={() => {
                setIsEditing(!isEditing);
                setIsSavedAlert(false);
              }}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5"
            >
              {isEditing ? <span>Cancel</span> : <><FiEdit2 /> <span>Edit Profile</span></>}
            </button>
          </div>

          <AnimatePresence>
            {isSavedAlert && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2.5 shadow-md"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <FiCheck className="text-emerald-400 text-xs" />
                </div>
                <span>Profile changes saved successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Display Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 pl-10 text-xs text-white focus:outline-none focus:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 mb-1 font-bold">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="email" 
                    value={user?.email || 'aravind@nexcart.com'}
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
                <label className="block text-gray-500 mb-1 font-bold">Avatar Image URL</label>
                <input 
                  type="text" 
                  value={formData.avatar}
                  onChange={(e) => setFormData(p => ({ ...p, avatar: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50 disabled:opacity-40"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 mb-1 font-bold">Short Bio</label>
              <textarea 
                rows="3"
                value={formData.bio}
                onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                disabled={!isEditing}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50 disabled:opacity-40 resize-none"
              />
            </div>

            {isEditing && (
              <button 
                type="submit"
                className="btn-glow-yellow !py-2.5 text-xs text-black font-bold flex items-center gap-1.5 btn-premium-interactive"
              >
                <FiCheck />
                <span>Save Changes</span>
              </button>
            )}

          </form>

        </div>

      </div>

    </div>
  );
};

export default UserProfile;
