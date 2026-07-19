import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FiMail, FiChevronRight } from 'react-icons/fi';

const ForgotPassword = () => {
  const { showToast } = useContext(AppContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      showToast('Reset verification link sent to your mailbox!', 'info');
      // Redirect to Reset screen (for demo)
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center py-6">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-left relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="text-2xl font-bold tracking-wider text-primary">NEX<span className="text-white">CART</span></Link>
          <p className="text-xs text-gray-500 font-medium">Forgot Password Recovery</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            Enter your email below and we will send you a secure link to reset your account password.
          </p>

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

          <button 
            type="submit" 
            className="w-full btn-glow-yellow !py-3 text-xs text-black font-extrabold rounded-lg flex items-center justify-center gap-1"
          >
            <span>Send Reset Code</span>
            <FiChevronRight />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/5 text-[10px] text-gray-500">
          <span>Remembered credentials? </span>
          <Link to="/login" className="text-primary hover:underline font-bold">Log In</Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
