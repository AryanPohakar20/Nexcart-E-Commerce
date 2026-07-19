import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { ADMIN_STATS, CATEGORIES } from '../constants/dummyData';
import { FiSliders, FiUsers, FiBox, FiTrendingUp, FiSettings, FiCheckCircle, FiActivity, FiXCircle } from 'react-icons/fi';

const AdminDashboard = () => {
  const { showToast } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, users, categories

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

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="border-b border-white/5 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Root Administrator Terminal</h1>
          <p className="text-xs text-gray-500 mt-1">Global settings, database aggregates, and access controls.</p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-white/5 border border-white/5 rounded-xl p-1 text-xs">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'dashboard' ? 'bg-accentBlue text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'users' ? 'bg-accentBlue text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Accounts
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'categories' ? 'bg-accentBlue text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Categories
          </button>
        </div>
      </div>

      {/* Tabs panels */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          
          {/* Main metrics summary grid */}
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
                <span>Category Count</span>
                <FiSettings className="text-accentBlue text-base" />
              </div>
              <p className="text-2xl font-black text-white">{ADMIN_STATS.totalCategories}</p>
              <span className="text-[10px] text-yellow-500 font-bold">All sectors operational</span>
            </div>
          </div>

          {/* SVG Pie Chart / distribution & Action logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* SVG Pie share */}
            <div className="lg:col-span-2 bg-cardBg border border-white/5 p-6 rounded-3xl space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FiActivity className="text-accentBlue" />
                <span>Sector Sales Distribution</span>
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-8 justify-around pt-4">
                {/* SVG circular pie display */}
                <svg className="w-40 h-40 transform -rotate-90 select-none">
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#1F1F1F" strokeWidth="24" />
                  {/* Mobiles: 38% */}
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#00C2FF" strokeWidth="24" strokeDasharray="376.8" strokeDashoffset="143.1" />
                  {/* Laptops: 24% */}
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#FFC107" strokeWidth="24" strokeDasharray="376.8" strokeDashoffset="233.6" />
                </svg>

                {/* Legend logs */}
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

            {/* Quick logs */}
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

      {activeTab === 'users' && (
        <div className="bg-cardBg border border-white/5 rounded-3xl overflow-hidden">
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

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
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
