import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiLock, FiShield, FiKey,
  FiCheck, FiSave, FiSmartphone, FiGlobe
} from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';

const AdminProfile = () => {
  const { user } = useContext(AppContext);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || 'Administrator',
    email: user?.email || 'admin@nexcart.in',
    phone: '+91 98765 43210',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    setPasswordSaved(true);
    setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white tracking-tight">Admin Profile & Security Credentials</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your root administrative profile, security passwords, and authorized session keys
        </p>
      </motion.div>

      {/* Profile Overview Card */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={user?.avatar || `https://i.pravatar.cc/150?img=60`}
            alt="Admin Avatar"
            className="w-24 h-24 rounded-2xl object-cover border-2 border-yellow-500/40 shadow-xl"
          />
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-[#1A1A1A]" />
        </div>
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-lg font-black text-white">{formData.name}</h2>
            <span className="bg-yellow-500/15 border border-yellow-500/20 text-yellow-400 text-[10px] uppercase font-black px-2 py-0.5 rounded-md">
              Root Administrator
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{formData.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-gray-500">
            <span>Privilege Level: <strong className="text-white">Tier 0 (Full Access)</strong></span>
            <span>2FA: <strong className="text-emerald-400">Enforced</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <form onSubmit={handleProfileUpdate} className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FiUser className="text-yellow-400" /> Personal Information
            </h3>
            {profileSaved && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <FiCheck /> Saved
              </span>
            )}
          </div>

          <div>
            <label className="block text-gray-400 font-bold mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-bold mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-bold mb-1">Direct Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-md mt-2"
          >
            Update Profile Information
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={handlePasswordUpdate} className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FiKey className="text-yellow-400" /> Security Password
            </h3>
            {passwordSaved && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <FiCheck /> Password Updated
              </span>
            )}
          </div>

          <div>
            <label className="block text-gray-400 font-bold mb-1">Current Password</label>
            <input
              type="password"
              required
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-bold mb-1">New Strong Password</label>
            <input
              type="password"
              required
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-bold mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 bg-white/10 text-white font-bold rounded-xl hover:bg-white/15 transition-all mt-2"
          >
            Update Security Password
          </button>
        </form>
      </div>

      {/* Active Login Sessions */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FiSmartphone className="text-yellow-400" /> Active Hardware Sessions
        </h3>
        <div className="divide-y divide-white/5 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <FiGlobe size={16} />
              </div>
              <div>
                <p className="font-bold text-white">Chrome on macOS (Current Session)</p>
                <p className="text-[10px] text-gray-500">IP: 103.21.144.92 • Mumbai, India</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Active Now
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
