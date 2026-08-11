import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SellerContext } from '../../context/SellerContext';
import { AppContext } from '../../context/AppContext';
import { 
  FiX, FiTruck, FiCheckCircle, FiClock, FiAlertCircle, 
  FiUser, FiMapPin, FiPhone, FiMail, FiPackage, FiDollarSign 
} from 'react-icons/fi';

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  const { updateOrderStatus, cancelOrder } = useContext(SellerContext);
  const { formatCurrency } = useContext(AppContext);

  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const [carrier, setCarrier] = useState(order?.carrier || 'Delhivery');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');

  if (!isOpen || !order) return null;

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';

  const handleAdvanceStatus = (nextStatus) => {
    updateOrderStatus(order.id, nextStatus, {
      carrier,
      trackingNumber: trackingNumber || `TRK-${Date.now().toString().slice(-6)}`,
    });
    setIsUpdatingTracking(false);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrder(order.id, 'Cancelled by Seller Studio');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-cardBg border border-borderColor rounded-3xl shadow-2xl overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col text-xs"
        >
          {/* Header */}
          <div className="p-6 border-b border-borderColor flex items-center justify-between bg-surface/50">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-base font-black text-textPrimary">{order.id}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-extrabold uppercase text-[10px] tracking-wider border ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : order.status === 'Shipped'
                      ? 'bg-accentBlue/10 text-blue-600 dark:text-accentBlue border-accentBlue/20'
                      : order.status === 'Processing'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : order.status === 'Cancelled'
                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                      : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-[11px] text-textSecondary mt-1">
                Placed on {order.orderDate} • Payment: <span className="text-textPrimary font-bold">{order.paymentMethod}</span> ({order.paymentStatus})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface border border-borderColor text-textSecondary hover:text-textPrimary transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Tracking Pipeline Stepper */}
            {!isCancelled ? (
              <div className="bg-surface border border-borderColor p-4 rounded-2xl">
                <div className="flex items-center justify-between relative">
                  {/* Connecting Line */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-borderColor -z-0" />
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-500 -z-0"
                    style={{
                      width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%`,
                    }}
                  />

                  {STATUS_STEPS.map((step, idx) => {
                    const isPassed = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;

                    return (
                      <div key={step} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                            isPassed
                              ? 'bg-primary text-black shadow-yellow-glow'
                              : 'bg-cardBg text-textSecondary border border-borderColor'
                          }`}
                        >
                          {isPassed ? <FiCheckCircle size={14} /> : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] font-bold mt-1.5 ${
                            isCurrent ? 'text-primary' : isPassed ? 'text-textPrimary' : 'text-textSecondary'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {order.trackingNumber && order.trackingNumber !== 'CANCELLED' && (
                  <div className="mt-4 pt-3 border-t border-borderColor flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2 text-textSecondary">
                      <FiTruck className="text-primary" />
                      <span>Carrier: <strong className="text-textPrimary">{order.carrier}</strong></span>
                      <span>• Tracking: <strong className="text-primary font-mono">{order.trackingNumber}</strong></span>
                    </div>
                    <span className="text-textSecondary">{order.deliveryEstimate}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500">
                <FiAlertCircle size={20} />
                <div>
                  <h4 className="font-bold">This order is Cancelled</h4>
                  <p className="text-[11px] text-textSecondary">{order.customerNote || 'Cancelled upon request'}</p>
                </div>
              </div>
            )}

            {/* Customer & Delivery Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Card */}
              <div className="bg-surface border border-borderColor p-4 rounded-2xl space-y-3">
                <span className="text-[10px] uppercase font-extrabold text-textSecondary tracking-wider flex items-center gap-1.5">
                  <FiUser className="text-primary" />
                  <span>Buyer Information</span>
                </span>
                <div className="flex items-center gap-3">
                  <img
                    src={order.customer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'}
                    alt={order.customer?.name}
                    className="w-10 h-10 rounded-full object-cover border border-borderColor"
                  />
                  <div>
                    <h4 className="text-textPrimary font-bold text-sm">{order.customer?.name}</h4>
                    <p className="text-textSecondary text-[11px] flex items-center gap-1 mt-0.5">
                      <FiMail size={12} /> {order.customer?.email}
                    </p>
                    <p className="text-textSecondary text-[11px] flex items-center gap-1">
                      <FiPhone size={12} /> {order.customer?.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-surface border border-borderColor p-4 rounded-2xl space-y-3">
                <span className="text-[10px] uppercase font-extrabold text-textSecondary tracking-wider flex items-center gap-1.5">
                  <FiMapPin className="text-primary" />
                  <span>Shipping & Delivery Destination</span>
                </span>
                <p className="text-textSecondary font-medium leading-relaxed">
                  {order.shippingAddress}
                </p>
                <div className="pt-2 border-t border-borderColor text-[11px] text-textSecondary">
                  Mode: <span className="text-primary font-bold">{order.deliveryType}</span>
                </div>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="bg-surface border border-borderColor rounded-2xl overflow-hidden">
              <div className="p-3.5 border-b border-borderColor font-extrabold text-textPrimary text-xs uppercase tracking-wider flex items-center gap-2">
                <FiPackage className="text-primary" />
                <span>Ordered Item(s)</span>
              </div>
              <div className="divide-y divide-borderColor">
                {order.items.map((item, index) => (
                  <div key={index} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 rounded-xl object-cover border border-borderColor"
                      />
                      <div>
                        <h5 className="font-bold text-textPrimary text-xs">{item.title}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-textSecondary">Qty: {item.quantity}</span>
                          {item.sellerType === 'individual_c2c' ? (
                            <span className="bg-primary/10 text-primary px-1.5 py-0.2 rounded text-[9px] font-bold">
                              C2C Pre-owned
                            </span>
                          ) : (
                            <span className="bg-accentBlue/10 text-accentBlue px-1.5 py-0.2 rounded text-[9px] font-bold">
                              Retail Brand
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-textPrimary text-sm">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                      <span className="text-[10px] text-textSecondary">{formatCurrency(item.price)} / unit</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-surface border-t border-borderColor flex justify-between items-center font-bold">
                <span className="text-textSecondary">Total Order Amount:</span>
                <span className="text-base text-primary font-black">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            {/* Action Buttons to Advance Order Pipeline */}
            {!isCancelled && (
              <div className="bg-surface border border-borderColor p-4 rounded-2xl space-y-3">
                <span className="text-[10px] uppercase font-extrabold text-textSecondary tracking-wider block">
                  Studio Workflow Actions
                </span>

                {isUpdatingTracking ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-textSecondary font-bold mb-1">Carrier Name</label>
                        <input
                          type="text"
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          placeholder="Delhivery / BlueDart / SpeedPost"
                          className="w-full bg-cardBg border border-borderColor rounded-xl px-3 py-2 text-textPrimary text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-textSecondary font-bold mb-1">Tracking AWB #</label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="TRK-987654"
                          className="w-full bg-cardBg border border-borderColor rounded-xl px-3 py-2 text-textPrimary text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsUpdatingTracking(false)}
                        className="px-4 py-2 rounded-xl bg-cardBg border border-borderColor text-textSecondary hover:text-textPrimary"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdvanceStatus('Shipped')}
                        className="px-4 py-2 rounded-xl font-bold bg-accentBlue text-black hover:bg-accentBlue/90 shadow-blue-glow"
                      >
                        Confirm Dispatch & Mark Shipped
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => handleAdvanceStatus('Processing')}
                        className="px-4 py-2.5 rounded-xl font-bold bg-primary text-black hover:bg-primary-light shadow-yellow-glow"
                      >
                        Accept & Mark Processing
                      </button>
                    )}

                    {order.status === 'Processing' && (
                      <button
                        onClick={() => setIsUpdatingTracking(true)}
                        className="px-4 py-2.5 rounded-xl font-bold bg-accentBlue text-black hover:bg-accentBlue/90 shadow-blue-glow flex items-center gap-1.5"
                      >
                        <FiTruck size={14} />
                        <span>Dispatch & Mark as Shipped</span>
                      </button>
                    )}

                    {order.status === 'Shipped' && (
                      <button
                        onClick={() => handleAdvanceStatus('Delivered')}
                        className="px-4 py-2.5 rounded-xl font-bold bg-emerald-400 text-black hover:bg-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5"
                      >
                        <FiCheckCircle size={14} />
                        <span>Confirm Delivery Handoff</span>
                      </button>
                    )}

                    {order.status !== 'Delivered' && (
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2.5 rounded-xl font-bold bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 ml-auto"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-borderColor bg-surface/40 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl font-bold bg-surface border border-borderColor text-textSecondary hover:text-textPrimary"
            >
              Close Window
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderDetailsModal;
