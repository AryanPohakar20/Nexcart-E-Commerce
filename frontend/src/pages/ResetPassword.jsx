import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FiLock, FiChevronRight, FiKey, FiMail } from 'react-icons/fi';

import authService from '../services/authService';

/**
 * ResetPassword — Change password using current password for identity verification.
 * OTP-based reset removed. User must know current password.
 */
const ResetPassword = () => {
  const { showToast } = useContext(AppContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast('Please enter your email address', 'error');
      return;
    }
    if (!currentPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }

    try {
      await authService.resetPassword(email, currentPassword, password);
      showToast('Password changed successfully! Please log in with your new password.', 'success');
      navigate('/login');
    } catch (error) {
      showToast(error.message || 'Failed to change password', 'error');
    }
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center py-6">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-left relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="text-2xl font-bold tracking-wider text-primary">Nex<span className="text-white">Cart</span></Link>
          <p className="text-xs text-gray-500 font-medium">Change Password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            Enter your email and current password to verify your identity, then set a new password.
          </p>

          {/* Email */}
          <div>
            <label className="block text-gray-500 mb-1 font-bold">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                placeholder="alex@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 text-xs text-white focus:outline-none focus:border-primary/50"
                required
              />
            </div>
          </div>

          {/* Current Password */}
          <div>
            <label className="block text-gray-500 mb-1 font-bold">Current Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                placeholder="Your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 text-xs text-white focus:outline-none focus:border-primary/50"
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-gray-500 mb-1 font-bold">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 text-xs text-white focus:outline-none focus:border-primary/50"
                required
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-gray-500 mb-1 font-bold">Confirm New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 text-xs text-white focus:outline-none focus:border-primary/50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-glow-yellow !py-3 text-xs text-black font-extrabold rounded-lg flex items-center justify-center gap-1.5"
          >
            <FiKey />
            <span>Change Password</span>
            <FiChevronRight />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/5 text-[10px] text-gray-500">
          <Link to="/login" className="text-primary hover:underline font-bold">Back to Login</Link>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
