import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { CATEGORIES } from '../constants/dummyData';
import { 
  FiDollarSign, FiShoppingBag, FiUsers, FiArchive, FiPlus, FiCheck, 
  FiPackage, FiBarChart2, FiArrowRight, FiPercent, FiTrash2, FiCopy, 
  FiEye, FiEyeOff, FiTrendingUp, FiAlertCircle, FiSettings, FiUser, 
  FiMessageSquare, FiSend, FiStar, FiClock, FiUploadCloud, FiShield, 
  FiLayers, FiFilter, FiDownload, FiMapPin, FiTag, FiX 
} from 'react-icons/fi';

// Premium CountUp Helper for stats counters
const CountUp = ({ to, duration = 1.0, formatter = (val) => val }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = to;
    if (start === end) return;

    const totalMiliseconds = duration * 1000;
    const intervalTime = 25; 
    const totalSteps = Math.round(totalMiliseconds / intervalTime);
    const increment = (end - start) / totalSteps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setCount((prev) => {
        const nextVal = Math.round(start + increment * currentStep);
        if (currentStep >= totalSteps) {
          clearInterval(timer);
          return end;
        }
        return nextVal;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [to, duration]);

  return <span>{formatter(count)}</span>;
};

const SellerDashboard = () => {
  const { showToast, user } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Active sub-page dispatcher based on location path
  const currentPath = location.pathname;

  // 1. My Listings State
  const [vendorProducts, setVendorProducts] = useState([
    { id: 'vp1', title: 'Apple iPhone 15 Pro Max (256GB)', price: 139900, stock: 12, category: 'mobiles', sku: 'NEX-IP15PM', status: 'Active', views: 1840, orders: 45, rating: 4.8 },
    { id: 'vp2', title: 'Sony WH-1000XM5 Noise Cancelling', price: 24999, stock: 3, category: 'electronics', sku: 'NEX-SXM5', status: 'Active', views: 980, orders: 21, rating: 4.6 },
    { id: 'vp3', title: 'Nike Air Max Pulse Sneakers', price: 13999, stock: 25, category: 'fashion', sku: 'NEX-NAMP', status: 'Active', views: 2400, orders: 88, rating: 4.5 },
    { id: 'vp4', title: 'MacBook Pro 16-inch M3 Max', price: 349900, stock: 0, category: 'laptops', sku: 'NEX-MBP16M3', status: 'OutOfStock', views: 320, orders: 12, rating: 4.9 }
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProd, setNewProd] = useState({ title: '', price: '', stock: '', category: 'electronics', sku: '', status: 'Active' });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (newProd.title && newProd.price && newProd.stock) {
      const added = {
        id: `vp-${Date.now()}`,
        title: newProd.title,
        price: Number(newProd.price),
        stock: Number(newProd.stock),
        category: newProd.category,
        sku: newProd.sku || `NEX-V${Math.floor(Math.random() * 9000) + 1000}`,
        status: Number(newProd.stock) > 0 ? 'Active' : 'OutOfStock',
        views: 0,
        orders: 0,
        rating: 5.0
      };
      setVendorProducts(prev => [added, ...prev]);
      setNewProd({ title: '', price: '', stock: '', category: 'electronics', sku: '', status: 'Active' });
      setIsAddOpen(false);
      showToast('Product Listing Published successfully!');
    }
  };

  const handleDuplicate = (prod) => {
    const duplicated = {
      ...prod,
      id: `vp-${Date.now()}`,
      title: `${prod.title} (Copy)`,
      sku: `${prod.sku}-COPY`
    };
    setVendorProducts(prev => [duplicated, ...prev]);
    showToast('Listing duplicated successfully!');
  };

  const handleDeleteListing = (id) => {
    setVendorProducts(prev => prev.filter(p => p.id !== id));
    showToast('Listing removed permanently', 'info');
  };

  const handleToggleStatus = (id) => {
    setVendorProducts(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'Active' ? 'Hidden' : 'Active';
        showToast(`Listing status updated to ${nextStatus}`);
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  // 2. Orders Received State
  const [vendorOrders, setVendorOrders] = useState([
    { id: 'ORD-8941', customer: 'Amit Patel', product: 'Apple iPhone 15 Pro Max', qty: 1, amount: 139900, paymentStatus: 'Paid', status: 'Pending', date: '2026-07-26', courier: 'BlueDart', tracking: 'BD98471203', address: 'B-402, Gagan Vihar, Andheri West, Mumbai, MH - 400053' },
    { id: 'ORD-8923', customer: 'Priya Sharma', product: 'Sony WH-1000XM5 Headphones', qty: 1, amount: 24999, paymentStatus: 'Paid', status: 'Shipped', date: '2026-07-25', courier: 'Delhivery', tracking: 'DL9421034', address: 'Penthouse B, Skyview Heights, Hitec City, Hyderabad - 500081' },
    { id: 'ORD-8891', customer: 'Rahul Joshi', product: 'Nike Air Max Pulse Sneakers', qty: 2, amount: 27998, paymentStatus: 'Paid', status: 'Delivered', date: '2026-07-22', courier: 'FedEx', tracking: 'FX20391244', address: '12, MG Road, Landmark Residency, Bengaluru, KA - 560001' }
  ]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  const updateOrderStatus = (orderId, nextStatus) => {
    setVendorOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        showToast(`Order ${orderId} updated to ${nextStatus}`, 'success');
        return { ...ord, status: nextStatus };
      }
      return ord;
    }));
  };

  // 3. Messages State
  const [conversations, setConversations] = useState([
    { id: 'c1', user: 'Amit Patel', unread: 2, lastMsg: 'Is the warranty applicable in India?', messages: [
      { sender: 'user', text: 'Hi, I ordered the iPhone 15 Pro Max.' },
      { sender: 'user', text: 'Is the warranty applicable in India?' }
    ]},
    { id: 'c2', user: 'Priya Sharma', unread: 0, lastMsg: 'Thanks for fast shipping!', messages: [
      { sender: 'user', text: 'When will the headphones deliver?' },
      { sender: 'seller', text: 'Hi Priya, we shipped it via Delhivery, it should arrive by tomorrow.' },
      { sender: 'user', text: 'Thanks for fast shipping!' }
    ]}
  ]);
  const [activeConvId, setActiveConvId] = useState('c1');
  const [newMsgText, setNewMsgText] = useState('');

  const handleSendMessage = () => {
    if (!newMsgText.trim()) return;
    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        return {
          ...c,
          lastMsg: newMsgText,
          messages: [...c.messages, { sender: 'seller', text: newMsgText }]
        };
      }
      return c;
    }));
    setNewMsgText('');
    setTimeout(() => {
      showToast('Message sent');
    }, 100);
  };

  // 4. Coupons Creator State
  const [coupons, setCoupons] = useState([
    { code: 'NEXSTART20', type: 'Percentage', value: 20, minCart: 5000, status: 'Active' },
    { code: 'FLASH50', type: 'Percentage', value: 50, minCart: 15000, status: 'Active' },
    { code: 'FREESHIP', type: 'Flat', value: 150, minCart: 1000, status: 'Active' }
  ]);
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'Percentage', value: '', minCart: '' });

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (newCoupon.code && newCoupon.value) {
      setCoupons(prev => [...prev, { ...newCoupon, status: 'Active', value: Number(newCoupon.value), minCart: Number(newCoupon.minCart || 0) }]);
      setNewCoupon({ code: '', type: 'Percentage', value: '', minCart: '' });
      showToast('Discount Coupon Created Successfully!');
    }
  };

  // 5. Payouts State
  const [payoutHistory, setPayoutHistory] = useState([
    { id: 'PAY-891', amount: 84900, status: 'Completed', date: '2026-07-20', bank: 'HDFC Bank (**** 4921)' },
    { id: 'PAY-854', amount: 120500, status: 'Completed', date: '2026-07-10', bank: 'ICICI Bank (**** 8940)' }
  ]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutBalance, setPayoutBalance] = useState({ available: 164900, pending: 42100 });

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) return;
    if (amount > payoutBalance.available) {
      showToast('Insufficient available balance.', 'error');
      return;
    }
    setPayoutBalance(prev => ({ ...prev, available: prev.available - amount }));
    setPayoutHistory(prev => [
      { id: `PAY-${Math.floor(Math.random() * 900) + 100}`, amount, status: 'Completed', date: new Date().toISOString().split('T')[0], bank: 'HDFC Bank (**** 4921)' },
      ...prev
    ]);
    setWithdrawAmount('');
    showToast('Withdrawal Processed Successfully!');
  };

  // 6. Review Panel State
  const [reviews, setReviews] = useState([
    { id: 'rv-1', customer: 'Amit Patel', rating: 5, comment: 'Brand new, sealed product. Instant packaging was top tier!', product: 'Apple iPhone 15 Pro Max', date: '2026-07-26', reply: '' },
    { id: 'rv-2', customer: 'Priya Sharma', rating: 4, comment: 'Great sound, slightly warm on earcups over 4 hours usage.', product: 'Sony WH-1000XM5 Headphones', date: '2026-07-24', reply: 'Thank you Priya, glad you liked the ANC features!' }
  ]);
  const [replyInputs, setReplyInputs] = useState({});

  const handlePostReply = (id) => {
    const text = replyInputs[id];
    if (!text?.trim()) return;
    setReviews(prev => prev.map(rv => {
      if (rv.id === id) {
        showToast('Review reply published!');
        return { ...rv, reply: text };
      }
      return rv;
    }));
    setReplyInputs(prev => ({ ...prev, [id]: '' }));
  };

  // 7. Store profile state
  const [profileForm, setProfileForm] = useState({
    storeName: 'NexCart Store Hub',
    ownerName: 'Srushti Salunke',
    email: 'srushtisalunke41@gmail.com',
    phone: '9876543210',
    gstin: '27AAAAA1111A1Z1',
    businessType: 'Retailer',
    address: 'Penthouse B, Skyview Heights, Hitec City',
    city: 'Hyderabad',
    state: 'Telangana',
    pin: '500081',
    description: 'We sell premium grade consumer electronics, smartphones, custom fashion apparel, and accessories.',
    website: 'https://nexcart.shop/store/hub',
    hours: '09:00 AM - 09:00 PM'
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    showToast('Store Profile Information Saved successfully!');
  };

  // 8. Global search filter
  const [globalSearch, setGlobalSearch] = useState('');

  // Calculations for dashboard counters
  const activeListingsCount = vendorProducts.filter(p => p.status === 'Active').length;
  const outOfStockCount = vendorProducts.filter(p => p.stock <= 0).length;
  const lowStockCount = vendorProducts.filter(p => p.stock > 0 && p.stock <= 5).length;
  const completedOrdersCount = vendorOrders.filter(o => o.status === 'Delivered').length;
  const pendingOrdersCount = vendorOrders.filter(o => o.status === 'Pending').length;

  return (
    <div className="space-y-6 text-left pb-12">
      
      {/* GLOBAL DISPATCH RENDERING */}

      {/* VIEW A: DASHBOARD OVERVIEW */}
      {currentPath === '/seller/dashboard' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Welcome Dashboard Title Card */}
          <div className="glass-card border border-white/10 p-6 rounded-3xl bg-[#0E1420]/60 backdrop-blur-xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{profileForm.storeName}</h1>
                <span className="bg-primary/10 border border-primary/20 text-primary text-[9px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FiCheck className="text-xs" /> Verified Merchant
                </span>
              </div>
              <p className="text-xs text-gray-400">Welcome back, <strong>{profileForm.ownerName}</strong>. Check store health and manage customer items.</p>
            </div>
            
            {/* Store Quick Performance Rating */}
            <div className="flex gap-4">
              <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Rating</p>
                <div className="flex items-center justify-center gap-1 text-primary text-sm font-black mt-0.5">
                  <FiStar className="fill-current" /> 4.9
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-2.5 text-center min-w-[90px]">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Perf. Score</p>
                <p className="text-emerald-400 text-sm font-black mt-0.5">98%</p>
              </div>
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => navigate('/seller/products')} className="flex items-center justify-center gap-2 p-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-2xl text-primary font-bold text-xs transition-all uppercase tracking-wider">
              <FiPlus /> Add Product
            </button>
            <button onClick={() => navigate('/seller/orders')} className="flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white font-bold text-xs transition-all uppercase tracking-wider">
              <FiShoppingBag /> Manage Orders
            </button>
            <button onClick={() => navigate('/seller/analytics')} className="flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white font-bold text-xs transition-all uppercase tracking-wider">
              <FiBarChart2 /> View Analytics
            </button>
            <button onClick={() => navigate('/seller/inventory')} className="flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white font-bold text-xs transition-all uppercase tracking-wider">
              <FiArchive /> Inventory
            </button>
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-cardBg border border-white/5 p-5 rounded-3xl space-y-3 relative hover-lift">
              <div className="flex items-center justify-between text-xs text-gray-500 font-extrabold uppercase tracking-wider">
                <span>Revenue</span>
                <FiDollarSign className="text-primary" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white">
                ₹<CountUp to={192800} formatter={(val) => val.toLocaleString('en-IN')} />
              </p>
              <span className="text-[10px] text-green-400 font-bold block">+18.4% monthly</span>
            </div>

            <div className="bg-cardBg border border-white/5 p-5 rounded-3xl space-y-3 relative hover-lift">
              <div className="flex items-center justify-between text-xs text-gray-500 font-extrabold uppercase tracking-wider">
                <span>Active Listings</span>
                <FiPackage className="text-primary" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white">
                <CountUp to={activeListingsCount} />
              </p>
              <span className="text-[10px] text-gray-500 font-bold block">Items live in shop</span>
            </div>

            <div className="bg-cardBg border border-white/5 p-5 rounded-3xl space-y-3 relative hover-lift">
              <div className="flex items-center justify-between text-xs text-gray-500 font-extrabold uppercase tracking-wider">
                <span>Pending Orders</span>
                <FiShoppingBag className="text-primary" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white">
                <CountUp to={pendingOrdersCount} />
              </p>
              <span className="text-[10px] text-yellow-500 font-bold block">Need processing</span>
            </div>

            <div className="bg-cardBg border border-white/5 p-5 rounded-3xl space-y-3 relative hover-lift">
              <div className="flex items-center justify-between text-xs text-gray-500 font-extrabold uppercase tracking-wider">
                <span>Low Stock Alert</span>
                <FiAlertCircle className="text-red-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white">
                <CountUp to={lowStockCount + outOfStockCount} />
              </p>
              <span className="text-[10px] text-red-400 font-bold block">Requires restock</span>
            </div>
          </div>

          {/* Warnings & Recent Orders panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Low stock indicators list */}
            <div className="lg:col-span-1 bg-cardBg border border-white/5 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                <FiAlertCircle className="text-red-400" /> Low Stock Warnings
              </h3>
              <div className="space-y-3">
                {vendorProducts.filter(p => p.stock <= 5).map(p => (
                  <div key={p.id} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                    <div className="text-left space-y-0.5">
                      <p className="text-xs font-bold text-white line-clamp-1">{p.title}</p>
                      <p className="text-[10px] text-gray-500">SKU: {p.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${p.stock === 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                        {p.stock === 0 ? 'SOLD OUT' : `${p.stock} left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders received table */}
            <div className="lg:col-span-2 bg-cardBg border border-white/5 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-black uppercase text-white tracking-wider">Pending Shipping Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-gray-400 border-b border-white/5">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Buyer Name</th>
                      <th className="p-3">Product Description</th>
                      <th className="p-3">Price</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {vendorOrders.slice(0, 2).map((o) => (
                      <tr key={o.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-bold text-white">{o.id}</td>
                        <td className="p-3 text-gray-300">{o.customer}</td>
                        <td className="p-3 text-gray-300 truncate max-w-[120px]">{o.product}</td>
                        <td className="p-3 text-white font-extrabold">₹{o.amount.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => navigate('/seller/orders')} className="text-[10px] text-primary hover:underline font-bold uppercase">
                            Process
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW B: MY LISTINGS */}
      {currentPath === '/seller/products' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <FiPackage className="text-primary" /> My Published Products ({vendorProducts.length})
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Control pricing, modify stock levels, and review listing clicks.</p>
            </div>
            <button 
              onClick={() => setIsAddOpen(true)}
              className="btn-glow-yellow text-xs font-bold py-2.5 px-4 flex items-center gap-2 rounded-xl"
            >
              <FiPlus /> Publish New Item
            </button>
          </div>

          {/* Filtering panel toolbar */}
          <div className="bg-cardBg border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 min-w-[200px]"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto justify-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="OutOfStock">Out of Stock</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>
          </div>

          {/* ADD PRODUCT MODAL SLIDER FORM */}
          <AnimatePresence>
            {isAddOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-secondaryBg border border-white/10 p-6 rounded-3xl max-w-md w-full text-xs space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h3 className="text-sm font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <FiPlus /> New Product Listing
                    </h3>
                    <button onClick={() => setIsAddOpen(false)} className="text-gray-500 hover:text-white">
                      <FiX size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleAddProduct} className="space-y-4 text-left">
                    <div>
                      <label className="block text-gray-500 mb-1 font-bold">Product Title</label>
                      <input 
                        type="text" 
                        value={newProd.title}
                        onChange={(e) => setNewProd(p => ({ ...p, title: e.target.value }))}
                        placeholder="Nike Free Run Sports Shoes"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary/50" 
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-500 mb-1 font-bold">Price (INR)</label>
                        <input 
                          type="number" 
                          value={newProd.price}
                          onChange={(e) => setNewProd(p => ({ ...p, price: e.target.value }))}
                          placeholder="12999" 
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary/50" 
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1 font-bold">Stock Count</label>
                        <input 
                          type="number" 
                          value={newProd.stock}
                          onChange={(e) => setNewProd(p => ({ ...p, stock: e.target.value }))}
                          placeholder="20" 
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary/50" 
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-500 mb-1 font-bold">SKU ID (Optional)</label>
                        <input 
                          type="text" 
                          value={newProd.sku}
                          onChange={(e) => setNewProd(p => ({ ...p, sku: e.target.value.toUpperCase() }))}
                          placeholder="NEX-SHOES" 
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1 font-bold">Category</label>
                        <select
                          value={newProd.category}
                          onChange={(e) => setNewProd(p => ({ ...p, category: e.target.value }))}
                          className="w-full bg-cardBg border border-white/10 rounded-xl p-3 text-xs text-white cursor-pointer"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="w-full btn-glow-yellow py-3.5 mt-2 rounded-xl text-black font-extrabold uppercase tracking-wider text-xs">
                      Publish Product Listing
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Listings Table grid */}
          <div className="bg-cardBg border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 uppercase font-extrabold tracking-wider border-b border-white/5">
                    <th className="p-4">Product Details</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Performance</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vendorProducts
                    .filter(p => {
                      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
                      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
                      return matchesSearch && matchesCategory && matchesStatus;
                    })
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-black/20 overflow-hidden flex-shrink-0 border border-white/5">
                            <img src={`https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80`} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-white line-clamp-1">{p.title}</p>
                            <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              p.status === 'Active' ? 'bg-green-500/10 text-green-400' : p.status === 'Hidden' ? 'bg-gray-500/10 text-gray-400' : 'bg-red-500/10 text-red-400'
                            }`}>{p.status}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-400 font-bold">{p.sku}</td>
                        <td className="p-4 text-gray-400 capitalize">{p.category}</td>
                        <td className="p-4 text-white font-extrabold">₹{p.price.toLocaleString('en-IN')}</td>
                        <td className="p-4 font-bold">
                          <span className={p.stock <= 5 ? 'text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-500/10' : 'text-gray-300'}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4 text-amber-400 font-bold flex items-center gap-1 pt-7">
                          <FiStar className="fill-current" /> {p.rating}
                        </td>
                        <td className="p-4 text-gray-500 font-medium">
                          <p>{p.views} views</p>
                          <p>{p.orders} orders</p>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleToggleStatus(p.id)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white" title={p.status === 'Active' ? 'Hide Listing' : 'Activate Listing'}>
                              {p.status === 'Active' ? <FiEye /> : <FiEyeOff />}
                            </button>
                            <button onClick={() => handleDuplicate(p)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white" title="Duplicate Listing">
                              <FiCopy />
                            </button>
                            <button onClick={() => handleDeleteListing(p.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400" title="Delete Listing">
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW C: ORDERS RECEIVED */}
      {currentPath === '/seller/orders' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <FiShoppingBag className="text-primary" /> Received Order Control Desk
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage delivery fulfillment, accept payouts, and download cargo invoices.</p>
          </div>

          {/* Filter status buttons */}
          <div className="flex flex-wrap gap-2 text-xs">
            {['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
              <button 
                key={status}
                onClick={() => setOrderStatusFilter(status)}
                className={`px-4 py-2 rounded-xl font-bold transition-all border ${
                  orderStatusFilter === status 
                    ? 'bg-primary text-black border-primary shadow-yellow-glow' 
                    : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
                }`}
              >
                {status} Orders
              </button>
            ))}
          </div>

          {/* Orders Cards Grid */}
          <div className="space-y-4">
            {vendorOrders
              .filter(o => orderStatusFilter === 'All' || o.status === orderStatusFilter)
              .map((o) => (
                <div key={o.id} className="glass-card border border-white/10 p-6 rounded-2xl bg-[#0E1420]/40 backdrop-blur-xl flex flex-col gap-6">
                  {/* Order Details Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
                    <div className="text-left space-y-0.5">
                      <p className="text-sm font-black text-white">{o.id}</p>
                      <p className="text-[10px] text-gray-500">Ordered on: {o.date}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        o.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                        o.status === 'Shipped' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                        'bg-green-500/10 text-green-500 border border-green-500/20'
                      }`}>{o.status}</span>
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {o.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-left">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Customer</p>
                      <p className="text-white font-bold mt-1">{o.customer}</p>
                      <p className="text-gray-400 mt-1">{o.address}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Listing Purchased</p>
                      <p className="text-white font-bold mt-1">{o.product}</p>
                      <p className="text-gray-400 mt-1">Quantity: {o.qty} unit • Total: ₹{o.amount.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Shipping Partner</p>
                      <p className="text-white font-bold mt-1">{o.courier}</p>
                      <p className="text-gray-400 mt-1">Tracking ID: {o.tracking}</p>
                    </div>
                  </div>

                  {/* Order Process Timeline Tracker */}
                  <div className="bg-black/30 p-4 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-3 text-left">Milestone Fulfillment Timeline</p>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                      <div className="flex items-center gap-1.5 text-primary">
                        <FiCheck className="bg-primary/20 p-0.5 rounded-full text-sm" /> <span>Order Received</span>
                      </div>
                      <div className="w-12 h-0.5 bg-white/10" />
                      <div className={`flex items-center gap-1.5 ${['Shipped', 'Delivered'].includes(o.status) ? 'text-primary' : ''}`}>
                        {['Shipped', 'Delivered'].includes(o.status) ? <FiCheck className="bg-primary/20 p-0.5 rounded-full text-sm" /> : <span className="w-3.5 h-3.5 rounded-full border border-gray-600 inline-block" />}
                        <span>Ready & Shipped</span>
                      </div>
                      <div className="w-12 h-0.5 bg-white/10" />
                      <div className={`flex items-center gap-1.5 ${o.status === 'Delivered' ? 'text-green-400' : ''}`}>
                        {o.status === 'Delivered' ? <FiCheck className="bg-green-400/20 p-0.5 rounded-full text-sm text-green-400" /> : <span className="w-3.5 h-3.5 rounded-full border border-gray-600 inline-block" />}
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>

                  {/* Action panel triggers */}
                  <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => showToast(`Invoice PDF download initiated for ${o.id}`)}
                      className="text-[10px] text-gray-400 hover:text-white font-bold flex items-center gap-1.5 border border-white/10 p-2 px-3 rounded-lg"
                    >
                      <FiDownload /> Download Invoice
                    </button>
                    
                    <div className="flex gap-2">
                      {o.status === 'Pending' && (
                        <>
                          <button onClick={() => updateOrderStatus(o.id, 'Shipped')} className="btn-glow-yellow py-2 px-4 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-black">
                            Confirm & Ship Cargo
                          </button>
                          <button onClick={() => updateOrderStatus(o.id, 'Cancelled')} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 px-4 rounded-lg text-[10px] font-bold uppercase">
                            Reject Order
                          </button>
                        </>
                      )}
                      {o.status === 'Shipped' && (
                        <button onClick={() => updateOrderStatus(o.id, 'Delivered')} className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded-lg text-[10px] font-extrabold uppercase text-white">
                          Mark As Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* VIEW D: INVENTORY OVERVIEW */}
      {currentPath === '/seller/inventory' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <FiArchive className="text-primary" /> Warehouse Inventory Control Dashboard
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Track units, receive out-of-stock warning notifications, and modify counts.</p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-cardBg border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Total Stock Units</p>
              <p className="text-lg font-black text-white mt-1">
                <CountUp to={40} /> units
              </p>
            </div>
            <div className="bg-cardBg border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Low Stock Warning</p>
              <p className="text-lg font-black text-yellow-500 mt-1">
                <CountUp to={lowStockCount} /> items
              </p>
            </div>
            <div className="bg-cardBg border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Sold Out Items</p>
              <p className="text-lg font-black text-red-500 mt-1">
                <CountUp to={outOfStockCount} /> items
              </p>
            </div>
            <div className="bg-cardBg border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Valuation Value</p>
              <p className="text-lg font-black text-primary mt-1">
                ₹<CountUp to={2098000} formatter={val => val.toLocaleString('en-IN')} />
              </p>
            </div>
          </div>

          {/* Inventory lists */}
          <div className="bg-cardBg border border-white/5 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 uppercase font-extrabold tracking-wider border-b border-white/5">
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Warehouse Location</th>
                    <th className="p-4">Stock Levels</th>
                    <th className="p-4">Last Updated</th>
                    <th className="p-4 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vendorProducts.map((p) => {
                    const percentage = Math.min((p.stock / 30) * 100, 100);
                    return (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-white">{p.title}</p>
                          <span className="text-[10px] text-gray-500 font-bold">SKU: {p.sku}</span>
                        </td>
                        <td className="p-4 text-gray-400 font-medium">WH-Mumbai East A2</td>
                        <td className="p-4 space-y-1">
                          <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                            <span>{p.stock} units available</span>
                            <span>Cap: 30</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              className={`h-full rounded-full ${
                                p.stock === 0 ? 'bg-red-500' : p.stock <= 5 ? 'bg-amber-500' : 'bg-green-500'
                              }`} 
                            />
                          </div>
                        </td>
                        <td className="p-4 text-gray-500">Today, 11:34 AM</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => {
                                setVendorProducts(prev => prev.map(item => item.id === p.id ? { ...item, stock: Math.max(0, item.stock - 1) } : item));
                                showToast('Stock decreased by 1');
                              }}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-sm"
                            >
                              -
                            </button>
                            <button 
                              onClick={() => {
                                setVendorProducts(prev => prev.map(item => item.id === p.id ? { ...item, stock: item.stock + 5 } : item));
                                showToast('Added 5 units of stock');
                              }}
                              className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm"
                            >
                              +5
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW E: SALES SUMMARY */}
      {currentPath === '/seller/analytics' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <FiBarChart2 className="text-primary" /> Store Analytics Summary
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Analyze monthly sales trends and category share distributions.</p>
            </div>
            
            <button 
              onClick={() => showToast('Report exported successfully!')}
              className="text-xs text-gray-400 hover:text-white border border-white/10 p-2.5 rounded-xl font-bold flex items-center gap-1.5"
            >
              <FiDownload /> Export PDF / CSV
            </button>
          </div>

          {/* Interactive Date Filter */}
          <div className="bg-[#0E1420]/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-gray-400 font-bold">Reporting period: <strong>Last 30 Days</strong></span>
            <div className="flex gap-2">
              <button className="bg-primary text-black font-extrabold p-2 px-3 rounded-lg">30D</button>
              <button className="bg-white/5 text-gray-400 font-bold p-2 px-3 rounded-lg hover:text-white">6M</button>
              <button className="bg-white/5 text-gray-400 font-bold p-2 px-3 rounded-lg hover:text-white">1Y</button>
            </div>
          </div>

          {/* Sales Performance charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* SVG line chart representing trend */}
            <div className="lg:col-span-2 bg-cardBg border border-white/5 p-6 rounded-3xl space-y-6">
              <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                <FiTrendingUp className="text-primary" /> Revenue Flow Trend
              </h3>
              
              <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-white/5 relative">
                {/* SVG Line representation overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M 0 80 Q 25 30, 50 40 T 100 10" fill="none" stroke="#FFC107" strokeWidth="2" />
                  </svg>
                </div>

                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month, idx) => {
                  const values = [120000, 240000, 180000, 320000, 280000, 420000, 490000];
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
                      <span className="text-[8px] text-gray-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{Math.round(values[idx] / 1000)}K
                      </span>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${(values[idx] / 500000) * 100}%` }}
                        className="w-3/5 bg-primary/20 group-hover:bg-primary/50 border border-primary/20 rounded-t-lg cursor-pointer min-h-[5px] transition-all" 
                      />
                      <span className="text-[10px] text-gray-400 font-bold pb-2">{month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sales by Category shares */}
            <div className="lg:col-span-1 bg-cardBg border border-white/5 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                <FiLayers className="text-primary" /> Category Distribution
              </h3>
              
              <div className="space-y-4 pt-3 text-xs">
                {[
                  { name: 'Mobiles', percentage: 38, count: 18, color: 'bg-primary' },
                  { name: 'Laptops', percentage: 24, count: 8, color: 'bg-cyan-400' },
                  { name: 'Electronics', percentage: 18, count: 6, color: 'bg-purple-400' },
                  { name: 'Fashion', percentage: 20, count: 8, color: 'bg-emerald-400' }
                ].map(cat => (
                  <div key={cat.name} className="space-y-1.5 text-left">
                    <div className="flex justify-between font-bold text-gray-400">
                      <span>{cat.name}</span>
                      <span>{cat.percentage}% ({cat.count} listings)</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        className={`h-full rounded-full ${cat.color}`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW F: STORE COUPONS */}
      {currentPath === '/seller/coupons' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <FiTag className="text-primary" /> Store Coupon Codes & Discounts
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Publish custom codes, set minimum checkout baskets, and trace active discounts.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Coupon Card */}
            <div className="lg:col-span-1 bg-cardBg border border-white/10 p-5 rounded-3xl space-y-4 text-xs h-fit">
              <h3 className="text-xs font-black uppercase text-primary tracking-wider">Publish New Coupon</h3>
              
              <form onSubmit={handleCreateCoupon} className="space-y-4 text-left">
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">Coupon Code</label>
                  <input 
                    type="text" 
                    placeholder="E.g. EXTRA30"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white uppercase font-bold focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">Value (INR/%)</label>
                    <input 
                      type="number" 
                      placeholder="30"
                      value={newCoupon.value}
                      onChange={(e) => setNewCoupon(p => ({ ...p, value: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">Type</label>
                    <select
                      value={newCoupon.type}
                      onChange={(e) => setNewCoupon(p => ({ ...p, type: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white cursor-pointer"
                    >
                      <option value="Percentage">Percentage %</option>
                      <option value="Flat">Flat Discount</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-bold">Min Cart Value Required (INR)</label>
                  <input 
                    type="number" 
                    placeholder="2000"
                    value={newCoupon.minCart}
                    onChange={(e) => setNewCoupon(p => ({ ...p, minCart: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <button type="submit" className="w-full btn-glow-yellow py-3 text-black font-extrabold uppercase tracking-wider text-xs rounded-xl">
                  Create Coupon
                </button>
              </form>
            </div>

            {/* Coupons list details */}
            <div className="lg:col-span-2 bg-cardBg border border-white/5 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-black uppercase text-white tracking-wider text-left">Active Store Coupons</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((c) => (
                  <div key={c.code} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                    <div className="text-left space-y-1">
                      <span className="text-xs font-black text-primary tracking-widest">{c.code}</span>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{c.type} discount</p>
                      <p className="text-[10px] text-gray-500">Min. Purchase: ₹{c.minCart.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-white bg-white/5 px-2.5 py-1 rounded border border-white/5">
                        {c.type === 'Percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW G: CUSTOMER MESSAGES */}
      {currentPath === '/seller/messages' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <FiMessageSquare className="text-primary" /> Customer Messaging Box
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Respond to buyer questions, send instructions, and review attachment documents.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
            {/* Conversations list sidebar */}
            <div className="md:col-span-1 bg-cardBg border border-white/5 rounded-3xl p-4 overflow-y-auto space-y-2">
              <p className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500 text-left mb-2">Inbox Threads</p>
              {conversations.map((c) => (
                <button 
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all border ${
                    activeConvId === c.id ? 'bg-primary/10 border-primary/20 text-white' : 'bg-transparent border-transparent hover:bg-white/5 text-gray-400'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">{c.user}</p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{c.lastMsg}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="bg-cyan-400 text-black text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
                      {c.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Live Chat content box */}
            <div className="md:col-span-2 bg-cardBg border border-white/5 rounded-3xl p-4 flex flex-col justify-between h-full">
              {/* Head */}
              <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                <p className="text-xs font-bold text-white">Chat with {conversations.find(c => c.id === activeConvId)?.user}</p>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_#10B981] animate-pulse" />
              </div>
              
              {/* Message History flow */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 no-scrollbar text-xs">
                {conversations.find(c => c.id === activeConvId)?.messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 max-w-[70%] rounded-2xl ${
                      m.sender === 'seller' ? 'bg-primary text-black font-semibold rounded-tr-none' : 'bg-white/5 text-white rounded-tl-none border border-white/5'
                    }`}>
                      <p>{m.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message inputs box */}
              <div className="flex gap-2 border-t border-white/5 pt-3">
                <input 
                  type="text" 
                  placeholder="Type your response instructions here..."
                  value={newMsgText}
                  onChange={(e) => setNewMsgText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white focus:outline-none"
                />
                <button 
                  onClick={handleSendMessage}
                  className="p-3 bg-primary hover:bg-primary-hover text-black font-extrabold rounded-xl transition-all active:scale-95"
                >
                  <FiSend />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW H: CUSTOMER REVIEWS */}
      {currentPath === '/seller/reviews' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <FiStar className="text-primary" /> Customer Feedbacks & Product Reviews
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Read reviews left by purchasers, reply to concerns, and flag fraudulent submissions.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reviews Summary Stats Card */}
            <div className="lg:col-span-1 bg-cardBg border border-white/5 p-5 rounded-3xl space-y-4">
              <h3 className="text-xs font-black uppercase text-white tracking-wider text-left">Store Rating Stats</h3>
              <div className="text-center py-6 bg-black/20 rounded-2xl border border-white/5">
                <p className="text-4xl font-black text-white">4.9</p>
                <div className="flex items-center justify-center gap-1 text-primary text-sm mt-1.5">
                  <FiStar className="fill-current" />
                  <FiStar className="fill-current" />
                  <FiStar className="fill-current" />
                  <FiStar className="fill-current" />
                  <FiStar className="fill-current" />
                </div>
                <p className="text-[10px] text-gray-500 mt-1 font-bold">Based on 98 reviews</p>
              </div>
            </div>

            {/* Reviews List and Reply Editor */}
            <div className="lg:col-span-2 space-y-4">
              {reviews.map((rv) => (
                <div key={rv.id} className="glass-card border border-white/10 p-5 rounded-2xl bg-[#0E1420]/40 text-left space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5 text-xs">
                      <p className="font-bold text-white">{rv.customer}</p>
                      <p className="text-[10px] text-gray-500">Purchased: {rv.product} • {rv.date}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary font-bold">
                      <FiStar className="fill-current" /> {rv.rating}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-300 italic">"{rv.comment}"</p>

                  {/* Merchant Reply Section */}
                  {rv.reply ? (
                    <div className="bg-white/5 border border-white/5 p-3.5 rounded-xl text-[11px] leading-relaxed">
                      <span className="font-extrabold text-primary uppercase text-[9px] block mb-1">Your Response</span>
                      <p className="text-gray-400">"{rv.reply}"</p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Write a public response to this review..."
                        value={replyInputs[rv.id] || ''}
                        onChange={(e) => setReplyInputs(prev => ({ ...prev, [rv.id]: e.target.value }))}
                        className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                      />
                      <button 
                        onClick={() => handlePostReply(rv.id)}
                        className="btn-glow-yellow py-2 px-4 rounded-xl text-black font-extrabold text-[10px] uppercase tracking-wider"
                      >
                        Publish Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW I: PAYOUTS & LEDGER */}
      {currentPath === '/seller/payouts' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <FiDollarSign className="text-primary" /> Store Payout Ledger & Withdrawal Center
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Request balance withdrawals, link merchant bank credentials, and view payout timelines.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Balance Card & Withdrawal triggers */}
            <div className="lg:col-span-1 bg-cardBg border border-white/10 p-5 rounded-3xl space-y-4 text-left">
              <h3 className="text-xs font-black uppercase text-white tracking-wider">Merchant Balance</h3>
              
              <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Available for Withdrawal</p>
                  <p className="text-2xl font-black text-white">₹{payoutBalance.available.toLocaleString('en-IN')}</p>
                </div>
                <div className="border-t border-white/5 pt-3">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Pending Clearance</p>
                  <p className="text-sm font-bold text-gray-400 mt-0.5">₹{payoutBalance.pending.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">Withdraw Amount (INR)</label>
                  <input 
                    type="number" 
                    placeholder="Enter amount (e.g. 50000)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <button type="submit" className="w-full btn-glow-yellow py-3.5 rounded-xl text-black font-extrabold uppercase tracking-wider text-xs">
                  Request Payout Transfer
                </button>
              </form>
            </div>

            {/* Historical ledgers */}
            <div className="lg:col-span-2 bg-cardBg border border-white/5 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-black uppercase text-white tracking-wider text-left">Payout History Ledger</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-gray-400 border-b border-white/5">
                      <th className="p-3">Payout ID</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Payout Bank Account</th>
                      <th className="p-3">Date Processed</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payoutHistory.map((p) => (
                      <tr key={p.id}>
                        <td className="p-3 font-bold text-white">{p.id}</td>
                        <td className="p-3 text-white font-extrabold">₹{p.amount.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-gray-400">{p.bank}</td>
                        <td className="p-3 text-gray-500">{p.date}</td>
                        <td className="p-3 text-right">
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW J: SELLER PROFILE */}
      {currentPath === '/seller/profile' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <FiUser className="text-primary" /> Store Profile & Brand Credentials
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Upload store design mock banners, change company contacts, and configure business fields.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-left">
            {/* Logo and completion metrics */}
            <div className="lg:col-span-1 bg-cardBg border border-white/5 p-5 rounded-3xl space-y-6">
              <h3 className="text-xs font-black uppercase text-white tracking-wider">Store Branding</h3>
              
              {/* Avatar uploads */}
              <div className="space-y-3 text-center">
                <div className="w-24 h-24 mx-auto bg-black/20 rounded-full border border-primary/40 overflow-hidden flex items-center justify-center relative group cursor-pointer">
                  <img src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <FiUploadCloud size={20} />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 font-bold">Store Logo (Square PNG/JPG)</p>
              </div>

              {/* Profile setup completion scale */}
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-gray-400">
                  <span>Profile Completion</span>
                  <span>90%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full rounded-full bg-primary w-[90%]" />
                </div>
              </div>

              {/* Verification status warnings */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex gap-2">
                <FiShield className="text-emerald-400 text-lg flex-shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-bold text-white">Identity Verified</p>
                  <p className="text-[10px] text-gray-400">GSTIN Company files approved by NexCart Admin.</p>
                </div>
              </div>
            </div>

            {/* Profile Information fields Form */}
            <div className="lg:col-span-2 bg-cardBg border border-white/5 p-6 rounded-3xl">
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">Store Name</label>
                    <input 
                      type="text" 
                      value={profileForm.storeName}
                      onChange={(e) => setProfileForm(p => ({ ...p, storeName: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">Owner Full Name</label>
                    <input 
                      type="text" 
                      value={profileForm.ownerName}
                      onChange={(e) => setProfileForm(p => ({ ...p, ownerName: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">GSTIN Number</label>
                    <input 
                      type="text" 
                      value={profileForm.gstin}
                      disabled
                      className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">Store Phone Contact</label>
                    <input 
                      type="text" 
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-bold">Store Description</label>
                  <textarea 
                    rows="3"
                    value={profileForm.description}
                    onChange={(e) => setProfileForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-gray-500 mb-1 font-bold">Street Address</label>
                    <input 
                      type="text" 
                      value={profileForm.address}
                      onChange={(e) => setProfileForm(p => ({ ...p, address: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">PIN Code</label>
                    <input 
                      type="text" 
                      value={profileForm.pin}
                      onChange={(e) => setProfileForm(p => ({ ...p, pin: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" className="btn-glow-yellow py-3 px-8 text-xs text-black font-extrabold uppercase tracking-wider rounded-xl">
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW K: STUDIO SETTINGS */}
      {currentPath === '/seller/settings' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <FiSettings className="text-primary" /> Studio Operational Settings
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Adjust operational parameters, security requirements, and automated low-stock notice alerts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left">
            {/* General operations settings */}
            <div className="bg-cardBg border border-white/5 p-5 rounded-3xl space-y-4">
              <h3 className="text-xs font-black uppercase text-white tracking-wider">Operational Preferences</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">Low Stock Warning Emails</p>
                    <p className="text-[10px] text-gray-500">Notify me immediately when items hit below 5 units.</p>
                  </div>
                  <span className="w-10 h-6 bg-primary rounded-full p-1 cursor-pointer flex items-center justify-end">
                    <span className="w-4 h-4 bg-black rounded-full" />
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">Auto-Accept Pre-Paid Orders</p>
                    <p className="text-[10px] text-gray-500">Skip the accept queue for pre-paid, fully settled carts.</p>
                  </div>
                  <span className="w-10 h-6 bg-primary rounded-full p-1 cursor-pointer flex items-center justify-end">
                    <span className="w-4 h-4 bg-black rounded-full" />
                  </span>
                </div>
              </div>
            </div>

            {/* Security settings */}
            <div className="bg-cardBg border border-white/5 p-5 rounded-3xl space-y-4">
              <h3 className="text-xs font-black uppercase text-white tracking-wider">Security & Access Control</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">Two-Factor Authentication (2FA)</p>
                    <p className="text-[10px] text-gray-500">Request code confirmation during payouts withdrawals.</p>
                  </div>
                  <span className="w-10 h-6 bg-primary rounded-full p-1 cursor-pointer flex items-center justify-end">
                    <span className="w-4 h-4 bg-black rounded-full" />
                  </span>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer" onClick={() => showToast('Redirecting to password reset flow')}>
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">Change Account Password</p>
                    <p className="text-[10px] text-gray-500">Update security logins for this merchant credential.</p>
                  </div>
                  <FiArrowRight className="text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SellerDashboard;
