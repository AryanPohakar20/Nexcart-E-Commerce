import React, { useState } from 'react';
import { FiMapPin, FiAlignLeft, FiGlobe, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

const Step2Profile = ({ onNext, onBack, initialData = {} }) => {
  const [formData, setFormData] = useState({
    displayName: initialData.displayName || '',
    bio: initialData.bio || '',
    languagePreference: initialData.languagePreference || 'English',
    city: initialData.address?.city || '',
    state: initialData.address?.state || '',
    pincode: initialData.address?.pincode || '',
    pickupAddress: initialData.address?.pickupAddress || '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({
      displayName: formData.displayName,
      bio: formData.bio,
      languagePreference: formData.languagePreference,
      address: {
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        pickupAddress: formData.pickupAddress,
      }
    });
  };

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Seller Profile</h2>
        <p className="text-sm text-gray-500 mt-2">Tell buyers a bit about yourself and your store.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Display Name</label>
          <div className="relative">
            <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Short Bio</label>
          <div className="relative">
            <FiAlignLeft className="absolute left-3.5 top-4 text-gray-400" />
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white resize-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">City</label>
            <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">State</label>
            <input type="text" name="state" value={formData.state} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Pincode</label>
            <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white" />
          </div>
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Pickup Address</label>
            <div className="relative">
              <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onBack} className="w-1/3 py-3.5 text-sm font-bold text-gray-400 hover:text-white border border-gray-700 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
            <FiArrowLeft /> Back
          </button>
          <button type="submit" className="w-2/3 btn-glow-yellow py-3.5 text-sm text-black font-extrabold rounded-xl flex items-center justify-center gap-2">
            Next <FiArrowRight />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2Profile;
