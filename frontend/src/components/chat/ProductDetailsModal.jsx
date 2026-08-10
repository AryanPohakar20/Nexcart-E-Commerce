import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiExternalLink, FiTag, FiShield, FiMapPin, FiShoppingCart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ProductDetailsModal = ({ isOpen, onClose, product, partner }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black transition-all"
        >
          <FiX className="text-lg" />
        </button>

        {/* Product Image */}
        <div className="relative h-60 rounded-2xl overflow-hidden mb-5 bg-black/10">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
          <span className="absolute top-3 left-3 bg-primary text-black font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
            {product.category || 'Featured Item'}
          </span>
        </div>

        {/* Product Information */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white leading-snug">
              {product.title}
            </h3>
            <span className="text-2xl font-black text-amber-500 flex-shrink-0">
              ${product.price}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1 font-semibold text-emerald-500">
              <FiShield /> Condition: {product.condition || 'Used - Like New'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FiMapPin /> {partner.location || 'Metro City'}
            </span>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-200/50 dark:border-white/5">
            Seller guarantees full functionality, original box, and authentic proof of purchase. Available for immediate C2C handoff or shipped via NexCart Express.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              navigate(`/product/${product.id}`);
            }}
            className="flex-1 py-3 bg-primary text-black font-bold text-xs rounded-2xl hover:bg-primary-dark shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            Open Full Listing <FiExternalLink />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetailsModal;
