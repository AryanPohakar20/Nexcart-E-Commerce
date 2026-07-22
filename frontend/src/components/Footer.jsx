import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiCheck } from 'react-icons/fi';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-secondaryBg border-t border-white/5 pt-16 pb-8 px-4 md:px-6 w-full relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Newsletter Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12 border-b border-white/5 items-center">
          <div className="lg:col-span-1 text-left">
            <h3 className="text-xl font-bold text-white mb-2">Subscribe to our newsletter</h3>
            <p className="text-xs text-gray-400">Get 10% off your first purchase and stay updated on flash deals.</p>
          </div>
          <div className="lg:col-span-2">
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full max-w-lg lg:ml-auto">
              <div className="relative flex-grow">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 text-xs px-10 py-3 rounded-lg border border-white/10 focus:outline-none focus:border-primary/50 text-white placeholder-gray-500 transition-all duration-300"
                  required
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                type="submit" 
                className={`btn-glow-yellow text-xs font-semibold py-3 flex items-center justify-center min-w-[120px] transition-all duration-300 ${subscribed ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20 text-white' : ''}`}
              >
                {subscribed ? (
                  <span className="flex items-center gap-1"><FiCheck className="animate-bounce" /> Subscribed</span>
                ) : (
                  <span>Subscribe</span>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 text-left">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="text-2xl font-bold tracking-wider text-primary inline-block hover:scale-105 transition-transform">NEX<span className="text-white">CART</span></Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              NexCart is a next-generation shopping experience offering ultra-fast delivery, secure checkouts, and custom collections. Shop Beyond Limits.
            </p>
            <div className="flex gap-3 text-lg">
              {[
                { icon: <FiFacebook />, href: "#" },
                { icon: <FiTwitter />, href: "#" },
                { icon: <FiInstagram />, href: "#" },
                { icon: <FiYoutube />, href: "#" }
              ].map((item, idx) => (
                <motion.a 
                  key={idx}
                  whileHover={{ y: -4, scale: 1.15, rotate: 6 }}
                  whileTap={{ scale: 0.9 }}
                  href={item.href} 
                  className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-primary hover:bg-white/10 transition-all"
                >
                  {item.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/category/electronics" className="hover:text-primary transition-all link-underline">Electronics</Link></li>
              <li><Link to="/category/mobiles" className="hover:text-primary transition-all link-underline">Mobiles</Link></li>
              <li><Link to="/category/laptops" className="hover:text-primary transition-all link-underline">Laptops</Link></li>
              <li><Link to="/category/fashion" className="hover:text-primary transition-all link-underline">Fashion & Apparel</Link></li>
              <li><Link to="/category/sports" className="hover:text-primary transition-all link-underline">Sports Equipment</Link></li>
            </ul>
          </div>

          {/* Company Resources */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/about" className="hover:text-primary transition-all link-underline">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-all link-underline">Contact Support</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-all link-underline">FAQs</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-all link-underline">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-all link-underline">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Account & Partner portals */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Portals</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/profile" className="hover:text-primary transition-all link-underline">My Profile</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-all link-underline">Track Orders</Link></li>
              <li><Link to="/seller/dashboard" className="hover:text-primary transition-all link-underline">Seller Studio</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-primary transition-all link-underline">System Root (Admin)</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Base Info */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} NexCart Inc. Shop Beyond Limits. Made with Premium React.</p>
          <div className="flex gap-2">
            <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded text-[10px] text-gray-400 font-bold uppercase tracking-wider">UPI</span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded text-[10px] text-gray-400 font-bold uppercase tracking-wider">VISA</span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded text-[10px] text-gray-400 font-bold uppercase tracking-wider">MASTERCARD</span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded text-[10px] text-gray-400 font-bold uppercase tracking-wider">COD</span>
          </div>
        </div>

      </div>
    </motion.footer>
  );
};

export default Footer;
