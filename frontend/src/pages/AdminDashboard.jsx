import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { ADMIN_STATS, CATEGORIES } from '../constants/dummyData';
import { 
  FiSliders, FiUsers, FiBox, FiTrendingUp, FiSettings, 
  FiCheckCircle, FiActivity, FiXCircle, FiStar, FiAlertTriangle, 
  FiTrash2, FiUserMinus, FiCheck, FiFilter, FiAlertCircle, FiShield,
  FiRefreshCw
} from 'react-icons/fi';

const CountUp = ({ to, duration = 1 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(to, 10) || 0;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 15);
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [to, duration]);

  return <span>{count}</span>;
};

const AdminDashboard = () => {
  const { 
    showToast, 
    reviews, 
    setReviews, 
    reports, 
    setReports, 
    adminModerationAction 
  } = useContext(AppContext);
  
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Mock list of system users
  const [usersList, setUsersList] = useState([
    { name: 'Arjun Kapoor', email: 'arjun@gmail.com', role: 'Customer', active: true, date: '2026-07-18' },
    { name: 'Megha Gupta', email: 'megha@seller.com', role: 'Seller', active: true, date: '2026-07-17' },
    { name: 'Rahul Joshi', email: 'rahul@gmail.com', role: 'Customer', active: false, date: '2026-07-16' },
  ]);

  const toggleUserStatus = (email) => {
    setUsersList(prev => 
      prev.map(u => u.email === email ? { ...u, active: !u.active } : u)
    );
    showToast('User account status updated!');
  };

  // Moderation active sub-filter
  const [moderationFilter, setModerationFilter] = useState('pending'); // pending, reported, approved, spam, ai-flagged
  
  // Bulk selection list
  const [selectedReviewIds, setSelectedReviewIds] = useState([]);

  const handleSelectAll = (filteredReviews) => {
    if (selectedReviewIds.length === filteredReviews.length) {
      setSelectedReviewIds([]);
    } else {
      setSelectedReviewIds(filteredReviews.map(r => r.id));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedReviewIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = () => {
    selectedReviewIds.forEach(id => adminModerationAction(id, 'approve'));
    setSelectedReviewIds([]);
  };

  const handleBulkDelete = () => {
    selectedReviewIds.forEach(id => adminModerationAction(id, 'delete'));
    setSelectedReviewIds([]);
  };

  // Get filtered reviews list depending on queue choice
  const getFilteredReviews = () => {
    return reviews.filter(r => {
      if (moderationFilter === 'pending') return r.isApproved && r.reports === 0 && !r.isSpam;
      if (moderationFilter === 'reported') return r.reports > 0 && r.isApproved;
      if (moderationFilter === 'approved') return r.isApproved && r.reports === 0;
      if (moderationFilter === 'spam') return r.isSpam || !r.isApproved;
      if (moderationFilter === 'ai-flagged') return r.qualityScore < 80;
      return true;
    });
  };

  const filteredReviews = getFilteredReviews();

  return (
    <div className="space-y-8 text-left pb-12">
      
      {/* Header section depending on URL path */}
      <div className="border-b border-white/5 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {currentPath === '/admin/reviews' ? 'Reviews & Trust Moderation' : 'Root Administrator Terminal'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {currentPath === '/admin/reviews' 
              ? 'Moderate user comments, verify reported content, and check AI spam index ratios.' 
              : 'Global settings, database aggregates, and access controls.'}
          </p>
        </div>

        {/* Dynamic header navigation */}
        <div className="flex bg-white/5 border border-white/5 rounded-xl p-1 text-xs">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${currentPath === '/admin/dashboard' ? 'bg-accentBlue text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => navigate('/admin/users')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${currentPath === '/admin/users' ? 'bg-accentBlue text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Accounts
          </button>
          <button 
            onClick={() => navigate('/admin/reviews')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${currentPath === '/admin/reviews' ? 'bg-accentBlue text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Review Queue
          </button>
          <button 
            onClick={() => navigate('/admin/categories')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${currentPath === '/admin/categories' ? 'bg-accentBlue text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Categories
          </button>
        </div>
      </div>

      {/* VIEW 1: DASHBOARD OVERVIEW */}
      {currentPath === '/admin/dashboard' && (
        <div className="space-y-8 animate-fade-in-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-cardBg border border-white/5 p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                <span>Active Users</span>
                <FiUsers className="text-accentBlue text-base" />
              </div>
              <p className="text-2xl font-black text-white">{ADMIN_STATS.totalUsers}</p>
              <span className="text-[10px] text-green-400 font-bold">+43 new registered today</span>
            </div>

            <div className="bg-cardBg border border-white/5 p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                <span>System Products</span>
                <FiBox className="text-accentBlue text-base" />
              </div>
              <p className="text-2xl font-black text-white">{ADMIN_STATS.totalProducts}</p>
              <span className="text-[10px] text-accentBlue font-bold">13 catalog collections</span>
            </div>

            <div className="bg-cardBg border border-white/5 p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                <span>Total Orders</span>
                <FiTrendingUp className="text-accentBlue text-base" />
              </div>
              <p className="text-2xl font-black text-white">{ADMIN_STATS.totalOrders}</p>
              <span className="text-[10px] text-green-400 font-bold">+18 completed hours ago</span>
            </div>

            <div className="bg-cardBg border border-white/5 p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                <span>Pending Reviews</span>
                <FiStar className="text-accentBlue text-base animate-pulse" />
              </div>
              <p className="text-2xl font-black text-white">{reviews.filter(r => r.reports > 0).length}</p>
              <span className="text-[10px] text-yellow-500 font-bold">Needs moderation check</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-cardBg border border-white/5 p-6 rounded-3xl space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FiActivity className="text-accentBlue" />
                <span>Sector Sales Distribution</span>
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-8 justify-around pt-4">
                <svg className="w-40 h-40 transform -rotate-90 select-none">
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#1F1F1F" strokeWidth="24" />
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#00C2FF" strokeWidth="24" strokeDasharray="376.8" strokeDashoffset="143.1" />
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#FFC107" strokeWidth="24" strokeDasharray="376.8" strokeDashoffset="233.6" />
                </svg>

                <div className="space-y-3 text-xs">
                  {ADMIN_STATS.categoryShare.map((share, idx) => (
                    <div key={share.name} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-accentBlue' : idx === 1 ? 'bg-primary' : 'bg-gray-600'}`} />
                      <div className="w-24 font-bold text-white">{share.name}</div>
                      <span className="text-gray-500 font-extrabold">{share.percentage}% share</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 bg-cardBg border border-white/5 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Audit Operations</h3>
              <div className="space-y-3 text-xs text-gray-400 font-medium">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-white font-bold">API Server Status</p>
                  <p className="text-[10px] text-green-400 mt-0.5">Online | Ping: 42ms</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-white font-bold">CDN caching</p>
                  <p className="text-[10px] text-primary mt-0.5">Enabled | Hit rate: 94.2%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ACCOUNTS LIST */}
      {currentPath === '/admin/users' && (
        <div className="bg-cardBg border border-white/5 rounded-3xl overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-400 uppercase font-extrabold tracking-wider border-b border-white/5">
                  <th className="p-4">Account name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Operational Status</th>
                  <th className="p-4 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersList.map((user) => (
                  <tr key={user.email} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white">{user.name}</td>
                    <td className="p-4 text-gray-300 font-medium">{user.email}</td>
                    <td className="p-4 text-gray-300 font-medium">{user.role}</td>
                    <td className="p-4 text-gray-500">{user.date}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${user.active ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                        {user.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => toggleUserStatus(user.email)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${user.active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                      >
                        {user.active ? 'Suspend Account' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: REVIEWS MODERATION QUEUE */}
      {currentPath === '/admin/reviews' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Top statistics widgets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-cardBg border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Total Reviews List</p>
              <p className="text-lg font-black text-white mt-1">
                <CountUp to={reviews.length} /> submissions
              </p>
            </div>
            <div className="bg-cardBg border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Active User Reports</p>
              <p className="text-lg font-black text-red-400 mt-1">
                <CountUp to={reports.filter(r => r.status === 'pending').length} /> reports
              </p>
            </div>
            <div className="bg-cardBg border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] text-gray-500 uppercase font-bold">AI Spam Flags</p>
              <p className="text-lg font-black text-amber-500 mt-1">
                <CountUp to={reviews.filter(r => r.qualityScore < 80).length} /> warnings
              </p>
            </div>
            <div className="bg-cardBg border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Average Quality Score</p>
              <p className="text-lg font-black text-emerald-400 mt-1">88%</p>
            </div>
          </div>

          {/* Queues switch buttons */}
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { id: 'pending', label: 'Moderation Queue', icon: FiActivity },
              { id: 'reported', label: 'Reported Reviews', icon: FiAlertTriangle },
              { id: 'approved', label: 'Approved Reviews', icon: FiCheckCircle },
              { id: 'spam', label: 'Spam / Hidden', icon: FiXCircle },
              { id: 'ai-flagged', label: 'AI Risk Flags', icon: FiShield }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setModerationFilter(tab.id);
                    setSelectedReviewIds([]);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all ${
                    moderationFilter === tab.id 
                      ? 'bg-accentBlue text-black border-accentBlue shadow-[0_0_15px_rgba(0,194,255,0.25)]' 
                      : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  <Icon />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bulk actions toolbar panel */}
          {selectedReviewIds.length > 0 && (
            <div className="bg-accentBlue/10 border border-accentBlue/20 p-4 rounded-2xl flex items-center justify-between text-xs animate-pulse">
              <span className="text-accentBlue font-bold">Selected {selectedReviewIds.length} items for bulk moderation</span>
              <div className="flex gap-2">
                <button onClick={handleBulkApprove} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold p-2 px-4 rounded-lg flex items-center gap-1">
                  <FiCheck /> Approve Selected
                </button>
                <button onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600 text-white font-bold p-2 px-4 rounded-lg flex items-center gap-1">
                  <FiTrash2 /> Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* Queue lists table */}
          <div className="bg-cardBg border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 uppercase font-extrabold tracking-wider border-b border-white/5">
                    <th className="p-4 w-12 text-center">
                      <input 
                        type="checkbox" 
                        checked={filteredReviews.length > 0 && selectedReviewIds.length === filteredReviews.length}
                        onChange={() => handleSelectAll(filteredReviews)}
                        className="rounded bg-black/40 border-white/10"
                      />
                    </th>
                    <th className="p-4">Item Details</th>
                    <th className="p-4">Customer Author</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Content Title & Description</th>
                    <th className="p-4">AI Score</th>
                    <th className="p-4">Flags</th>
                    <th className="p-4 text-right">Moderator Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredReviews.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-600 mb-3">
                          <FiCheckCircle size={28} />
                        </div>
                        <p className="font-bold text-white text-xs">Moderation queue cleared</p>
                        <p className="text-[10px] text-gray-500 mt-1">All user ratings and flags are checked and resolved.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredReviews.map((r) => {
                      const isSelected = selectedReviewIds.includes(r.id);
                      const reviewReports = reports.filter(rep => rep.reviewId === r.id);
                      return (
                        <tr key={r.id} className={`hover:bg-white/5 transition-colors ${isSelected ? 'bg-white/5' : ''}`}>
                          <td className="p-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => handleSelectOne(r.id)}
                              className="rounded bg-black/40 border-white/10"
                            />
                          </td>
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-black/20 overflow-hidden border border-white/5 flex-shrink-0">
                              <img src={r.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left max-w-[120px]">
                              <p className="font-bold text-white line-clamp-1">{r.productTitle}</p>
                              <span className="text-[8px] text-gray-500 uppercase tracking-widest block mt-0.5">ID: {r.productId}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <img src={r.customerAvatar} alt="" className="w-6 h-6 rounded-full object-cover border border-white/10" />
                              <div className="text-left">
                                <p className="font-bold text-white">{r.customerName}</p>
                                {r.verified && (
                                  <span className="text-[8px] text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded">Verified Buy</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-amber-400 font-bold flex items-center gap-1 pt-7">
                            <FiStar className="fill-current" /> {r.rating}
                          </td>
                          <td className="p-4 text-left max-w-[200px]">
                            <p className="font-bold text-white line-clamp-1">{r.title}</p>
                            <p className="text-gray-400 text-[10px] line-clamp-2 mt-0.5">{r.description}</p>
                            <span className="text-[8px] text-gray-500 mt-1 block">Date: {r.date}</span>
                          </td>
                          <td className="p-4 font-bold">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              r.qualityScore >= 85 ? 'text-green-400 bg-green-500/10' : 'text-amber-500 bg-amber-500/10'
                            }`}>
                              {r.qualityScore}% Quality
                            </span>
                          </td>
                          <td className="p-4">
                            {r.reports > 0 ? (
                              <div className="space-y-1 text-left">
                                <span className="inline-block text-[9px] font-bold text-red-400 bg-red-400/10 border border-red-500/20 px-2 py-0.5 rounded">
                                  ⚠️ {r.reports} Reports
                                </span>
                                {reviewReports.map((rep, index) => (
                                  <p key={index} className="text-[8px] text-gray-500 truncate max-w-[100px]" title={rep.description}>
                                    {rep.reason}: {rep.description}
                                  </p>
                                ))}
                              </div>
                            ) : r.qualityScore < 80 ? (
                              <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                                🛡️ High Spam Probability
                              </span>
                            ) : (
                              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">None</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Action: Approve */}
                              <button 
                                onClick={() => adminModerationAction(r.id, 'approve')}
                                className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg"
                                title="Approve Review"
                              >
                                <FiCheck />
                              </button>
                              {/* Action: Spam */}
                              <button 
                                onClick={() => adminModerationAction(r.id, 'flagSpam')}
                                className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg"
                                title="Flag as Spam"
                              >
                                <FiAlertTriangle />
                              </button>
                              {/* Action: Delete */}
                              <button 
                                onClick={() => adminModerationAction(r.id, 'delete')}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg"
                                title="Delete Permanently"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: CATEGORIES LIST */}
      {currentPath === '/admin/categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in-up">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="bg-cardBg border border-white/5 p-5 rounded-3xl text-xs space-y-3 relative overflow-hidden">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Sector</span>
              <h4 className="font-extrabold text-white text-sm">{cat.name}</h4>
              <div className="flex justify-between items-center text-gray-400 font-bold border-t border-white/5 pt-3">
                <div>
                  <p className="text-[9px] text-gray-500 uppercase font-bold">Listings</p>
                  <p className="text-white text-xs">{cat.count} active</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
