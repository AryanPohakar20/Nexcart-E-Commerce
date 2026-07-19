import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FiMail, FiLock, FiChevronRight, FiCheck } from 'react-icons/fi';

const Login = () => {
  const { loginUser } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // customer, seller, admin

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      loginUser(email, password, role);
      if (role === 'seller') navigate('/seller/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    }
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center py-6">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-left relative overflow-hidden">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="text-2xl font-bold tracking-wider text-primary">NEX<span className="text-white">CART</span></Link>
          <p className="text-xs text-gray-500 font-medium">Shop Beyond Limits | Account Login</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-500 mb-1 font-bold">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="email" 
                placeholder="buyer@nexcart.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 text-xs text-white focus:outline-none focus:border-primary/50" 
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="block text-gray-500 font-bold">Password</label>
              <Link to="/forgot-password" className="text-[10px] text-primary hover:underline">Forgot?</Link>
            </div>
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

          {/* Demonstration role switcher checkbox/select */}
          <div>
            <label className="block text-gray-500 mb-1.5 font-bold">Log in as</label>
            <div className="grid grid-cols-3 gap-2">
              {['customer', 'seller', 'admin'].map(r => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2 border rounded-lg uppercase tracking-wider text-[9px] font-extrabold transition-all ${
                    role === r 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-white/5 bg-white/5 text-gray-500 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full btn-glow-yellow !py-3 text-xs text-black font-extrabold rounded-lg flex items-center justify-center gap-1"
          >
            <span>Log In</span>
            <FiChevronRight />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/5 text-[10px] text-gray-500">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-primary hover:underline font-bold">Register Now</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
