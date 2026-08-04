import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { FiMapPin, FiPlus, FiTrash2, FiHome, FiBriefcase, FiX, FiCheck, FiEdit2, FiGlobe } from 'react-icons/fi';

const Addresses = () => {
  const { addresses, addAddress, editAddress, setDefaultAddress, deleteAddress, showToast } = useContext(AppContext);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); // null if adding
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    houseNo: '',
    streetName: '',
    area: '',
    city: '',
    state: '',
    country: 'India',
    pin: '',
    addressType: 'Home'
  });

  const handleOpenAddForm = () => {
    setFormData({
      name: '',
      phone: '',
      houseNo: '',
      streetName: '',
      area: '',
      city: '',
      state: '',
      country: 'India',
      pin: '',
      addressType: 'Home'
    });
    setEditingAddressId(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (addr) => {
    setFormData({
      name: addr.name || '',
      phone: addr.phone || '',
      houseNo: addr.houseNo || '',
      streetName: addr.streetName || addr.street || '',
      area: addr.area || '',
      city: addr.city || '',
      state: addr.state || '',
      country: addr.country || 'India',
      pin: addr.pin || '',
      addressType: addr.addressType || 'Home'
    });
    setEditingAddressId(addr.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.streetName || !formData.city || !formData.state || !formData.pin) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (!/^\d{6}$/.test(formData.pin)) {
      showToast('PIN code must be a 6-digit number.', 'error');
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      showToast('Phone number must be a 10-digit number.', 'error');
      return;
    }

    const computedStreet = `${formData.houseNo ? formData.houseNo + ', ' : ''}${formData.streetName}${formData.area ? ', ' + formData.area : ''}`;
    const payload = {
      ...formData,
      street: computedStreet,
    };

    if (editingAddressId) {
      editAddress(editingAddressId, {
        ...payload,
        isDefault: addresses.find(a => a.id === editingAddressId)?.isDefault || false
      });
    } else {
      addAddress({
        ...payload,
        isDefault: addresses.length === 0
      });
    }

    // Reset form
    setFormData({
      name: '',
      phone: '',
      houseNo: '',
      streetName: '',
      area: '',
      city: '',
      state: '',
      country: 'India',
      pin: '',
      addressType: 'Home'
    });
    setEditingAddressId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="border-b border-white/5 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Delivery Addresses</h1>
          <p className="text-xs text-gray-500 mt-1">Manage multiple home, office, and dispatch addresses.</p>
        </div>
        <button 
          onClick={() => {
            if (isFormOpen) {
              setIsFormOpen(false);
              setEditingAddressId(null);
            } else {
              handleOpenAddForm();
            }
          }}
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
              {editingAddressId ? 'Update Shipping Details' : 'New Shipping Details'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Contact Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Arjun Verma"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Phone Number *</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">House No *</label>
                  <input 
                    type="text" 
                    value={formData.houseNo}
                    onChange={(e) => setFormData(p => ({ ...p, houseNo: e.target.value }))}
                    placeholder="Penthouse B"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-500 mb-1 font-bold">Street Address *</label>
                  <input 
                    type="text" 
                    value={formData.streetName}
                    onChange={(e) => setFormData(p => ({ ...p, streetName: e.target.value }))}
                    placeholder="Skyview Heights"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Area / Locality</label>
                <input 
                  type="text" 
                  value={formData.area}
                  onChange={(e) => setFormData(p => ({ ...p, area: e.target.value }))}
                  placeholder="Hitec City"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">City *</label>
                  <input 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                    placeholder="Hyderabad"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">State *</label>
                  <input 
                    type="text" 
                    value={formData.state}
                    onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))}
                    placeholder="Telangana"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">Country *</label>
                  <input 
                    type="text" 
                    value={formData.country}
                    onChange={(e) => setFormData(p => ({ ...p, country: e.target.value }))}
                    placeholder="India"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">PIN Code *</label>
                  <input 
                    type="text" 
                    value={formData.pin}
                    onChange={(e) => setFormData(p => ({ ...p, pin: e.target.value.replace(/\D/g, '') }))}
                    placeholder="500081"
                    maxLength={6}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                    required
                  />
                </div>
              </div>
              <div className="pb-2">
                <label className="block text-gray-500 mb-1.5 font-bold">Address Type</label>
                <div className="flex gap-4">
                  {['Home', 'Office', 'Other'].map((type) => (
                    <label key={type} className="flex items-center gap-1.5 cursor-pointer text-white font-bold">
                      <input 
                        type="radio" 
                        name="addrType" 
                        value={type}
                        checked={formData.addressType === type}
                        onChange={(e) => setFormData(p => ({ ...p, addressType: e.target.value }))}
                        className="text-primary focus:ring-primary h-3.5 w-3.5 bg-black/40 border-white/10" 
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full btn-glow-yellow !py-2.5 text-xs text-black">
                {editingAddressId ? 'Save Shipping Address' : 'Create Shipping Address'}
              </button>
            </form>
          </div>
        )}

        {/* Right Column: Address Cards List */}
        <div className={isFormOpen ? 'lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6' : 'col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6'}>
          {addresses.length === 0 ? (
            <div className="col-span-full py-16 text-center text-gray-500 font-medium">
              No addresses saved. Click "Add New" to save one.
            </div>
          ) : (
            addresses.map((addr) => (
              <div 
                key={addr.id}
                className="bg-cardBg border border-white/5 p-6 rounded-3xl flex flex-col justify-between h-56 text-xs hover:border-primary/20 transition-all duration-300 relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-extrabold text-white flex items-center gap-1">
                      {addr.addressType === 'Office' ? (
                        <FiBriefcase className="text-primary" />
                      ) : addr.addressType === 'Home' ? (
                        <FiHome className="text-primary" />
                      ) : (
                        <FiGlobe className="text-primary" />
                      )}
                      <span className="truncate max-w-[120px]">{addr.name}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/10 border border-primary/20 text-primary text-[8px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded">
                        {addr.addressType || 'Home'}
                      </span>
                      {addr.isDefault && (
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded">Default</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-gray-400 font-medium leading-relaxed space-y-0.5">
                    <p className="line-clamp-2">
                      {addr.houseNo ? `${addr.houseNo}, ` : ''}{addr.streetName || addr.street}
                    </p>
                    {addr.area && <p className="truncate">{addr.area}</p>}
                    <p className="truncate">
                      {addr.city}, {addr.state} - {addr.pin}
                    </p>
                    {addr.country && <p className="text-[10px] text-gray-500">{addr.country}</p>}
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold">Contact: {addr.phone}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                  <div>
                    {!addr.isDefault && (
                      <button 
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-[10px] text-primary hover:underline font-bold"
                      >
                        Make Default
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenEditForm(addr)}
                      className="p-2 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-lg active:scale-95 transition-all"
                      title="Edit Address"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button 
                      onClick={() => deleteAddress(addr.id)}
                      className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg active:scale-95 transition-all"
                      title="Delete Address"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};

export default Addresses;
