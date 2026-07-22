import React, { useState, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FiLock, FiChevronRight, FiKey } from 'react-icons/fi';

import authService from '../services/authService';

const ResetPassword = () => {
  const { showToast } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'user@nexcart.com';
  const otp = searchParams.get('otp') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }
    
    try {
      await authService.resetPassword(email, otp, password);
      showToast('Password reset successfully! Please log in.', 'success');
      navigate('/login');
    } catch (error) {
      showToast(error.message || 'Failed to reset password', 'error');
    }
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center py-6">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-left relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="text-2xl font-bold tracking-wider text-primary">NEX<span className="text-white">CART</span></Link>
          <p className="text-xs text-gray-500 font-medium">Reset Password reset</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-500 mb-1 font-bold">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="password" 
                placeholder="******" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 text-xs text-white focus:outline-none focus:border-primary/50" 
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 mb-1 font-bold">Confirm New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="password" 
                placeholder="******" 
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
            <span>Reset Password & Login</span>
          </button>
        </form>

      </div>
    </div>
  );
};

export default ResetPassword;
