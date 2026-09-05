import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage, FiEye, FiEdit2, FiStar, FiTrash2, FiCheckCircle,
  FiXCircle, FiX, FiRefreshCw, FiSave, FiCheck,
  FiTrendingUp, FiEyeOff, FiAlertCircle, FiTag, FiClock
} from 'react-icons/fi';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import ActionDropdown from '../../components/admin/shared/ActionDropdown';
import TableToolbar from '../../components/admin/shared/TableToolbar';
import Pagination from '../../components/admin/shared/Pagination';
import ConfirmDialog from '../../components/admin/shared/ConfirmDialog';
import adminService from '../../services/adminService';

const STATUS_OPTIONS = [
  { value: 'All Status', label: 'All Status' },
  { value: 'Active', label: 'Active' },
  { value: 'Pending', label: 'Pending Approval' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'in_stock', label: 'In Stock' },
];

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

  // Drawer state
  const [drawerProduct, setDrawerProduct] = useState(null);
  const [editingStock, setEditingStock] = useState('');
  const [stockSaving, setStockSaving] = useState(false);
  const [stockSavedSuccess, setStockSavedSuccess] = useState(false);

  // Edit Modal state
  const [editModal, setEditModal] = useState({ open: false, product: null });
  const [editForm, setEditForm] = useState({
    title: '',
    brand: '',
    category: '',
    price: '',
    mrp: '',
    discount: '',
    stock: '',
    status: 'Active',
    visibility: true,
    description: '',
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  // Confirmation & Notifications
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const perPage = 10;

  // Show temporary feedback toast
  const showFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Safe image helper
  const getProductImage = (product) => {
    if (product.image) return product.image;
    if (Array.isArray(product.images) && product.images.length > 0) {
      const primary = product.images.find((img) => img?.isPrimary);
      if (primary?.url) return primary.url;
      const first = product.images[0];
      if (typeof first === 'string') return first;
      if (first?.url) return first.url;
    }
    if (product.thumbnail) return product.thumbnail;
    return 'https://via.placeholder.com/150?text=No+Image';
  };

  // Load categories from database for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await adminService.getCategories({ limit: 100 });
        if (res.data?.categories) {
          setCategoriesList(res.data.categories);
        } else if (res.categories) {
          setCategoriesList(res.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products from MongoDB database via backend API
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
      const payload = res.data || res;

      if (payload && Array.isArray(payload.products)) {
        const mapped = payload.products.map((p) => {
          const stockNum = Number(
            p.stock !== undefined ? p.stock : (p.stockQuantity !== undefined ? p.stockQuantity : 0)
          );
          const priceNum = Number(p.price) || 0;
          const mrpNum = Number(p.mrp || p.originalPrice || (priceNum > 0 ? Math.round(priceNum * 1.15) : 0));
          const discountNum = Number(
            p.discount !== undefined
              ? p.discount
              : (p.discountPercentage !== undefined
                ? p.discountPercentage
                : (mrpNum > priceNum && mrpNum > 0 ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0))
          );

          return {
            id: p.id || p._id,
            _id: p._id || p.id,
            title: p.title || p.name || 'Untitled Product',
            name: p.title || p.name || 'Untitled Product',
            sku: p.sku || 'N/A',
            brand: p.brand || 'Generic',
            category: p.category || 'Uncategorized',
            seller: p.sellerDisplayName || p.seller?.name || p.seller?.businessName || 'Seller unavailable',
            price: priceNum,
            mrp: mrpNum,
            discount: discountNum,
            stock: stockNum,
            rating: Number(p.rating || p.averageRating || 0),
            reviews: Number(p.reviewsCount || p.reviewCount || 0),
            status: stockNum <= 0 ? 'out_of_stock' : (p.status?.toLowerCase() === 'approved' || p.status?.toLowerCase() === 'active') ? 'active' : p.status?.toLowerCase(),
            rawStatus: p.rawStatus || p.status || 'Active',
            visibility: p.visibility !== undefined ? Boolean(p.visibility) : true,
            featured: Boolean(p.isFeatured || p.featured),
            trending: Boolean(p.isTrending || p.trending),
            condition: p.condition || 'New',
            image: getProductImage(p),
            images: Array.isArray(p.images) ? p.images : [],
            description: p.description || '',
            delivery: p.delivery || 'Standard Delivery',
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          };
        });

        setProducts(mapped);
        const pagination = payload.pagination || {};
        setTotalPages(pagination.totalPages || pagination.pages || 1);
        setTotalItems(pagination.totalItems || pagination.total || payload.rawTotal || mapped.length);
      } else {
        setProducts([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Unable to load products from database. Please ensure backend services and database are online.');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Selection toggles
  const toggleSelectAll = () => {
    if (selected.length === products.length) setSelected([]);
    else setSelected(products.map((p) => p.id));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditForm({
      title: product.title || product.name || '',
      brand: product.brand || '',
      category: product.category || '',
      price: product.price || '',
      mrp: product.mrp || '',
      discount: product.discount || 0,
      stock: product.stock !== undefined ? product.stock : '',
      status: product.rawStatus || 'Active',
      visibility: product.visibility !== undefined ? product.visibility : true,
      description: product.description || '',
    });
    setEditError(null);
    setEditModal({ open: true, product });
  };

  // Save Edit Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editModal.product) return;
    setEditSaving(true);
    setEditError(null);

    try {
      const priceNum = parseFloat(editForm.price) || 0;
      const mrpNum = parseFloat(editForm.mrp) || priceNum;
      const stockNum = parseInt(editForm.stock, 10) || 0;

      const payload = {
        title: editForm.title.trim(),
        brand: editForm.brand.trim(),
        category: editForm.category.trim(),
        price: priceNum,
        mrp: mrpNum,
        discount: parseFloat(editForm.discount) || 0,
        stock: stockNum,
        status: editForm.status,
        visibility: Boolean(editForm.visibility),
        description: editForm.description.trim(),
      };

      await adminService.updateProduct(editModal.product.id, payload);
      setEditModal({ open: false, product: null });
      showFeedback(`Product "${payload.title}" updated successfully.`);
      fetchProducts();

      if (drawerProduct && drawerProduct.id === editModal.product.id) {
        setDrawerProduct((prev) => ({
          ...prev,
          ...payload,
          name: payload.title,
        }));
      }
    } catch (err) {
      console.error('Failed to update product:', err);
      setEditError(err.response?.data?.message || 'Failed to update product. Please check fields.');
    } finally {
      setEditSaving(false);
    }
  };

  // Handle single product action
  const handleAction = async (action, product) => {
    if (action === 'view') {
      setDrawerProduct(product);
      setEditingStock(product.stock);
      setStockSavedSuccess(false);
    } else if (action === 'edit') {
      handleOpenEdit(product);
    } else if (action === 'toggle_featured') {
      try {
        await adminService.toggleFeaturedProduct(product.id);
        showFeedback(`${product.featured ? 'Removed' : 'Added'} "${product.name}" ${product.featured ? 'from' : 'to'} Featured.`);
        fetchProducts();
        if (drawerProduct && drawerProduct.id === product.id) {
          setDrawerProduct((prev) => ({ ...prev, featured: !prev.featured }));
        }
      } catch (err) {
        console.error('Failed to toggle featured status:', err);
      }
    } else if (action === 'toggle_trending') {
      try {
        await adminService.toggleTrendingProduct(product.id);
        showFeedback(`${product.trending ? 'Removed' : 'Marked'} "${product.name}" as Trending.`);
        fetchProducts();
        if (drawerProduct && drawerProduct.id === product.id) {
          setDrawerProduct((prev) => ({ ...prev, trending: !prev.trending }));
        }
      } catch (err) {
        console.error('Failed to toggle trending status:', err);
      }
    } else if (action === 'toggle_visibility') {
      try {
        const newVis = !product.visibility;
        await adminService.toggleProductVisibility(product.id, newVis);
        showFeedback(`"${product.name}" listing is now ${newVis ? 'Visible' : 'Hidden'}.`);
        fetchProducts();
        if (drawerProduct && drawerProduct.id === product.id) {
          setDrawerProduct((prev) => ({ ...prev, visibility: newVis }));
        }
      } catch (err) {
        console.error('Failed to toggle visibility:', err);
      }
    } else if (action === 'approve') {
      try {
        await adminService.approveProduct(product.id);
        showFeedback(`Listing "${product.name}" approved successfully.`);
        fetchProducts();
      } catch (err) {
        console.error('Failed to approve product:', err);
      }
    } else if (action === 'reject') {
      try {
        await adminService.rejectProduct(product.id, { reason: 'Rejected by admin moderation' });
        showFeedback(`Listing "${product.name}" marked as rejected.`);
        fetchProducts();
      } catch (err) {
        console.error('Failed to reject product:', err);
      }
    } else if (action === 'delete') {
      setConfirmDialog({
        open: true,
        title: 'Delete Product Listing',
        message: `Are you sure you want to soft delete "${product.name}"? This removes it from marketplace listings while preserving order records.`,
        type: 'danger',
        confirmLabel: 'Delete Product',
        onConfirm: async () => {
          try {
            await adminService.deleteProduct(product.id);
            setConfirmDialog({ open: false });
            if (drawerProduct && drawerProduct.id === product.id) {
              setDrawerProduct(null);
            }
            showFeedback(`Product "${product.name}" deleted successfully.`);
            fetchProducts();
          } catch (err) {
            console.error('Failed to delete product:', err);
          }
        },
      });
    }
  };

  // Quick live inventory updater
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
      showFeedback(`Stock for "${drawerProduct.name}" updated to ${updatedStockVal} units.`);
      fetchProducts();
    } catch (err) {
      console.error('Failed to update product stock:', err);
    } finally {
      setStockSaving(false);
    }
  };

  // Bulk actions
  const handleBulkAction = async (bulkAction) => {
    if (selected.length === 0) return;
    try {
      await adminService.bulkProductAction(bulkAction, selected);
      showFeedback(`Bulk ${bulkAction} applied to ${selected.length} products.`);
      setSelected([]);
      fetchProducts();
    } catch (err) {
      console.error(`Bulk ${bulkAction} failed:`, err);
    }
  };

  // Action options per product row
  const getActions = (product) => [
    { label: 'View Details & Inventory', icon: FiEye, onClick: () => handleAction('view', product) },
    { label: 'Edit Product', icon: FiEdit2, onClick: () => handleAction('edit', product) },
    { type: 'divider' },
    {
      label: product.visibility ? 'Hide from Store' : 'Make Visible',
      icon: product.visibility ? FiEyeOff : FiEye,
      onClick: () => handleAction('toggle_visibility', product),
    },
    {
      label: product.featured ? 'Remove from Featured' : 'Mark as Featured',
      icon: FiStar,
      onClick: () => handleAction('toggle_featured', product),
      warning: !product.featured,
    },
    {
      label: product.trending ? 'Remove from Trending' : 'Mark as Trending',
      icon: FiTrendingUp,
      onClick: () => handleAction('toggle_trending', product),
    },
    ...(product.rawStatus === 'Pending' || product.rawStatus === 'Pending Approval'
      ? [
          { type: 'divider' },
          { label: 'Approve Listing', icon: FiCheckCircle, onClick: () => handleAction('approve', product) },
          { label: 'Reject Listing', icon: FiXCircle, onClick: () => handleAction('reject', product), danger: true },
        ]
      : []),
    { type: 'divider' },
    { label: 'Delete Product', icon: FiTrash2, onClick: () => handleAction('delete', product), danger: true },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-yellow-500 text-black font-semibold text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-yellow-400"
          >
            <FiCheck className="text-sm font-bold" />
            <span>{feedbackMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">Product Catalog Master</h1>
            <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full">
              {totalItems} Products
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time catalog moderation, live inventory sync, and pricing control
          </p>
        </div>
        <button
          onClick={fetchProducts}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors w-fit"
          title="Refresh database records"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </motion.div>

      {/* Toolbar with Search, Category Filter, and Status Filter */}
      <TableToolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        onSearchClear={() => { setSearch(''); setPage(1); }}
        searchPlaceholder="Search title, SKU, brand, or category..."
        filters={
          <>
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none focus:border-yellow-500"
            >
              <option value="All Categories">All Categories</option>
              {categoriesList.map((c) => {
                const cName = typeof c === 'string' ? c : c.name;
                return (
                  <option key={c._id || c.id || cName} value={cName}>
                    {cName}
                  </option>
                );
              })}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none focus:border-yellow-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </>
        }
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
                <th className="py-4 px-4">Seller / Merchant</th>
                <th className="py-4 px-4 text-right">Price & MRP</th>
                <th className="py-4 px-4 text-center">Stock</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-center">Visibility</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-24 text-center text-gray-500">
                    <FiRefreshCw className="animate-spin text-2xl mx-auto mb-3 text-yellow-500" />
                    <span>Loading products from MongoDB database...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="py-24 text-center text-red-400">
                    <FiAlertCircle className="text-3xl mx-auto mb-2 text-red-400" />
                    <p className="font-semibold">{error}</p>
                    <button
                      onClick={fetchProducts}
                      className="mt-3 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs hover:bg-red-500/30 transition-all"
                    >
                      Retry Connection
                    </button>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-24 text-center text-gray-500">
                    <FiPackage className="text-4xl mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-semibold text-gray-400">No products match your query</p>
                    <p className="text-xs text-gray-600 mt-1">Try clearing search keywords or active filters.</p>
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
                          <div className="relative shrink-0">
                            <img
                              src={product.image}
                              alt={product.title}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://via.placeholder.com/100?text=Product';
                              }}
                              className="w-11 h-11 rounded-xl object-cover border border-white/10 bg-white/5"
                            />
                            {product.featured && (
                              <span
                                className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[9px] text-black font-black shadow-md"
                                title="Featured Placement"
                              >
                                ★
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-yellow-400 transition-colors line-clamp-1 max-w-[240px]" title={product.title}>
                              {product.title}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-0.5">
                              <span>SKU: {product.sku}</span>
                              <span>•</span>
                              <span className="text-gray-400">{product.brand}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-white/5 border border-white/10 text-gray-300 text-[11px] px-2.5 py-1 rounded-lg inline-block whitespace-nowrap">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-300 font-medium truncate max-w-[140px]">{product.seller}</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <span>⭐ {product.rating > 0 ? product.rating.toFixed(1) : '4.5'}</span>
                          <span>({product.reviews})</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="font-bold text-white font-mono text-sm">
                          ₹{product.price.toLocaleString('en-IN')}
                        </div>
                        {product.mrp > product.price && (
                          <div className="flex items-center justify-end gap-1.5 text-[10px] mt-0.5 font-mono">
                            <span className="text-gray-500 line-through">
                              ₹{product.mrp.toLocaleString('en-IN')}
                            </span>
                            {product.discount > 0 && (
                              <span className="text-green-400 font-bold">
                                {product.discount}% OFF
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-xs inline-block ${
                            product.stock === 0
                              ? 'text-red-400 bg-red-500/10'
                              : product.stock < 10
                              ? 'text-yellow-400 bg-yellow-500/10'
                              : 'text-green-400 bg-green-500/10'
                          }`}
                        >
                          {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={product.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleAction('toggle_visibility', product)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                            product.visibility
                              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                              : 'text-gray-400 border-gray-600 bg-gray-500/10 hover:bg-gray-500/20'
                          }`}
                        >
                          {product.visibility ? 'Visible' : 'Hidden'}
                        </button>
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

        {/* Pagination Bar */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={totalItems}
          itemsPerPage={perPage}
        />
      </div>

      {/* Product Details & Live Inventory Drawer */}
      <AnimatePresence>
        {drawerProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setDrawerProduct(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#141414] border-l border-white/10 z-50 overflow-y-auto p-6 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Product Details</h3>
                  <p className="text-xs text-gray-500">MongoDB Document Snapshot</p>
                </div>
                <button
                  onClick={() => setDrawerProduct(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Product Header Card */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-5 text-center">
                <img
                  src={drawerProduct.image}
                  alt={drawerProduct.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://via.placeholder.com/150?text=Product';
                  }}
                  className="w-36 h-36 rounded-2xl object-cover mx-auto border border-white/10 mb-4 shadow-xl"
                />
                <h4 className="text-base font-bold text-white line-clamp-2">{drawerProduct.title}</h4>
                <p className="text-xs text-gray-400 mt-1">Merchant: {drawerProduct.seller}</p>
                <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                  <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2.5 py-1 rounded-full font-black font-mono">
                    ₹{drawerProduct.price.toLocaleString('en-IN')}
                  </span>
                  {drawerProduct.mrp > drawerProduct.price && (
                    <span className="text-gray-400 text-xs line-through font-mono">
                      ₹{drawerProduct.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                  <StatusBadge status={drawerProduct.status} size="sm" />
                </div>
              </div>

              {/* Quick Inventory / Stock Manager */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Inventory Stock Management</span>
                  <span className="text-[10px] text-green-400 font-mono">● Real-time DB Sync</span>
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

              {/* Stat Counters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-white font-mono">{drawerProduct.stock}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">
                    Available Stock
                  </p>
                </div>
                <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-yellow-400 font-mono">⭐ {drawerProduct.rating > 0 ? drawerProduct.rating.toFixed(1) : '4.5'}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">
                    {drawerProduct.reviews} Customer Reviews
                  </p>
                </div>
              </div>

              {/* Metadata Details */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-500">Brand</span>
                  <span className="text-white font-medium">{drawerProduct.brand}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-500">Category</span>
                  <span className="text-white font-medium">{drawerProduct.category}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-500">Condition</span>
                  <span className="text-white font-medium">{drawerProduct.condition}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-500">Visibility</span>
                  <span className={drawerProduct.visibility ? 'text-emerald-400' : 'text-gray-400'}>
                    {drawerProduct.visibility ? 'Visible (Active in store)' : 'Hidden (Private)'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-500">Featured</span>
                  <span className="text-white font-medium">
                    {drawerProduct.featured ? 'Yes (Homepage & Banner)' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-500">Trending</span>
                  <span className="text-white font-medium">
                    {drawerProduct.trending ? 'Yes (Top Trending)' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-500">SKU</span>
                  <span className="text-gray-400 font-mono">{drawerProduct.sku}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">Listing ID</span>
                  <span className="text-gray-400 font-mono text-[11px]">{drawerProduct.id}</span>
                </div>
              </div>

              {/* Description Preview */}
              {drawerProduct.description && (
                <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-1.5">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</span>
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {drawerProduct.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    const prod = drawerProduct;
                    setDrawerProduct(null);
                    handleOpenEdit(prod);
                  }}
                  className="h-10 px-4 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <FiEdit2 size={13} />
                  Edit Product
                </button>
                <button
                  onClick={() => handleAction('toggle_featured', drawerProduct)}
                  className="h-10 px-4 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded-xl transition-all shadow-[0_0_12px_rgba(255,193,7,0.3)] flex items-center justify-center gap-1.5"
                >
                  <FiStar size={13} />
                  {drawerProduct.featured ? 'Unfeature' : 'Feature'}
                </button>
              </div>

              <button
                onClick={() => {
                  const prod = drawerProduct;
                  setDrawerProduct(null);
                  handleAction('delete', prod);
                }}
                className="w-full h-10 px-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <FiTrash2 size={13} />
                Delete Product Listing
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Product</h3>
                  <p className="text-xs text-gray-500">Update MongoDB product details & pricing</p>
                </div>
                <button
                  onClick={() => setEditModal({ open: false, product: null })}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <FiX size={18} />
                </button>
              </div>

              {editError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                  {editError}
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-yellow-500"
                    placeholder="Full product title"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Brand</label>
                    <input
                      type="text"
                      required
                      value={editForm.brand}
                      onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-yellow-500"
                      placeholder="e.g. Apple, Samsung, Nike"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Category</label>
                    <input
                      type="text"
                      required
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-yellow-500"
                      placeholder="e.g. Mobile Phones, Fashion & Apparel"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Selling Price (₹ INR)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-yellow-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">MRP (₹ INR)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.mrp}
                      onChange={(e) => setEditForm({ ...editForm, mrp: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-yellow-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Discount (% OFF)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editForm.discount}
                      onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-yellow-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-yellow-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Listing Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-yellow-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Hidden">Hidden</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Store Visibility</label>
                    <select
                      value={editForm.visibility ? 'true' : 'false'}
                      onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value === 'true' })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-yellow-500"
                    >
                      <option value="true">Visible</option>
                      <option value="false">Hidden</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Product Description</label>
                  <textarea
                    rows={4}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-yellow-500"
                    placeholder="Product details, features, and specifications..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditModal({ open: false, product: null })}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {editSaving ? <FiRefreshCw className="animate-spin" /> : <FiCheck />}
                    {editSaving ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
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
