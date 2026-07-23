import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import NexCartLogo from '../components/NexCartLogo';
import ThemeToggle from '../components/ThemeToggle';

import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiCheck, 
  FiArrowRight, 
  FiZap, 
  FiShield, 
  FiCpu, 
  FiAlertCircle, 
  FiLoader, 
  FiHelpCircle
} from 'react-icons/fi';

const Login = () => {
  const { showToast, theme } = useContext(AppContext);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // customer, seller, admin
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Validation & UI states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Floating Particles data
  const particles = Array.from({ length: 16 });

  // Real-time Field Validation logic
  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'email') {
      if (!value.trim()) {
        errorMsg = 'Email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorMsg = 'Please enter a valid email address';
      }
    }

    if (name === 'password') {
      if (!value) {
        errorMsg = 'Password is required';
      } else if (value.length < 6) {
        errorMsg = 'Password must be at least 6 characters';
      }
    }

    return errorMsg;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = field === 'email' ? email : password;
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field, value) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);

    if (touched[field]) {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ email: true, password: true });

    const emailErr = validateField('email', email);
    const passErr = validateField('password', password);

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      showToast('Please fix the errors before submitting', 'error');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await login(email, password);
      
      if (result.success) {
        setIsSuccess(true);
        showToast('Login successful!');
        
        setTimeout(() => {
          const userRole = (result.user?.role || '').toLowerCase();
          if (userRole === 'seller' || userRole === 'marketplaceseller') navigate('/seller/dashboard');
          else if (userRole === 'admin') navigate('/admin/dashboard');
          else navigate('/');
        }, 800);
      } else {
        setIsSubmitting(false);
        setErrors({ ...result.errors, email: result.message || 'Login failed' });
        showToast(result.message || 'Invalid credentials', 'error');
      }
    } catch (error) {
      setIsSubmitting(false);
      showToast('Something went wrong. Please try again.', 'error');
    }
  };

  const handleSocialLogin = (provider) => {
    setIsSubmitting(true);
    showToast(`Connecting to ${provider}...`);
    setTimeout(async () => {
      // For now, simulated social login using the same endpoint logic or fallback
      const mockEmail = `user@${provider.toLowerCase()}.com`;
      const result = await login(mockEmail, 'social123');
      
      setIsSubmitting(false);
      
      if (result.success) {
        showToast(`Authenticated via ${provider}!`);
        const userRole = (result.user?.role || '').toLowerCase();
        if (userRole === 'seller' || userRole === 'marketplaceseller') navigate('/seller/dashboard');
        else if (userRole === 'admin') navigate('/admin/dashboard');
        else navigate('/');
      } else {
        showToast(`Authentication via ${provider} failed.`, 'error');
      }
    }, 900);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F8F9FB] dark:bg-[#070B12] text-gray-900 dark:text-white flex flex-col justify-between overflow-hidden font-sans select-none transition-colors duration-400">
      
      {/* Background Animated Elements & Ambient Glow Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[650px] h-[650px] bg-accentBlue/15 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[120px]" />

        {/* SVG Circuit Trace Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-15 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
          <pattern id="circuitGrid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(0, 200, 255, 0.15)" strokeWidth="1" />
            <circle cx="100" cy="0" r="3" fill="#00C8FF" opacity="0.4" />
            <circle cx="0" cy="100" r="3" fill="#FFC107" opacity="0.4" />
            <path d="M 0 50 Q 25 25 50 50 T 100 50" fill="none" stroke="rgba(255, 193, 7, 0.1)" strokeWidth="1" strokeDasharray="4 4" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#circuitGrid)" />
        </svg>

        {/* Floating Sparkle Particles */}
        {particles.map((_, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full"
            style={{
              width: (index % 3 + 2) + 'px',
              height: (index % 3 + 2) + 'px',
              backgroundColor: index % 2 === 0 ? '#FFC107' : '#00C8FF',
              left: `${(index * 6.5) % 100}%`,
              top: `${(index * 7.2) % 100}%`,
              boxShadow: index % 2 === 0 ? '0 0 10px #FFC107' : '0 0 10px #00C8FF'
            }}
            animate={{
              y: [0, -35, 0],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: 4 + (index % 4),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.2
            }}
          />
        ))}
      </div>

      {/* Main Split Layout Container */}
      <div className="relative z-10 flex-grow grid grid-cols-1 lg:grid-cols-12 min-h-screen w-full">
        
        {/* ================= LEFT SIDE (60% Desktop Width) ================= */}
        <div className="lg:col-span-7 flex flex-col justify-between p-8 lg:p-16 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/5 bg-gradient-to-br from-[#FFFFFF] via-[#F1F5F9] to-[#F8F9FB] dark:from-[#070B12] dark:via-[#0b101d] dark:to-[#070B12] transition-colors duration-400">
          
          {/* Top Brand Nav Header & Theme Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <Link to="/" className="hover:opacity-90 transition-opacity">
              <NexCartLogo size="md" />
            </Link>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-xs font-mono text-gray-700 dark:text-gray-300 backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-gray-400">STATUS:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">NEURAL NET ONLINE</span>
              </div>
            </div>
          </motion.div>

          {/* Central Animated Visual Showcase & Tagline */}
          <div className="my-12 lg:my-auto max-w-xl space-y-8 text-left">
            
            {/* AI Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-accentBlue/10 to-transparent border border-primary/30 text-xs font-semibold text-primary backdrop-blur-xl shadow-yellow-glow"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="tracking-wider uppercase font-mono">✦ AI-POWERED ECOMMERCE V2.4</span>
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-none font-sans">
                <span className="text-gray-900 dark:text-white block">SHOP BEYOND</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-accentBlue drop-shadow-[0_0_25px_rgba(255,193,7,0.3)] block">
                  LIMITS.
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-600 dark:text-[#AAB4C5] font-light leading-relaxed max-w-lg">
                Experience the future of smart shopping with AI-powered recommendations, secure checkout, and unlimited possibilities.
              </p>
            </motion.div>

            {/* Floating Abstract Cards Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4"
            >
              <div className="group relative p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 backdrop-blur-xl hover:border-primary/50 transition-all duration-300 shadow-sm dark:shadow-none hover:shadow-yellow-glow">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <FiCpu className="text-xl" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-mono">NEURAL RECOMMENDATIONS</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      99.8% Precision Match
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold">ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 backdrop-blur-xl hover:border-accentBlue/50 transition-all duration-300 shadow-sm dark:shadow-none hover:shadow-blue-glow">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-accentBlue/10 text-accentBlue group-hover:scale-110 transition-transform">
                    <FiZap className="text-xl" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-mono">SUB-MS CHECKOUT</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      Instant 1-Click Pay
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-accentBlue/20 text-accentBlue font-extrabold">0.2ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Left CTA Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="pt-2"
            >
              <Link
                to="/products"
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/15 text-gray-900 dark:text-white font-semibold text-sm hover:border-primary/50 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <span>Explore NexCart</span>
                <FiArrowRight className="text-primary group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </motion.div>

          </div>

          {/* Left Bottom Feature Pills */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center gap-6 text-xs text-gray-500 dark:text-gray-400 font-mono pt-6 border-t border-gray-200 dark:border-white/5"
          >
            <div className="flex items-center gap-2">
              <FiShield className="text-primary text-base" />
              <span>256-BIT QUANTUM ENCRYPTED</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accentBlue font-bold">∞</span>
              <span>UNLIMITED POSSIBILITIES</span>
            </div>
          </motion.div>

        </div>


        {/* ================= RIGHT SIDE (40% Desktop Width) ================= */}
        <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative">
          
          {/* Centered Glass Login Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-md bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[24px] p-8 sm:p-10 shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden group hover:border-primary/40 transition-all duration-400"
          >
            {/* Top Glowing Light accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full blur-[1px]" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />

            {/* Card Header & Logo */}
            <div className="text-center space-y-3 mb-8">
              <div className="flex justify-center mb-2">
                <NexCartLogo size="lg" animated={true} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
                <span>Welcome Back</span>
                <span className="inline-block animate-bounce origin-bottom-right">👋</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-[#AAB4C5]">
                Sign in to continue shopping
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="mb-6 p-1 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 grid grid-cols-3 gap-1 text-[11px] font-bold uppercase tracking-wider">
              {['customer', 'seller', 'admin'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-lg transition-all duration-200 ${
                    role === r
                      ? 'bg-gradient-to-r from-primary to-amber-500 text-black shadow-yellow-glow font-black'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              
              {/* Email Input Field */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Email Address <span className="text-primary">*</span>
                </label>
                <div className="relative group/input">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary transition-colors">
                    <FiMail className="text-lg" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="name@nexcart.com"
                    aria-invalid={!!errors.email}
                    className={`w-full bg-gray-50 dark:bg-black/50 border rounded-xl py-3.5 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 focus:outline-none ${
                      errors.email && touched.email
                        ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-shake'
                        : 'border-gray-200 dark:border-white/10 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-yellow-glow'
                    }`}
                  />
                </div>
                {/* Error message */}
                <AnimatePresence>
                  {errors.email && touched.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium pt-0.5"
                    >
                      <FiAlertCircle className="text-sm flex-shrink-0" />
                      <span>{errors.email}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Input Field */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Password <span className="text-primary">*</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:text-amber-500 hover:underline transition-colors font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
                
                <div className="relative group/input">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary transition-colors">
                    <FiLock className="text-lg" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    className={`w-full bg-gray-50 dark:bg-black/50 border rounded-xl py-3.5 pl-11 pr-11 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 focus:outline-none ${
                      errors.password && touched.password
                        ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-shake'
                        : 'border-gray-200 dark:border-white/10 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-yellow-glow'
                    }`}
                  />
                  {/* Eye Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                  </button>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {errors.password && touched.password && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium pt-0.5"
                    >
                      <FiAlertCircle className="text-sm flex-shrink-0" />
                      <span>{errors.password}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center ${
                        rememberMe
                          ? 'bg-primary border-primary text-black shadow-yellow-glow'
                          : 'bg-gray-100 dark:bg-black/40 border-gray-300 dark:border-white/20 group-hover:border-primary'
                      }`}
                    >
                      {rememberMe && <FiCheck className="text-sm font-black stroke-[3]" />}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors font-medium">
                    Remember me for 30 days
                  </span>
                </label>
              </div>

              {/* Primary Login CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-yellow-glow hover:shadow-yellow-glow-lg active:scale-[0.98] btn-premium-interactive ${
                  isSuccess
                    ? 'bg-emerald-400 text-black shadow-emerald-500/50'
                    : 'bg-gradient-to-r from-primary via-amber-400 to-amber-500 text-black hover:brightness-110'
                } disabled:opacity-80`}
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="text-lg animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <FiCheck className="text-lg stroke-[3]" />
                    <span>SUCCESS! REDIRECTING...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <FiArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

            </form>

            {/* Divider "OR" */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-white/10" />
              </div>
              <span className="relative px-4 text-[11px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-400 bg-white dark:bg-[#0c111d] rounded-full border border-gray-200 dark:border-white/10">
                OR
              </span>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-3 gap-3">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/25 hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all text-xs font-semibold text-gray-800 dark:text-white group"
                aria-label="Continue with Google"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="hidden sm:inline">Google</span>
              </button>

              {/* Apple Button */}
              <button
                type="button"
                onClick={() => handleSocialLogin('Apple')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/25 hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all text-xs font-semibold text-gray-800 dark:text-white group"
                aria-label="Continue with Apple"
              >
                <svg className="w-4 h-4 fill-current text-gray-900 dark:text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.12-1 .04-2.24.68-2.94 1.5-.62.72-1.16 1.88-1.01 3.01 1.12.09 2.29-.57 2.96-1.39z"/>
                </svg>
                <span className="hidden sm:inline">Apple</span>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                onClick={() => handleSocialLogin('GitHub')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/25 hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all text-xs font-semibold text-gray-800 dark:text-white group"
                aria-label="Continue with GitHub"
              >
                <svg className="w-4 h-4 fill-current text-gray-900 dark:text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span className="hidden sm:inline">GitHub</span>
              </button>
            </div>

            {/* Sign Up Link Footer */}
            <div className="mt-8 text-center pt-5 border-t border-gray-200 dark:border-white/10 text-xs text-gray-500 dark:text-[#AAB4C5]">
              <span>Don't have an account? </span>
              <Link
                to="/register"
                className="text-primary font-bold hover:text-amber-500 hover:underline transition-colors ml-1 inline-flex items-center gap-1"
              >
                Sign Up
                <FiArrowRight className="text-xs" />
              </Link>
            </div>

          </motion.div>

        </div>

      </div>

      {/* ================= PAGE BOTTOM FOOTER BAR ================= */}
      <footer className="relative z-10 w-full py-4 px-6 border-t border-gray-200 dark:border-white/5 bg-white/90 dark:bg-black/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 dark:text-gray-500 gap-3 transition-colors duration-400">
        <div className="flex items-center gap-6">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
          <Link to="/contact" className="hover:text-primary transition-colors flex items-center gap-1">
            <FiHelpCircle className="text-sm" />
            <span>Help Center</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-gray-500 dark:text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>NEXCART SYSTEM v2.4.0-QUANTUM</span>
          <span>© 2026 NEXCART INC.</span>
        </div>
      </footer>

    </div>
  );
};

export default Login;
