import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiHelpCircle } from 'react-icons/fi';

/**
 * ForgotPassword — Account Recovery Info Page
 * 
 * Email-based OTP password reset has been removed from this deployment.
 * Users can change their password via the in-app Reset Password page
 * (requires knowing current password), or contact support.
 */
const ForgotPassword = () => {
  return (
    <div className="min-h-[500px] flex items-center justify-center py-6">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-left relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="text-2xl font-bold tracking-wider text-primary">Nex<span className="text-white">Cart</span></Link>
          <p className="text-xs text-gray-500 font-medium">Account Recovery</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FiHelpCircle className="text-primary" size={26} />
            </div>
            <h2 className="text-sm font-bold text-white text-center">How to Recover Access</h2>
          </div>

          <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
            <div className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
              <FiLock className="text-primary mt-0.5 flex-shrink-0" size={14} />
              <div>
                <p className="font-bold text-white mb-0.5">Know your current password?</p>
                <p>Use the <span className="text-primary font-semibold">Reset Password</span> page to change it directly — no email required.</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
              <FiMail className="text-primary mt-0.5 flex-shrink-0" size={14} />
              <div>
                <p className="font-bold text-white mb-0.5">Forgot your password completely?</p>
                <p>Contact our support team at <span className="text-primary font-semibold">support@nexcart.com</span> for manual account recovery assistance.</p>
              </div>
            </div>
          </div>

          <Link
            to="/reset-password"
            className="block w-full btn-glow-yellow !py-3 text-xs text-black font-extrabold rounded-lg text-center"
          >
            Go to Reset Password →
          </Link>
        </div>

        <div className="text-center pt-2 border-t border-white/5 text-[10px] text-gray-500">
          <span>Remembered credentials? </span>
          <Link to="/login" className="text-primary hover:underline font-bold">Log In</Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
