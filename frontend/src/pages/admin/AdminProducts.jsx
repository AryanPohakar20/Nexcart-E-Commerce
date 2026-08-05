import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage, FiEye, FiEdit2, FiStar, FiTrash2, FiCheckCircle,
  FiXCircle, FiX, FiDollarSign, FiTag, FiShoppingBag, FiLayers,
  FiRefreshCw
} from 'react-icons/fi';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import ActionDropdown from '../../components/admin/shared/ActionDropdown';
import TableToolbar from '../../components/admin/shared/TableToolbar';
import Pagination from '../../components/admin/shared/Pagination';
import ConfirmDialog from '../../components/admin/shared/ConfirmDialog';
import adminService from '../../services/adminService';

const STATUS_OPTIONS = ['All Status', 'active', 'out_of_stock', 'Pending', 'Rejected'];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [drawerProduct, setDrawerProduct] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const perPage = 10;

  // Load categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await adminService.getCategories({ limit: 100 });
        if (res.data?.categories) {
          setCategoriesList(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products from backend API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: perPage,
      };

      if (search.trim()) params.search = search.trim();
      if (categoryFilter !== 'All Categories') params.category = categoryFilter;
      if (statusFilter !== 'All Status') params.status = statusFilter;

      const res = await adminService.getProducts(params);
      if (res.data) {
        const mapped = (res.data.products || []).map((p) => ({
          id: p._id,
          name: p.name,
          sku: p.sku || 'N/A',
          seller: p.seller?.business?.businessName || p.seller?.accountInfo?.displayName || p.seller?.slug || 'Direct Store',
          category: p.category?.name || 'Uncategorized',
          categoryId: p.category?._id,
          price: p.price || 0,
          stock: p.stock || 0,
          rating: p.ratings?.average || 4.5,
          reviews: p.ratings?.count || 0,
          status: p.stock <= 0 ? 'out_of_stock' : (p.status?.toLowerCase() === 'approved' || p.status?.toLowerCase() === 'active') ? 'active' : p.status?.toLowerCase(),
          rawStatus: p.status,
          featured: p.featured || false,
          image: p.images?.[0]?.url || p.thumbnail || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
          createdAt: p.createdAt,
        }));

        setProducts(mapped);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalItems(res.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Unable to load products from database.');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleSelectAll = () => {
    if (selected.length === products.length) setSelected([]);
    else setSelected(products.map((p) => p.id));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleAction = async (action, product) => {
    if (action === 'view') {
      setDrawerProduct(product);
    } else if (action === 'toggle_featured') {
      try {
        await adminService.toggleFeaturedProduct(product.id);
        fetchProducts();
        if (drawerProduct && drawerProduct.id === product.id) {
          setDrawerProduct((prev) => ({ ...prev, featured: !prev.featured }));
        }
      } catch (err) {
        console.error('Failed to toggle featured status:', err);
      }
    } else if (action === 'approve') {
      try {
        await adminService.approveProduct(product.id);
        fetchProducts();
      } catch (err) {
        console.error('Failed to approve product:', err);
      }
    } else if (action === 'delete') {
      setConfirmDialog({
        open: true,
        title: 'Delete Product Listing',
        message: `Permanently delete "${product.name}"? This removes it from marketplace searches.`,
        type: 'danger',
        confirmLabel: 'Delete',
        onConfirm: async () => {
          try {
            await adminService.deleteProduct(product.id);
            setConfirmDialog({ open: false });
            fetchProducts();
          } catch (err) {
            console.error('Failed to delete product:', err);
          }
        },
      });
    }
  };

  const handleBulkAction = async (bulkAction) => {
    if (selected.length === 0) return;
    try {
      await adminService.bulkProductAction(bulkAction, selected);
      setSelected([]);
      fetchProducts();
    } catch (err) {
      console.error(`Bulk ${bulkAction} failed:`, err);
    }
  };

  const getActions = (product) => [
    { label: 'View Details', icon: FiEye, onClick: () => handleAction('view', product) },
    ...(product.rawStatus === 'Pending'
      ? [{ label: 'Approve Listing', icon: FiCheckCircle, onClick: () => handleAction('approve', product) }]
      : []),
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
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Product Catalog Master</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review, moderate, and manage all live and out-of-stock listings across the ecosystem
          </p>
        </div>
        <button
          onClick={fetchProducts}
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
          searchPlaceholder="Search product title, SKU, seller..."
          selectedCount={selected.length}
          onExport={() => {}}
          onCreate={() => {}}
          createLabel="Add Product"
          filters={
            <>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/8 rounded-xl text-gray-300 outline-none hover:border-white/20"
              >
                <option value="All Categories">All Categories</option>
                {categoriesList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/8 rounded-xl text-gray-300 outline-none hover:border-white/20"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All Status' ? s : s === 'out_of_stock' ? 'Out of Stock' : s}
                  </option>
                ))}
              </select>
            </>
          }
        />

        {/* Bulk Action Banner */}
        {selected.length > 0 && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-2 flex items-center justify-between text-xs">
            <span className="text-yellow-400 font-bold">
              {selected.length} product(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-lg hover:bg-emerald-500/30"
              >
                Approve Selected
              </button>
              <button
                onClick={() => handleBulkAction('feature')}
                className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 font-bold rounded-lg hover:bg-yellow-500/30"
              >
                Feature Selected
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-2.5 py-1 bg-red-500/20 text-red-400 font-bold rounded-lg hover:bg-red-500/30"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-white/3 border-b border-white/5 text-gray-500 uppercase tracking-wider font-bold">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selected.length === products.length}
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
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-gray-500">
                    <FiRefreshCw className="animate-spin inline mr-2" size={16} />
                    Loading product catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-gray-500">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
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
                          <p className="text-[10px] text-gray-500 font-mono">SKU: {product.sku}</p>
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
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-500">SKU</span>
                  <span className="text-gray-400 font-mono">{drawerProduct.sku}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">Listing Reference ID</span>
                  <span className="text-gray-400 font-mono">{drawerProduct.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAction('toggle_featured', drawerProduct)}
                  className="h-10 px-4 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_12px_rgba(255,193,7,0.3)]"
                >
                  {drawerProduct.featured ? 'Unfeature' : 'Feature Product'}
                </button>
                <button
                  onClick={() => {
                    const prod = drawerProduct;
                    setDrawerProduct(null);
                    handleAction('delete', prod);
                  }}
                  className="h-10 px-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all"
                >
                  Delete Listing
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
