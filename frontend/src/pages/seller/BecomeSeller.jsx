import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiShield, FiUsers, FiArrowRight } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import NexCartLogo from '../../components/NexCartLogo';
import ThemeToggle from '../../components/ThemeToggle';

const BecomeSeller = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070B12] text-gray-900 dark:text-white relative overflow-hidden flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 lg:px-12 relative z-10">
        <NexCartLogo />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/login" className="text-sm font-semibold hover:text-primary transition-colors">
            Login
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 -mt-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4 border border-primary/20">
            Marketplace Seller
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Sell Your Products to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">
              Millions of Buyers
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Join the NexCart Marketplace. Open your online shop in 5 minutes, list your items, and start earning money today.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/seller/onboarding')}
              className="btn-glow-yellow py-4 px-10 text-sm text-black font-extrabold rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              Start Selling Now <FiArrowRight className="text-lg" />
            </button>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          {[
            { icon: <FiTrendingUp />, title: 'Grow Your Sales', desc: 'Reach a massive audience of active buyers looking for your products.' },
            { icon: <FiShield />, title: 'Secure Payments', desc: 'Get paid directly to your bank account or UPI safely and securely.' },
            { icon: <FiUsers />, title: 'Seller Community', desc: 'Join thousands of successful independent sellers on NexCart.' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="glass-card p-8 rounded-3xl border border-gray-200 dark:border-white/10 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-2xl mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Decorative Background Elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />
    </div>
  );
};

export default BecomeSeller;
