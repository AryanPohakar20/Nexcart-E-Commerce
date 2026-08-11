import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingCart, FiEye, FiCheckCircle, FiTruck, FiXCircle,
  FiDollarSign, FiX, FiCalendar, FiCreditCard, FiMapPin, FiPackage,
  FiRefreshCw
} from 'react-icons/fi';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import ActionDropdown from '../../components/admin/shared/ActionDropdown';
import TableToolbar from '../../components/admin/shared/TableToolbar';
import Pagination from '../../components/admin/shared/Pagination';
import ConfirmDialog from '../../components/admin/shared/ConfirmDialog';
import adminService from '../../services/adminService';
import { AppContext } from '../../context/AppContext';

const STATUS_OPTIONS = ['All Statuses', 'delivered', 'shipped', 'processing', 'cancelled', 'pending'];
const PAYMENT_OPTIONS = ['All Payments', 'paid', 'pending', 'refunded', 'failed'];

const AdminOrders = () => {
  const { formatCurrency } = React.useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [paymentFilter, setPaymentFilter] = useState('All Payments');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [drawerOrder, setDrawerOrder] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const perPage = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: perPage,
      };

      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'All Statuses') params.status = statusFilter;
      if (paymentFilter !== 'All Payments') params.paymentStatus = paymentFilter;

      const res = await adminService.getOrders(params);
      if (res.data) {
        const mapped = (res.data.orders || []).map((o) => ({
          id: o._id,
          orderId: o.orderId || o._id.slice(-6).toUpperCase(),
          customer: o.customer
            ? `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim()
            : o.shippingAddress?.fullName || 'Customer',
          customerEmail: o.customer?.email || 'N/A',
          seller: o.seller?.business?.businessName || o.seller?.accountInfo?.displayName || o.seller?.slug || 'Direct Fulfillment',
          total: o.totalAmount || 0,
          items: o.items?.length || 1,
          itemList: o.items || [],
          status: o.orderStatus?.toLowerCase() || 'pending',
          paymentStatus: o.paymentInfo?.status?.toLowerCase() || 'pending',
          paymentMethod: o.paymentInfo?.method || 'Card',
          shippingAddress: o.shippingAddress || {},
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
          deliveredDate: o.deliveredDate ? new Date(o.deliveredDate).toLocaleDateString('en-IN') : null,
          statusHistory: o.statusHistory || [],
        }));

        setOrders(mapped);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalItems(res.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleSelectAll = () => {
    if (selected.length === orders.length) setSelected([]);
    else setSelected(orders.map((o) => o.id));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const updateOrderStatus = async (orderId, newStatus, note = '') => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus, note);
      fetchOrders();
      if (drawerOrder && drawerOrder.id === orderId) {
        setDrawerOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleAction = (action, order) => {
    if (action === 'view') {
      setDrawerOrder(order);
    } else if (action === 'mark_shipped') {
      updateOrderStatus(order.id, 'shipped', 'Order dispatched via courier');
    } else if (action === 'mark_delivered') {
      updateOrderStatus(order.id, 'delivered', 'Order delivered to recipient');
    } else if (action === 'cancel') {
      setConfirmDialog({
        open: true,
        title: 'Cancel Order & Issue Refund',
        message: `Are you sure you want to cancel order ${order.orderId}? The customer will be refunded ₹${order.total.toLocaleString('en-IN')}.`,
        type: 'danger',
        confirmLabel: 'Cancel & Refund',
        onConfirm: async () => {
          try {
            await adminService.cancelOrder(order.id, 'Cancelled by admin request');
            setConfirmDialog({ open: false });
            fetchOrders();
          } catch (err) {
            console.error('Failed to cancel order:', err);
          }
        },
      });
    }
  };

  const getActions = (order) => [
    { label: 'View Order Dossier', icon: FiEye, onClick: () => handleAction('view', order) },
    { type: 'divider' },
    ...(order.status === 'processing' || order.status === 'pending'
      ? [{ label: 'Dispatch / Mark Shipped', icon: FiTruck, onClick: () => handleAction('mark_shipped', order), success: true }]
      : []),
    ...(order.status === 'shipped'
      ? [{ label: 'Confirm Delivery', icon: FiCheckCircle, onClick: () => handleAction('mark_delivered', order), success: true }]
      : []),
    ...(order.status !== 'cancelled' && order.status !== 'delivered'
      ? [{ label: 'Cancel & Refund', icon: FiXCircle, onClick: () => handleAction('cancel', order), danger: true }]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Order Fulfillment Center</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track transaction streams, logistics pipelines, refunds, and merchant payouts
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors w-fit"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>

      {/* Table Card */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <TableToolbar
          search={search}
          onSearch={(val) => { setSearch(val); setPage(1); }}
          onSearchClear={() => { setSearch(''); setPage(1); }}
          searchPlaceholder="Search order ID, customer, merchant..."
          selectedCount={selected.length}
          onExport={() => {}}
          filters={
            <>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/8 rounded-xl text-gray-300 outline-none hover:border-white/20"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All Statuses' ? s : s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={paymentFilter}
                onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
                className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/8 rounded-xl text-gray-300 outline-none hover:border-white/20"
              >
                {PAYMENT_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p === 'All Payments' ? p : p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </>
          }
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-white/3 border-b border-white/5 text-gray-500 uppercase tracking-wider font-bold">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selected.length === orders.length}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded accent-yellow-500"
                  />
                </th>
                <th className="p-4">Order Reference</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Fulfilling Merchant</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4">Date Placed</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-gray-500">
                    <FiRefreshCw className="animate-spin inline mr-2" size={16} />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-gray-500">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/3 transition-colors group">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        className="w-3.5 h-3.5 rounded accent-yellow-500"
                      />
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-bold text-yellow-400 group-hover:underline cursor-pointer" onClick={() => handleAction('view', order)}>
                        {order.orderId}
                      </span>
                      <p className="text-[10px] text-gray-500">{order.items} items</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white">{order.customer}</p>
                      <p className="text-[10px] text-gray-500">{order.customerEmail}</p>
                    </td>
                    <td className="p-4 text-gray-300 font-medium">{order.seller}</td>
                    <td className="p-4 font-bold text-white text-sm">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <StatusBadge status={order.paymentStatus} />
                        <p className="text-[10px] text-gray-500 font-medium">{order.paymentMethod}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="p-4 text-gray-400">{order.date}</td>
                    <td className="p-4 text-right">
                      <ActionDropdown actions={getActions(order)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={totalItems}
          itemsPerPage={perPage}
        />
      </div>

      {/* Order Drawer */}
      <AnimatePresence>
        {drawerOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setDrawerOrder(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#141414] border-l border-white/5 z-50 overflow-y-auto p-6 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-yellow-400 font-mono font-bold">INVOICE & MANIFEST</span>
                  <h3 className="text-lg font-bold text-white">{drawerOrder.orderId}</h3>
                </div>
                <button
                  onClick={() => setDrawerOrder(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Status Header */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Fulfillment Pipeline</p>
                  <div className="mt-1">
                    <StatusBadge status={drawerOrder.status} size="md" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Total Invoiced</p>
                  <p className="text-lg font-black text-white mt-0.5">
                    {formatCurrency(drawerOrder.total)}
                  </p>
                </div>
              </div>

              {/* Stakeholders Info */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3 text-xs">
                <h5 className="font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Customer & Destination
                </h5>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-500">Customer Name</span>
                  <span className="text-white font-medium">{drawerOrder.customer}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-500">Contact Email</span>
                  <span className="text-gray-300">{drawerOrder.customerEmail}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-500">Merchant Store</span>
                  <span className="text-yellow-400 font-bold">{drawerOrder.seller}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">Payment Channel</span>
                  <span className="text-white font-medium">
                    {drawerOrder.paymentMethod} • <StatusBadge status={drawerOrder.paymentStatus} size="sm" />
                  </span>
                </div>
              </div>

              {/* Delivery Timeline Progress */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Logistics Milestones
                </h5>
                <div className="space-y-3 text-xs pl-2 border-l-2 border-yellow-500/30">
                  <div className="relative pl-3">
                    <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <p className="font-bold text-white">Order Placed & Registered</p>
                    <p className="text-[10px] text-gray-500">{drawerOrder.date}</p>
                  </div>
                  {drawerOrder.status !== 'cancelled' && (
                    <div className="relative pl-3">
                      <span
                        className={`absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full ${
                          drawerOrder.status === 'delivered' || drawerOrder.status === 'shipped'
                            ? 'bg-yellow-500'
                            : 'bg-gray-600'
                        }`}
                      />
                      <p className="font-bold text-white">Dispatched to Carrier</p>
                      <p className="text-[10px] text-gray-500">
                        {drawerOrder.status === 'delivered' || drawerOrder.status === 'shipped'
                          ? 'Express Carrier Assigned'
                          : 'Awaiting Merchant Packing'}
                      </p>
                    </div>
                  )}
                  {drawerOrder.status === 'delivered' && (
                    <div className="relative pl-3">
                      <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <p className="font-bold text-emerald-400">Delivered Successfully</p>
                      <p className="text-[10px] text-gray-500">{drawerOrder.deliveredDate || 'Confirmed'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                {(drawerOrder.status === 'processing' || drawerOrder.status === 'pending') && (
                  <button
                    onClick={() => updateOrderStatus(drawerOrder.id, 'shipped', 'Dispatched from dashboard')}
                    className="col-span-2 h-10 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_12px_rgba(255,193,7,0.3)]"
                  >
                    Mark as Shipped
                  </button>
                )}
                {drawerOrder.status === 'shipped' && (
                  <button
                    onClick={() => updateOrderStatus(drawerOrder.id, 'delivered', 'Delivered from dashboard')}
                    className="col-span-2 h-10 bg-emerald-500 text-black text-xs font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  >
                    Confirm Delivered
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmLabel={confirmDialog.confirmLabel}
      />
    </div>
  );
};

export default AdminOrders;
