import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import { SellerContext } from '../../context/SellerContext';
import { AppContext } from '../../context/AppContext';

const MarkAsSoldModal = ({ isOpen, onClose, product }) => {
  const { markListingAsSold } = useContext(SellerContext);
  const { showToast } = useContext(AppContext);
  
  const [finalSalePrice, setFinalSalePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setFinalSalePrice(product.price?.toString() || '');
      setCostPrice(product.costPrice?.toString() || '0');
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const sale = Number(finalSalePrice);
    const cost = Number(costPrice);
    
    if (isNaN(sale) || sale < 0) {
      return showToast('Please enter a valid final sale price', 'error');
    }
    if (isNaN(cost) || cost < 0) {
      return showToast('Please enter a valid cost price', 'error');
    }

    setIsSubmitting(true);
    try {
      await markListingAsSold(product._id || product.id, sale, cost);
      onClose();
    } catch (err) {
      // Error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-cardBg border border-borderColor rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-borderColor">
                <h2 className="text-lg font-black text-textPrimary flex items-center gap-2">
                  <FiCheckCircle className="text-primary" />
                  Mark as Sold
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-textSecondary hover:text-textPrimary hover:bg-surface rounded-full transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 text-left">
                <div className="p-4 bg-surface rounded-xl border border-borderColor flex items-center gap-4">
                  <img src={product.image} alt={product.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <h4 className="font-bold text-sm text-textPrimary truncate">{product.title}</h4>
                    <p className="text-xs text-textSecondary">Listed Price: ₹{product.price?.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-textSecondary mb-1.5 uppercase tracking-wider">
                      Final Sale Price (₹)
                    </label>
                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
                      <input
                        type="number"
                        value={finalSalePrice}
                        onChange={(e) => setFinalSalePrice(e.target.value)}
                        className="w-full bg-surface border border-borderColor rounded-xl pl-9 pr-4 py-3 text-sm font-bold text-textPrimary focus:outline-none focus:border-primary"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-textSecondary mb-1.5 uppercase tracking-wider">
                      Your Cost Price / Acquisition Cost (₹)
                    </label>
                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
                      <input
                        type="number"
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value)}
                        className="w-full bg-surface border border-borderColor rounded-xl pl-9 pr-4 py-3 text-sm font-bold text-textPrimary focus:outline-none focus:border-primary"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-textSecondary mt-1.5">
                      This helps calculate your actual profit for analytics.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-borderColor">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-textSecondary hover:text-textPrimary bg-surface border border-borderColor hover:bg-bgSecondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-primary hover:bg-primary-light shadow-yellow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Confirming...' : 'Confirm Sale'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MarkAsSoldModal;
