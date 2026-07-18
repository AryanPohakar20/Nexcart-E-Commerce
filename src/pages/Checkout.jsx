import React, { useContext, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FiMapPin, FiCreditCard, FiDollarSign, FiPlus, FiChevronRight, FiCheck } from 'react-icons/fi';

const Checkout = () => {
  const { 
    cart, addresses, addAddress, appliedCoupon, clearCart, setOrders, showToast 
  } = useContext(AppContext);
  
  const navigate = useNavigate();

  // Selected States
  const [selectedAddrId, setSelectedAddrId] = useState(addresses[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, Card, COD

  // Add Address Form Toggle
  const [isAddAddrOpen, setIsAddAddrOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: '', street: '', city: '', state: '', pin: '', phone: '' });

  // Input states for payments
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

  // Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const tax = Math.round(cartSubtotal * 0.12);
  const shippingFee = cartSubtotal > 20000 || cartSubtotal === 0 ? 0 : 150;
  
  let discount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minCartValue) {
    if (appliedCoupon.code === 'FREESHIP') {
      discount = 150;
    } else {
      discount = Math.round(cartSubtotal * (appliedCoupon.discountPercent / 100));
      if (appliedCoupon.code === 'FLASH50' && discount > 10000) discount = 10000;
    }
  }

  const grandTotal = cartSubtotal + tax + shippingFee - discount;

  // Selected Address text
  const selectedAddressText = useMemo(() => {
    const selected = addresses.find(a => a.id === selectedAddrId);
    if (selected) {
      return `${selected.street}, ${selected.city}, ${selected.state} - ${selected.pin}`;
    }
    return '';
  }, [selectedAddrId, addresses]);

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (newAddr.name && newAddr.street && newAddr.city && newAddr.pin && newAddr.phone) {
      addAddress({ ...newAddr, isDefault: addresses.length === 0 });
      setNewAddr({ name: '', street: '', city: '', state: '', pin: '', phone: '' });
      setIsAddAddrOpen(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!selectedAddrId) {
      showToast('Please select a shipping address', 'error');
      return;
    }

    if (paymentMethod === 'UPI' && !upiId.includes('@')) {
      showToast('Please enter a valid UPI ID (e.g. user@okaxis)', 'error');
      return;
    }

    if (paymentMethod === 'Card' && (cardDetails.number.length < 16 || cardDetails.cvv.length < 3)) {
      showToast('Please enter valid Card Details', 'error');
      return;
    }

    // Place Order mock simulation
    showToast('Processing Payment...', 'info');

    setTimeout(() => {
      const newOrder = {
        id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString().split('T')[0],
        items: [...cart],
        shippingAddress: selectedAddressText,
        paymentMethod: paymentMethod === 'COD' ? 'Cash on Delivery' : paymentMethod === 'UPI' ? `UPI (${upiId})` : 'Credit/Debit Card',
        amount: grandTotal,
        status: 'Processing',
        deliveryEstimate: 'Delivery expected within 2 days'
      };

      setOrders((prev) => [newOrder, ...prev]);
      clearCart();
      showToast('Order Placed Successfully!');
      navigate(`/order-success/${newOrder.id}`);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/5 pb-6 text-left">
        <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-2">
          <Link to="/cart" className="hover:underline">Cart</Link>
          <FiChevronRight />
          <span className="text-white">Checkout</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Billing & Shipping Checkout</h1>
        <p className="text-xs text-gray-500 mt-1">Select shipping details and enter your payment information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Delivery & Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Address Selection Card */}
          <div className="bg-cardBg border border-white/5 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FiMapPin className="text-primary" />
                <span>1. Shipping Address</span>
              </h3>
              <button 
                onClick={() => setIsAddAddrOpen(!isAddAddrOpen)}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
              >
                <FiPlus />
                <span>Add Address</span>
              </button>
            </div>

            {/* List addresses */}
            <div className="flex flex-col gap-3">
              {addresses.map((addr) => (
                <div 
                  key={addr.id}
                  onClick={() => setSelectedAddrId(addr.id)}
                  className={`border rounded-2xl p-4 text-left cursor-pointer transition-all ${
                    selectedAddrId === addr.id 
                      ? 'border-primary bg-primary/5 shadow-yellow-glow' 
                      : 'border-white/5 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-white">{addr.name}</span>
                    {addr.isDefault && <span className="bg-primary/20 text-primary border border-primary/20 text-[9px] uppercase font-extrabold tracking-wider px-1.5 rounded">Default</span>}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed font-medium">{addr.street}, {addr.city}, {addr.state} - {addr.pin}</p>
                  <p className="text-[10px] text-gray-500 font-bold mt-1">Phone: {addr.phone}</p>
                </div>
              ))}
            </div>

            {/* Add Address Form panel */}
            {isAddAddrOpen && (
              <form onSubmit={handleAddAddress} className="p-4 bg-black/30 border border-white/10 rounded-2xl grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="block text-gray-500 mb-1 font-bold">Full Name</label>
                  <input 
                    type="text" 
                    value={newAddr.name}
                    onChange={(e) => setNewAddr(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                    placeholder="Arjun Verma"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-500 mb-1 font-bold">Street Address</label>
                  <input 
                    type="text" 
                    value={newAddr.street}
                    onChange={(e) => setNewAddr(p => ({ ...p, street: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                    placeholder="Apt 203, Sky Villa"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">City</label>
                  <input 
                    type="text" 
                    value={newAddr.city}
                    onChange={(e) => setNewAddr(p => ({ ...p, city: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                    placeholder="Mumbai"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">State</label>
                  <input 
                    type="text" 
                    value={newAddr.state}
                    onChange={(e) => setNewAddr(p => ({ ...p, state: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                    placeholder="Maharashtra"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">PIN Code</label>
                  <input 
                    type="text" 
                    value={newAddr.pin}
                    onChange={(e) => setNewAddr(p => ({ ...p, pin: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                    placeholder="400001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">Contact Number</label>
                  <input 
                    type="text" 
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                    placeholder="9988776655"
                    required
                  />
                </div>
                <button type="submit" className="col-span-2 btn-glow-yellow !py-2.5 text-xs text-black">
                  Save Address
                </button>
              </form>
            )}

          </div>

          {/* 2. Payment Method selection Card */}
          <div className="bg-cardBg border border-white/5 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FiCreditCard className="text-primary" />
              <span>2. Payment Method</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'UPI', name: 'UPI / GPay', icon: FiCheck },
                { id: 'Card', name: 'Debit/Credit Card', icon: FiCreditCard },
                { id: 'COD', name: 'Cash on Delivery', icon: FiDollarSign }
              ].map(pay => (
                <button
                  key={pay.id}
                  onClick={() => setPaymentMethod(pay.id)}
                  type="button"
                  className={`flex flex-col items-center justify-center p-4 border rounded-2xl gap-2 transition-all ${
                    paymentMethod === pay.id 
                      ? 'border-primary bg-primary/5 shadow-yellow-glow text-primary' 
                      : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <pay.icon size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{pay.name}</span>
                </button>
              ))}
            </div>

            {/* Conditional input sections */}
            <div className="pt-2 text-left">
              {paymentMethod === 'UPI' && (
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500 font-bold">UPI ID</label>
                  <input 
                    type="text" 
                    placeholder="username@okhdfcbank" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                  />
                  <p className="text-[10px] text-gray-500">Pay securely with GPay, PhonePe, or BHIM.</p>
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="col-span-2">
                    <label className="block text-gray-500 mb-1 font-bold">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="4321 8765 2341 0987" 
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails(p => ({ ...p, number: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails(p => ({ ...p, expiry: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">CVV Code</label>
                    <input 
                      type="password" 
                      placeholder="***" 
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails(p => ({ ...p, cvv: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'COD' && (
                <p className="text-xs text-gray-400 bg-white/5 border border-white/5 p-4 rounded-xl leading-relaxed">
                  <strong>Cash on Delivery (COD):</strong> An extra handling fee of ₹50 may apply. Please ensure exact cash is available during parcel arrival.
                </p>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Order Summary box */}
          <div className="bg-cardBg border border-white/5 p-6 rounded-3xl space-y-4 text-left">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Order Summary</h3>

            {/* List items */}
            <div className="divide-y divide-white/5 space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between py-2 text-xs">
                  <div className="max-w-[150px] truncate">
                    <p className="font-bold text-white truncate">{item.product.title}</p>
                    <span className="text-[10px] text-gray-500">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-semibold text-gray-300">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Price values breakdown */}
            <div className="border-t border-white/5 pt-4 space-y-2 text-xs divide-y divide-white/5">
              <div className="flex justify-between py-1.5 text-gray-400">
                <span>Subtotal</span>
                <span className="text-white">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 text-gray-400">
                <span>GST (12% standard)</span>
                <span className="text-white">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 text-gray-400">
                <span>Shipping fee</span>
                <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between py-1.5 text-green-500 font-semibold">
                  <span>Discount</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between py-3 text-sm font-bold text-white">
                <span>Grand Total</span>
                <span className="text-primary text-base">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrder}
              className="w-full btn-glow-yellow text-xs font-bold py-3 text-center"
            >
              Place Order & Pay
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Checkout;
