import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage, FiEye, FiEdit2, FiStar, FiTrash2, FiCheckCircle,
  FiXCircle, FiX, FiDollarSign, FiTag, FiShoppingBag, FiLayers
} from 'react-icons/fi';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import ActionDropdown from '../../components/admin/shared/ActionDropdown';
import TableToolbar from '../../components/admin/shared/TableToolbar';
import Pagination from '../../components/admin/shared/Pagination';
import ConfirmDialog from '../../components/admin/shared/ConfirmDialog';
import { ADMIN_PRODUCTS, ADMIN_CATEGORIES } from '../../constants/adminDummyData';

const STATUS_OPTIONS = ['All Status', 'active', 'out_of_stock'];

const AdminProducts = () => {
  const [products, setProducts] = useState(ADMIN_PRODUCTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [drawerProduct, setDrawerProduct] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const perPage = 10;

  const categories = useMemo(() => {
    return ['All Categories', ...new Set(ADMIN_CATEGORIES.map((c) => c.name))];
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.seller.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        categoryFilter === 'All Categories' || p.category === categoryFilter;
      const matchStatus = statusFilter === 'All Status' || p.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage) || 1;

  const toggleSelectAll = () => {
    if (selected.length === paged.length) setSelected([]);
    else setSelected(paged.map((p) => p.id));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleAction = (action, product) => {
    if (action === 'view') {
      setDrawerProduct(product);
    } else if (action === 'toggle_featured') {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, featured: !p.featured } : p))
      );
    } else if (action === 'delete') {
      setConfirmDialog({
        open: true,
        title: 'Delete Product Listing',
        message: `Permanently delete "${product.name}"? This removes it from marketplace searches.`,
        type: 'danger',
        confirmLabel: 'Delete',
        onConfirm: () => {
          setProducts((prev) => prev.filter((p) => p.id !== product.id));
          setConfirmDialog({ open: false });
        },
      });
    }
  };

  const getActions = (product) => [
    { label: 'View Details', icon: FiEye, onClick: () => handleAction('view', product) },
    { label: 'Edit Product', icon: FiEdit2, onClick: () => {} },
    { type: 'divider' },
    {
      label: product.featured ? 'Remove Featured' : 'Mark as Featured',
      icon: FiStar,
      onClick: () => handleAction('toggle_featured', product),
      warning: !product.featured,
    },
    { type: 'divider' },
    { label: 'Delete Product', icon: FiTrash2, onClick: () => handleAction('delete', product), danger: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white tracking-tight">Product Catalog Master</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review, moderate, and manage all live and out-of-stock listings across the ecosystem
        </p>
      </motion.div>

      {/* Table Card */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <TableToolbar
          search={search}
          onSearch={setSearch}
          onSearchClear={() => setSearch('')}
          searchPlaceholder="Search product title or seller..."
          selectedCount={selected.length}
          onExport={() => {}}
          onCreate={() => {}}
          createLabel="Add Product"
          filters={
            <>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/8 rounded-xl text-gray-300 outline-none hover:border-white/20"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
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
                    {s === 'All Status' ? s : s === 'out_of_stock' ? 'Out of Stock' : 'Active'}
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
                    checked={paged.length > 0 && selected.length === paged.length}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded accent-yellow-500"
                  />
                </th>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Merchant</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {paged.map((product) => (
                <tr key={product.id} className="hover:bg-white/3 transition-colors group">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="w-3.5 h-3.5 rounded accent-yellow-500"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-xl object-cover border border-white/10"
                      />
                      <div className="max-w-[200px] sm:max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors truncate">
                            {product.name}
                          </p>
                          {product.featured && (
                            <span className="bg-yellow-500/20 text-yellow-400 text-[9px] px-1 py-0.2 rounded font-bold">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-md font-semibold">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300 font-medium">{product.seller}</td>
                  <td className="p-4 font-bold text-white text-sm">
                    ₹{product.price.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-bold ${
                        product.stock > 10
                          ? 'text-emerald-400'
                          : product.stock > 0
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {product.stock > 0 ? `${product.stock} units` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 font-bold text-white">
                      <FiStar className="text-yellow-400 fill-yellow-400" size={13} />
                      <span>{product.rating}</span>
                      <span className="text-[10px] text-gray-500">({product.reviews})</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="p-4 text-right">
                    <ActionDropdown actions={getActions(product)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filtered.length}
          itemsPerPage={perPage}
        />
      </div>

      {/* Product Details Drawer */}
      <AnimatePresence>
        {drawerProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setDrawerProduct(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#141414] border-l border-white/5 z-50 overflow-y-auto p-6 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Product Summary</h3>
                <button
                  onClick={() => setDrawerProduct(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="bg-white/3 border border-white/5 rounded-2xl p-5 text-center">
                <img
                  src={drawerProduct.image}
                  alt={drawerProduct.name}
                  className="w-36 h-36 rounded-2xl object-cover mx-auto border border-white/10 mb-4 shadow-xl"
                />
                <h4 className="text-base font-bold text-white">{drawerProduct.name}</h4>
                <p className="text-xs text-gray-400 mt-1">Merchant: {drawerProduct.seller}</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2.5 py-1 rounded-full font-black">
                    ₹{drawerProduct.price.toLocaleString('en-IN')}
                  </span>
                  <StatusBadge status={drawerProduct.status} size="md" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-white">{drawerProduct.stock}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">
                    Available Stock
                  </p>
                </div>
                <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-yellow-400">{drawerProduct.rating} ★</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">
                    {drawerProduct.reviews} Ratings
                  </p>
                </div>
              </div>

              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-500">Category</span>
                  <span className="text-white font-medium">{drawerProduct.category}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-500">Featured Placement</span>
                  <span className="text-white font-medium">
                    {drawerProduct.featured ? 'Yes (Homepage & Deals)' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">Listing Reference ID</span>
                  <span className="text-gray-400 font-mono">{drawerProduct.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="h-10 px-4 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_12px_rgba(255,193,7,0.3)]">
                  Edit Listing
                </button>
                <button
                  onClick={() => handleAction('toggle_featured', drawerProduct)}
                  className="h-10 px-4 bg-white/5 border border-white/10 text-gray-300 text-xs font-bold rounded-xl hover:bg-white/10 transition-all"
                >
                  {drawerProduct.featured ? 'Unfeature' : 'Feature Product'}
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

export default AdminProducts;
