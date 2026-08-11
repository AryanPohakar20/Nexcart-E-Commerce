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
  const { 
    settings, 
    stats, 
    dashboardRecentOrders, 
    dashboardLowStockItems, 
    revenueChartData, 
    growthText,
    fetchDashboardSummary
  } = useContext(SellerContext);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [timeframe, setTimeframe] = useState('7D');

  // Fetch summary when timeframe changes
  React.useEffect(() => {
    fetchDashboardSummary(timeframe);
  }, [timeframe, fetchDashboardSummary]);

  return (
    <div className="space-y-8 text-left">
      {/* ── 1. Top Welcome Banner & Quick Action Center ─────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cardBg via-secondaryBg to-cardBg border border-borderColor p-6 md:p-8 rounded-3xl shadow-card-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Glow Accent */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-accentBlue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-primary/15 border border-primary/30 text-primary text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1.5 shadow-yellow-glow">
              <FiShield size={12} />
              <span>Verified Seller Studio</span>
            </span>
            <span className="bg-surface border border-borderColor text-textSecondary text-[10px] font-bold px-2 py-0.5 rounded-full">
              Hybrid Marketplace Model
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-textPrimary tracking-tight">
            Welcome back, <span className="text-primary">{settings.displayName || 'Seller'}</span>!
          </h1>
          <p className="text-xs md:text-sm text-textSecondary font-medium">
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
            className="flex-1 md:flex-none px-5 py-3 rounded-2xl font-bold bg-surface border border-borderColor text-textPrimary hover:bg-bgSecondary transition-all flex items-center justify-center gap-2 text-xs"
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
          change={`${growthText} vs prev period`}
          isPositive={growthText.startsWith('+')}
          icon={FiDollarSign}
          accent="yellow"
          subtitle="Net payouts ready"
        />

        <SellerStatsCard
          title="Orders Placed"
          value={stats.ordersCount}
          change={`+${stats.ordersCount} total`}
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
          change={`${stats.rating} ★ Seller Rating`}
          isPositive={true}
          icon={FiEye}
          accent="green"
          subtitle={`${stats.reviewsCount} verified reviews`}
        />
      </div>

      {/* ── 3. Main Analytics Chart & Sidebar Insights ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Revenue Performance Chart (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart 
            title="Revenue & Sales Trajectory" 
            data={revenueChartData}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            growthText={growthText}
          />

          {/* Recent Orders Overview */}
          <div className="bg-cardBg border border-borderColor rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-borderColor pb-4">
              <div>
                <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
                  <FiShoppingBag className="text-primary" />
                  <span>Recent Customer Orders</span>
                </h3>
                <p className="text-xs text-textSecondary mt-0.5">Live orders requiring fulfillment or dispatch</p>
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
                  <tr className="text-textSecondary font-bold border-b border-borderColor uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Buyer</th>
                    <th className="pb-3">Primary Item</th>
                    <th className="pb-3">Mode</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {dashboardRecentOrders.length > 0 ? (
                    dashboardRecentOrders.map((ord) => (
                      <tr
                        key={ord.id}
                        onClick={() => setSelectedOrder(ord)}
                        className="hover:bg-surface transition-colors cursor-pointer group"
                      >
                      <td className="py-3.5 font-bold text-textPrimary group-hover:text-primary transition-colors">
                        {ord.id}
                      </td>
                      <td className="py-3.5 text-textSecondary font-medium">
                        <div className="flex items-center gap-2">
                          <img
                            src={ord.customer?.avatar}
                            alt={ord.customer?.name}
                            className="w-6 h-6 rounded-full object-cover border border-borderColor"
                          />
                          <span>{ord.customer?.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-textSecondary font-medium max-w-[180px] truncate">
                        {ord.items[0]?.title}
                      </td>
                      <td className="py-3.5 text-textSecondary">
                        {ord.deliveryType.includes('Meetup') ? (
                          <span className="text-primary font-bold">Meetup</span>
                        ) : (
                          <span className="text-accentBlue font-bold">Courier</span>
                        )}
                      </td>
                      <td className="py-3.5 font-black text-textPrimary">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider border ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : ord.status === 'Shipped'
                              ? 'bg-accentBlue/10 text-blue-600 dark:text-accentBlue border-accentBlue/20'
                              : ord.status === 'Processing'
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : ord.status === 'Cancelled'
                              ? 'bg-red-500/10 text-red-500 border-red-500/20'
                              : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-textSecondary text-xs">
                        No recent orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Inventory Watch & Marketplace Selling Guide (1 Col) */}
        <div className="space-y-6">
          {/* Inventory Health Widget */}
          <div className="bg-cardBg border border-borderColor rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-borderColor pb-3">
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
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

            {dashboardLowStockItems.length > 0 ? (
              <div className="space-y-3">
                {dashboardLowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-surface border border-borderColor rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-10 h-10 rounded-xl object-cover border border-borderColor flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <h4 className="text-textPrimary font-bold text-xs truncate">{item.title}</h4>
                        <span className="text-[10px] text-textSecondary capitalize">{item.category}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`text-xs font-black ${
                          item.stock === 0 ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {item.stock === 0 ? 'Sold Out' : `${item.stock} left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
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
              <div className="bg-surface border border-borderColor p-3 rounded-2xl space-y-1">
                <div className="flex items-center justify-between font-bold text-textPrimary">
                  <span>C2C Individual Mode</span>
                  <span className="text-primary text-[10px] font-black">0% Listing Fee</span>
                </div>
                <p className="text-[11px] text-textSecondary leading-relaxed">
                  List electronics, furniture & fashion second-hand. Add condition notes, bill/box status, and enable direct buyer meetups.
                </p>
              </div>

              <div className="bg-surface border border-borderColor p-3 rounded-2xl space-y-1">
                <div className="flex items-center justify-between font-bold text-textPrimary">
                  <span>Small Business Mode</span>
                  <span className="text-accentBlue text-[10px] font-black">Bulk Dispatch</span>
                </div>
                <p className="text-[11px] text-textSecondary leading-relaxed">
                  Manage inventory SKU counts, provide warranty assurances, and unlock wholesale bulk discount tags.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/seller/settings')}
              className="w-full py-2.5 rounded-xl font-bold bg-surface border border-borderColor text-textPrimary hover:bg-bgSecondary transition-all text-xs"
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
