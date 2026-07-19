import React, { useContext, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FiCheckCircle, FiTruck, FiShoppingBag, FiChevronRight } from 'react-icons/fi';

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders } = useContext(AppContext);

  const order = useMemo(() => {
    return orders.find(o => o.id === id) || orders[0];
  }, [id, orders]);

  if (!order) {
    return <div className="py-12 text-center text-gray-500">Order details not found.</div>;
  }

  return (
    <div className="min-h-[500px] flex items-center justify-center py-6 text-left">
      <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-center">
        
        {/* Animated Check circle */}
        <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,94,0.2)]">
          <FiCheckCircle size={42} className="animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] text-primary uppercase font-bold tracking-widest">Congratulations</span>
          <h2 className="text-2xl font-black text-white tracking-tight">Order Placed Successfully!</h2>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            Your transaction has been approved and details have been sent to your email.
          </p>
        </div>

        {/* Invoice summaries */}
        <div className="bg-white/5 border border-white/5 p-5 rounded-2xl text-xs text-left divide-y divide-white/5 space-y-3">
          <div className="flex justify-between font-bold text-white pt-2 first:pt-0">
            <span>Order Reference</span>
            <span className="text-primary">{order.id}</span>
          </div>
          <div className="flex justify-between font-medium text-gray-400 pt-3">
            <span>Amount Paid</span>
            <span className="text-white">₹{order.amount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between font-medium text-gray-400 pt-3">
            <span>Delivery Estimate</span>
            <span className="text-white">{order.deliveryEstimate}</span>
          </div>
        </div>

        {/* Action triggers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            onClick={() => navigate(`/track-order/${order.id}`)}
            className="btn-glow-yellow text-xs font-bold py-3 flex items-center justify-center gap-1.5"
          >
            <FiTruck />
            <span>Track Delivery</span>
          </button>
          
          <Link 
            to="/products"
            className="py-3 bg-white/5 border border-white/10 hover:border-primary/40 rounded-lg text-xs font-bold text-gray-300 hover:text-primary transition-all flex items-center justify-center gap-1.5"
          >
            <FiShoppingBag />
            <span>Continue Shopping</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;
