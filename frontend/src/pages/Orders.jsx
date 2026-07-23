import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { FiShoppingBag, FiTruck, FiChevronRight } from 'react-icons/fi';

const Orders = () => {
  const { orders } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/5 pb-6 text-left">
        <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-2">
          <Link to="/" className="hover:underline">Home</Link>
          <FiChevronRight />
          <span className="text-white">Orders</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <FiShoppingBag className="text-primary" />
          <span>My Orders</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Review your order history and track dispatch statuses.</p>
      </div>

      {/* Orders List Container */}
      {orders.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto space-y-6 border border-white/5 shadow-2xl">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20">
            <FiShoppingBag size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">No Orders Found</h2>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">You haven't placed any orders yet. Head back to the store to find premium gear.</p>
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="w-full btn-glow-yellow text-xs font-bold py-3"
          >
            Find Products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {orders.map((order, idx) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="bg-cardBg border border-white/5 rounded-3xl p-6 text-left space-y-6 hover:border-primary/20 hover:shadow-yellow-glow duration-300 transition-all"
              >
                
                {/* Order Header Summary */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5 text-xs">
                  <div className="space-y-1">
                    <p className="font-extrabold text-white text-sm">Order: {order.id}</p>
                    <p className="text-gray-400 font-medium">Placed on: {order.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-gray-500 font-bold">Total Amount</p>
                      <p className="font-extrabold text-white text-sm">₹{order.amount.toLocaleString('en-IN')}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest border ${
                      order.status === 'Delivered' 
                        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                        : order.status === 'Cancelled' 
                        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                        : 'bg-primary/10 border-primary/20 text-primary animate-pulse'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items List inside Order */}
                <div className="flex flex-col gap-4">
                  {order.items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-4">
                      <img src={item.product.image} alt={item.product.title} className="w-16 h-16 rounded-xl object-cover bg-black/20" />
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{item.product.title}</h4>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Brand: {item.product.brand} | Qty: {item.quantity}</p>
                        <p className="text-xs font-extrabold text-white mt-1">₹{item.product.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons footer */}
                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-semibold">{order.deliveryEstimate}</span>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => navigate(`/order-details/${order.id}`)}
                      className="flex-1 sm:flex-none px-4 py-2 border border-white/10 hover:border-primary/40 rounded-lg text-xs font-bold text-gray-300 hover:text-primary transition-all"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => navigate(`/track-order/${order.id}`)}
                      className="flex-grow sm:flex-none btn-glow-yellow !px-5 !py-2 text-xs flex items-center justify-center gap-1.5 btn-premium-interactive"
                    >
                      <FiTruck />
                      <span>Track Shipment</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Orders;
