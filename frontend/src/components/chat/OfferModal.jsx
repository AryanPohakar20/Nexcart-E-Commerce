import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign, FiX, FiCheck, FiInfo, FiTag } from 'react-icons/fi';

const OfferModal = ({ isOpen, onClose, onSubmitOffer, product }) => {
  const [offerPrice, setOfferPrice] = useState(
    Math.round(product.price * 0.9) || product.price
  );
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handlePercentageDiscount = (percent) => {
    const calculated = Math.round(product.price * (1 - percent / 100));
    setOfferPrice(calculated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (offerPrice > 0) {
      onSubmitOffer(Number(offerPrice), note);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <FiDollarSign className="text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Make a Price Offer
              </h3>
              <p className="text-xs text-gray-500">Negotiate directly with seller</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Product Item Preview Card */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-200/60 dark:border-white/5 mb-5">
          <img src={product.image} alt={product.title} className="w-12 h-12 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">{product.title}</h4>
            <span className="text-xs text-gray-500">Listed Price: <strong className="text-amber-500">${product.price}</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Discount Preset Chips */}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              Quick Discounts:
            </label>
            <div className="flex items-center gap-2">
              {[5, 10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentageDiscount(pct)}
                  className="flex-1 py-1.5 px-2 text-xs font-bold rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-black transition-all"
                >
                  -{pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Offer Input Field */}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
              Your Offer Amount ($):
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-amber-500 text-lg">$</span>
              <input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                min="1"
                max={product.price}
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 font-bold text-lg text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Additional Note */}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
              Optional Note for Seller:
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Can pick up today with cash"
              className="w-full px-4 py-2.5 rounded-2xl text-xs bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-primary text-black font-bold text-xs rounded-2xl hover:bg-primary-dark shadow-lg shadow-amber-500/20 transition-all"
            >
              Send Offer ${offerPrice}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default OfferModal;
