import React, { useState, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { AppContext } from '../../context/AppContext';

const ROLE_OPTIONS = ['All Roles', 'customer', 'seller', 'marketplace_seller', 'moderator', 'support_staff', 'admin'];
const STATUS_OPTIONS = ['All Status', 'active', 'suspended', 'blocked'];

const AdminUsers = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(AppContext) || {};
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
  const [actionLoading, setActionLoading] = useState(false);

  // User Create / Edit Modal State
  const [userModal, setUserModal] = useState({
    open: false,
    mode: 'create', // 'create' | 'edit'
    userId: null,
  });
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    status: 'Active',
    isVerified: false,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Password Reset Modal State
  const [passwordModal, setPasswordModal] = useState({
    open: false,
    user: null,
    newPassword: '',
    submitting: false,
  });

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

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
    setSelected([]);
  };

  const handleRoleFilterChange = (val) => {
    setRoleFilter(val);
    setPage(1);
    setSelected([]);
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setPage(1);
    setSelected([]);
  };

  const isAllSelected = useMemo(() => {
    return users.length > 0 && users.every((u) => selected.includes(u._id));
  }, [users, selected]);

  const toggleSelectAll = () => {
    const pageUserIds = users.map((u) => u._id);
    if (isAllSelected) {
      setSelected((prev) => {
        const next = prev.filter((id) => !pageUserIds.includes(id));
        console.log("Selected users:", next);
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = Array.from(new Set([...prev, ...pageUserIds]));
        console.log("Selected users:", next);
        return next;
      });
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      console.log("Selected users:", next);
      return next;
    });
  };

  const handleBulkSuspend = () => {
    if (selected.length === 0) return;
    console.log("Selected users:", selected);
    console.log("Bulk action IDs:", selected);
    const count = selected.length;
    setConfirmDialog({
      open: true,
      title: 'Bulk Suspend Users',
      message: `Suspend ${count} selected user${count > 1 ? 's' : ''}?`,
      type: 'warning',
      confirmLabel: 'Suspend',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const res = await adminService.bulkSuspendUsers(selected);
          const updatedCount = res?.data?.count ?? count;
          const message = res?.message || `${updatedCount} user${updatedCount !== 1 ? 's' : ''} suspended successfully.`;
          if (showToast) showToast(message, 'success');
          setSelected([]);
          setConfirmDialog({ open: false });
          fetchUsers();
        } catch (error) {
          console.error('Error suspending users:', error);
          if (showToast) showToast(error.response?.data?.message || 'Failed to suspend users', 'error');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleBulkActivate = () => {
    if (selected.length === 0) return;
    console.log("Selected users:", selected);
    console.log("Bulk action IDs:", selected);
    const count = selected.length;
    setConfirmDialog({
      open: true,
      title: 'Bulk Activate Users',
      message: `Activate ${count} selected user${count > 1 ? 's' : ''}?`,
      type: 'info',
      confirmLabel: 'Activate',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const res = await adminService.bulkActivateUsers(selected);
          const updatedCount = res?.data?.count ?? count;
          const message = res?.message || `${updatedCount} user${updatedCount !== 1 ? 's' : ''} activated successfully.`;
          if (showToast) showToast(message, 'success');
          setSelected([]);
          setConfirmDialog({ open: false });
          fetchUsers();
        } catch (error) {
          console.error('Error activating users:', error);
          if (showToast) showToast(error.response?.data?.message || 'Failed to activate users', 'error');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleBulkDelete = () => {
    if (selected.length === 0) return;
    console.log("Selected users:", selected);
    console.log("Bulk action IDs:", selected);
    const count = selected.length;
    setConfirmDialog({
      open: true,
      title: 'Bulk Delete Users',
      message: `Delete ${count} selected user${count > 1 ? 's' : ''}?`,
      type: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const res = await adminService.bulkDeleteUsers(selected);
          const updatedCount = res?.data?.count ?? count;
          const message = res?.message || `${updatedCount} user${updatedCount !== 1 ? 's' : ''} deleted successfully.`;
          if (showToast) showToast(message, 'success');
          setSelected([]);
          setConfirmDialog({ open: false });
          fetchUsers();
        } catch (error) {
          console.error('Error deleting users:', error);
          if (showToast) showToast(error.response?.data?.message || 'Failed to delete users', 'error');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleExport = async () => {
    try {
      await adminService.exportData('users', 'csv');
      if (showToast) showToast('Users exported successfully.', 'success');
    } catch (error) {
      console.error('Error exporting users:', error);
      if (showToast) showToast('Failed to export users.', 'error');
    }
  };

  const handleAction = async (action, user) => {
    if (action === 'view') setDrawerUser(user);
    else if (action === 'suspend') {
      setConfirmDialog({
        open: true, title: 'Suspend Account', message: `Are you sure you want to suspend the account of ${user.firstName} ${user.lastName}? They won't be able to login.`, type: 'warning', confirmLabel: 'Suspend',
        onConfirm: async () => {
          try {
            setActionLoading(true);
            await adminService.updateUserStatus(user._id, 'suspended');
            if (showToast) showToast(`User ${user.firstName} ${user.lastName} suspended successfully.`, 'success');
            setConfirmDialog({ open: false });
            fetchUsers();
          } catch (error) {
            console.error('Error suspending user:', error);
            if (showToast) showToast(error.response?.data?.message || 'Failed to suspend user', 'error');
          } finally {
            setActionLoading(false);
          }
        }
      });
    } else if (action === 'block') {
      setConfirmDialog({
        open: true, title: 'Block User', message: `Permanently block ${user.firstName}?`, type: 'danger',
        onConfirm: async () => {
          try {
            setActionLoading(true);
            await adminService.blockUser(user._id, 'Blocked by admin');
            if (showToast) showToast(`User ${user.firstName} blocked successfully.`, 'success');
            setConfirmDialog({ open: false });
            fetchUsers();
          } catch (error) {
            console.error('Error blocking user:', error);
            if (showToast) showToast(error.response?.data?.message || 'Failed to block user', 'error');
          } finally {
            setActionLoading(false);
          }
        }
      });
    } else if (action === 'activate') {
      try {
        await adminService.updateUserStatus(user._id, 'active');
        if (showToast) showToast(`User ${user.firstName} ${user.lastName} activated successfully.`, 'success');
        fetchUsers();
      } catch (error) {
        console.error('Error activating user:', error);
        if (showToast) showToast(error.response?.data?.message || 'Failed to activate user', 'error');
      }
    } else if (action === 'delete') {
      setConfirmDialog({
        open: true, title: 'Delete Account', message: 'Are you sure you want to permanently delete this user? This action cannot be undone.', type: 'danger', confirmLabel: 'Delete',
        onConfirm: async () => {
          try {
            setActionLoading(true);
            await adminService.deleteUser(user._id);
            if (showToast) showToast('User deleted successfully.', 'success');
            setConfirmDialog({ open: false });
            fetchUsers();
          } catch (error) {
            console.error('Error deleting user:', error);
            if (showToast) showToast(error.response?.data?.message || 'Failed to delete user', 'error');
          } finally {
            setActionLoading(false);
          }
        }
      });
    }
  };

  const handleOpenCreate = () => {
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: 'customer',
      status: 'Active',
      isVerified: false,
    });
    setUserModal({ open: true, mode: 'create', userId: null });
  };

  const handleOpenEdit = (user) => {
    if (!user) return;
    setUserForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role || 'customer',
      status: user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase() : 'Active',
      isVerified: Boolean(user.isVerified || user.profileCompleted),
    });
    setUserModal({ open: true, mode: 'edit', userId: user._id });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      if (userModal.mode === 'create') {
        if (!userForm.password || userForm.password.length < 6) {
          if (showToast) showToast('Password must be at least 6 characters long.', 'error');
          setFormSubmitting(false);
          return;
        }
        await adminService.createUser(userForm);
        if (showToast) showToast('User created successfully.', 'success');
      } else {
        const payload = { ...userForm };
        if (!payload.password) delete payload.password;
        await adminService.updateUser(userModal.userId, payload);
        if (showToast) showToast('User updated successfully.', 'success');
        if (drawerUser && drawerUser._id === userModal.userId) {
          setDrawerUser((prev) => ({ ...prev, ...payload }));
        }
      }
      setUserModal({ open: false, mode: 'create', userId: null });
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      if (showToast) showToast(error.response?.data?.message || 'Failed to save user.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenResetPassword = (user) => {
    setPasswordModal({
      open: true,
      user,
      newPassword: '',
      submitting: false,
    });
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordModal.newPassword || passwordModal.newPassword.length < 6) {
      if (showToast) showToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    try {
      setPasswordModal((prev) => ({ ...prev, submitting: true }));
      await adminService.resetUserPassword(passwordModal.user._id, passwordModal.newPassword);
      if (showToast) showToast(`Password for ${passwordModal.user.firstName} reset successfully.`, 'success');
      setPasswordModal({ open: false, user: null, newPassword: '', submitting: false });
    } catch (error) {
      console.error('Error resetting password:', error);
      if (showToast) showToast(error.response?.data?.message || 'Failed to reset password.', 'error');
      setPasswordModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const getActions = (user) => [
    { label: 'View Details', icon: FiEye, onClick: () => handleAction('view', user) },
    { label: 'Edit User', icon: FiEdit2, onClick: () => handleOpenEdit(user) },
    { type: 'divider' },
    ...(user.status?.toLowerCase() === 'active' ? [
      { label: 'Suspend Account', icon: FiPauseCircle, onClick: () => handleAction('suspend', user), warning: true },
      { label: 'Block', icon: FiSlash, onClick: () => handleAction('block', user), danger: true },
    ] : [
      { label: 'Reactivate Account', icon: FiCheckCircle, onClick: () => handleAction('activate', user), success: true },
    ]),
    { type: 'divider' },
    { label: 'Reset Password', icon: FiKey, onClick: () => handleOpenResetPassword(user) },
    { label: 'View Orders', icon: FiShoppingCart, onClick: () => navigate(`/admin/orders?search=${encodeURIComponent(user.email)}`) },
    { type: 'divider' },
    { label: 'Delete Account', icon: FiTrash2, onClick: () => handleAction('delete', user), danger: true },
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
          onSearch={handleSearchChange}
          onSearchClear={() => handleSearchChange('')}
          searchPlaceholder="Search users..."
          selectedCount={selected.length}
          onExport={handleExport}
          onCreate={handleOpenCreate}
          createLabel="Add User"
          filters={
            <>
              <select value={roleFilter} onChange={(e) => handleRoleFilterChange(e.target.value)} className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/8 rounded-xl text-gray-300 outline-none">
                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r === 'All Roles' ? r : r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => handleStatusFilterChange(e.target.value)} className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/8 rounded-xl text-gray-300 outline-none">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'All Status' ? s : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </>
          }
          bulkActions={[
            { label: 'Suspend', icon: FiPauseCircle, onClick: handleBulkSuspend, warning: true },
            { label: 'Activate', icon: FiCheckCircle, onClick: handleBulkActivate, success: true },
            { label: 'Export', icon: FiDownload, onClick: handleExport },
            { label: 'Delete', icon: FiTrash2, onClick: handleBulkDelete, danger: true },
          ]}
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-white/3 border-b border-white/5 text-gray-500 uppercase tracking-wider font-bold">
                <th className="p-4 w-10">
                  <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} className="w-3.5 h-3.5 rounded accent-yellow-500" />
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
                    <td className="p-4"><StatusBadge status={user.status?.toLowerCase()} /></td>
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
                    <StatusBadge status={drawerUser.status?.toLowerCase()} size="md" />
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
                  <button
                    onClick={() => handleOpenEdit(drawerUser)}
                    className="h-10 px-4 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_12px_rgba(255,193,7,0.3)] flex items-center justify-center gap-1.5"
                  >
                    <FiEdit2 size={13} /> Edit User
                  </button>
                  <button
                    onClick={() => navigate(`/admin/orders?search=${encodeURIComponent(drawerUser.email)}`)}
                    className="h-10 px-4 bg-white/5 border border-white/10 text-gray-300 text-xs font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    <FiShoppingCart size={13} /> View Orders
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create / Edit User Modal */}
      <AnimatePresence>
        {userModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => !formSubmitting && setUserModal({ open: false, mode: 'create', userId: null })}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#1C1C1C] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                    {userModal.mode === 'create' ? <FiPlus size={18} /> : <FiEdit2 size={16} />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {userModal.mode === 'create' ? 'Create New User' : 'Edit User Profile'}
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      {userModal.mode === 'create' ? 'Add a new member to the NexCart platform' : 'Update account privileges, status, and profile info'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !formSubmitting && setUserModal({ open: false, mode: 'create', userId: null })}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="mt-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1.5">First Name *</label>
                    <input
                      type="text"
                      required
                      value={userForm.firstName}
                      onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                      placeholder="e.g. John"
                      className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1.5">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={userForm.lastName}
                      onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                      placeholder="e.g. Doe"
                      className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="john.doe@example.com"
                      className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1.5">Account Role</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      className="w-full h-10 px-3 bg-[#242424] border border-white/10 rounded-xl text-gray-200 outline-none focus:border-yellow-500/50"
                    >
                      <option value="customer">Customer</option>
                      <option value="seller">Seller</option>
                      <option value="marketplace_seller">Marketplace Seller</option>
                      <option value="moderator">Moderator</option>
                      <option value="support_staff">Support Staff</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1.5">Status</label>
                    <select
                      value={userForm.status}
                      onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                      className="w-full h-10 px-3 bg-[#242424] border border-white/10 rounded-xl text-gray-200 outline-none focus:border-yellow-500/50"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1.5">
                    {userModal.mode === 'create' ? 'Password *' : 'New Password (optional)'}
                  </label>
                  <input
                    type="password"
                    required={userModal.mode === 'create'}
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder={userModal.mode === 'create' ? 'Min 6 characters' : 'Leave blank to keep current password'}
                    minLength={6}
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="verifiedUserToggle"
                    checked={userForm.isVerified}
                    onChange={(e) => setUserForm({ ...userForm, isVerified: e.target.checked })}
                    className="w-4 h-4 rounded accent-yellow-500 cursor-pointer"
                  />
                  <label htmlFor="verifiedUserToggle" className="text-gray-300 font-medium cursor-pointer">
                    Verified Account Badge
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    disabled={formSubmitting}
                    onClick={() => setUserModal({ open: false, mode: 'create', userId: null })}
                    className="flex-1 h-10 rounded-xl font-bold text-gray-300 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 h-10 rounded-xl font-bold text-black bg-yellow-500 hover:bg-yellow-400 transition-colors shadow-[0_0_12px_rgba(255,193,7,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {formSubmitting ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : userModal.mode === 'create' ? (
                      'Create User'
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {passwordModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => !passwordModal.submitting && setPasswordModal({ open: false, user: null, newPassword: '', submitting: false })}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#1C1C1C] border border-white/10 rounded-2xl p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                    <FiKey size={16} />
                  </div>
                  <h3 className="text-base font-bold text-white">Reset Password</h3>
                </div>
                <button
                  type="button"
                  onClick={() => !passwordModal.submitting && setPasswordModal({ open: false, user: null, newPassword: '', submitting: false })}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSavePassword} className="mt-4 space-y-4 text-xs">
                <p className="text-gray-400">
                  Set a new password for <span className="text-white font-bold">{passwordModal.user?.firstName} {passwordModal.user?.lastName}</span> ({passwordModal.user?.email}).
                </p>

                <div>
                  <label className="block text-gray-400 font-bold mb-1.5">New Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordModal.newPassword}
                    onChange={(e) => setPasswordModal({ ...passwordModal, newPassword: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50 font-mono"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={passwordModal.submitting}
                    onClick={() => setPasswordModal({ open: false, user: null, newPassword: '', submitting: false })}
                    className="flex-1 h-10 rounded-xl font-bold text-gray-300 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordModal.submitting}
                    className="flex-1 h-10 rounded-xl font-bold text-black bg-yellow-500 hover:bg-yellow-400 transition-colors shadow-[0_0_12px_rgba(255,193,7,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {passwordModal.submitting ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
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
        loading={actionLoading}
      />
    </div>
  );
};


export default AdminUsers;

