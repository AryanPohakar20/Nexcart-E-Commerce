import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiShield, FiUsers, FiArrowRight } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import NexCartLogo from '../../components/NexCartLogo';
import ThemeToggle from '../../components/ThemeToggle';

const BecomeSeller = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const userName = user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.username || user?.email?.split('@')[0] || 'User');
  const userInitial = (userName.trim()[0] || 'U').toUpperCase();

  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary relative overflow-hidden flex flex-col transition-colors duration-250">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 lg:px-12 relative z-10">
        <NexCartLogo />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <Link to="/profile" className="flex items-center gap-2 p-0.5 rounded-full border border-primary/50 hover:border-primary transition-all" title={userName}>
              {user.avatar ? (
                <img src={user.avatar} alt={userName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-amber-400 text-black font-black flex items-center justify-center text-xs">
                  {userInitial}
                </div>
              )}
            </Link>
          ) : (
            <Link to="/login" className="text-sm font-semibold text-textSecondary hover:text-primary transition-colors">
              Login
            </Link>
          )}
        </div>
      </nav>



      {/* Decorative Background Elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />
    </div>
  );
};

export default BecomeSeller;
