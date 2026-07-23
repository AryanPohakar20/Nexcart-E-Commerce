import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { FiTrash2, FiShoppingBag, FiTag, FiX, FiChevronRight } from 'react-icons/fi';
import { COUPONS } from '../constants/dummyData';

const Cart = () => {
  const { 
    cart, updateCartQty, removeFromCart, appliedCoupon, applyCouponCode, removeCouponCode 
  } = useContext(AppContext);
  
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');

  // Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  
  // Tax (GST at 12%)
  const tax = Math.round(cartSubtotal * 0.12);
  
  // Shipping (Free over 20,000, else flat 150)
  const shippingFee = cartSubtotal > 20000 || cartSubtotal === 0 ? 0 : 150;

  // Coupon discount calculations
  let discount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minCartValue) {
    if (appliedCoupon.code === 'FREESHIP') {
      discount = 150;
    } else {
      discount = Math.round(cartSubtotal * (appliedCoupon.discountPercent / 100));
      // Max cap for FLASH50
      if (appliedCoupon.code === 'FLASH50' && discount > 10000) {
        discount = 10000;
      }
    }
  }

  const grandTotal = cartSubtotal + tax + shippingFee - discount;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCouponCode(couponInput);
      setCouponInput('');
    }
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      navigate('/checkout');
    }
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb Header */}
      <div className="border-b border-white/5 pb-6 text-left">
        <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-2">
          <Link to="/" className="hover:underline">Home</Link>
          <FiChevronRight />
          <span className="text-white">Cart</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <FiShoppingBag className="text-primary" />
          <span>My Shopping Cart ({cart.length} items)</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Review items, apply coupons, and checkout securely.</p>
      </div>

      {cart.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto space-y-6 border border-white/5 shadow-2xl">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20">
            <FiShoppingBag size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">Your Cart is Empty</h2>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">Add some premium tech, shoes, or gear from our homepage to proceed.</p>
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="w-full btn-glow-yellow text-xs font-bold py-3"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Cart items List */}
          <motion.div layout className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div 
                  key={item.product.id} 
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="bg-cardBg border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  {/* Product Thumbnail & Details */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img src={item.product.image} alt={item.product.title} className="w-20 h-20 rounded-xl object-cover bg-black/20 flex-shrink-0" />
                    <div className="text-left space-y-1">
                      <span className="text-[9px] text-primary uppercase font-extrabold tracking-widest">{item.product.brand}</span>
                      <h3 
                        onClick={() => navigate(`/product/${item.product.id}`)}
                        className="text-xs font-bold text-white line-clamp-1 hover:text-primary transition-all cursor-pointer"
                      >
                        {item.product.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-bold">₹{item.product.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Quantity adjustments & Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    
                    {/* Quantity Box */}
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                      <motion.button 
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                        className="px-2.5 py-1 hover:bg-white/10 text-white font-bold transition-all text-xs"
                      >
                        -
                      </motion.button>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span 
                          key={item.quantity}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.2 }}
                          className="px-3 py-1 text-xs font-bold text-white text-center min-w-[28px] inline-block"
                        >
                          {item.quantity}
                        </motion.span>
                      </AnimatePresence>
                      <motion.button 
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                        className="px-2.5 py-1 hover:bg-white/10 text-white font-bold transition-all text-xs"
                      >
                        +
                      </motion.button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[80px]">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.p 
                          key={item.quantity}
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: 1, scale: [1, 1.05, 1] }}
                          transition={{ duration: 0.25 }}
                          className="text-xs font-extrabold text-white"
                        >
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </motion.p>
                      </AnimatePresence>
                    </div>

                    {/* Remove CTA */}
                    <motion.button 
                      whileHover={{ scale: 1.08, rotate: 5 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <FiTrash2 size={13} />
                    </motion.button>

                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Right Column: Checkout Pricing Summary sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Coupon Application Box */}
            <div className="bg-cardBg border border-white/5 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FiTag className="text-primary" />
                <span>Apply Coupon</span>
              </h3>

              {appliedCoupon ? (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center justify-between">
                  <div className="text-left space-y-0.5">
                    <p className="text-[10px] font-bold text-primary tracking-widest">{appliedCoupon.code} ACTIVE</p>
                    <p className="text-[10px] text-gray-400">Saving applied on checkout summary.</p>
                  </div>
                  <button onClick={removeCouponCode} className="text-red-400 hover:text-red-500">
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Code (e.g. FLASH50)" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-grow bg-black/40 border border-white/10 rounded-lg p-2 px-3 text-xs focus:outline-none focus:border-primary/50 text-white placeholder-gray-500"
                  />
                  <button type="submit" className="btn-glow-yellow !px-4 !py-2 text-xs btn-premium-interactive">
                    Apply
                  </button>
                </form>
              )}

              {/* Suggestions */}
              {!appliedCoupon && (
                <div className="space-y-1.5 pt-2">
                  <p className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500">Suggested Coupons</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COUPONS.map(c => (
                      <button 
                        key={c.code}
                        onClick={() => applyCouponCode(c.code)}
                        className="bg-white/5 border border-white/10 hover:border-primary/30 text-[9px] font-bold px-2 py-1 rounded transition-all text-gray-300"
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price details breakdown */}
            <div className="bg-cardBg border border-white/5 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Price Details</h3>
              
              <div className="space-y-2 text-xs divide-y divide-white/5">
                <div className="flex justify-between py-2 text-gray-400">
                  <span>Price ({cart.length} items)</span>
                  <span className="text-white font-medium">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 text-gray-400">
                  <span>GST (12% standard)</span>
                  <span className="text-white font-medium">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 text-gray-400">
                  <span>Delivery Charges</span>
                  <span className={shippingFee === 0 ? 'text-green-500 font-bold' : 'text-white font-medium'}>
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between py-2 text-green-500 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 text-sm font-bold text-white">
                  <span>Grand Total</span>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span 
                      key={grandTotal}
                      initial={{ opacity: 0.8, scale: 0.95 }}
                      animate={{ opacity: 1, scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.3 }}
                      className="text-primary text-base font-black shadow-yellow-glow"
                    >
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full btn-glow-yellow text-xs font-bold py-3 text-center btn-premium-interactive"
              >
                Secure Checkout
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;
