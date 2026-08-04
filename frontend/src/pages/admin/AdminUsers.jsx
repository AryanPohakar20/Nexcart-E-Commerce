import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiEye, FiEdit2, FiPauseCircle, FiSlash, FiCheckCircle,
  FiTrash2, FiKey, FiActivity, FiClock, FiX, FiDownload, FiPlus,
  FiMail, FiPhone, FiMapPin, FiShoppingCart
} from 'react-icons/fi';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import ActionDropdown from '../../components/admin/shared/ActionDropdown';
import TableToolbar from '../../components/admin/shared/TableToolbar';
import Pagination from '../../components/admin/shared/Pagination';
import ConfirmDialog from '../../components/admin/shared/ConfirmDialog';
import adminService from '../../services/adminService';

const ROLE_OPTIONS = ['All Roles', 'customer', 'seller', 'marketplace_seller'];
const STATUS_OPTIONS = ['All Status', 'active', 'suspended', 'blocked'];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [drawerUser, setDrawerUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const perPage = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: perPage,
        ...(search && { search }),
        ...(roleFilter !== 'All Roles' && { role: roleFilter }),
        ...(statusFilter !== 'All Status' && { status: statusFilter === 'active' ? 'Active' : statusFilter === 'suspended' ? 'Suspended' : 'Blocked' }),
      };
      const res = await adminService.getUsers(params);
      setUsers(res.data.users);
      setTotalItems(res.data.pagination.totalItems);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, statusFilter]);

  const toggleSelectAll = () => {
    if (selected.length === users.length) setSelected([]);
    else setSelected(users.map((u) => u._id));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleAction = async (action, user) => {
    if (action === 'view') setDrawerUser(user);
    else if (action === 'suspend') {
      setConfirmDialog({
        open: true, title: 'Suspend User', message: `Suspend ${user.firstName}? They won't be able to login.`, type: 'warning',
        onConfirm: async () => {
          await adminService.suspendUser(user._id, 'Suspended by admin');
          setConfirmDialog({ open: false });
          fetchUsers();
        }
      });
    } else if (action === 'block') {
      setConfirmDialog({
        open: true, title: 'Block User', message: `Permanently block ${user.firstName}?`, type: 'danger',
        onConfirm: async () => {
          await adminService.blockUser(user._id, 'Blocked by admin');
          setConfirmDialog({ open: false });
          fetchUsers();
        }
      });
    } else if (action === 'activate') {
      await adminService.activateUser(user._id);
      fetchUsers();
    } else if (action === 'delete') {
      setConfirmDialog({
        open: true, title: 'Delete User', message: `Permanently delete ${user.firstName}? This cannot be undone.`, type: 'danger', confirmLabel: 'Delete',
        onConfirm: async () => {
          await adminService.deleteUser(user._id);
          setConfirmDialog({ open: false });
          fetchUsers();
        }
      });
    }
  };

  const getActions = (user) => [
    { label: 'View Details', icon: FiEye, onClick: () => handleAction('view', user) },
    { label: 'Edit User', icon: FiEdit2, onClick: () => {} },
    { type: 'divider' },
    ...(user.status?.toLowerCase() === 'active' ? [
      { label: 'Suspend', icon: FiPauseCircle, onClick: () => handleAction('suspend', user), warning: true },
      { label: 'Block', icon: FiSlash, onClick: () => handleAction('block', user), danger: true },
    ] : [
      { label: 'Activate', icon: FiCheckCircle, onClick: () => handleAction('activate', user), success: true },
    ]),
    { type: 'divider' },
    { label: 'Reset Password', icon: FiKey, onClick: () => {} },
    { label: 'View Activity', icon: FiActivity, onClick: () => {} },
    { label: 'View Audit History', icon: FiClock, onClick: () => {} },
    { type: 'divider' },
    { label: 'Delete User', icon: FiTrash2, onClick: () => handleAction('delete', user), danger: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white tracking-tight">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all platform users, roles, and access</p>
      </motion.div>

      {/* Table Card */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
        <TableToolbar
          search={search}
          onSearch={setSearch}
          onSearchClear={() => setSearch('')}
          searchPlaceholder="Search users..."
          selectedCount={selected.length}
          onExport={() => {}}
          onCreate={() => {}}
          createLabel="Add User"
          filters={
            <>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/8 rounded-xl text-gray-300 outline-none">
                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r === 'All Roles' ? r : r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/8 rounded-xl text-gray-300 outline-none">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'All Status' ? s : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </>
          }
          bulkActions={[
            { label: 'Suspend', icon: FiPauseCircle, onClick: () => {}, warning: true },
            { label: 'Activate', icon: FiCheckCircle, onClick: () => {}, success: true },
            { label: 'Export', icon: FiDownload, onClick: () => {} },
            { label: 'Delete', icon: FiTrash2, onClick: () => {}, danger: true },
          ]}
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-white/3 border-b border-white/5 text-gray-500 uppercase tracking-wider font-bold">
                <th className="p-4 w-10">
                  <input type="checkbox" checked={users.length > 0 && selected.length === users.length} onChange={toggleSelectAll} className="w-3.5 h-3.5 rounded accent-yellow-500" />
                </th>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4 hidden lg:table-cell">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 hidden md:table-cell">Joined</th>
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
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-white/3 transition-colors group">
                    <td className="p-4">
                      <input type="checkbox" checked={selected.includes(user._id)} onChange={() => toggleSelect(user._id)} className="w-3.5 h-3.5 rounded accent-yellow-500" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.firstName} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-white">{user.firstName} {user.lastName}</p>
                          <p className="text-[10px] text-gray-500">{(user.isVerified || user.profileCompleted) ? 'Verified Profile' : 'Unverified'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400">{user.email}</td>
                    <td className="p-4 text-gray-400 hidden lg:table-cell">{user.phone}</td>
                    <td className="p-4"><StatusBadge status={user.role} /></td>
                    <td className="p-4"><StatusBadge status={user.status} /></td>
                    <td className="p-4 text-gray-500 hidden md:table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <ActionDropdown actions={getActions(user)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && users.length > 0 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} itemsPerPage={perPage} />
        )}
      </div>

      {/* User Details Drawer */}
      <AnimatePresence>
        {drawerUser && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setDrawerUser(null)} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#141414] border-l border-white/5 z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">User Details</h3>
                  <button onClick={() => setDrawerUser(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                    <FiX size={18} />
                  </button>
                </div>

                {/* Profile Card */}
                <div className="bg-white/3 border border-white/5 rounded-2xl p-5 text-center">
                  {drawerUser.avatar ? (
                    <img src={drawerUser.avatar} alt={drawerUser.firstName} className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-yellow-500/30 mb-3" />
                  ) : (
                    <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center text-3xl font-bold text-white border-2 border-yellow-500/30 mb-3">
                      {drawerUser.firstName?.[0]}{drawerUser.lastName?.[0]}
                    </div>
                  )}
                  <h4 className="text-lg font-bold text-white">{drawerUser.firstName} {drawerUser.lastName}</h4>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <StatusBadge status={drawerUser.role} size="md" />
                    <StatusBadge status={drawerUser.status} size="md" />
                  </div>
                  {(drawerUser.isVerified || drawerUser.profileCompleted) && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 mt-2">
                      <FiCheckCircle size={11} /> Verified Account
                    </span>
                  )}
                </div>

                {/* Contact Info */}
                <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h5>
                  <div className="flex items-center gap-3 text-sm">
                    <FiMail size={14} className="text-gray-500" />
                    <span className="text-gray-300">{drawerUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <FiPhone size={14} className="text-gray-500" />
                    <span className="text-gray-300">{drawerUser.phone}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-center">
                    <p className="text-lg font-black text-white">-</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">Orders</p>
                  </div>
                  <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-center">
                    <p className="text-lg font-black text-white">₹0</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">Total Spent</p>
                  </div>
                </div>

                {/* Activity */}
                <div className="bg-white/3 border border-white/5 rounded-2xl p-4">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Activity</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Joined</span><span className="text-white font-semibold">{new Date(drawerUser.createdAt).toLocaleDateString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Last Active</span><span className="text-white font-semibold">{drawerUser.lastLogin ? new Date(drawerUser.lastLogin).toLocaleDateString() : 'N/A'}</span></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="h-10 px-4 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_12px_rgba(255,193,7,0.3)]">
                    <FiEdit2 className="inline mr-1.5" size={13} /> Edit User
                  </button>
                  <button className="h-10 px-4 bg-white/5 border border-white/10 text-gray-300 text-xs font-bold rounded-xl hover:bg-white/10 transition-all">
                    <FiShoppingCart className="inline mr-1.5" size={13} /> View Orders
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
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

export default AdminUsers;
