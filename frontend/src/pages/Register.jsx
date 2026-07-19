import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FiUser, FiMail, FiPhone, FiLock, FiChevronRight } from 'react-icons/fi';

const Register = () => {
  const { showToast } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.password) {
      showToast('Registration Code Sent via SMS/Email!', 'info');
      // Forward to OTP screen
      navigate(`/otp-verification?email=${encodeURIComponent(formData.email)}`);
    }
  };

  return (
    <div className="min-h-[550px] flex items-center justify-center py-6">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-left relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="text-2xl font-bold tracking-wider text-primary">NEX<span className="text-white">CART</span></Link>
          <p className="text-xs text-gray-500 font-medium">Create a free NexCart Profile</p>
        </div>

        {/* Register form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-500 mb-1 font-bold">Display Name</label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Alex Johnson" 
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 text-xs text-white focus:outline-none focus:border-primary/50" 
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
                placeholder="alex@gmail.com" 
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 text-xs text-white focus:outline-none focus:border-primary/50" 
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 mb-1 font-bold">Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="+91 99887 76655" 
                value={formData.phone}
                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 text-xs text-white focus:outline-none focus:border-primary/50" 
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 mb-1 font-bold">Secure Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="password" 
                placeholder="******" 
                value={formData.password}
                onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 text-xs text-white focus:outline-none focus:border-primary/50" 
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full btn-glow-yellow !py-3 text-xs text-black font-extrabold rounded-lg flex items-center justify-center gap-1"
          >
            <span>Register Account</span>
            <FiChevronRight />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/5 text-[10px] text-gray-500">
          <span>Already have an account? </span>
          <Link to="/login" className="text-primary hover:underline font-bold">Login Here</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
