import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SellerContext } from '../../context/SellerContext';
import { CATEGORIES } from '../../constants/dummyData';
import AddProductModal from '../../components/seller/AddProductModal';
import QuickStockModal from '../../components/seller/QuickStockModal';
import { 
  FiPackage, FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, 
  FiCopy, FiEye, FiGrid, FiList, FiCheckCircle, FiTag, 
  FiLayers, FiAlertTriangle, FiSliders, FiBox
} from 'react-icons/fi';

import { AppContext } from '../../context/AppContext';

const SellerProducts = () => {
  const { products, deleteProduct, toggleProductStatus, addProduct } = useContext(SellerContext);
  const { formatCurrency } = useContext(AppContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'individual_c2c' | 'business'
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'active' | 'draft' | 'sold'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockModalProduct, setStockModalProduct] = useState(null);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesType = selectedType === 'all' || p.sellerType === selectedType;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  const handleDuplicate = (prod) => {
    const duplicated = {
      ...prod,
      title: `${prod.title} (Copy)`,
      views: 0,
      status: 'draft',
    };
    delete duplicated.id;
    addProduct(duplicated);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to remove "${title}"?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* ── 1. Header & Quick Actions ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-borderColor pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-textPrimary tracking-tight flex items-center gap-2.5">
            <FiPackage className="text-primary" />
            <span>Product Catalog Studio</span>
          </h1>
          <p className="text-xs text-textSecondary mt-1">
            Manage your peer-to-peer used listings, retail catalog, pricing, and condition grading.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* View Toggler */}
          <div className="flex items-center bg-surface border border-borderColor p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-primary text-black' : 'text-textSecondary hover:text-textPrimary hover:bg-surface'
              }`}
              title="Table View"
            >
              <FiList size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-primary text-black' : 'text-textSecondary hover:text-textPrimary hover:bg-surface'
              }`}
              title="Grid View"
            >
              <FiGrid size={16} />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsAddModalOpen(true);
            }}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold bg-primary text-black hover:bg-primary-light shadow-yellow-glow transition-all flex items-center justify-center gap-2 text-xs"
          >
            <FiPlus size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* ── 2. Filters & Search Bar ────────────────────────────────────────── */}
      <div className="bg-cardBg border border-borderColor p-4 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-3 text-textSecondary" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, SKU, brand..."
              className="w-full bg-surface border border-borderColor rounded-xl pl-9 pr-3 py-2 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
            />
          </div>

          {/* Seller Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-surface border border-borderColor rounded-xl px-3 py-2 text-textPrimary focus:outline-none focus:border-primary text-xs cursor-pointer"
            >
              <option value="all" className="bg-secondaryBg text-textPrimary">All Formats (C2C & Retail)</option>
              <option value="individual_c2c" className="bg-secondaryBg text-textPrimary">Individual C2C Only</option>
              <option value="business" className="bg-secondaryBg text-textPrimary">Small Business / Retail Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-surface border border-borderColor rounded-xl px-3 py-2 text-textPrimary focus:outline-none focus:border-primary text-xs cursor-pointer"
            >
              <option value="all" className="bg-secondaryBg text-textPrimary">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-secondaryBg text-textPrimary">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-surface border border-borderColor rounded-xl px-3 py-2 text-textPrimary focus:outline-none focus:border-primary text-xs cursor-pointer"
            >
              <option value="all" className="bg-secondaryBg text-textPrimary">All Statuses</option>
              <option value="active" className="bg-secondaryBg text-textPrimary">Active (Live on Store)</option>
              <option value="draft" className="bg-secondaryBg text-textPrimary">Draft / Paused</option>
              <option value="sold" className="bg-secondaryBg text-textPrimary">Sold Out</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pill Counts */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-borderColor text-[11px] text-textSecondary">
          <div className="flex items-center gap-2">
            <span>Showing <strong className="text-textPrimary">{filteredProducts.length}</strong> of {products.length} items</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-primary hover:underline font-bold"
              >
                Clear Search
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{products.filter((p) => p.status === 'active').length} Active</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>{products.filter((p) => p.sellerType === 'individual_c2c').length} C2C Used</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accentBlue" />
              <span>{products.filter((p) => p.sellerType === 'business').length} Retail</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Products List View ───────────────────────────────────────────── */}
      {filteredProducts.length === 0 ? (
        <div className="bg-cardBg border border-borderColor rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary mx-auto flex items-center justify-center border border-primary/20">
            <FiBox size={32} />
          </div>
          <h3 className="text-base font-bold text-textPrimary">No products found</h3>
          <p className="text-xs text-textSecondary max-w-sm mx-auto">
            Try adjusting your search criteria or category filter, or publish a new listing to get started.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedType('all');
              setSelectedStatus('all');
            }}
            className="px-4 py-2 rounded-xl bg-surface border border-borderColor text-primary text-xs font-bold hover:bg-bgSecondary"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-cardBg border border-borderColor rounded-3xl overflow-hidden shadow-card-hover">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-surface text-textSecondary font-extrabold uppercase text-[10px] tracking-wider border-b border-borderColor">
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Market Model</th>
                  <th className="p-4">Condition</th>
                  <th className="p-4">Price (INR)</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface transition-colors group">
                    {/* Title & Image */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-12 h-12 rounded-xl object-cover border border-borderColor flex-shrink-0"
                        />
                        <div className="max-w-[240px]">
                          <h4 className="font-bold text-textPrimary text-xs truncate group-hover:text-primary transition-colors">
                            {p.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-textSecondary mt-0.5">
                            <span className="capitalize">{p.category}</span>
                            {p.sku && <span>• SKU: {p.sku}</span>}
                            {p.location && <span>• {p.location.split(',')[0]}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Market Model */}
                    <td className="p-4">
                      {p.sellerType === 'individual_c2c' ? (
                        <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          <FiTag size={10} />
                          <span>C2C Used</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-accentBlue/10 text-accentBlue border border-accentBlue/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          <FiLayers size={10} />
                          <span>Retail Stock</span>
                        </span>
                      )}
                    </td>

                    {/* Condition */}
                    <td className="p-4">
                      <span className="text-textSecondary font-semibold">{p.condition || 'Good'}</span>
                      {p.hasBox && <span className="block text-[9px] text-textSecondary">Box + Bill</span>}
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <div className="font-black text-textPrimary text-sm">
                        {formatCurrency(p.price)}
                      </div>
                      {p.originalPrice > p.price && (
                        <span className="text-[10px] text-textSecondary line-through">
                          {formatCurrency(p.originalPrice)}
                        </span>
                      )}
                    </td>

                    {/* Stock with quick modal trigger */}
                    <td className="p-4">
                      <button
                        onClick={() => setStockModalProduct(p)}
                        className={`font-bold px-2 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                          p.stock === 0
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : p.stock <= 5
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                        title="Click to quickly adjust stock"
                      >
                        <span>{p.stock} units</span>
                        <FiSliders size={11} />
                      </button>
                    </td>

                    {/* Status Toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => toggleProductStatus(p.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border transition-all ${
                          p.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                            : p.status === 'sold'
                            ? 'bg-red-500/10 text-red-500 border-red-500/30'
                            : 'bg-surface text-textSecondary border-borderColor'
                        }`}
                      >
                        {p.status === 'active' ? 'Active' : p.status === 'sold' ? 'Sold' : 'Draft'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsAddModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-surface text-textSecondary hover:text-primary hover:bg-bgSecondary border border-borderColor transition-colors"
                          title="Edit Listing"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(p)}
                          className="p-2 rounded-xl bg-surface text-textSecondary hover:text-blue-600 dark:hover:text-accentBlue hover:bg-bgSecondary border border-borderColor transition-colors"
                          title="Duplicate Listing"
                        >
                          <FiCopy size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          className="p-2 rounded-xl bg-surface text-textSecondary hover:text-red-500 hover:bg-red-500/10 border border-borderColor transition-colors"
                          title="Delete Listing"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cardBg border border-borderColor hover:border-primary/30 rounded-3xl overflow-hidden p-4 space-y-3 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Image Container */}
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-surface">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    {p.sellerType === 'individual_c2c' ? (
                      <span className="bg-black/70 backdrop-blur-md text-primary font-extrabold text-[9px] px-2 py-0.5 rounded-full border border-primary/20">
                        C2C Used
                      </span>
                    ) : (
                      <span className="bg-black/70 backdrop-blur-md text-accentBlue font-extrabold text-[9px] px-2 py-0.5 rounded-full border border-accentBlue/20">
                        Retail
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        p.status === 'active'
                          ? 'bg-emerald-500 text-black'
                          : 'bg-surface/90 text-textSecondary border border-borderColor'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h4 className="font-bold text-textPrimary text-xs line-clamp-1 group-hover:text-primary transition-colors">
                    {p.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-textSecondary mt-1">
                    <span className="capitalize">{p.category}</span>
                    <span>{p.condition}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Price & Actions */}
              <div className="pt-3 border-t border-borderColor space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black text-textPrimary">
                      {formatCurrency(p.price)}
                    </span>
                  </div>
                  <button
                    onClick={() => setStockModalProduct(p)}
                    className="text-[10px] font-bold text-textSecondary hover:text-textPrimary flex items-center gap-1"
                  >
                    <span>{p.stock} units</span>
                    <FiSliders size={10} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setIsAddModalOpen(true);
                    }}
                    className="py-2 rounded-xl bg-surface text-textSecondary hover:text-textPrimary border border-borderColor font-bold text-[11px] flex items-center justify-center gap-1"
                  >
                    <FiEdit2 size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDuplicate(p)}
                    className="py-2 rounded-xl bg-surface text-textSecondary hover:text-textPrimary border border-borderColor font-bold text-[11px] flex items-center justify-center gap-1"
                  >
                    <FiCopy size={12} />
                    <span>Clone</span>
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    className="py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold text-[11px] flex items-center justify-center gap-1"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── 4. Modals ───────────────────────────────────────────────────────── */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
      />

      <QuickStockModal
        product={stockModalProduct}
        isOpen={!!stockModalProduct}
        onClose={() => setStockModalProduct(null)}
      />
    </div>
  );
};

export default SellerProducts;
