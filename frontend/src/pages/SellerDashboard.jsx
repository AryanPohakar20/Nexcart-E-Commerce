import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SellerContext } from '../context/SellerContext';
import SellerStatsCard from '../components/seller/SellerStatsCard';
import RevenueChart from '../components/seller/RevenueChart';
import AddProductModal from '../components/seller/AddProductModal';
import OrderDetailsModal from '../components/seller/OrderDetailsModal';
import { 
  FiDollarSign, FiShoppingBag, FiPackage, FiEye, FiPlus, 
  FiArrowRight, FiCheckCircle, FiAlertTriangle, FiTag, FiTruck, 
  FiCompass, FiTrendingUp, FiLayers, FiShield
} from 'react-icons/fi';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { settings, stats, orders, products } = useContext(SellerContext);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const recentOrders = orders.slice(0, 5);
  const lowStockItems = products.filter((p) => p.status === 'active' && p.stock <= 5);

  return (
    <div className="space-y-8 text-left">
      {/* ── 1. Top Welcome Banner & Quick Action Center ─────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cardBg via-secondaryBg to-cardBg border border-white/10 p-6 md:p-8 rounded-3xl shadow-card-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Glow Accent */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-accentBlue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-primary/15 border border-primary/30 text-primary text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1.5 shadow-yellow-glow">
              <FiShield size={12} />
              <span>Verified Seller Studio</span>
            </span>
            <span className="bg-white/5 border border-white/10 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Hybrid Marketplace Model
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Welcome back, <span className="text-primary">{settings.displayName || 'Seller'}</span>!
          </h1>
          <p className="text-xs md:text-sm text-gray-400 font-medium">
            Manage your peer-to-peer second-hand listings and retail store inventory from a single, streamlined workspace.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 md:flex-none px-5 py-3 rounded-2xl font-bold bg-primary text-black hover:bg-primary-light shadow-yellow-glow transition-all flex items-center justify-center gap-2 text-xs"
          >
            <FiPlus size={16} />
            <span>Create New Listing</span>
          </button>
          <button
            onClick={() => navigate('/seller/orders')}
            className="flex-1 md:flex-none px-5 py-3 rounded-2xl font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-xs"
          >
            <FiShoppingBag size={16} />
            <span>Manage Orders</span>
          </button>
        </div>
      </div>

      {/* ── 2. Real-Time High-Impact Stats Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <SellerStatsCard
          title="Total Studio Revenue"
          value={stats.totalRevenue}
          prefix="₹"
          formatter={(val) => val.toLocaleString('en-IN')}
          change="21.5% this month"
          isPositive={true}
          icon={FiDollarSign}
          accent="yellow"
          subtitle="Net payouts ready"
        />

        <SellerStatsCard
          title="Orders Placed"
          value={stats.ordersCount}
          change="+3 new today"
          isPositive={true}
          icon={FiShoppingBag}
          accent="blue"
          subtitle={`${stats.processingOrdersCount} in fulfillment pipeline`}
        />

        <SellerStatsCard
          title="Active Catalog Listings"
          value={stats.activeListings}
          change={`${stats.c2cCount} C2C • ${stats.businessCount} Retail`}
          isPositive={true}
          icon={FiPackage}
          accent="purple"
          subtitle="Across all categories"
        />

        <SellerStatsCard
          title="Total Listing Impressions"
          value={stats.totalViews}
          change="4.9 ★ Seller Rating"
          isPositive={true}
          icon={FiEye}
          accent="green"
          subtitle="142 verified reviews"
        />
      </div>

      {/* ── 3. Main Analytics Chart & Sidebar Insights ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Revenue Performance Chart (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart title="Revenue & Sales Trajectory" />

          {/* Recent Orders Overview */}
          <div className="bg-cardBg/90 backdrop-blur-sm border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FiShoppingBag className="text-primary" />
                  <span>Recent Customer Orders</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Live orders requiring fulfillment or dispatch</p>
              </div>
              <button
                onClick={() => navigate('/seller/orders')}
                className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
              >
                <span>View All Orders</span>
                <FiArrowRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 font-bold border-b border-white/5 uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Buyer</th>
                    <th className="pb-3">Primary Item</th>
                    <th className="pb-3">Mode</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 font-bold text-white group-hover:text-primary transition-colors">
                        {ord.id}
                      </td>
                      <td className="py-3.5 text-gray-300 font-medium">
                        <div className="flex items-center gap-2">
                          <img
                            src={ord.customer?.avatar}
                            alt={ord.customer?.name}
                            className="w-6 h-6 rounded-full object-cover border border-white/10"
                          />
                          <span>{ord.customer?.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-gray-300 font-medium max-w-[180px] truncate">
                        {ord.items[0]?.title}
                      </td>
                      <td className="py-3.5 text-gray-400">
                        {ord.deliveryType.includes('Meetup') ? (
                          <span className="text-primary font-bold">Meetup</span>
                        ) : (
                          <span className="text-accentBlue font-bold">Courier</span>
                        )}
                      </td>
                      <td className="py-3.5 font-black text-white">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider border ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : ord.status === 'Shipped'
                              ? 'bg-accentBlue/10 text-accentBlue border-accentBlue/20'
                              : ord.status === 'Processing'
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : ord.status === 'Cancelled'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Inventory Watch & Marketplace Selling Guide (1 Col) */}
        <div className="space-y-6">
          {/* Inventory Health Widget */}
          <div className="bg-cardBg/90 backdrop-blur-sm border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FiAlertTriangle className="text-amber-400" />
                <span>Inventory Alerts</span>
              </h3>
              <button
                onClick={() => navigate('/seller/inventory')}
                className="text-[11px] text-primary hover:underline font-bold"
              >
                Manage
              </button>
            </div>

            {lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <h4 className="text-white font-bold text-xs truncate">{item.title}</h4>
                        <span className="text-[10px] text-gray-400 capitalize">{item.category}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`text-xs font-black ${
                          item.stock === 0 ? 'text-red-400' : 'text-amber-400'
                        }`}
                      >
                        {item.stock === 0 ? 'Sold Out' : `${item.stock} left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400">
                <FiCheckCircle size={18} />
                <p className="text-xs font-medium">All active catalog listings have healthy stock!</p>
              </div>
            )}
          </div>

          {/* Hybrid Model Selling Tips & Badges */}
          <div className="bg-gradient-to-br from-primary/10 via-cardBg to-cardBg border border-primary/20 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <FiCompass />
              <span>Hybrid Marketplace Highlights</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-black/40 border border-white/5 p-3 rounded-2xl space-y-1">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>C2C Individual Mode</span>
                  <span className="text-primary text-[10px]">0% Listing Fee</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  List electronics, furniture & fashion second-hand. Add condition notes, bill/box status, and enable direct buyer meetups.
                </p>
              </div>

              <div className="bg-black/40 border border-white/5 p-3 rounded-2xl space-y-1">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>Small Business Mode</span>
                  <span className="text-accentBlue text-[10px]">Bulk Dispatch</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Manage inventory SKU counts, provide warranty assurances, and unlock wholesale bulk discount tags.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/seller/settings')}
              className="w-full py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-xs"
            >
              Configure Studio Preferences
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Modals ───────────────────────────────────────────────────────── */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default SellerDashboard;
