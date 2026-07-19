import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { FiUser, FiMail, FiPhone, FiCalendar, FiEdit2, FiCheck } from 'react-icons/fi';

const UserProfile = () => {
  const { user, setUser, showToast } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      setUser(prev => ({
        ...prev,
        ...formData
      }));
      setIsEditing(false);
      showToast('Profile Updated Successfully!');
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-black text-white tracking-tight">My Profile Profile</h1>
        <p className="text-xs text-gray-500 mt-1">Manage user information, contact data, and vendor memberships.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Summary Box */}
        <div className="lg:col-span-1 bg-cardBg border border-white/5 p-6 rounded-3xl flex flex-col items-center text-center space-y-4 h-fit">
          <img 
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'} 
            alt="Avatar" 
            className="w-24 h-24 rounded-full object-cover border-2 border-primary/40 shadow-yellow-glow"
          />
          <div>
            <h2 className="text-base font-bold text-white">{user?.name}</h2>
            <span className="text-[9px] font-extrabold uppercase tracking-widest bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full inline-block mt-1">
              Member Level: Elite
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-medium italic">"{user?.bio}"</p>
          
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
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5"
            >
              {isEditing ? <span>Cancel</span> : <><FiEdit2 /> <span>Edit Profile</span></>}
            </button>
          </div>

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
                className="btn-glow-yellow !py-2.5 text-xs text-black font-bold flex items-center gap-1.5"
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
