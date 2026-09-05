import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiMoreVertical, FiExternalLink, FiDollarSign, 
  FiCalendar, FiMapPin, FiFlag, FiSlash, FiUserCheck, FiTrash2, FiEye, FiShield,
  FiRefreshCw
} from 'react-icons/fi';

const ChatHeader = ({
  partner,
  product,
  onBack,
  onOpenOfferModal,
  onOpenMeetupModal,
  onOpenLocationModal,
  onOpenReportModal,
  onOpenBlockModal,
  onOpenProductModal,
  onClearChat,
  isBlocked,
  onReload,
  isRefreshing = false
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white/80 dark:bg-[#121212]/90 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/10 p-3 sm:p-4 transition-colors">
      {/* Upper Row: Partner details & Three-dot menu */}
      <div className="flex items-center justify-between gap-3 mb-3">
        {/* Left: Mobile Back Button & Partner Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all flex-shrink-0"
            aria-label="Back to conversations"
          >
            <FiArrowLeft className="text-lg" />
          </button>

          <div className="relative flex-shrink-0">
            <img
              src={partner.avatar}
              alt={partner.name}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover border border-white/20 shadow-sm"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#121212] ${
                partner.online ? 'bg-emerald-500' : 'bg-gray-400'
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                {partner.name}
              </h3>
              {partner.verified && (
                <span className="text-[10px] bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-primary/30 flex-shrink-0">
                  <FiShield className="text-[9px]" /> Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className={`font-semibold text-[11px] ${partner.role === 'Seller' ? 'text-amber-500' : 'text-blue-500'}`}>
                {partner.role}
              </span>
              <span>•</span>
              <span className="truncate">{partner.online ? 'Online now' : partner.lastSeen}</span>
            </div>
          </div>
        </div>

        {/* Right Header Actions & Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Reload Chat Button */}
          <button
            onClick={onReload}
            disabled={isRefreshing}
            title="Reload this chat to load latest messages"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-semibold transition-all border border-gray-200/50 dark:border-white/5 active:scale-95 disabled:opacity-50"
            aria-label="Reload conversation"
          >
            <FiRefreshCw className={`text-xs sm:text-sm ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Reloading...' : 'Reload'}</span>
          </button>

          {/* Offer Button */}
          <button
            onClick={onOpenOfferModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-black font-semibold text-xs hover:bg-primary-dark transition-all shadow-sm"
          >
            <FiDollarSign className="text-sm" /> Make Offer
          </button>

          {/* Three-dot menu dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all border border-gray-200/50 dark:border-white/5"
            >
              <FiMoreVertical className="text-lg" />
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-1.5 overflow-hidden"
                >
                  <button
                    onClick={() => { setIsMenuOpen(false); onReload?.(); }}
                    disabled={isRefreshing}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-2 transition-all"
                  >
                    <FiRefreshCw className={`text-primary text-sm ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Reload Chat</span>
                  </button>

                  <button
                    onClick={() => { setIsMenuOpen(false); onOpenProductModal(); }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-2 transition-all"
                  >
                    <FiEye className="text-primary text-sm" /> View Item Details
                  </button>

                  <button
                    onClick={() => { setIsMenuOpen(false); onOpenOfferModal(); }}
                    className="sm:hidden w-full text-left px-3 py-2 text-xs rounded-xl font-medium text-amber-500 hover:bg-amber-500/10 flex items-center gap-2 transition-all"
                  >
                    <FiDollarSign className="text-sm" /> Offer Price
                  </button>

                  <button
                    onClick={() => { setIsMenuOpen(false); onOpenMeetupModal(); }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl font-medium text-emerald-500 hover:bg-emerald-500/10 flex items-center gap-2 transition-all"
                  >
                    <FiCalendar className="text-sm" /> Schedule Meetup
                  </button>

                  <button
                    onClick={() => { setIsMenuOpen(false); onOpenLocationModal(); }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl font-medium text-accentBlue hover:bg-accentBlue/10 flex items-center gap-2 transition-all"
                  >
                    <FiMapPin className="text-sm" /> Share Safe Location
                  </button>

                  <div className="h-[1px] bg-gray-200 dark:bg-white/10 my-1" />

                  <button
                    onClick={() => { setIsMenuOpen(false); onClearChat(); }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-2 transition-all"
                  >
                    <FiTrash2 className="text-gray-400 text-sm" /> Clear Chat History
                  </button>

                  <button
                    onClick={() => { setIsMenuOpen(false); onOpenReportModal(); }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl font-medium text-amber-500 hover:bg-amber-500/10 flex items-center gap-2 transition-all"
                  >
                    <FiFlag className="text-sm" /> Report User
                  </button>

                  <button
                    onClick={() => { setIsMenuOpen(false); onOpenBlockModal(); }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl font-medium flex items-center gap-2 transition-all ${
                      isBlocked
                        ? 'text-emerald-500 hover:bg-emerald-500/10'
                        : 'text-red-500 hover:bg-red-500/10'
                    }`}
                  >
                    <FiSlash className="text-sm" /> {isBlocked ? 'Unblock User' : 'Block User'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Embedded Product Card Sticky Header Bar */}
      <div className="bg-gray-50 dark:bg-white/[0.03] rounded-2xl p-2.5 px-3 border border-gray-200/60 dark:border-white/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={product.image}
            alt={product.title}
            className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-sm flex-shrink-0"
          />
          <div className="min-w-0">
            <h4 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
              {product.title}
            </h4>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-extrabold text-amber-600 dark:text-primary">${product.price}</span>
              {product.originalPrice && (
                <span className="text-[11px] text-gray-400 line-through">${product.originalPrice}</span>
              )}
              <span className="hidden sm:inline text-[11px] text-emerald-500 font-medium px-1.5 py-0.2 bg-emerald-500/10 rounded-md">
                {product.status || 'Available'}
              </span>
            </div>
          </div>
        </div>

        {/* View Product CTA */}
        <button
          onClick={onOpenProductModal}
          className="flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-white/10 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/20 transition-all flex-shrink-0"
        >
          View Item <FiExternalLink className="text-xs" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
