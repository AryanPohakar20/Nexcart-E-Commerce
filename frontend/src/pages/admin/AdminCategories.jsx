import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTag, FiGrid, FiList, FiPlus, FiEdit2, FiTrash2, FiBox,
  FiChevronRight, FiFolder, FiX, FiCheck, FiRefreshCw
} from 'react-icons/fi';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import ActionDropdown from '../../components/admin/shared/ActionDropdown';
import TableToolbar from '../../components/admin/shared/TableToolbar';
import ConfirmDialog from '../../components/admin/shared/ConfirmDialog';
import adminService from '../../services/adminService';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false });

  // Form state for category creation/edit
  const [formState, setFormState] = useState({
    name: '',
    slug: '',
    parent: '',
    status: 'Active',
    description: '',
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getCategories({ limit: 100 });
      if (res.data?.categories) {
        const mapped = res.data.categories.map((c) => ({
          id: c._id,
          name: c.name,
          slug: c.slug,
          productCount: c.productCount || 0,
          parent: c.parentCategory?.name || null,
          parentId: c.parent?._id || c.parent || null,
          status: c.status || 'Active',
          description: c.description || '',
          order: c.order || 0,
        }));
        setCategories(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filtered = categories.filter((c) => {
    return (
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.parent && c.parent.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormState({ name: '', slug: '', parent: '', status: 'Active', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormState({
      name: category.name,
      slug: category.slug,
      parent: category.parentId || '',
      status: category.status,
      description: category.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formState.name) return;

    try {
      const payload = {
        name: formState.name,
        slug: formState.slug || undefined,
        parent: formState.parent || null,
        status: formState.status,
        description: formState.description,
      };

      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, payload);
      } else {
        await adminService.createCategory(payload);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  const handleDelete = (category) => {
    if (category.productCount > 0) {
      setConfirmDialog({
        open: true,
        title: 'Cannot Delete Category',
        message: `Category "${category.name}" contains ${category.productCount} active listings. Reassign or delete the products first.`,
        type: 'warning',
        confirmLabel: 'Understood',
        onConfirm: () => setConfirmDialog({ open: false }),
      });
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete category "${category.name}"?`,
      type: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await adminService.deleteCategory(category.id);
          setConfirmDialog({ open: false });
          fetchCategories();
        } catch (err) {
          console.error('Failed to delete category:', err);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Category Architecture</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize taxonomy, product classifications, and hierarchical navigation trees
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-white/5 border border-white/5 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-yellow-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <FiGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-yellow-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Table View"
            >
              <FiList size={15} />
            </button>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 h-9 px-4 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_15px_rgba(255,193,7,0.3)]"
          >
            <FiPlus size={14} /> Add Category
          </button>
        </div>
      </motion.div>

      {/* Main Container */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-6">
        <TableToolbar
          search={search}
          onSearch={setSearch}
          onSearchClear={() => setSearch('')}
          searchPlaceholder="Search categories or taxonomy slugs..."
        />

        {/* View Mode: Grid */}
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <FiRefreshCw className="animate-spin inline mr-2" size={16} />
            Loading category architecture...
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((cat) => (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/3 border border-white/5 hover:border-yellow-500/30 rounded-2xl p-5 relative group transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400">
                    <FiFolder size={18} />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                      title="Edit"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      title="Delete"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-bold text-white text-base group-hover:text-yellow-400 transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">/{cat.slug}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-400">
                    <FiBox size={13} />
                    <span className="font-bold text-white">{cat.productCount}</span> items
                  </div>
                  {cat.parent ? (
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400">
                      Sub of <strong className="text-gray-300">{cat.parent}</strong>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded font-bold">
                      Root Sector
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* View Mode: Table */
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-white/3 border-b border-white/5 text-gray-500 uppercase tracking-wider font-bold">
                  <th className="p-4">Category</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Parent Level</th>
                  <th className="p-4">Product Count</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/3 transition-colors">
                    <td className="p-4 font-bold text-white text-sm flex items-center gap-2.5">
                      <FiFolder className="text-yellow-400" />
                      {cat.name}
                    </td>
                    <td className="p-4 font-mono text-gray-400">/{cat.slug}</td>
                    <td className="p-4">
                      {cat.parent ? (
                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-300">
                          {cat.parent}
                        </span>
                      ) : (
                        <span className="text-gray-500 font-semibold">— Root Level —</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-white">{cat.productCount} listings</td>
                    <td className="p-4">
                      <StatusBadge status={cat.status.toLowerCase()} />
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#1C1C1C] border border-white/10 rounded-2xl p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <h3 className="text-base font-bold text-white">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1.5">Category Name</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        name: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                      })
                    }
                    placeholder="e.g. Smart Watches"
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1.5">Slug URL identifier</label>
                  <input
                    type="text"
                    value={formState.slug}
                    onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                    placeholder="e.g. smart-watches"
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono outline-none focus:border-yellow-500/50"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1.5">Parent Category (Optional)</label>
                  <select
                    value={formState.parent}
                    onChange={(e) => setFormState({ ...formState, parent: e.target.value })}
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none focus:border-yellow-500/50"
                  >
                    <option value="">None (Top-Level Sector)</option>
                    {categories
                      .filter((c) => !editingCategory || c.id !== editingCategory.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="activeToggle"
                    checked={formState.status === 'Active'}
                    onChange={(e) =>
                      setFormState({ ...formState, status: e.target.checked ? 'Active' : 'Inactive' })
                    }
                    className="w-4 h-4 rounded accent-yellow-500"
                  />
                  <label htmlFor="activeToggle" className="text-gray-300 font-bold cursor-pointer">
                    Publish Category as Active
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-10 rounded-xl font-bold text-gray-300 bg-white/5 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl font-bold text-black bg-yellow-500 hover:bg-yellow-400 shadow-[0_0_12px_rgba(255,193,7,0.3)]"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
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

export default AdminCategories;
