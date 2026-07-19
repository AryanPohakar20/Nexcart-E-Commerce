import React, { useState, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FiUnlock, FiKey } from 'react-icons/fi';

const OTPVerification = () => {
  const { loginUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'user@nexcart.com';

  const [otp, setOtp] = useState(['', '', '', '']);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length === 4) {
      loginUser(email, '123456', 'customer');
      navigate('/');
    }
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center py-6">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-left relative overflow-hidden">
        
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="text-2xl font-bold tracking-wider text-primary">NEX<span className="text-white">CART</span></Link>
          <p className="text-xs text-gray-500 font-medium">Verification Code Verification</p>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-gray-400 leading-relaxed font-medium text-center">
            We have sent a 4-digit code to <strong className="text-white">{email}</strong>. Enter it below to authorize.
          </p>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                  className="w-12 h-12 bg-black/40 border border-white/10 rounded-xl text-center text-lg text-white font-extrabold focus:outline-none focus:border-primary/50"
                  required
                />
              ))}
            </div>

            <button 
              type="submit" 
              className="w-full btn-glow-yellow !py-3 text-xs text-black font-extrabold rounded-lg flex items-center justify-center gap-1.5"
            >
              <FiUnlock />
              <span>Verify Code & Continue</span>
            </button>
          </form>
        </div>

        <div className="text-center pt-2 border-t border-white/5 text-[10px] text-gray-500">
          <span>Didn't receive OTP? </span>
          <button 
            type="button"
            onClick={() => setOtp(['', '', '', ''])} 
            className="text-primary hover:underline font-bold"
          >
            Resend SMS
          </button>
        </div>

      </div>
    </div>
  );
};

export default OTPVerification;
