import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { 
  FiTrash2, FiShoppingBag, FiTag, FiX, FiChevronRight, 
  FiHeart, FiInbox, FiTruck, FiShield, FiPercent, FiArrowRight, 
  FiHelpCircle, FiCreditCard, FiAlertTriangle 
} from 'react-icons/fi';
import { PRODUCTS, COUPONS } from '../constants/dummyData';

const Cart = () => {
  const { 
    cart, 
    updateCartQty, 
    removeFromCart, 
    appliedCoupon, 
    applyCouponCode, 
    removeCouponCode,
    wishlist,
    toggleWishlist,
    saveForLater,
    moveToSaveLater,
    moveToCartFromSaveLater,
    removeFromSaveLater,
    showToast
  } = useContext(AppContext);
  
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState(false);
  
  // Shipping Estimator state
  const [pincode, setPincode] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [shippingCost, setShippingCost] = useState(150);
  const [pincodeMessage, setPincodeMessage] = useState('');

  // Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  
  // GST Tax (standard 12%)
  const tax = Math.round(cartSubtotal * 0.12);
  
  // Dynamic Shipping Fee (Free over 20,000 threshold, else follows calculated shipping cost)
  const isFreeShipping = cartSubtotal >= 20000;
  const shippingFee = cartSubtotal === 0 ? 0 : (isFreeShipping ? 0 : shippingCost);

  // Coupon discount calculations
  let discount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minCartValue) {
    if (appliedCoupon.code === 'FREESHIP') {
      discount = shippingFee;
    } else {
      discount = Math.round(cartSubtotal * (appliedCoupon.discountPercent / 100));
      // Max cap for FLASH50
      if (appliedCoupon.code === 'FLASH50' && discount > 10000) {
        discount = 10000;
      }
    }
  }

  const grandTotal = cartSubtotal + tax + shippingFee - discount;

  // Coupon Application Handler
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      const res = applyCouponCode(couponInput);
      if (res.success) {
        setCouponSuccess(true);
        setCouponError(false);
        setTimeout(() => setCouponSuccess(false), 2000);
      } else {
        setCouponError(true);
        setCouponSuccess(false);
        setTimeout(() => setCouponError(false), 2000);
      }
      setCouponInput('');
    }
  };

  // Shipping Estimation Handler
  const handleEstimateShipping = (e) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincode)) {
      // Simulate API calculations
      const days = Math.floor(Math.random() * 3) + 2; // 2 to 4 days
      const date = new Date();
      date.setDate(date.getDate() + days);
      const formattedDate = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      
      setEstimatedDelivery(formattedDate);
      const isMetropolitan = ['110001', '400001', '700001', '600001', '500001', '560001'].includes(pincode);
      const cost = isMetropolitan ? 80 : 150;
      setShippingCost(cost);
      setPincodeMessage(`Delivering to ${pincode} by ${formattedDate}`);
      showToast('Delivery options updated!');
    } else {
      setPincodeMessage('Please enter a valid 6-digit Indian PIN code.');
      setEstimatedDelivery('');
    }
  };

  const handleCheckout = () => {
    // Check if any cart item is out of stock
    const hasOutOfStock = cart.some(item => (item.product.stock || 0) <= 0);
    if (hasOutOfStock) {
      showToast('Please remove out of stock items before checking out.', 'error');
      return;
    }
    if (cart.length > 0) {
      navigate('/checkout');
    }
  };

  // Recommended Products logic (exclude items already in cart)
  const recommendedProducts = PRODUCTS.filter(
    (prod) => !cart.some((item) => item.product.id === prod.id)
  ).slice(0, 4);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left py-6">
      {/* Breadcrumb Header */}
      <div className="border-b border-white/5 pb-6">
        <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-2">
          <Link to="/" className="hover:underline">Home</Link>
          <FiChevronRight className="text-gray-600" />
          <span className="text-white">Cart</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <FiShoppingBag className="text-primary text-3xl" />
          <span>Shopping Cart ({cart.length} items)</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Review your premium selections and customize your shipping options.</p>
      </div>

      {cart.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-3xl p-16 text-center max-w-md mx-auto space-y-6 border border-white/5 shadow-2xl bg-[#0c111d]/40 backdrop-blur-xl relative overflow-hidden"
        >
          {/* Drifting Background Particles */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-primary/20"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${20 + (i * 17) % 60}%`
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, i % 2 === 0 ? 8 : -8, 0],
                  opacity: [0.1, 0.45, 0.1]
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>

          <motion.div 
            animate={{ y: [0, -6, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20 relative z-10"
          >
            <motion.div 
              animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.35, 0.15] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-primary/20 rounded-full blur-md"
            />
            <FiShoppingBag size={42} className="text-primary drop-shadow-[0_0_8px_rgba(255,193,7,0.3)] animate-pulse" />
          </motion.div>

          <div className="space-y-2 relative z-10">
            <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">Your cart is waiting for you to fill it with premium electronics, gear, or fashion.</p>
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="w-full btn-glow-yellow text-xs font-bold py-3.5 rounded-xl uppercase tracking-wider relative z-10 font-bold font-semibold text-black bg-primary"
          >
            Explore Catalog
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Cart items List (70%) */}
          <motion.div layout className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => {
                  const maxStock = item.product.stock || 0;
                  const isLowStock = maxStock > 0 && maxStock <= 3;
                  const isOutOfStock = maxStock <= 0;

                  return (
                    <motion.div 
                      key={item.product.id} 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3 }}
                      className="glass-card border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5 bg-[#0E1420]/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-all group"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="relative overflow-hidden rounded-xl bg-black/20 flex-shrink-0 w-24 h-24 border border-white/5">
                          <img 
                            src={item.product.image} 
                            alt={item.product.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                          {item.product.discount > 0 && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                              -{item.product.discount}%
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-primary uppercase font-extrabold tracking-widest">{item.product.brand}</span>
                            <span className="text-gray-600 text-[10px]">•</span>
                            <span className="text-[10px] text-gray-400 font-medium">Color: Space Black</span>
                          </div>
                          <h3 
                            onClick={() => navigate(`/product/${item.product.id}`)}
                            className="text-xs font-bold text-white line-clamp-1 hover:text-primary transition-all cursor-pointer"
                          >
                            {item.product.title}
                          </h3>

                          {/* Stock Badge */}
                          <div className="flex items-center gap-2 pt-0.5">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                                🔴 Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                                🟡 Only {maxStock} Left
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 px-2.5 py-0.5 rounded-full border border-green-500/20">
                                🟢 In Stock
                              </span>
                            )}

                            {/* Free Shipping Badge */}
                            {item.product.price >= 5000 && (
                              <span className="text-[9px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                                Free Shipping
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1.5 pt-0.5">
                            <FiTruck /> Est. Delivery: {estimatedDelivery || '2-3 Days'}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Selector, Pricing & Action Panel */}
                      <div className="flex flex-row md:flex-col lg:flex-row items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                        
                        {/* Quantity adjustor */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-inner">
                            <button 
                              onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                              disabled={isOutOfStock}
                              className="px-3 py-2 hover:bg-white/10 text-white font-black transition-all text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <span className="px-3 py-2 text-xs font-bold text-white text-center min-w-[32px]">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                              disabled={isOutOfStock || item.quantity >= maxStock}
                              className="px-3 py-2 hover:bg-white/10 text-white font-black transition-all text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>
                          {isOutOfStock && (
                            <span className="text-[9px] text-red-400 font-bold">Restocking soon</span>
                          )}
                        </div>

                        {/* Prices */}
                        <div className="text-right min-w-[100px] space-y-1">
                          <p className="text-xs font-extrabold text-white">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-[10px] text-gray-500 line-through">
                              ₹{(item.product.mrp * item.quantity).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[9px] text-red-400 font-bold">
                              Save ₹{((item.product.mrp - item.product.price) * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          {/* Save For Later */}
                          <button 
                            onClick={() => moveToSaveLater(item.product)}
                            className="p-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
                            title="Save for Later"
                          >
                            <FiInbox size={14} />
                          </button>
                          {/* Move to Wishlist */}
                          <button 
                            onClick={() => {
                              toggleWishlist(item.product);
                              removeFromCart(item.product.id);
                            }}
                            className="p-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-primary rounded-xl transition-all"
                            title="Move to Wishlist"
                          >
                            <FiHeart size={14} />
                          </button>
                          {/* Remove */}
                          <button 
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
                            title="Remove from Cart"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* SHIPPING ESTIMATOR CARD */}
            <div className="glass-card border border-white/10 p-6 rounded-2xl bg-[#0E1420]/40 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                <FiTruck className="text-primary" />
                <span>Shipping Estimator</span>
              </h3>
              <form onSubmit={handleEstimateShipping} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  maxLength="6"
                  placeholder="Enter 6-Digit PIN Code (e.g. 500081)" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="flex-grow bg-black/40 border border-white/10 rounded-xl p-3 px-4 text-xs focus:outline-none focus:border-primary/50 text-white placeholder-gray-500"
                />
                <button type="submit" className="btn-glow-yellow py-3 px-6 text-xs uppercase font-extrabold tracking-wider rounded-xl">
                  Calculate
                </button>
              </form>
              {pincodeMessage && (
                <p className={`text-xs mt-3 font-semibold ${pincodeMessage.includes('valid') ? 'text-red-400' : 'text-primary'}`}>
                  {pincodeMessage}
                </p>
              )}
            </div>

            {/* SAVE FOR LATER SECTION */}
            <AnimatePresence>
              {saveForLater.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className="space-y-4 pt-4"
                >
                  <div className="border-b border-white/5 pb-3">
                    <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                      <FiInbox className="text-primary" />
                      <span>Saved For Later ({saveForLater.length} items)</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {saveForLater.map((item) => (
                      <motion.div 
                        key={item.product.id}
                        layout
                        className="glass-card border border-white/5 p-4 rounded-xl flex items-center gap-4 bg-[#0c111d]/30"
                      >
                        <img src={item.product.image} alt={item.product.title} className="w-16 h-16 rounded-lg object-cover bg-black/10" />
                        <div className="flex-1 min-w-0 text-left space-y-1">
                          <h4 className="text-xs font-bold text-white line-clamp-1">{item.product.title}</h4>
                          <p className="text-xs text-primary font-black">₹{item.product.price.toLocaleString('en-IN')}</p>
                          <div className="flex items-center gap-3 pt-1.5">
                            <button 
                              onClick={() => moveToCartFromSaveLater(item.product)}
                              className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
                            >
                              Move to Cart
                            </button>
                            <span className="text-gray-700 text-[10px]">|</span>
                            <button 
                              onClick={() => removeFromSaveLater(item.product.id)}
                              className="text-[10px] font-bold text-red-400 hover:underline uppercase tracking-wider"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Column: Order Summary (30%) */}
          <div className="lg:col-span-1 space-y-6 sticky top-24">
            
            {/* Coupon application panel */}
            <div className="glass-card border border-white/10 p-6 rounded-2xl bg-[#0E1420]/40 backdrop-blur-xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FiTag className="text-primary" />
                <span>Apply Coupon</span>
              </h3>

              <AnimatePresence mode="wait">
                {appliedCoupon ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-primary/10 border border-primary/20 rounded-xl p-3.5 flex items-center justify-between"
                  >
                    <div className="text-left space-y-0.5">
                      <p className="text-[10px] font-black text-primary tracking-widest uppercase flex items-center gap-1">
                        <FiPercent /> {appliedCoupon.code} ACTIVE
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">{appliedCoupon.description}</p>
                    </div>
                    <button onClick={removeCouponCode} className="text-red-400 hover:text-red-500 transition-colors">
                      <FiX size={16} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleApplyCoupon} 
                    className="flex gap-2"
                  >
                    <input 
                      type="text" 
                      placeholder="Enter Code (e.g. FLASH50)" 
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-grow bg-black/40 border border-white/10 rounded-xl p-3 px-4 text-xs focus:outline-none focus:border-primary/50 text-white placeholder-gray-500 uppercase font-semibold"
                    />
                    <button type="submit" className="btn-glow-yellow !px-5 text-xs tracking-wider uppercase font-extrabold rounded-xl">
                      Apply
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {couponError && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs font-bold flex items-center gap-1.5"
                >
                  <FiAlertTriangle /> Invalid coupon code
                </motion.div>
              )}

              {couponSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-400 text-xs font-bold"
                >
                  🎉 Coupon applied successfully!
                </motion.div>
              )}

              {/* Suggestions */}
              {!appliedCoupon && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <p className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500">Suggested Coupons</p>
                  <div className="flex flex-col gap-2">
                    {COUPONS.map(c => (
                      <button 
                        key={c.code}
                        onClick={() => applyCouponCode(c.code)}
                        className="bg-white/5 border border-white/10 hover:border-primary/30 text-left p-2.5 rounded-xl transition-all text-white flex justify-between items-center"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black text-primary tracking-widest">{c.code}</span>
                          <p className="text-[9px] text-gray-400 font-medium">{c.description}</p>
                        </div>
                        <FiChevronRight className="text-gray-500 text-xs" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price details breakdown summary */}
            <div className="glass-card border border-white/10 p-6 rounded-2xl bg-[#0E1420]/40 backdrop-blur-xl space-y-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">Order Summary</h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Price ({cart.length} items)</span>
                  <span className="text-white font-bold">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>GST (12% standard)</span>
                  <span className="text-white font-bold">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Delivery Charges</span>
                  <span className={shippingFee === 0 ? 'text-green-500 font-extrabold' : 'text-white font-bold'}>
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-500 font-semibold bg-green-500/10 p-2.5 rounded-xl border border-green-500/20">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Free Shipping Alert Threshold Indicator */}
                {!isFreeShipping && cartSubtotal > 0 && (
                  <div className="text-[10px] text-primary bg-primary/10 border border-primary/20 p-2.5 rounded-xl text-center leading-relaxed">
                    Add <strong>₹{(20000 - cartSubtotal).toLocaleString('en-IN')}</strong> more for <strong>FREE SHIPPING</strong>.
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t border-white/5 text-sm font-bold text-white">
                  <span>Grand Total</span>
                  <span className="text-primary text-base font-black shadow-yellow-glow">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-3">
                <button 
                  onClick={handleCheckout}
                  className="w-full btn-glow-yellow text-xs font-extrabold uppercase tracking-wider py-4 text-center rounded-xl flex items-center justify-center gap-2 group btn-premium-interactive"
                >
                  <span>Secure Checkout</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <Link 
                  to="/products"
                  className="w-full py-3 block text-center border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Secure Payment & Badges */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 font-bold">
                  <FiShield className="text-primary text-xs" />
                  <span>Secure 256-Bit SSL Checkout</span>
                </div>
                <div className="flex justify-center gap-3 text-gray-500 text-lg">
                  <FiCreditCard title="Accepted Cards" />
                  <span className="text-[9px] uppercase tracking-widest font-black text-gray-600">Visa • Mastercard • UPI</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* RECOMMENDED / RELATED PRODUCTS SECTION */}
      {recommendedProducts.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-white/5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-white tracking-tight">Recommended For You</h2>
            <Link to="/products" className="text-xs text-primary hover:underline font-bold flex items-center gap-1">
              <span>View All Catalog</span>
              <FiChevronRight />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recommendedProducts.map((prod) => (
              <div 
                key={prod.id}
                className="bg-cardBg border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover-lift transition-all group"
              >
                <div className="space-y-3">
                  <div className="h-40 rounded-xl overflow-hidden bg-black/20 relative">
                    <img src={prod.image} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                    <button 
                      onClick={() => toggleWishlist(prod)}
                      className={`absolute top-2.5 right-2.5 p-2 rounded-full border bg-black/40 hover:bg-black/60 transition-all ${
                        wishlist.some(w => w.id === prod.id) ? 'text-primary border-primary/40' : 'text-gray-400 border-white/5'
                      }`}
                    >
                      <FiHeart className={wishlist.some(w => w.id === prod.id) ? 'fill-current' : ''} size={12} />
                    </button>
                  </div>
                  <div className="text-left space-y-1">
                    <span className="text-[9px] text-primary uppercase font-extrabold tracking-widest">{prod.brand}</span>
                    <h4 
                      onClick={() => navigate(`/product/${prod.id}`)}
                      className="text-xs font-semibold text-white truncate hover:text-primary transition-all cursor-pointer"
                    >
                      {prod.title}
                    </h4>
                    <p className="text-xs font-extrabold text-white">₹{prod.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => addToCart(prod, 1)}
                  disabled={prod.stock <= 0}
                  className="w-full btn-glow-yellow py-2 text-[10px] tracking-wider uppercase font-bold rounded-lg mt-4 disabled:opacity-40"
                >
                  Quick Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
