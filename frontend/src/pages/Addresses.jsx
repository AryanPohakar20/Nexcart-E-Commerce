import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { FiMapPin, FiPlus, FiTrash2, FiHome, FiBriefcase, FiX, FiStar, FiEdit2, FiCheck } from 'react-icons/fi';

const TYPE_ICONS = {
  Home: FiHome,
  Office: FiBriefcase,
  Other: FiMapPin,
};

const Addresses = () => {
  const { addresses, addAddress, deleteAddress, setDefaultAddress, updateAddress, showToast } = useContext(AppContext);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const blankForm = {
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    landmark: '',
    type: 'Home',
    isDefault: false,
  };

  const [formData, setFormData] = useState(blankForm);

  const openAddForm = () => {
    setEditingId(null);
    setFormData(blankForm);
    setIsFormOpen(true);
  };

  const openEditForm = (addr) => {
    setEditingId(addr._id);
    setFormData({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      state: addr.state || '',
      country: addr.country || 'India',
      postalCode: addr.postalCode || '',
      landmark: addr.landmark || '',
      type: addr.type || 'Home',
      isDefault: addr.isDefault || false,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'postalCode'];
    const missing = required.filter((k) => !formData[k]?.trim());
    if (missing.length > 0) {
      showToast(`Please fill in: ${missing.join(', ')}`, 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await updateAddress(editingId, formData);
      } else {
        await addAddress(formData);
      }
      setFormData(blankForm);
      setIsFormOpen(false);
      setEditingId(null);
    } catch (err) {
      // Error toast already shown by AppContext
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteAddress(id);
  };

  const handleSetDefault = async (id) => {
    await setDefaultAddress(id);
  };

  const inputCls = 'w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50';

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="border-b border-white/5 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Delivery Addresses</h1>
          <p className="text-xs text-gray-500 mt-1">Manage multiple home, office, and dispatch addresses.</p>
        </div>
        <button
          onClick={isFormOpen ? () => { setIsFormOpen(false); setEditingId(null); } : openAddForm}
          className="btn-glow-yellow text-xs font-bold py-2.5 flex items-center gap-1.5"
        >
          {isFormOpen ? <FiX size={15} /> : <FiPlus size={15} />}
          <span>{isFormOpen ? 'Close Panel' : 'Add New'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Form panel (when open) */}
        {isFormOpen && (
          <div className="lg:col-span-1 bg-cardBg border border-white/10 p-6 rounded-3xl h-fit space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {editingId ? 'Edit Address' : 'New Shipping Details'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Contact Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="Arjun Verma"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="9876543210"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Street Address</label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData(p => ({ ...p, addressLine1: e.target.value }))}
                  placeholder="Apt 203, Sky Villa"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Address Line 2 (optional)</label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData(p => ({ ...p, addressLine2: e.target.value }))}
                  placeholder="Near City Mall"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                  placeholder="Mumbai"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))}
                  placeholder="Maharashtra"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData(p => ({ ...p, postalCode: e.target.value }))}
                  placeholder="400001"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Landmark (optional)</label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData(p => ({ ...p, landmark: e.target.value }))}
                  placeholder="Opposite to park"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Address Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
                  className={inputCls}
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(p => ({ ...p, isDefault: e.target.checked }))}
                  className="accent-primary"
                />
                Set as default address
              </label>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full btn-glow-yellow !py-2.5 text-xs text-black font-bold flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <FiCheck size={12} />
                {isSaving ? 'Saving…' : (editingId ? 'Update Address' : 'Save Shipping Address')}
              </button>
            </form>
          </div>
        )}

        {/* Right Column: Address Cards */}
        <div className={isFormOpen ? 'lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6' : 'col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6'}>
          {addresses.length === 0 ? (
            <div className="col-span-full py-16 text-center text-gray-500 font-medium">
              No addresses saved. Click "Add New" to save one.
            </div>
          ) : (
            addresses.map((addr) => {
              const TypeIcon = TYPE_ICONS[addr.type] || FiMapPin;
              return (
                <div
                  key={addr._id}
                  className={`bg-cardBg border p-6 rounded-3xl flex flex-col justify-between text-xs hover:border-primary/20 transition-all duration-300 relative ${addr.isDefault ? 'border-primary/30' : 'border-white/5'}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="font-extrabold text-white flex items-center gap-1.5">
                        <TypeIcon className="text-primary" size={13} />
                        <span>{addr.fullName}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {addr.isDefault && (
                          <span className="bg-primary/10 border border-primary/20 text-primary text-[8px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded">Default</span>
                        )}
                        <span className="bg-white/5 text-gray-400 text-[8px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded">{addr.type}</span>
                      </div>
                    </div>

                    <p className="text-gray-400 font-medium leading-relaxed">
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                    </p>
                    <p className="text-gray-500">
                      {addr.city}, {addr.state} – {addr.postalCode}
                    </p>
                    {addr.landmark && (
                      <p className="text-[10px] text-gray-600">Near: {addr.landmark}</p>
                    )}
                    <p className="text-[10px] text-gray-500 font-bold">Contact: {addr.phone}</p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                    {/* Set Default */}
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr._id)}
                        className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-primary font-bold transition-colors"
                        title="Set as default"
                      >
                        <FiStar size={11} />
                        Set Default
                      </button>
                    )}
                    {addr.isDefault && <span />}

                    <div className="flex items-center gap-2">
                      {/* Edit */}
                      <button
                        onClick={() => openEditForm(addr)}
                        className="p-2 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-lg active:scale-95 transition-all"
                        title="Edit address"
                      >
                        <FiEdit2 size={12} />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(addr._id)}
                        className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg active:scale-95 transition-all"
                        title="Delete address"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default Addresses;
