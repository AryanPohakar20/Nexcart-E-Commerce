import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { FiMapPin, FiPlus, FiTrash2, FiHome, FiBriefcase, FiX } from 'react-icons/fi';

const Addresses = () => {
  const { addresses, addAddress, deleteAddress } = useContext(AppContext);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', street: '', city: '', state: '', pin: '', phone: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.street && formData.city && formData.pin && formData.phone) {
      addAddress({
        ...formData,
        isDefault: addresses.length === 0
      });
      setFormData({ name: '', street: '', city: '', state: '', pin: '', phone: '' });
      setIsFormOpen(false);
    }
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
          onClick={() => setIsFormOpen(!isFormOpen)}
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
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">New Shipping Details</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Contact Name</label>
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
                <label className="block text-gray-500 mb-1 font-bold">Street Address</label>
                <input 
                  type="text" 
                  value={formData.street}
                  onChange={(e) => setFormData(p => ({ ...p, street: e.target.value }))}
                  placeholder="Apt 203, Sky Villa"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">City</label>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                  placeholder="Mumbai"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
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
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">PIN Code</label>
                <input 
                  type="text" 
                  value={formData.pin}
                  onChange={(e) => setFormData(p => ({ ...p, pin: e.target.value }))}
                  placeholder="400001"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Phone Number</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="9876543210"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                  required
                />
              </div>
              <button type="submit" className="w-full btn-glow-yellow !py-2.5 text-xs text-black">
                Save Shipping Address
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
                className="bg-cardBg border border-white/5 p-6 rounded-3xl flex flex-col justify-between h-52 text-xs hover:border-primary/20 transition-all duration-300 relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-extrabold text-white flex items-center gap-1">
                      {addr.street.toLowerCase().includes('office') ? <FiBriefcase className="text-primary" /> : <FiHome className="text-primary" />}
                      <span>{addr.name}</span>
                    </span>
                    {addr.isDefault && (
                      <span className="bg-primary/10 border border-primary/20 text-primary text-[8px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded">Default</span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 font-medium leading-relaxed line-clamp-3">
                    {addr.street}, {addr.city}, {addr.state} - {addr.pin}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold">Contact: {addr.phone}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-end">
                  <button 
                    onClick={() => deleteAddress(addr.id)}
                    className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg active:scale-95 transition-all"
                  >
                    <FiTrash2 size={13} />
                  </button>
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
