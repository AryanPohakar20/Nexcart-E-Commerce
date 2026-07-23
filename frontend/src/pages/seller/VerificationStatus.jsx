import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import sellerAuthService from '../../services/sellerAuthService';
import NexCartLogo from '../../components/NexCartLogo';

const VerificationStatus = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [status, setStatus] = useState(null);
  const [trustScore, setTrustScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await sellerAuthService.getVerificationStatus();
        if (response.success) {
          setStatus(response.data.status);
          setTrustScore(response.data.trustScore);
        }
      } catch (error) {
        console.error('Failed to fetch status', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchStatus();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070B12] flex items-center justify-center">
        <div className="text-primary font-bold animate-pulse">Checking Status...</div>
      </div>
    );
  }

  const renderStatusCard = () => {
    if (status === 'Verification Pending') {
      return (
        <div className="text-center">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiClock className="text-4xl" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Verification Pending</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Your profile and identity documents are currently under review. This usually takes 12-24 hours. We will notify you via email once approved.
          </p>
          <div className="bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-4 inline-block">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Current Trust Score</span>
            <div className="text-3xl font-black text-primary mt-1">{trustScore}/100</div>
          </div>
        </div>
      );
    }

    if (status === 'Marketplace Seller') {
      return (
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-4xl" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Verification Successful!</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Congratulations! You are now an approved Marketplace Seller on NexCart. You can now start listing your products.
          </p>
          <button 
            onClick={() => navigate('/seller/dashboard')}
            className="btn-glow-yellow py-3 px-8 text-sm text-black font-extrabold rounded-xl inline-flex items-center gap-2"
          >
            Go to Seller Dashboard <FiArrowRight />
          </button>
        </div>
      );
    }

    if (status === 'Rejected' || status === 'Suspended') {
      return (
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiAlertCircle className="text-4xl" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Account {status}</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Unfortunately, your seller account has been {status.toLowerCase()}. Please contact support for more information.
          </p>
        </div>
      );
    }

    // Default catch-all (Draft, etc)
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Registration Incomplete</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Please complete your seller onboarding to become a Marketplace Seller.
        </p>
        <button 
          onClick={() => navigate('/seller/onboarding')}
          className="btn-glow-yellow py-3 px-8 text-sm text-black font-extrabold rounded-xl inline-flex items-center gap-2"
        >
          Continue Onboarding <FiArrowRight />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070B12] text-gray-900 dark:text-white flex flex-col relative overflow-hidden">
      <nav className="flex justify-between items-center p-6 lg:px-12 relative z-10 border-b border-gray-200 dark:border-white/5 bg-white/50 dark:bg-[#0c111d]/50 backdrop-blur-xl">
        <NexCartLogo />
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">{user?.email}</span>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-10 rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl max-w-xl w-full"
        >
          {renderStatusCard()}
        </motion.div>
      </main>
      
      <div className="fixed top-[20%] right-[-10%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
};

export default VerificationStatus;
