import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SellerContext } from '../../context/SellerContext';
import { FiX, FiPackage, FiCheck, FiMinus, FiPlus, FiAlertTriangle } from 'react-icons/fi';

const QuickStockModal = ({ product, isOpen, onClose }) => {
  const { updateStock } = useContext(SellerContext);
  const [stockVal, setStockVal] = useState(product?.stock ?? 0);

  useEffect(() => {
    if (product) {
      setStockVal(product.stock ?? 0);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleSave = (e) => {
    e.preventDefault();
    updateStock(product.id, stockVal);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-secondaryBg border border-borderColor rounded-3xl shadow-2xl overflow-hidden z-10 p-6 text-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-borderColor pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <FiPackage size={18} />
              </span>
              <div>
                <h3 className="font-extrabold text-sm text-textPrimary">Adjust Stock Level</h3>
                <p className="text-[11px] text-textSecondary">Update warehouse & catalog availability</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface text-textSecondary hover:text-textPrimary border border-borderColor transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Product Summary */}
          <div className="flex items-center gap-3 bg-cardBg border border-borderColor p-3 rounded-2xl">
            <img
              src={product.image}
              alt={product.title}
              className="w-12 h-12 rounded-xl object-cover border border-borderColor"
            />
            <div className="overflow-hidden">
              <h4 className="font-bold text-textPrimary text-xs truncate">{product.title}</h4>
              <p className="text-[11px] text-textSecondary capitalize mt-0.5">
                {product.category} • Price: ₹{product.price.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Quantity Counter */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-textSecondary font-bold mb-2 uppercase text-[10px] tracking-wider">
                Units Available in Inventory
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStockVal((s) => Math.max(0, s - 1))}
                  className="w-11 h-11 rounded-xl bg-surface border border-borderColor text-textPrimary hover:bg-bgSecondary flex items-center justify-center font-bold transition-colors"
                >
                  <FiMinus size={16} />
                </button>
                <input
                  type="number"
                  min="0"
                  value={stockVal}
                  onChange={(e) => setStockVal(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 h-11 bg-surface border border-borderColor rounded-xl text-center text-lg font-black text-textPrimary focus:outline-none focus:border-primary font-mono"
                />
                <button
                  type="button"
                  onClick={() => setStockVal((s) => s + 1)}
                  className="w-11 h-11 rounded-xl bg-surface border border-borderColor text-textPrimary hover:bg-bgSecondary flex items-center justify-center font-bold transition-colors"
                >
                  <FiPlus size={16} />
                </button>
              </div>
            </div>

            {stockVal === 0 && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl text-[11px] font-medium">
                <FiAlertTriangle size={16} className="flex-shrink-0" />
                <span>Product will be marked as "Out of Stock" on the storefront.</span>
              </div>
            )}

            {stockVal > 0 && stockVal <= 5 && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-[11px] font-medium">
                <FiAlertTriangle size={16} className="flex-shrink-0" />
                <span>Low stock threshold alert will be triggered for buyers.</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl font-bold bg-surface text-textSecondary hover:text-textPrimary border border-borderColor"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl font-bold bg-primary text-black hover:bg-primary-light shadow-yellow-glow flex items-center justify-center gap-1.5"
              >
                <FiCheck size={16} />
                <span>Save Stock</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickStockModal;
