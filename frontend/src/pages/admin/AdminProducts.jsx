import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage, FiEye, FiEdit2, FiStar, FiTrash2, FiCheckCircle,
  FiXCircle, FiX, FiDollarSign, FiTag, FiShoppingBag, FiLayers,
  FiRefreshCw, FiSave, FiCheck
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
  const [editingStock, setEditingStock] = useState('');
  const [stockSaving, setStockSaving] = useState(false);
  const [stockSavedSuccess, setStockSavedSuccess] = useState(false);
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
        const mapped = (res.data.products || []).map((p) => {
          const stockNum = Number(p.stock !== undefined ? p.stock : (p.stockQuantity !== undefined ? p.stockQuantity : 0));
          return {
            id: p.id || p._id,
            name: p.title || p.name || 'Untitled Product',
            sku: p.sku || 'N/A',
            seller: p.sellerDisplayName || p.seller?.name || p.seller?.business?.businessName || 'Direct Store',
            category: p.category || p.category?.name || 'Uncategorized',
            categoryId: p.categoryId || p.category?._id,
            price: Number(p.price) || 0,
            stock: stockNum,
            rating: Number(p.rating || p.averageRating || p.ratings?.average || 4.5),
            reviews: Number(p.reviewsCount || p.reviewCount || p.ratings?.count || 0),
            status: stockNum <= 0 ? 'out_of_stock' : (p.status?.toLowerCase() === 'approved' || p.status?.toLowerCase() === 'active') ? 'active' : p.status?.toLowerCase(),
            rawStatus: p.rawStatus || p.status,
            featured: Boolean(p.isFeatured || p.featured),
            image: p.image || p.thumbnail || p.images?.[0]?.url || p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
            createdAt: p.createdAt,
          };
        });

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
      setEditingStock(product.stock);
      setStockSavedSuccess(false);
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

  const handleUpdateStock = async () => {
    if (!drawerProduct || editingStock === '') return;
    setStockSaving(true);
    try {
      const updatedStockVal = Math.max(0, parseInt(editingStock, 10) || 0);
      await adminService.updateStock(drawerProduct.id, updatedStockVal);
      setDrawerProduct((prev) => ({
        ...prev,
        stock: updatedStockVal,
        status: updatedStockVal <= 0 ? 'out_of_stock' : 'active',
      }));
      setStockSavedSuccess(true);
      setTimeout(() => setStockSavedSuccess(false), 2500);
      fetchProducts();
    } catch (err) {
      console.error('Failed to update product stock:', err);
    } finally {
      setStockSaving(false);
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
    { label: 'View & Manage Stock', icon: FiEye, onClick: () => handleAction('view', product) },
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
            Review, moderate, and manage inventory and listings across MongoDB
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

      {/* Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name, SKU, seller, or ID..."
        filters={[
          {
            value: categoryFilter,
            onChange: (v) => { setCategoryFilter(v); setPage(1); },
            options: ['All Categories', ...categoriesList.map((c) => c.name)],
          },
          {
            value: statusFilter,
            onChange: (v) => { setStatusFilter(v); setPage(1); },
            options: STATUS_OPTIONS,
          },
        ]}
        selectedCount={selected.length}
        bulkActions={[
          { label: 'Feature Selected', icon: FiStar, onClick: () => handleBulkAction('feature') },
          { label: 'Approve Selected', icon: FiCheckCircle, onClick: () => handleBulkAction('approve') },
          { label: 'Delete Selected', icon: FiTrash2, onClick: () => handleBulkAction('delete'), danger: true },
        ]}
      />

      {/* Table Container */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selected.length === products.length}
                    onChange={toggleSelectAll}
                    className="rounded border-white/20 bg-white/5 text-yellow-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4">Product</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Merchant / Brand</th>
                <th className="py-4 px-4 text-right">Price</th>
                <th className="py-4 px-4 text-center">Inventory</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center text-gray-500">
                    <FiRefreshCw className="animate-spin text-2xl mx-auto mb-2 text-yellow-500" />
                    Loading database products...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center text-red-400">
                    {error}
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center text-gray-500">
                    <FiPackage className="text-4xl mx-auto mb-3 opacity-20" />
                    No products found matching criteria
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isSelected = selected.includes(product.id);
                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-white/[0.02] transition-colors group ${
                        isSelected ? 'bg-yellow-500/[0.03]' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(product.id)}
                          className="rounded border-white/20 bg-white/5 text-yellow-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded-xl object-cover border border-white/10 bg-white/5"
                            />
                            {product.featured && (
                              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-500 rounded-full flex items-center justify-center text-[8px] text-black font-black" title="Featured Product">
                                ★
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-yellow-400 transition-colors line-clamp-1 max-w-[220px]">
                              {product.name}
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                              SKU: {product.sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-white/5 border border-white/10 text-gray-300 text-[11px] px-2.5 py-1 rounded-lg">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-300 font-medium">{product.seller}</div>
                        <div className="text-[10px] text-gray-500">⭐ {product.rating.toFixed(1)} ({product.reviews})</div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="font-bold text-white font-mono">
                          ₹{product.price.toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                            product.stock === 0
                              ? 'text-red-400 bg-red-500/10'
                              : product.stock < 10
                              ? 'text-yellow-400 bg-yellow-500/10'
                              : 'text-green-400 bg-green-500/10'
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={product.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <ActionDropdown actions={getActions(product)} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={totalItems}
          itemsPerPage={perPage}
        />
      </div>

      {/* Product Details & Inventory Drawer */}
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

              {/* Quick Inventory / Stock Manager */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Inventory Stock Management</span>
                  <span className="text-[10px] text-gray-400 font-mono">Live MongoDB Sync</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      min="0"
                      value={editingStock}
                      onChange={(e) => setEditingStock(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-yellow-500 focus:outline-none"
                      placeholder="Stock quantity"
                    />
                  </div>
                  <button
                    onClick={handleUpdateStock}
                    disabled={stockSaving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    {stockSaving ? (
                      <FiRefreshCw className="animate-spin" />
                    ) : stockSavedSuccess ? (
                      <FiCheck className="text-sm font-black" />
                    ) : (
                      <FiSave />
                    )}
                    {stockSavedSuccess ? 'Saved!' : 'Save Stock'}
                  </button>
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
