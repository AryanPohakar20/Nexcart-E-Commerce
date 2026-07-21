import React, { useState, useContext, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import NexCartLogo from '../components/NexCartLogo';
import ThemeToggle from '../components/ThemeToggle';

import { 
  FiUser, 
  FiAtSign, 
  FiMail, 
  FiPhone, 
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
  FiHelpCircle,
  FiTag
} from 'react-icons/fi';

// Subtle Confetti Burst Component on Registration Success
const ConfettiBurst = () => {
  const pieces = Array.from({ length: 24 });
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((_, i) => {
        const randomX = (Math.random() - 0.5) * 320;
        const randomY = (Math.random() - 0.8) * 320;
        const color = i % 3 === 0 ? '#FFC107' : i % 3 === 1 ? '#00C8FF' : '#10B981';
        return (
          <motion.div
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
            animate={{ 
              opacity: 0, 
              x: randomX, 
              y: randomY, 
              scale: Math.random() * 0.8 + 0.4, 
              rotate: Math.random() * 360 
            }}
            transition={{ duration: 0.95, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '8px',
              height: '8px',
              borderRadius: i % 2 === 0 ? '50%' : '2px',
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}`
            }}
          />
        );
      })}
    </div>
  );
};

const Register = () => {
  const { loginUser, showToast } = useContext(AppContext);
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    agreeTerms: false
  });

  const [role, setRole] = useState('customer'); // customer, seller
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation & UI states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Ripple state for primary button
  const [ripples, setRipples] = useState([]);

  // Floating Particles data
  const particles = Array.from({ length: 16 });

  // Framer Motion Stagger Container Variants
  const formContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    }
  };

  const formItemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const socialContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.5
      }
    }
  };

  const socialItemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { duration: 0.3, ease: 'easeOut' } 
    }
  };

  // Password Requirement Checks
  const passwordRequirements = useMemo(() => {
    const pass = formData.password;
    return [
      { label: '8 Characters', met: pass.length >= 8 },
      { label: 'Uppercase', met: /[A-Z]/.test(pass) },
      { label: 'Lowercase', met: /[a-z]/.test(pass) },
      { label: 'Number', met: /[0-9]/.test(pass) },
      { label: 'Special Character', met: /[^A-Za-z0-9]/.test(pass) }
    ];
  }, [formData.password]);

  // Password Strength Calculation (0 to 5)
  const strengthScore = useMemo(() => {
    if (!formData.password) return 0;
    return passwordRequirements.filter((req) => req.met).length;
  }, [passwordRequirements, formData.password]);

  const strengthLabel = useMemo(() => {
    if (strengthScore === 0) return { text: 'None', color: 'bg-gray-500', textColor: 'text-gray-400' };
    if (strengthScore <= 2) return { text: 'Weak', color: 'bg-red-500', textColor: 'text-red-400' };
    if (strengthScore <= 3) return { text: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-400' };
    if (strengthScore === 4) return { text: 'Good', color: 'bg-blue-500', textColor: 'text-blue-400' };
    return { text: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
  }, [strengthScore]);

  // Real-time Field Validation logic
  const validateField = (name, value, allValues = formData) => {
    let errorMsg = '';

    if (name === 'fullName') {
      if (!value.trim()) {
        errorMsg = 'Full name is required';
      } else if (value.trim().length < 2) {
        errorMsg = 'Full name must be at least 2 characters';
      }
    }

    if (name === 'username') {
      if (!value.trim()) {
        errorMsg = 'Username is required';
      } else if (value.trim().length < 3) {
        errorMsg = 'Username must be at least 3 characters';
      } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        errorMsg = 'Username can only contain letters, numbers & underscores';
      }
    }

    if (name === 'email') {
      if (!value.trim()) {
        errorMsg = 'Email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorMsg = 'Please enter a valid email address';
      }
    }

    if (name === 'phone') {
      if (!value.trim()) {
        errorMsg = 'Mobile number is required';
      } else if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(value.replace(/\s+/g, ''))) {
        errorMsg = 'Please enter a valid phone number';
      }
    }

    if (name === 'password') {
      if (!value) {
        errorMsg = 'Password is required';
      } else if (value.length < 8) {
        errorMsg = 'Password must be at least 8 characters';
      }
    }

    if (name === 'confirmPassword') {
      if (!value) {
        errorMsg = 'Please confirm your password';
      } else if (value !== allValues.password) {
        errorMsg = 'Passwords do not match';
      }
    }

    if (name === 'agreeTerms') {
      if (!value) {
        errorMsg = 'You must agree to the Terms & Conditions';
      }
    }

    return errorMsg;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field, value) => {
    const nextFormData = { ...formData, [field]: value };
    setFormData(nextFormData);

    if (touched[field]) {
      const err = validateField(field, value, nextFormData);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }

    if (field === 'password' && touched.confirmPassword) {
      const confirmErr = validateField('confirmPassword', formData.confirmPassword, nextFormData);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  const handleRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allFields = ['fullName', 'username', 'email', 'phone', 'password', 'confirmPassword', 'agreeTerms'];
    const touchedAll = {};
    const newErrors = {};

    allFields.forEach((field) => {
      touchedAll[field] = true;
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    setTouched(touchedAll);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix all form errors before continuing', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      showToast('Account created successfully! Redirecting...', 'success');

      setTimeout(() => {
        loginUser(formData.email, formData.password, role);
        navigate(`/otp-verification?email=${encodeURIComponent(formData.email)}`);
      }, 800);
    }, 1000);
  };

  const handleSocialSignup = (provider) => {
    setIsSubmitting(true);
    showToast(`Connecting to ${provider}...`, 'info');
    setTimeout(() => {
      setIsSubmitting(false);
      loginUser(`user@${provider.toLowerCase()}.com`, 'social123', role);
      showToast(`Authenticated via ${provider}!`, 'success');
      navigate('/otp-verification?email=' + encodeURIComponent(`user@${provider.toLowerCase()}.com`));
    }, 900);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="relative min-h-screen w-full bg-[#F8F9FB] dark:bg-[#070B12] text-gray-900 dark:text-white flex flex-col justify-between overflow-x-hidden font-sans select-none transition-colors duration-400"
    >
      
      {/* Background Animated Gradient Mesh, Moving Orbs & Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.28, 0.15], rotate: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.18, 1], opacity: [0.15, 0.3, 0.15], rotate: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-40 -right-40 w-[650px] h-[650px] bg-accentBlue/15 rounded-full blur-[160px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.12, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[120px]" 
        />

        {/* SVG Circuit Trace Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-15 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
          <pattern id="circuitGridRegister" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(0, 200, 255, 0.15)" strokeWidth="1" />
            <circle cx="100" cy="0" r="3" fill="#00C8FF" opacity="0.4" />
            <circle cx="0" cy="100" r="3" fill="#FFC107" opacity="0.4" />
            <path d="M 0 50 Q 25 25 50 50 T 100 50" fill="none" stroke="rgba(255, 193, 7, 0.1)" strokeWidth="1" strokeDasharray="4 4" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#circuitGridRegister)" />
        </svg>

        {/* Floating Sparkle Particles */}
        {particles.map((_, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full pointer-events-none"
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
              scale: [1, 1.25, 1],
              opacity: [0.2, 0.85, 0.2]
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
        
        {/* ================= LEFT SIDE (60% Desktop Width - Fades in from Left) ================= */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col justify-between p-8 lg:p-16 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/5 bg-gradient-to-br from-[#FFFFFF] via-[#F1F5F9] to-[#F8F9FB] dark:from-[#070B12] dark:via-[#0b101d] dark:to-[#070B12] transition-colors duration-400"
        >
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
              whileHover={{ scale: 1.04 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-accentBlue/10 to-transparent border border-primary/30 text-xs font-semibold text-primary backdrop-blur-xl shadow-yellow-glow cursor-default"
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
              <motion.div 
                whileHover={{ y: -4, scale: 1.02, boxShadow: '0 10px 25px rgba(255,193,7,0.2)' }}
                transition={{ duration: 0.25 }}
                className="group relative p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 backdrop-blur-xl hover:border-primary/50 transition-all duration-300 shadow-sm dark:shadow-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
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
              </motion.div>

              <motion.div 
                whileHover={{ y: -4, scale: 1.02, boxShadow: '0 10px 25px rgba(0,200,255,0.2)' }}
                transition={{ duration: 0.25 }}
                className="group relative p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 backdrop-blur-xl hover:border-accentBlue/50 transition-all duration-300 shadow-sm dark:shadow-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-accentBlue/10 text-accentBlue group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
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
              </motion.div>
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
                <FiArrowRight className="text-primary group-hover:translate-x-1.5 transition-transform duration-300" />
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

        </motion.div>

        {/* ================= RIGHT SIDE (40% Desktop Width - Glass Register Card) ================= */}
        <div className="lg:col-span-5 flex items-center justify-center p-4 sm:p-8 lg:p-10 relative py-8 my-auto">
          
          {/* Centered Glass Register Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ 
              y: -4, 
              boxShadow: isSuccess ? '0 0 60px rgba(255, 193, 7, 0.8)' : '0 25px 50px rgba(0,0,0,0.6), 0 0 30px rgba(255,193,7,0.2)' 
            }}
            className={`w-full max-w-md bg-white dark:bg-white/[0.04] backdrop-blur-2xl border ${
              isSuccess ? 'border-amber-400 shadow-[0_0_50px_rgba(255,193,7,0.6)]' : 'border-gray-200 dark:border-white/10'
            } rounded-[24px] p-6 sm:p-8 shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden group hover:border-primary/40 transition-all duration-400 my-auto`}
          >
            {/* Shimmer Light Ray across Glass Card */}
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 4.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
              className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none z-10"
            />

            {/* Confetti Burst Overlay on Registration Success */}
            {isSuccess && <ConfettiBurst />}

            {/* Top Glowing Light Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full blur-[1px]" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

            {/* Card Header & Continuous Floating Logo */}
            <div className="text-center space-y-2.5 mb-6">
              <motion.div 
                animate={{ 
                  y: [0, -6, 0],
                  scale: [1, 1.04, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
                whileHover={{ scale: 1.1, rotate: 2 }}
                className="flex justify-center mb-1 cursor-pointer"
              >
                <NexCartLogo size="lg" animated={true} />
              </motion.div>
              
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
                <span>Create Account</span>
                <motion.span 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-block origin-bottom-right"
                >
                  🚀
                </motion.span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-[#AAB4C5] max-w-xs mx-auto">
                Create your NexCart account and start your premium shopping experience.
              </p>
            </div>

            {/* Account Type Selector Tabs */}
            <div className="mb-5 p-1 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 grid grid-cols-2 gap-1 text-[11px] font-bold uppercase tracking-wider">
              {['customer', 'seller'].map((r) => (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-lg transition-all duration-200 ${
                    role === r
                      ? 'bg-gradient-to-r from-primary to-amber-500 text-black shadow-yellow-glow font-black'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                  }`}
                >
                  {r === 'customer' ? 'Customer Account' : 'Seller Account'}
                </motion.button>
              ))}
            </div>

            {/* Register Form with Staggered Entrance */}
            <motion.form 
              variants={formContainerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit} 
              className="space-y-4" 
              noValidate
            >
              
              {/* Full Name Field */}
              <motion.div variants={formItemVariants} className="space-y-1 text-left">
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Full Name <span className="text-primary">*</span>
                </label>
                <div className="relative group/input">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary group-focus-within/input:scale-115 group-focus-within/input:rotate-6 transition-all duration-300">
                    <FiUser className="text-base" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    placeholder="Alex Johnson"
                    aria-invalid={!!errors.fullName}
                    className={`w-full bg-gray-50 dark:bg-black/50 border rounded-xl py-3 pl-10 pr-9 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:placeholder-gray-600 transition-all duration-300 focus:outline-none ${
                      errors.fullName && touched.fullName
                        ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'border-gray-200 dark:border-white/10 hover:border-primary/50 hover:shadow-yellow-glow focus:border-accentBlue focus:ring-1 focus:ring-accentBlue focus:shadow-blue-glow'
                    }`}
                  />
                  {touched.fullName && !errors.fullName && formData.fullName && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none"
                    >
                      <FiCheck className="text-sm stroke-[3]" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.fullName && touched.fullName && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, x: 0 }}
                      animate={{ opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ opacity: { duration: 0.2 }, x: { duration: 0.35, ease: 'easeInOut' } }}
                      className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium pt-0.5"
                    >
                      <FiAlertCircle className="text-xs flex-shrink-0" />
                      <span>{errors.fullName}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Username Field */}
              <motion.div variants={formItemVariants} className="space-y-1 text-left">
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Username <span className="text-primary">*</span>
                </label>
                <div className="relative group/input">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary group-focus-within/input:scale-115 group-focus-within/input:rotate-6 transition-all duration-300">
                    <FiAtSign className="text-base" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    onBlur={() => handleBlur('username')}
                    placeholder="alexjohnson"
                    aria-invalid={!!errors.username}
                    className={`w-full bg-gray-50 dark:bg-black/50 border rounded-xl py-3 pl-10 pr-9 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:placeholder-gray-600 transition-all duration-300 focus:outline-none ${
                      errors.username && touched.username
                        ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'border-gray-200 dark:border-white/10 hover:border-primary/50 hover:shadow-yellow-glow focus:border-accentBlue focus:ring-1 focus:ring-accentBlue focus:shadow-blue-glow'
                    }`}
                  />
                  {touched.username && !errors.username && formData.username && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none"
                    >
                      <FiCheck className="text-sm stroke-[3]" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.username && touched.username && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, x: 0 }}
                      animate={{ opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ opacity: { duration: 0.2 }, x: { duration: 0.35, ease: 'easeInOut' } }}
                      className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium pt-0.5"
                    >
                      <FiAlertCircle className="text-xs flex-shrink-0" />
                      <span>{errors.username}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Email Address Field */}
              <motion.div variants={formItemVariants} className="space-y-1 text-left">
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Email Address <span className="text-primary">*</span>
                </label>
                <div className="relative group/input">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary group-focus-within/input:scale-115 group-focus-within/input:rotate-6 transition-all duration-300">
                    <FiMail className="text-base" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="alex@nexcart.com"
                    aria-invalid={!!errors.email}
                    className={`w-full bg-gray-50 dark:bg-black/50 border rounded-xl py-3 pl-10 pr-9 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:placeholder-gray-600 transition-all duration-300 focus:outline-none ${
                      errors.email && touched.email
                        ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'border-gray-200 dark:border-white/10 hover:border-primary/50 hover:shadow-yellow-glow focus:border-accentBlue focus:ring-1 focus:ring-accentBlue focus:shadow-blue-glow'
                    }`}
                  />
                  {touched.email && !errors.email && formData.email && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none"
                    >
                      <FiCheck className="text-sm stroke-[3]" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.email && touched.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, x: 0 }}
                      animate={{ opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ opacity: { duration: 0.2 }, x: { duration: 0.35, ease: 'easeInOut' } }}
                      className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium pt-0.5"
                    >
                      <FiAlertCircle className="text-xs flex-shrink-0" />
                      <span>{errors.email}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Mobile Number Field */}
              <motion.div variants={formItemVariants} className="space-y-1 text-left">
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Mobile Number <span className="text-primary">*</span>
                </label>
                <div className="relative group/input">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary group-focus-within/input:scale-115 group-focus-within/input:rotate-6 transition-all duration-300">
                    <FiPhone className="text-base" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    placeholder="+91 99887 76655"
                    aria-invalid={!!errors.phone}
                    className={`w-full bg-gray-50 dark:bg-black/50 border rounded-xl py-3 pl-10 pr-9 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:placeholder-gray-600 transition-all duration-300 focus:outline-none ${
                      errors.phone && touched.phone
                        ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'border-gray-200 dark:border-white/10 hover:border-primary/50 hover:shadow-yellow-glow focus:border-accentBlue focus:ring-1 focus:ring-accentBlue focus:shadow-blue-glow'
                    }`}
                  />
                  {touched.phone && !errors.phone && formData.phone && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none"
                    >
                      <FiCheck className="text-sm stroke-[3]" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.phone && touched.phone && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, x: 0 }}
                      animate={{ opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ opacity: { duration: 0.2 }, x: { duration: 0.35, ease: 'easeInOut' } }}
                      className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium pt-0.5"
                    >
                      <FiAlertCircle className="text-xs flex-shrink-0" />
                      <span>{errors.phone}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={formItemVariants} className="space-y-1 text-left">
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Password <span className="text-primary">*</span>
                </label>
                <div className="relative group/input">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary group-focus-within/input:scale-115 group-focus-within/input:rotate-6 transition-all duration-300">
                    <FiLock className="text-base" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    className={`w-full bg-gray-50 dark:bg-black/50 border rounded-xl py-3 pl-10 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:placeholder-gray-600 transition-all duration-300 focus:outline-none ${
                      errors.password && touched.password
                        ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'border-gray-200 dark:border-white/10 hover:border-primary/50 hover:shadow-yellow-glow focus:border-accentBlue focus:ring-1 focus:ring-accentBlue focus:shadow-blue-glow'
                    }`}
                  />
                  {/* Eye Toggle with Rotation & Scale Animation */}
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={showPassword ? 'eyeOff' : 'eyeOn'}
                        initial={{ opacity: 0, rotate: -25, scale: 0.7 }}
                        animate={{ opacity: 1, rotate: [0, 20, 0], scale: 1 }}
                        exit={{ opacity: 0, rotate: 25, scale: 0.7 }}
                        transition={{ duration: 0.2 }}
                      >
                        {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                      </motion.div>
                    </AnimatePresence>
                  </motion.button>
                </div>
                <AnimatePresence>
                  {errors.password && touched.password && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, x: 0 }}
                      animate={{ opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ opacity: { duration: 0.2 }, x: { duration: 0.35, ease: 'easeInOut' } }}
                      className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium pt-0.5"
                    >
                      <FiAlertCircle className="text-xs flex-shrink-0" />
                      <span>{errors.password}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Password Strength Bar & Requirements Checklist */}
                {formData.password && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="pt-2 space-y-2 overflow-hidden"
                  >
                    {/* Strength Indicator Bar */}
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-gray-500 dark:text-gray-400">STRENGTH:</span>
                      <span className={`font-bold ${strengthLabel.textColor}`}>{strengthLabel.text.toUpperCase()}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${strengthLabel.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(strengthScore / 5) * 100}%` }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                      />
                    </div>

                    {/* Requirements Grid */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                      {passwordRequirements.map((req, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-1.5 transition-colors duration-300 ${
                            req.met
                              ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          <motion.div
                            animate={{ scale: req.met ? [0.8, 1.25, 1] : 1 }}
                            transition={{ duration: 0.25 }}
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] transition-colors duration-300 ${
                              req.met ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-200 dark:bg-white/5 text-gray-400'
                            }`}
                          >
                            <FiCheck className={req.met ? 'stroke-[3]' : 'opacity-40'} />
                          </motion.div>
                          <span>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div variants={formItemVariants} className="space-y-1 text-left">
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Confirm Password <span className="text-primary">*</span>
                </label>
                <div className="relative group/input">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary group-focus-within/input:scale-115 group-focus-within/input:rotate-6 transition-all duration-300">
                    <FiLock className="text-base" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="••••••••"
                    aria-invalid={!!errors.confirmPassword}
                    className={`w-full bg-gray-50 dark:bg-black/50 border rounded-xl py-3 pl-10 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:placeholder-gray-600 transition-all duration-300 focus:outline-none ${
                      errors.confirmPassword && touched.confirmPassword
                        ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'border-gray-200 dark:border-white/10 hover:border-primary/50 hover:shadow-yellow-glow focus:border-accentBlue focus:ring-1 focus:ring-accentBlue focus:shadow-blue-glow'
                    }`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={showConfirmPassword ? 'eyeOff' : 'eyeOn'}
                        initial={{ opacity: 0, rotate: -25, scale: 0.7 }}
                        animate={{ opacity: 1, rotate: [0, 20, 0], scale: 1 }}
                        exit={{ opacity: 0, rotate: 25, scale: 0.7 }}
                        transition={{ duration: 0.2 }}
                      >
                        {showConfirmPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                      </motion.div>
                    </AnimatePresence>
                  </motion.button>
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, x: 0 }}
                      animate={{ opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ opacity: { duration: 0.2 }, x: { duration: 0.35, ease: 'easeInOut' } }}
                      className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium pt-0.5"
                    >
                      <FiAlertCircle className="text-xs flex-shrink-0" />
                      <span>{errors.confirmPassword}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Referral Code Field (Optional) */}
              <motion.div variants={formItemVariants} className="space-y-1 text-left">
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Referral Code <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative group/input">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary group-focus-within/input:scale-115 group-focus-within/input:rotate-6 transition-all duration-300">
                    <FiTag className="text-base" />
                  </div>
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={(e) => handleChange('referralCode', e.target.value.toUpperCase())}
                    placeholder="NEX-9988"
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:placeholder-gray-600 transition-all duration-300 focus:outline-none hover:border-primary/50 hover:shadow-yellow-glow focus:border-accentBlue focus:ring-1 focus:ring-accentBlue focus:shadow-blue-glow uppercase font-mono"
                  />
                </div>
              </motion.div>

              {/* Terms & Conditions Checkbox */}
              <motion.div variants={formItemVariants} className="space-y-1 pt-1 text-left">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                      onBlur={() => handleBlur('agreeTerms')}
                      className="sr-only"
                    />
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      animate={{ scale: formData.agreeTerms ? [0.8, 1.2, 1] : 1 }}
                      transition={{ duration: 0.25 }}
                      className={`w-5 h-5 rounded-md border transition-all duration-300 flex items-center justify-center ${
                        formData.agreeTerms
                          ? 'bg-primary border-primary text-black shadow-yellow-glow'
                          : 'bg-gray-100 dark:bg-black/40 border-gray-300 dark:border-white/20 group-hover:border-primary'
                      }`}
                    >
                      <AnimatePresence>
                        {formData.agreeTerms && (
                          <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 45 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FiCheck className="text-sm font-black stroke-[3]" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-300 leading-snug group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    I agree to the{' '}
                    <Link to="/terms" target="_blank" className="text-primary font-semibold hover:text-amber-500 transition-colors inline-block group/link relative">
                      <span className="relative">
                        Terms & Conditions
                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-amber-400 group-hover/link:w-full transition-all duration-300" />
                      </span>
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" target="_blank" className="text-primary font-semibold hover:text-amber-500 transition-colors inline-block group/link relative">
                      <span className="relative">
                        Privacy Policy
                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-amber-400 group-hover/link:w-full transition-all duration-300" />
                      </span>
                    </Link>
                  </span>
                </label>
                <AnimatePresence>
                  {errors.agreeTerms && touched.agreeTerms && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, x: 0 }}
                      animate={{ opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ opacity: { duration: 0.2 }, x: { duration: 0.35, ease: 'easeInOut' } }}
                      className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium pt-0.5"
                    >
                      <FiAlertCircle className="text-xs flex-shrink-0" />
                      <span>{errors.agreeTerms}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Primary Register CTA Button with Gradient Shimmer & Ripple Effect */}
              <motion.div variants={formItemVariants}>
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(255, 193, 7, 0.5), 0 0 40px rgba(0, 200, 255, 0.25)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  onClick={handleRipple}
                  type="submit"
                  disabled={isSubmitting || isSuccess}
                  className={`relative overflow-hidden w-full py-3.5 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-yellow-glow hover:shadow-yellow-glow-lg active:scale-[0.98] mt-2 ${
                    isSuccess
                      ? 'bg-emerald-400 text-black shadow-emerald-500/50'
                      : 'bg-gradient-to-r from-primary via-amber-400 to-amber-500 text-black hover:brightness-110'
                  } disabled:opacity-80`}
                >
                  {/* Moving Gradient Shimmer Line */}
                  <motion.span 
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                    className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 pointer-events-none"
                  />

                  {/* Button Click Ripple Elements */}
                  {ripples.map((ripple) => (
                    <motion.span
                      key={ripple.id}
                      initial={{ width: 0, height: 0, opacity: 0.6 }}
                      animate={{ width: 320, height: 320, opacity: 0 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{
                        position: 'absolute',
                        left: ripple.x,
                        top: ripple.y,
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.4)',
                        pointerEvents: 'none'
                      }}
                    />
                  ))}

                  {isSubmitting ? (
                    <>
                      <FiLoader className="text-lg animate-spin" />
                      <span>CREATING ACCOUNT...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <FiCheck className="text-lg stroke-[3] animate-bounce" />
                      <span>ACCOUNT CREATED! REDIRECTING...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <FiArrowRight className="text-lg group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </motion.button>
              </motion.div>

            </motion.form>

            {/* Divider "OR" */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-white/10" />
              </div>
              <span className="relative px-4 text-[11px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-400 bg-white dark:bg-[#0c111d] rounded-full border border-gray-200 dark:border-white/10">
                OR
              </span>
            </div>

            {/* Social Signup Buttons Staggered Fade-in */}
            <motion.div 
              variants={socialContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-3 gap-3"
            >
              {/* Google Button */}
              <motion.button
                variants={socialItemVariants}
                whileHover={{ y: -4, scale: 1.03, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)', borderColor: 'rgba(255, 193, 7, 0.5)' }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => handleSocialSignup('Google')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all text-xs font-semibold text-gray-800 dark:text-white group"
                aria-label="Continue with Google"
              >
                <svg className="w-4 h-4 group-hover:scale-115 group-hover:rotate-6 transition-transform duration-300" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="hidden sm:inline">Google</span>
              </motion.button>

              {/* Apple Button */}
              <motion.button
                variants={socialItemVariants}
                whileHover={{ y: -4, scale: 1.03, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)', borderColor: 'rgba(255, 193, 7, 0.5)' }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => handleSocialSignup('Apple')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all text-xs font-semibold text-gray-800 dark:text-white group"
                aria-label="Continue with Apple"
              >
                <svg className="w-4 h-4 fill-current text-gray-900 dark:text-white group-hover:scale-115 group-hover:-rotate-6 transition-transform duration-300" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.12-1 .04-2.24.68-2.94 1.5-.62.72-1.16 1.88-1.01 3.01 1.12.09 2.29-.57 2.96-1.39z"/>
                </svg>
                <span className="hidden sm:inline">Apple</span>
              </motion.button>

              {/* GitHub Button */}
              <motion.button
                variants={socialItemVariants}
                whileHover={{ y: -4, scale: 1.03, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)', borderColor: 'rgba(255, 193, 7, 0.5)' }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => handleSocialSignup('GitHub')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all text-xs font-semibold text-gray-800 dark:text-white group"
                aria-label="Continue with GitHub"
              >
                <svg className="w-4 h-4 fill-current text-gray-900 dark:text-white group-hover:scale-115 group-hover:rotate-6 transition-transform duration-300" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span className="hidden sm:inline">GitHub</span>
              </motion.button>
            </motion.div>

            {/* Already Have an Account Link Footer with Underline Hover Animation */}
            <div className="mt-6 text-center pt-4 border-t border-gray-200 dark:border-white/10 text-xs text-gray-500 dark:text-[#AAB4C5]">
              <span>Already have an account? </span>
              <Link
                to="/login"
                className="text-primary font-bold hover:text-amber-500 transition-colors ml-1 inline-flex items-center gap-1 group/link relative"
              >
                <span className="relative">
                  Sign In
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-amber-400 group-hover/link:w-full transition-all duration-300" />
                </span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <FiArrowRight className="text-xs" />
                </motion.span>
              </Link>
            </div>

          </motion.div>

        </div>

      </div>

      {/* ================= PAGE BOTTOM FOOTER BAR ================= */}
      <footer className="relative z-10 w-full py-4 px-6 border-t border-gray-200 dark:border-white/5 bg-white/90 dark:bg-black/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 dark:text-gray-500 gap-3 transition-colors duration-400">
        <div className="flex items-center gap-6">
          <Link to="/privacy" className="hover:text-primary transition-colors inline-block group/link relative">
            <span className="relative">
              Privacy Policy
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-amber-400 group-hover/link:w-full transition-all duration-300" />
            </span>
          </Link>
          <Link to="/terms" className="hover:text-primary transition-colors inline-block group/link relative">
            <span className="relative">
              Terms & Conditions
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-amber-400 group-hover/link:w-full transition-all duration-300" />
            </span>
          </Link>
          <Link to="/contact" className="hover:text-primary transition-colors flex items-center gap-1 group/link relative">
            <FiHelpCircle className="text-sm" />
            <span className="relative">
              Help Center
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-amber-400 group-hover/link:w-full transition-all duration-300" />
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-gray-500 dark:text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>NEXCART SYSTEM v2.4.0-QUANTUM</span>
          <span>© 2026 NEXCART INC.</span>
        </div>
      </footer>

    </motion.div>
  );
};

export default Register;
