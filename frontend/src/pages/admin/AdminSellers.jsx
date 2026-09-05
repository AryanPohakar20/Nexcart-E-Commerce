import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingBag, FiEye, FiEdit2, FiCheckCircle, FiXCircle, FiPauseCircle,
  FiSlash, FiTrash2, FiExternalLink, FiFileText, FiStar, FiX, FiMail,
  FiMapPin, FiAward, FiTrendingUp, FiBox, FiDollarSign
} from 'react-icons/fi';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import ActionDropdown from '../../components/admin/shared/ActionDropdown';
import TableToolbar from '../../components/admin/shared/TableToolbar';
import Pagination from '../../components/admin/shared/Pagination';
import ConfirmDialog from '../../components/admin/shared/ConfirmDialog';
import adminService from '../../services/adminService';

const VERIFICATION_OPTIONS = ['All Verifications', 'verified', 'pending', 'rejected'];
const SELLER_TYPE_OPTIONS = ['All Seller Types', 'marketplace_seller', 'seller'];
const STATUS_OPTIONS = ['All Status', 'active', 'suspended'];

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('All Verifications');
  const [sellerTypeFilter, setSellerTypeFilter] = useState('All Seller Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [drawerSeller, setDrawerSeller] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const perPage = 10;

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: perPage,
        ...(search && { search }),
        ...(verificationFilter !== 'All Verifications' && {
          verificationStatus:
            verificationFilter === 'verified'
              ? 'Verified'
              : verificationFilter === 'pending'
              ? 'In Progress'
              : 'Rejected',
        }),
        ...(sellerTypeFilter !== 'All Seller Types' && { sellerType: sellerTypeFilter }),
        ...(statusFilter !== 'All Status' && {
          status: statusFilter === 'active' ? 'Active' : 'Suspended',
          isActive: statusFilter === 'active' ? 'true' : undefined,
          isSuspended: statusFilter === 'suspended' ? 'true' : undefined,
        }),
      };
      const res = await adminService.getSellers(params);
      const rawSellers = res.data.sellers || [];
      const mappedSellers = rawSellers.map((seller) => {
        const storeName =
          seller.business?.businessName ||
          seller.individual?.fullName ||
          seller.accountInfo?.displayName ||
          seller.sellerId ||
          'Merchant Store';
        const logo =
          seller.profile?.logo?.url ||
          seller.business?.businessLogo?.url ||
          seller.individual?.profilePhoto?.url ||
          seller.userId?.avatar?.url ||
          null;
        const city = seller.address?.city || seller.profile?.city || 'N/A';
        const status = seller.isBlocked
          ? 'blocked'
          : seller.isSuspended
          ? 'suspended'
          : seller.isActive
          ? 'active'
          : 'inactive';
        const gstNumber = seller.identity?.gst || seller.business?.gst || 'N/A';
        const user = seller.userId || {};

        return {
          ...seller,
          storeName,
          logo,
          city,
          status,
          user,
          businessAddress: { city },
          businessDetails: { gstNumber },
        };
      });

      setSellers(mappedSellers);
      setTotalItems(res.data.pagination.totalItems);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSellers();
  }, [page, search, verificationFilter, sellerTypeFilter, statusFilter]);

  const toggleSelectAll = () => {
    if (selected.length === sellers.length) setSelected([]);
    else setSelected(sellers.map((s) => s._id));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleAction = async (action, seller) => {
    if (action === 'view') {
      setDrawerSeller(seller);
    } else if (action === 'approve') {
      await adminService.updateSeller(seller._id, {
        verificationStatus: 'Verified',
        sellerStatus: 'Approved',
        isActive: true,
      });
      fetchSellers();
    } else if (action === 'reject') {
      setConfirmDialog({
        open: true,
        title: 'Reject Seller Verification',
        message: `Reject verification for ${seller.storeName}?`,
        type: 'warning',
        confirmLabel: 'Reject',
        onConfirm: async () => {
          await adminService.updateSeller(seller._id, { verificationStatus: 'Rejected' });
          setConfirmDialog({ open: false });
          fetchSellers();
        },
      });
    } else if (action === 'suspend') {
      setConfirmDialog({
        open: true,
        title: 'Suspend Seller Store',
        message: `Suspend ${seller.storeName}? Their products will be hidden from the storefront.`,
        type: 'warning',
        confirmLabel: 'Suspend',
        onConfirm: async () => {
          await adminService.suspendSeller(seller._id, 'Suspended by admin');
          setConfirmDialog({ open: false });
          fetchSellers();
        },
      });
    } else if (action === 'activate') {
      await adminService.activateSeller(seller._id);
      fetchSellers();
    } else if (action === 'delete') {
      setConfirmDialog({
        open: true,
        title: 'Delete Seller',
        message: `Permanently delete ${seller.storeName} and all associated products?`,
        type: 'danger',
        confirmLabel: 'Delete',
        onConfirm: async () => {
          await adminService.deleteSeller(seller._id);
          setConfirmDialog({ open: false });
          fetchSellers();
        },
      });
    }
  };

  const getActions = (seller) => [
    { label: 'View Details', icon: FiEye, onClick: () => handleAction('view', seller) },
    { label: 'Edit Store', icon: FiEdit2, onClick: () => {} },
    { type: 'divider' },
    ...(seller.verificationStatus?.toLowerCase() !== 'verified'
      ? [{ label: 'Approve KYC', icon: FiCheckCircle, onClick: () => handleAction('approve', seller), success: true }]
      : []),
    ...(seller.verificationStatus?.toLowerCase() === 'pending' || seller.verificationStatus?.toLowerCase() === 'in progress'
      ? [{ label: 'Reject KYC', icon: FiXCircle, onClick: () => handleAction('reject', seller), warning: true }]
      : []),
    ...(seller.status?.toLowerCase() === 'active' || (seller.isActive && !seller.isSuspended)
      ? [{ label: 'Suspend Store', icon: FiPauseCircle, onClick: () => handleAction('suspend', seller), warning: true }]
      : [{ label: 'Activate Store', icon: FiCheckCircle, onClick: () => handleAction('activate', seller), success: true }]),
    { type: 'divider' },
    { label: 'Open Public Store', icon: FiExternalLink, onClick: () => {} },
    { label: 'View Verification Docs', icon: FiFileText, onClick: () => handleAction('view', seller) },
    { type: 'divider' },
    { label: 'Delete Seller', icon: FiTrash2, onClick: () => handleAction('delete', seller), danger: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white tracking-tight">Seller Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor merchant stores, trust scores, KYC compliance, and catalog health
        </p>
      </motion.div>

      {/* Table Card */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <TableToolbar
          search={search}
          onSearch={setSearch}
          onSearchClear={() => setSearch('')}
          searchPlaceholder="Search store or owner..."
          selectedCount={selected.length}
          onExport={() => {}}
          onCreate={() => {}}
          createLabel="Onboard Seller"
          filters={
            <>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/8 rounded-xl text-gray-300 outline-none hover:border-white/20"
              >
                {VERIFICATION_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v === 'All Verifications'
                      ? v
                      : v.charAt(0).toUpperCase() + v.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={sellerTypeFilter}
                onChange={(e) => setSellerTypeFilter(e.target.value)}
                className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/8 rounded-xl text-gray-300 outline-none hover:border-white/20"
              >
                {SELLER_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t === 'All Seller Types'
                      ? t
                      : t === 'marketplace_seller'
                      ? 'Marketplace Seller'
                      : 'Standard Seller'}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/8 rounded-xl text-gray-300 outline-none hover:border-white/20"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All Status' ? s : s.charAt(0).toUpperCase() + s.slice(1)}
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
                    checked={sellers.length > 0 && selected.length === sellers.length}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded accent-yellow-500"
                  />
                </th>
                <th className="p-4">Store & Owner</th>
                <th className="p-4">Type</th>
                <th className="p-4">Trust Score</th>
                <th className="p-4">KYC Status</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Loading sellers...
                  </td>
                </tr>
              ) : sellers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">No sellers found</td>
                </tr>
              ) : (
                sellers.map((seller) => (
                  <tr key={seller._id} className="hover:bg-white/3 transition-colors group">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(seller._id)}
                        onChange={() => toggleSelect(seller._id)}
                        className="w-3.5 h-3.5 rounded accent-yellow-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {seller.logo ? (
                          <img
                            src={seller.logo}
                            alt={seller.storeName}
                            className="w-9 h-9 rounded-xl object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                            {seller.storeName?.[0] || seller.userId?.firstName?.[0] || seller.user?.firstName?.[0] || 'S'}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">
                            {seller.storeName}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {(seller.userId?.firstName || seller.user?.firstName || '')} {(seller.userId?.lastName || seller.user?.lastName || '')} • {seller.address?.city || seller.businessAddress?.city || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={seller.sellerType} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              seller.trustScore >= 80
                                ? 'bg-emerald-400'
                                : seller.trustScore >= 65
                                ? 'bg-yellow-400'
                                : 'bg-red-400'
                            }`}
                            style={{ width: `${seller.trustScore}%` }}
                          />
                        </div>
                        <span className="font-bold text-white">{seller.trustScore}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={seller.verificationStatus} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-bold text-white">
                        <FiStar className="text-yellow-400 fill-yellow-400" size={13} />
                        <span>{seller.averageRating || seller.rating || 0}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={seller.status} />
                    </td>
                    <td className="p-4 text-right">
                      <ActionDropdown actions={getActions(seller)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && sellers.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={totalItems}
            itemsPerPage={perPage}
          />
        )}
      </div>

      {/* Seller Details Drawer */}
      <AnimatePresence>
        {drawerSeller && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setDrawerSeller(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#141414] border-l border-white/5 z-50 overflow-y-auto p-6 space-y-6 shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Seller Store Dossier</h3>
                <button
                  onClick={() => setDrawerSeller(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Profile Card */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-5 text-center">
                {drawerSeller.logo ? (
                  <img
                    src={drawerSeller.logo}
                    alt={drawerSeller.storeName}
                    className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-yellow-500/30 mb-3 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-bold text-white border-2 border-yellow-500/30 mb-3 shadow-lg">
                    {drawerSeller.storeName?.[0] || 'S'}
                  </div>
                )}
                <h4 className="text-lg font-bold text-white">{drawerSeller.storeName}</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Operated by {drawerSeller.userId?.firstName || drawerSeller.user?.firstName || ''} {drawerSeller.userId?.lastName || drawerSeller.user?.lastName || ''}
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <StatusBadge status={drawerSeller.sellerType} size="md" />
                  <StatusBadge status={drawerSeller.verificationStatus} size="md" />
                  <StatusBadge status={drawerSeller.status} size="md" />
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-white">{drawerSeller.statistics?.totalProducts ?? 0}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">
                    Products
                  </p>
                </div>
                <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-white">{drawerSeller.statistics?.totalOrders ?? 0}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">
                    Orders
                  </p>
                </div>
                <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-yellow-400">
                    ₹{(drawerSeller.statistics?.revenue || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">
                    Revenue
                  </p>
                </div>
                <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-white">{drawerSeller.trustScore || 0}%</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">
                    Trust Score
                  </p>
                </div>
              </div>

              {/* Compliance & Contact */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3 text-xs">
                <h5 className="font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Compliance & Contact
                </h5>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-500">Email</span>
                  <span className="text-white font-medium">
                    {drawerSeller.userId?.email || drawerSeller.user?.email || drawerSeller.accountInfo?.email || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-500">GST Registration</span>
                  <span className="text-yellow-400 font-mono font-bold">
                    {drawerSeller.identity?.gst || drawerSeller.business?.gst || drawerSeller.businessDetails?.gstNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-500">Location</span>
                  <span className="text-white font-medium">
                    {drawerSeller.address?.city || drawerSeller.businessAddress?.city || drawerSeller.profile?.city || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">Joined Date</span>
                  <span className="text-white font-medium">
                    {drawerSeller.createdAt ? new Date(drawerSeller.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button className="h-10 px-4 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_12px_rgba(255,193,7,0.3)]">
                  Edit Store
                </button>
                <button className="h-10 px-4 bg-white/5 border border-white/10 text-gray-300 text-xs font-bold rounded-xl hover:bg-white/10 transition-all">
                  Open Storefront
                </button>
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

export default AdminSellers;
