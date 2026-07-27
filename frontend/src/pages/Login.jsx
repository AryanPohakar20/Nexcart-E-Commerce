import React, { useState, useContext, useEffect } from 'react';
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
  const { login, sellerLogin } = useContext(AuthContext);
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
  const [showBecomeSeller, setShowBecomeSeller] = useState(false);

  // Animation states
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
  const [cardShake, setCardShake] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Floating Particles data
  const particles = Array.from({ length: 16 });

  // Global mouse coordinates for parallax elements
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15
      });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1200);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      clearTimeout(timer);
    };
  }, []);

  // Card 3D tilt calculation
  const handleMouseMove = (e) => {
    const card = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - card.left;
    const mouseY = e.clientY - card.top;
    const xRotate = ((mouseY / card.height) - 0.5) * 3; 
    const yRotate = ((mouseX / card.width) - 0.5) * -3;
    setTilt({ x: xRotate, y: yRotate });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Magnetic button pull calculation
  const handleBtnMouseMove = (e) => {
    const btn = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - (btn.left + btn.width / 2);
    const mouseY = e.clientY - (btn.top + btn.height / 2);
    setBtnOffset({ x: mouseX * 0.12, y: mouseY * 0.12 });
  };

  const handleBtnMouseLeave = () => {
    setBtnOffset({ x: 0, y: 0 });
  };

  // Stagger entry configurations
  const letterContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.3
      }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 150
      }
    }
  };

  // Fade Up stagger for form inputs
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // delay each input by 0.1s
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

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
      setCardShake(true);
      setTimeout(() => setCardShake(false), 500);
      showToast('Please fix the errors before submitting', 'error');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = role === 'seller'
        ? await sellerLogin(email, password)
        : await login(email, password);
      
      if (result.success) {
        setIsSuccess(true);
        setShowBecomeSeller(false);
        setShowConfetti(true);
        showToast('Login successful!');
        
        setTimeout(() => {
          const userRole = (result.user?.role || '').toLowerCase();
          if (userRole === 'seller' || userRole === 'marketplaceseller') navigate('/seller/dashboard');
          else if (userRole === 'admin') navigate('/admin/dashboard');
          else navigate('/');
        }, 1200);
      } else {
        setIsSubmitting(false);
        setCardShake(true);
        setTimeout(() => setCardShake(false), 500);
        if (result.message && result.message.includes('not registered as a Marketplace Seller')) {
          setShowBecomeSeller(true);
        } else {
          setErrors({ ...result.errors, email: result.message || 'Login failed' });
        }
        showToast(result.message || 'Invalid credentials', 'error');
      }
    } catch (error) {
      setIsSubmitting(false);
      setCardShake(true);
      setTimeout(() => setCardShake(false), 500);
      showToast('Something went wrong. Please try again.', 'error');
    }
  };

  const handleSocialLogin = (provider) => {
    setIsSubmitting(true);
    showToast(`Connecting to ${provider}...`);
    setTimeout(async () => {
      const mockEmail = `user@${provider.toLowerCase()}.com`;
      const result = await login(mockEmail, 'social123');
      
      setIsSubmitting(false);
      
      if (result.success) {
        setShowConfetti(true);
        showToast(`Authenticated via ${provider}!`);
        const userRole = (result.user?.role || '').toLowerCase();
        setTimeout(() => {
          if (userRole === 'seller' || userRole === 'marketplaceseller') navigate('/seller/dashboard');
          else if (userRole === 'admin') navigate('/admin/dashboard');
          else navigate('/');
        }, 1200);
      } else {
        setCardShake(true);
        setTimeout(() => setCardShake(false), 500);
        showToast(`Authentication via ${provider} failed.`, 'error');
      }
    }, 900);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F8F9FB] dark:bg-[#070B12] text-gray-900 dark:text-white flex flex-col justify-between overflow-hidden font-sans select-none transition-colors duration-400">
      
      {/* Background Animated Elements & Ambient Glow Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{
            x: [0, 15, -15, 0],
            y: [0, -15, 15, 0],
            opacity: [0.12, 0.22, 0.12]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px]" 
        />
        <motion.div 
          animate={{
            x: [0, -20, 20, 0],
            y: [0, 20, -20, 0],
            opacity: [0.12, 0.22, 0.12]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute -bottom-40 -right-40 w-[650px] h-[650px] bg-accentBlue/15 rounded-full blur-[160px]" 
        />
        <motion.div 
          animate={{
            x: mousePos.x * -0.3,
            y: mousePos.y * -0.3
          }}
          transition={{ type: 'easeOut', duration: 0.5 }}
          className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[120px]" 
        />

        {/* Slow moving Glass reflection sweep */}
        <motion.div
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            repeatDelay: 6,
            ease: 'easeInOut'
          }}
          className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
        />

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

        {/* Floating Sparkle Particles (CSS Animations fallback via Tailwind) */}
        {particles.map((_, index) => (
          <div
            key={index}
            className="absolute rounded-full animate-pulse"
            style={{
              width: (index % 3 + 2) + 'px',
              height: (index % 3 + 2) + 'px',
              backgroundColor: index % 2 === 0 ? '#FFC107' : '#00C8FF',
              left: `${(index * 6.5) % 100}%`,
              top: `${(index * 7.2) % 100}%`,
              boxShadow: index % 2 === 0 ? '0 0 10px #FFC107' : '0 0 10px #00C8FF',
              animationDuration: `${3 + (index % 3)}s`
            }}
          />
        ))}
      </div>

      {/* Main Split Layout Container */}
      <div className="relative z-10 flex-grow grid grid-cols-1 md:grid-cols-12 min-h-screen w-full">
        
        {/* ================= LEFT SIDE ================= */}
        <motion.div 
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="md:col-span-6 lg:col-span-7 flex flex-col justify-between p-8 md:p-12 lg:p-16 relative overflow-hidden border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/5 bg-gradient-to-br from-[#FFFFFF] via-[#F1F5F9] to-[#F8F9FB] dark:from-[#070B12] dark:via-[#0b101d] dark:to-[#070B12] transition-colors duration-400"
        >
          
          {/* Top Brand Nav Header & Theme Toggle */}
          <motion.div 
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
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
            <div className="space-y-4">
              <motion.h1 
                variants={letterContainerVariants}
                initial="hidden"
                animate="visible"
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-none font-sans"
              >
                <span className="text-gray-900 dark:text-white block">
                  {"SHOP BEYOND ".split("").map((char, idx) => (
                    <motion.span key={idx} variants={letterVariants} className="inline-block whitespace-pre">
                      {char}
                    </motion.span>
                  ))}
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-accentBlue drop-shadow-[0_0_25px_rgba(255,193,7,0.3)] block">
                  {"LIMITS.".split("").map((char, idx) => (
                    <motion.span key={idx} variants={letterVariants} className="inline-block whitespace-pre">
                      {char}
                    </motion.span>
                  ))}
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 }}
                className="text-base sm:text-lg text-gray-600 dark:text-[#AAB4C5] font-light leading-relaxed max-w-lg"
              >
                Experience the future of smart shopping with AI-powered recommendations, secure checkout, and unlimited possibilities.
              </motion.p>
            </div>

            {/* Floating Abstract Cards Grid */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4"
            >
              <motion.div 
                variants={itemVariants}
                animate={{ y: mousePos.y * -0.2, x: mousePos.x * -0.2 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className="group relative p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 backdrop-blur-xl hover:border-primary/50 transition-all duration-300 shadow-sm dark:shadow-none hover:shadow-yellow-glow"
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ rotate: 15 }}
                    className="p-3 rounded-xl bg-primary/10 text-primary transition-transform"
                  >
                    <FiCpu className="text-xl" />
                  </motion.div>
                  <div>
                    <div className="text-xs text-gray-400 font-mono">NEURAL RECOMMENDATIONS</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      99.8% Precision Match
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold">ACTIVE</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                animate={{ y: mousePos.y * 0.2, x: mousePos.x * 0.2 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className="group relative p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 backdrop-blur-xl hover:border-accentBlue/50 transition-all duration-300 shadow-sm dark:shadow-none hover:shadow-blue-glow"
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ rotate: 15 }}
                    className="p-3 rounded-xl bg-accentBlue/10 text-accentBlue transition-transform"
                  >
                    <FiZap className="text-xl" />
                  </motion.div>
                  <div>
                    <div className="text-xs text-gray-400 font-mono">SUB-MS CHECKOUT</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      Instant 1-Click Pay
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-accentBlue/20 text-accentBlue font-extrabold">0.2ms</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Left CTA Button */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
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
            transition={{ duration: 0.8, delay: 0.8 }}
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

        </motion.div>


        {/* ================= RIGHT SIDE ================= */}
        <div className="md:col-span-6 lg:col-span-5 flex items-center justify-center p-6 md:p-8 lg:p-12 relative">
          
          {/* Intro wrapper for login card */}
          <motion.div
            initial={{ x: 80, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18
            }}
            className="w-full max-w-md"
          >
            {/* Centered Glass Login Card with continuous float */}
            <motion.div 
              animate={{ 
                x: cardShake ? [-8, 8, -8, 8, -4, 4, 0] : 0,
                // Continuous floating animation
                y: [0, -8, 0],
                boxShadow: isSuccess 
                  ? '0 0 50px rgba(16,185,129,0.35)' 
                  : theme === 'dark' 
                    ? '0 20px 60px rgba(0,0,0,0.8)' 
                    : '0 10px 30px rgba(0,0,0,0.05)'
              }}
              transition={{ 
                x: { duration: 0.5 },
                y: { repeat: Infinity, duration: 5, ease: "easeInOut" },
                boxShadow: { duration: 0.3 }
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                rotateX: tilt.x,
                rotateY: tilt.y,
                transformStyle: 'preserve-3d',
                perspective: 1000
              }}
              className="w-full bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[24px] p-8 sm:p-12 shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden group hover:border-primary/40 transition-all duration-400"
            >
              {/* Confetti Explosion Burst on Success */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                  {Array.from({ length: 40 }).map((_, i) => {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 80 + Math.random() * 150;
                    const x = Math.cos(angle) * distance;
                    const y = Math.sin(angle) * distance - 50;
                    const colors = ['#FFC107', '#00C8FF', '#10B981', '#EC4899', '#8B5CF6'];
                    const color = colors[i % colors.length];
                    return (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: color,
                          left: '50%',
                          top: '50%',
                        }}
                        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                        animate={{
                          x: x,
                          y: y,
                          scale: [1, 0.5, 0],
                          opacity: [1, 1, 0]
                        }}
                        transition={{
                          duration: 1.2,
                          ease: 'easeOut',
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Top Glowing Light accent */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full blur-[1px]" />
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />

              {/* Card Header & Logo */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <motion.div
                    animate={{
                      y: [0, -6, 0]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut"
                    }}
                    whileHover={{ scale: 1.05 }}
                    className="relative group/logo cursor-pointer"
                  >
                    <NexCartLogo size="lg" animated={true} />
                    {/* Glowing Pulse Ring */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.15, 0.35, 0.15],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-primary to-accentBlue rounded-xl blur-md pointer-events-none -z-10"
                    />
                  </motion.div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
                  <span>Welcome Back</span>
                  <span className="inline-block animate-bounce origin-bottom-right">👋</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-[#AAB4C5] mt-4">
                  Sign in to continue shopping
                </p>
              </div>

              {/* Role Switcher Tabs */}
              <motion.div 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="mb-8 p-1 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 grid grid-cols-3 gap-1 text-[11px] font-bold uppercase tracking-wider"
              >
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
              </motion.div>

              {/* Login Form */}
              <motion.form 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit} 
                className="space-y-6" 
                noValidate
              >
                
                {/* Become Seller Prompt */}
                <AnimatePresence>
                  {showBecomeSeller && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center mb-6"
                    >
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium mb-3">
                        You are not registered as a Marketplace Seller.
                      </p>
                      <Link
                        to="/seller/become-seller"
                        className="btn-glow-yellow py-2 px-6 text-xs text-black font-extrabold rounded-lg inline-flex items-center justify-center gap-1.5"
                      >
                        Become Seller
                        <FiArrowRight />
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Input Field */}
                <motion.div variants={itemVariants} className="space-y-2 text-left">
                  <motion.label 
                    animate={{
                      x: focusedField === 'email' ? 4 : 0,
                      color: focusedField === 'email' ? '#FFC107' : ''
                    }}
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Email Address <span className="text-primary">*</span>
                  </motion.label>
                  
                  <motion.div 
                    animate={errors.email && touched.email ? { x: [-6, 6, -6, 6, -3, 3, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="relative group/input"
                  >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary transition-colors">
                      <FiMail className="text-lg" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => { handleBlur('email'); setFocusedField(null); }}
                      onFocus={() => setFocusedField('email')}
                      placeholder="name@nexcart.com"
                      aria-invalid={!!errors.email}
                      className={`w-full bg-gray-50 dark:bg-black/50 border rounded-xl py-3.5 pl-12 pr-12 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 focus:outline-none focus:border-accentBlue focus:ring-2 focus:ring-accentBlue/20 focus:shadow-[0_0_15px_rgba(0,200,255,0.25)] ${
                        errors.email && touched.email
                          ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-shake'
                          : 'border-gray-200 dark:border-white/10 hover:border-primary/50'
                      }`}
                    />
                    {/* Focus animated underline expansions */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: focusedField === 'email' ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-primary to-accentBlue origin-center rounded-full pointer-events-none"
                    />
                    {/* Success animated checkmark */}
                    {email && !errors.email && touched.email && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"
                      >
                        <FiCheck className="text-lg stroke-[3]" />
                      </motion.div>
                    )}
                  </motion.div>
                  
                  {/* Error message */}
                  <AnimatePresence>
                    {errors.email && touched.email && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium pt-1"
                      >
                        <FiAlertCircle className="text-sm flex-shrink-0" />
                        <span>{errors.email}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Password Input Field */}
                <motion.div variants={itemVariants} className="space-y-2 text-left">
                  <motion.label 
                    animate={{
                      x: focusedField === 'password' ? 4 : 0,
                      color: focusedField === 'password' ? '#FFC107' : ''
                    }}
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Password <span className="text-primary">*</span>
                  </motion.label>
                  
                  <motion.div 
                    animate={errors.password && touched.password ? { x: [-6, 6, -6, 6, -3, 3, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="relative group/input"
                  >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary transition-colors">
                      <FiLock className="text-lg" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      onBlur={() => { handleBlur('password'); setFocusedField(null); }}
                      onFocus={() => setFocusedField('password')}
                      placeholder="••••••••"
                      aria-invalid={!!errors.password}
                      className={`w-full bg-gray-50 dark:bg-black/50 border rounded-xl py-3.5 pl-12 pr-12 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 focus:outline-none focus:border-accentBlue focus:ring-2 focus:ring-accentBlue/20 focus:shadow-[0_0_15px_rgba(0,200,255,0.25)] ${
                        errors.password && touched.password
                          ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-shake'
                          : 'border-gray-200 dark:border-white/10 hover:border-primary/50'
                      }`}
                    />
                    {/* Focus animated underline expansions */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: focusedField === 'password' ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-primary to-accentBlue origin-center rounded-full pointer-events-none"
                    />
                    {/* Eye Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                    </button>
                  </motion.div>

                  {/* Error message */}
                  <AnimatePresence>
                    {errors.password && touched.password && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium pt-1"
                      >
                        <FiAlertCircle className="text-sm flex-shrink-0" />
                        <span>{errors.password}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Remember Me Checkbox & Forgot Password Row */}
                <motion.div variants={itemVariants} className="flex items-center justify-between pt-2">
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
                            ? 'bg-primary border-primary text-black shadow-[0_0_10px_rgba(255,193,7,0.5)]'
                            : 'bg-gray-100 dark:bg-black/40 border-gray-300 dark:border-white/20 group-hover:border-primary'
                        }`}
                      >
                        {rememberMe && (
                          <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <motion.path
                              d="M20 6L9 17L4 12"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors font-medium">
                      Remember me for 30 days
                    </span>
                  </label>
                  
                  <motion.div whileHover="hover" className="inline-flex">
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary hover:text-amber-500 transition-colors font-medium relative group/forgot py-0.5 flex items-center gap-1"
                    >
                      <span>Forgot Password?</span>
                      <motion.span
                        variants={{
                          hover: { x: 3 }
                        }}
                        transition={{ type: 'spring', stiffness: 150 }}
                        className="inline-block text-xs"
                      >
                        →
                      </motion.span>
                      <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-amber-500 scale-x-0 group-hover/forgot:scale-x-100 origin-left transition-transform duration-300" />
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Primary Login CTA Button */}
                <motion.button
                  variants={itemVariants}
                  onMouseMove={handleBtnMouseMove}
                  onMouseLeave={handleBtnMouseLeave}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 0 25px rgba(255,193,7,.4)"
                  }}
                  whileTap={{ 
                    scale: 0.97
                  }}
                  animate={{
                    x: btnOffset.x,
                    y: btnOffset.y,
                    backgroundColor: isSuccess ? '#34D399' : ''
                  }}
                  transition={{
                    x: { type: 'spring', stiffness: 200, damping: 15 },
                    y: { type: 'spring', stiffness: 200, damping: 15 },
                    boxShadow: { duration: 0.3 },
                    scale: { type: 'spring', stiffness: 250, damping: 12 }
                  }}
                  type="submit"
                  disabled={isSubmitting || isSuccess}
                  className="relative overflow-hidden w-full py-3.5 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-yellow-glow hover:shadow-yellow-glow-lg active:scale-[0.98] btn-premium-interactive bg-gradient-to-r from-primary via-amber-400 to-amber-500 text-black hover:brightness-110 disabled:opacity-80"
                >
                  {/* Shimmer sweep effect */}
                  <motion.span
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                    initial={{ left: '-100%' }}
                    whileHover={{ left: '100%', transition: { duration: 0.8, ease: 'easeOut' } }}
                    style={{ transform: 'skewX(-25deg)' }}
                  />

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
                      <FiArrowRight className="text-lg" />
                    </>
                  )}
                </motion.button>

              </motion.form>

              {/* Divider "OR" */}
              <motion.div variants={itemVariants} initial="hidden" animate="visible" className="relative my-8 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-white/10" />
                </div>
                <span className="relative px-4 text-[11px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-400 bg-white dark:bg-[#0c111d] rounded-full border border-gray-200 dark:border-white/10">
                  OR
                </span>
              </motion.div>

              {/* Social Login Buttons */}
              <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Google Button */}
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    y: -4,
                    borderColor: 'rgba(255, 193, 7, 0.4)',
                    boxShadow: '0 0 15px rgba(255, 193, 7, 0.25)'
                  }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  className="relative overflow-hidden flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all text-xs font-semibold text-gray-800 dark:text-white group"
                  aria-label="Continue with Google"
                >
                  <motion.span
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
                    initial={{ left: '-100%' }}
                    whileHover={{ left: '100%', transition: { duration: 0.7, ease: 'easeOut' } }}
                    style={{ transform: 'skewX(-25deg)' }}
                  />
                  <motion.svg 
                    whileHover={{ rotate: 12 }}
                    className="w-4 h-4 transition-transform" 
                    viewBox="0 0 24 24"
                  >
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </motion.svg>
                  <span>Google</span>
                </motion.button>

                {/* Apple Button */}
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    y: -4,
                    borderColor: 'rgba(255, 193, 7, 0.4)',
                    boxShadow: '0 0 15px rgba(255, 193, 7, 0.25)'
                  }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => handleSocialLogin('Apple')}
                  className="relative overflow-hidden flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all text-xs font-semibold text-gray-800 dark:text-white group"
                  aria-label="Continue with Apple"
                >
                  <motion.span
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
                    initial={{ left: '-100%' }}
                    whileHover={{ left: '100%', transition: { duration: 0.7, ease: 'easeOut' } }}
                    style={{ transform: 'skewX(-25deg)' }}
                  />
                  <motion.svg 
                    whileHover={{ rotate: 12 }}
                    className="w-4 h-4 fill-current text-gray-900 dark:text-white transition-transform" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.12-1 .04-2.24.68-2.94 1.5-.62.72-1.16 1.88-1.01 3.01 1.12.09 2.29-.57 2.96-1.39z"/>
                  </motion.svg>
                  <span>Apple</span>
                </motion.button>

                {/* GitHub Button */}
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    y: -4,
                    borderColor: 'rgba(255, 193, 7, 0.4)',
                    boxShadow: '0 0 15px rgba(255, 193, 7, 0.25)'
                  }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => handleSocialLogin('GitHub')}
                  className="relative overflow-hidden flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all text-xs font-semibold text-gray-800 dark:text-white group"
                  aria-label="Continue with GitHub"
                >
                  <motion.span
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
                    initial={{ left: '-100%' }}
                    whileHover={{ left: '100%', transition: { duration: 0.7, ease: 'easeOut' } }}
                    style={{ transform: 'skewX(-25deg)' }}
                  />
                  <motion.svg 
                    whileHover={{ rotate: 12 }}
                    className="w-4 h-4 fill-current text-gray-900 dark:text-white transition-transform" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </motion.svg>
                  <span>GitHub</span>
                </motion.button>
              </motion.div>

              {/* Sign Up Link Footer */}
              <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mt-10 text-center pt-8 border-t border-gray-200 dark:border-white/10 text-xs text-gray-500 dark:text-[#AAB4C5]">
                <span>Don't have an account? </span>
                <Link
                  to="/register"
                  className="text-primary font-bold hover:text-amber-500 hover:underline transition-colors ml-1 inline-flex items-center gap-1"
                >
                  Sign Up
                  <FiArrowRight className="text-xs" />
                </Link>
              </motion.div>

            </motion.div>
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

      {/* Pre-loader Screen */}
      <AnimatePresence>
        {isPageLoading && (
          <motion.div
            key="preloader"
            exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
            className="fixed inset-0 z-[100] bg-[#F8F9FB] dark:bg-[#070B12] flex flex-col items-center justify-center gap-6"
          >
            {/* Loading Logo Rotating slowly */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            >
              <NexCartLogo size="xl" />
            </motion.div>

            {/* Gold loading line and blue glowing dots */}
            <div className="flex flex-col items-center gap-4">
              {/* Gold loading line */}
              <div className="w-48 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ left: '-100%' }}
                  animate={{ left: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-primary via-amber-400 to-amber-500 rounded-full"
                />
              </div>

              {/* Blue glowing dots */}
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                      boxShadow: ['0 0 0px #00C8FF', '0 0 10px #00C8FF', '0 0 0px #00C8FF']
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeInOut'
                    }}
                    className="w-2.5 h-2.5 rounded-full bg-accentBlue"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Login;
