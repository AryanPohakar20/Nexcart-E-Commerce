import React, { useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { FiChevronRight, FiCheckCircle, FiPackage, FiTruck, FiHome } from 'react-icons/fi';

const TrackOrder = () => {
  const { id } = useParams();
  const { orders } = useContext(AppContext);

  const order = useMemo(() => {
    return orders.find(o => o.id === id) || orders[0];
  }, [id, orders]);

  if (!order) {
    return <div className="py-12 text-center text-gray-500">Order not found.</div>;
  }

  // Determine active steps based on status
  // Status: Processing, Shipped, Delivered, Cancelled
  const getStepStatus = (stepIndex) => {
    if (order.status === 'Cancelled') return 'cancelled';
    
    if (order.status === 'Delivered') {
      return 'completed';
    }
    if (order.status === 'Shipped') {
      if (stepIndex <= 2) return 'completed';
      if (stepIndex === 3) return 'active';
      return 'pending';
    }
    // Processing
    if (stepIndex === 0) return 'completed';
    if (stepIndex === 1) return 'active';
    return 'pending';
  };

  const steps = [
    { title: 'Order Confirmed', desc: 'Receipt generated & verified.', icon: FiCheckCircle },
    { title: 'Packed & Dispatched', desc: 'Securely packaged at Hyderabad hub.', icon: FiPackage },
    { title: 'In Transit', desc: 'Forwarded to local delivery center.', icon: FiTruck },
    { title: 'Out For Delivery', desc: 'Courier agent out for shipping.', icon: FiTruck },
    { title: 'Delivered', desc: 'Successfully handed over.', icon: FiHome }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/5 pb-6 text-left">
        <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-2">
          <Link to="/orders" className="hover:underline">Orders</Link>
          <FiChevronRight />
          <span className="text-white">Track Order</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Shipment Tracking</h1>
        <p className="text-xs text-gray-500 mt-1">Live timeline of delivery logs for ID: {order.id}</p>
      </div>

      <div className="max-w-2xl mx-auto bg-cardBg border border-white/5 p-8 rounded-3xl text-left space-y-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between border-b border-white/5 pb-4 text-xs gap-2">
          <div>
            <p className="text-gray-500 font-bold">Estimated Delivery</p>
            <p className="font-extrabold text-white mt-0.5">{order.deliveryEstimate}</p>
          </div>
          <div>
            <p className="text-gray-500 font-bold">Shipping Courier</p>
            <p className="font-extrabold text-white mt-0.5">NexExpress Speedpost</p>
          </div>
        </div>

        {/* Timeline step builders */}
        <div className="relative pl-8 space-y-8 ml-4 py-2">
          {/* Static Background Line */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/10" />

          {/* Animated Active Line */}
          <motion.div 
            initial={{ height: '0%' }}
            animate={{ 
              height: order.status === 'Delivered' 
                ? '100%' 
                : order.status === 'Shipped' 
                ? '75%' 
                : order.status === 'Cancelled' 
                ? '0%' 
                : '25%' 
            }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute left-0 top-0 w-[2px] bg-primary shadow-yellow-glow"
          />

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } }
            }}
            className="space-y-8"
          >
            {steps.map((step, idx) => {
              const stepStatus = getStepStatus(idx);
              const Icon = step.icon;
              
              return (
                <motion.div 
                  key={idx} 
                  variants={{
                    hidden: { opacity: 0, x: -15 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
                  }}
                  className="relative group flex items-start"
                >
                  
                  {/* Step indicator circle */}
                  <div className={`absolute -left-[46px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                    stepStatus === 'completed' 
                      ? 'bg-primary border-primary text-black shadow-yellow-glow' 
                      : stepStatus === 'active' 
                      ? 'bg-accentBlue border-accentBlue text-black animate-pulse shadow-blue-glow' 
                      : stepStatus === 'cancelled'
                      ? 'bg-red-500/20 border-red-500/50 text-red-500'
                      : 'bg-cardBg border-white/10 text-gray-600'
                  }`}>
                    <Icon size={14} />
                  </div>

                  {/* Step Content */}
                  <div className="space-y-1 pl-2">
                    <h4 className={`text-xs font-bold transition-all ${
                      stepStatus === 'completed' ? 'text-white' : stepStatus === 'active' ? 'text-accentBlue' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed font-medium">{step.desc}</p>
                  </div>

                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Footer return */}
        <div className="pt-4 border-t border-white/5 text-center">
          <Link to="/orders" className="btn-glow-yellow !py-2.5 text-xs text-black font-semibold inline-block px-6 btn-premium-interactive">
            Back to Orders List
          </Link>
        </div>

      </div>

    </div>
  );
};

export default TrackOrder;
