import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { SellerContext } from '../../context/SellerContext';
import OrderDetailsModal from '../../components/seller/OrderDetailsModal';
import { 
  FiShoppingBag, FiSearch, FiFilter, FiEye, FiTruck, 
  FiCheckCircle, FiClock, FiXCircle, FiPackage, FiMapPin 
} from 'react-icons/fi';

const TAB_STATUSES = [
  { key: 'all', label: 'All Orders' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Processing', label: 'Processing' },
  { key: 'Shipped', label: 'Shipped' },
  { key: 'Delivered', label: 'Delivered' },
  { key: 'Cancelled', label: 'Cancelled' },
];

const SellerOrders = () => {
  const { orders, updateOrderStatus } = useContext(SellerContext);

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeliveryType, setSelectedDeliveryType] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filtered Orders
  const filteredOrders = orders.filter((ord) => {
    const matchesTab = activeTab === 'all' || ord.status === activeTab;
    const matchesSearch =
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.trackingNumber && ord.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ord.items?.some((i) => i.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDelivery =
      selectedDeliveryType === 'all' ||
      (selectedDeliveryType === 'meetup' && ord.deliveryType.includes('Meetup')) ||
      (selectedDeliveryType === 'courier' && !ord.deliveryType.includes('Meetup'));

    return matchesTab && matchesSearch && matchesDelivery;
  });

  const getStatusCount = (statusKey) => {
    if (statusKey === 'all') return orders.length;
    return orders.filter((o) => o.status === statusKey).length;
  };

  return (
    <div className="space-y-6 text-left">
      {/* ── 1. Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-borderColor pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-textPrimary tracking-tight flex items-center gap-2.5">
            <FiShoppingBag className="text-primary" />
            <span>Orders Management Pipeline</span>
          </h1>
          <p className="text-xs text-textSecondary mt-1">
            Track customer shipments, direct C2C meetups, and fulfillment status in real time.
          </p>
        </div>
      </div>

      {/* ── 2. Status Pipeline Tabs ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-borderColor text-xs">
        {TAB_STATUSES.map((tab) => {
          const count = getStatusCount(tab.key);
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 flex-shrink-0 ${
                isActive
                  ? 'bg-primary text-black shadow-yellow-glow'
                  : 'bg-cardBg border border-borderColor text-textSecondary hover:text-textPrimary hover:border-borderColor/50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-black/20 text-black' : 'bg-surface text-textSecondary'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 3. Filters & Search ─────────────────────────────────────────────── */}
      <div className="bg-cardBg border border-borderColor p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <FiSearch className="absolute left-3.5 top-3 text-textSecondary" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Buyer name, product or tracking #..."
              className="w-full bg-surface border border-borderColor rounded-xl pl-9 pr-3 py-2 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
            />
          </div>

          {/* Delivery Mode Filter */}
          <div>
            <select
              value={selectedDeliveryType}
              onChange={(e) => setSelectedDeliveryType(e.target.value)}
              className="w-full bg-surface border border-borderColor rounded-xl px-3 py-2 text-textPrimary focus:outline-none focus:border-primary text-xs cursor-pointer"
            >
              <option value="all" className="bg-secondaryBg text-textPrimary">All Delivery Modes</option>
              <option value="courier" className="bg-secondaryBg text-textPrimary">Courier Dispatch (BlueDart, Delhivery)</option>
              <option value="meetup" className="bg-secondaryBg text-textPrimary">Buyer Meetup / Local Handshake (C2C)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 4. Orders Table List ────────────────────────────────────────────── */}
      {filteredOrders.length === 0 ? (
        <div className="bg-cardBg border border-borderColor rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary mx-auto flex items-center justify-center border border-primary/20">
            <FiShoppingBag size={32} />
          </div>
          <h3 className="text-base font-bold text-textPrimary">No orders matching this filter</h3>
          <p className="text-xs text-textSecondary max-w-sm mx-auto">
            You currently have no orders in the <span className="text-primary font-bold">"{activeTab}"</span> stage.
          </p>
          <button
            onClick={() => {
              setActiveTab('all');
              setSearchQuery('');
              setSelectedDeliveryType('all');
            }}
            className="px-4 py-2 rounded-xl bg-surface border border-borderColor text-primary text-xs font-bold hover:bg-bgSecondary"
          >
            Reset Order Filter
          </button>
        </div>
      ) : (
        <div className="bg-cardBg border border-borderColor rounded-3xl overflow-hidden shadow-card-hover">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-surface text-textSecondary font-extrabold uppercase text-[10px] tracking-wider border-b border-borderColor">
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Buyer Customer</th>
                  <th className="p-4">Purchased Items</th>
                  <th className="p-4">Fulfillment Mode</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor">
                {filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-surface transition-colors group"
                  >
                    {/* ID & Date */}
                    <td className="p-4">
                      <div className="font-bold text-textPrimary group-hover:text-primary transition-colors">
                        {ord.id}
                      </div>
                      <span className="text-[10px] text-textSecondary">{ord.orderDate}</span>
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={ord.customer?.avatar}
                          alt={ord.customer?.name}
                          className="w-8 h-8 rounded-full object-cover border border-borderColor flex-shrink-0"
                        />
                        <div>
                          <span className="font-bold text-textPrimary block">{ord.customer?.name}</span>
                          <span className="text-[10px] text-textSecondary block">{ord.customer?.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={ord.items[0]?.image}
                          alt={ord.items[0]?.title}
                          className="w-9 h-9 rounded-lg object-cover border border-borderColor"
                        />
                        <div className="max-w-[200px]">
                          <span className="font-medium text-textSecondary truncate block">
                            {ord.items[0]?.title}
                          </span>
                          {ord.items.length > 1 && (
                            <span className="text-[10px] text-primary font-bold">
                              +{ord.items.length - 1} more item(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Delivery Mode */}
                    <td className="p-4">
                      {ord.deliveryType.includes('Meetup') ? (
                        <div className="flex items-center gap-1.5 text-primary font-bold text-[11px]">
                          <FiMapPin size={12} />
                          <span>Local Meetup</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-accentBlue font-bold text-[11px]">
                          <FiTruck size={12} />
                          <span>Courier ({ord.carrier || 'Express'})</span>
                        </div>
                      )}
                      <span className="text-[10px] text-textSecondary block truncate max-w-[150px]">
                        {ord.shippingAddress}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="p-4">
                      <div className="font-black text-textPrimary text-sm">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-textSecondary">{ord.paymentMethod}</span>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider border ${
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
                        {ord.status === 'Delivered' && <FiCheckCircle size={10} />}
                        {ord.status === 'Shipped' && <FiTruck size={10} />}
                        {ord.status === 'Processing' && <FiClock size={10} />}
                        {ord.status === 'Cancelled' && <FiXCircle size={10} />}
                        <span>{ord.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 rounded-xl bg-surface text-primary border border-primary/20 hover:bg-primary hover:text-black font-bold transition-all text-xs flex items-center gap-1.5 ml-auto"
                      >
                        <FiEye size={12} />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. Order Details Modal ──────────────────────────────────────────── */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default SellerOrders;
