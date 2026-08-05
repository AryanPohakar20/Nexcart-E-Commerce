import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SellerContext } from '../../context/SellerContext';
import { CATEGORIES } from '../../constants/dummyData';
import { 
  FiX, FiPlus, FiTag, FiDollarSign, FiPackage, FiMapPin, 
  FiCheckCircle, FiImage, FiLayers, FiShield, FiInfo, FiEdit3
} from 'react-icons/fi';

const SAMPLE_IMAGES = [
  { label: 'Smartphone', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80' },
  { label: 'Headphones', url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80' },
  { label: 'Laptop', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80' },
  { label: 'Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
  { label: 'Furniture', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80' },
  { label: 'Ceramic Mug', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80' },
  { label: 'Leather Bag', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80' },
  { label: 'Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80' },
];

const AddProductModal = ({ isOpen, onClose, editingProduct = null }) => {
  const { addProduct, updateProduct, settings } = useContext(SellerContext);

  const [sellerType, setSellerType] = useState('individual_c2c'); // 'individual_c2c' | 'business'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'mobiles',
    price: '',
    originalPrice: '',
    image: SAMPLE_IMAGES[0].url,
    stock: 1,
    // C2C Specific
    condition: 'Like New',
    usageDuration: '6 months',
    hasBox: true,
    hasBill: true,
    location: settings?.city ? `${settings.city}, ${settings.state}` : 'Bengaluru, Karnataka',
    deliveryType: 'Meetup & Courier',
    negotiable: true,
    // Business Specific
    brand: '',
    sku: '',
    warranty: '1 Year Warranty',
  });

  useEffect(() => {
    if (editingProduct) {
      setSellerType(editingProduct.sellerType || 'individual_c2c');
      setFormData({
        title: editingProduct.title || '',
        description: editingProduct.description || '',
        category: editingProduct.category || 'mobiles',
        price: editingProduct.price || '',
        originalPrice: editingProduct.originalPrice || '',
        image: editingProduct.image || SAMPLE_IMAGES[0].url,
        stock: editingProduct.stock ?? 1,
        condition: editingProduct.condition || 'Like New',
        usageDuration: editingProduct.usageDuration || '',
        hasBox: editingProduct.hasBox ?? true,
        hasBill: editingProduct.hasBill ?? true,
        location: editingProduct.location || (settings?.city ? `${settings.city}, ${settings.state}` : 'Bengaluru, Karnataka'),
        deliveryType: editingProduct.deliveryType || 'Meetup & Courier',
        negotiable: editingProduct.negotiable ?? false,
        brand: editingProduct.brand || '',
        sku: editingProduct.sku || '',
        warranty: editingProduct.warranty || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'mobiles',
        price: '',
        originalPrice: '',
        image: SAMPLE_IMAGES[0].url,
        stock: sellerType === 'individual_c2c' ? 1 : 10,
        condition: 'Like New',
        usageDuration: '6 months',
        hasBox: true,
        hasBill: true,
        location: settings?.city ? `${settings.city}, ${settings.state}` : 'Bengaluru, Karnataka',
        deliveryType: 'Meetup & Courier',
        negotiable: true,
        brand: '',
        sku: '',
        warranty: '1 Year Warranty',
      });
    }
  }, [editingProduct, isOpen, settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price) return;

    const payload = {
      ...formData,
      sellerType,
      stock: sellerType === 'individual_c2c' ? Math.max(1, Number(formData.stock) || 1) : Number(formData.stock) || 0,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price) * 1.25,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-cardBg border border-borderColor rounded-3xl shadow-2xl overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-borderColor flex items-center justify-between bg-surface/50">
            <div>
              <h2 className="text-lg font-black text-textPrimary flex items-center gap-2">
                {editingProduct ? (
                  <>
                    <FiEdit3 className="text-primary" />
                    <span>Edit Listing</span>
                  </>
                ) : (
                  <>
                    <FiPlus className="text-primary" />
                    <span>Publish Marketplace Listing</span>
                  </>
                )}
              </h2>
              <p className="text-xs text-textSecondary mt-0.5">
                Support for both second-hand C2C resale & small business catalog inventory.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface border border-borderColor text-textSecondary hover:text-textPrimary transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Body Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* Listing Model Switcher */}
            <div>
              <label className="block text-textSecondary font-bold uppercase tracking-wider mb-2 text-[11px]">
                Select Seller Listing Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSellerType('individual_c2c');
                    setFormData((f) => ({ ...f, stock: 1, condition: 'Like New' }));
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    sellerType === 'individual_c2c'
                      ? 'bg-primary/10 border-primary shadow-yellow-glow text-textPrimary'
                      : 'bg-cardBg border-borderColor text-textSecondary hover:border-borderColor/60 hover:text-textPrimary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-primary">Individual C2C Seller</span>
                    {sellerType === 'individual_c2c' && <FiCheckCircle className="text-primary" size={16} />}
                  </div>
                  <p className="text-[11px] text-textSecondary mt-1">
                    Pre-owned / second-hand items (OLX style). Condition grading, bill/box & meetup options.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSellerType('business');
                    setFormData((f) => ({ ...f, stock: 10, condition: 'Brand New' }));
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    sellerType === 'business'
                      ? 'bg-accentBlue/10 border-accentBlue shadow-blue-glow text-textPrimary'
                      : 'bg-cardBg border-borderColor text-textSecondary hover:border-borderColor/60 hover:text-textPrimary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-accentBlue">Small Business / Retail</span>
                    {sellerType === 'business' && <FiCheckCircle className="text-accentBlue" size={16} />}
                  </div>
                  <p className="text-[11px] text-textSecondary mt-1">
                    Brand new store inventory, boutique wholesale, SKU codes, bulk capacity & warranty.
                  </p>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-textSecondary font-bold mb-1.5">
                  Product / Item Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={sellerType === 'individual_c2c' ? 'e.g. Apple iPhone 13 (128GB, Midnight) - Mint Condition' : 'e.g. Minimalist Ceramic Coffee Mug Set (Pack of 4)'}
                  className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary transition-colors text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-textSecondary font-bold mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary focus:outline-none focus:border-primary transition-colors text-xs font-medium cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-secondaryBg text-textPrimary">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-textSecondary font-bold mb-1.5">
                    Selling Price (INR) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-textSecondary font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 14500"
                      className="w-full bg-surface border border-borderColor rounded-xl pl-8 pr-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary transition-colors text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-textSecondary font-bold mb-1.5">
                    Original MRP / New Purchase Price (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-textSecondary font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      placeholder="e.g. 29990"
                      className="w-full bg-surface border border-borderColor rounded-xl pl-8 pr-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary transition-colors text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-textSecondary font-bold mb-1.5">
                    {sellerType === 'individual_c2c' ? 'Available Units' : 'Stock Inventory Capacity'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="1"
                    className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary transition-colors text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* C2C SPECIFIC FIELDS */}
            {sellerType === 'individual_c2c' && (
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <FiTag />
                  <span>Second-Hand & C2C Listing Attributes</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-textSecondary font-semibold mb-1">Item Condition</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="w-full bg-surface border border-borderColor rounded-xl px-3 py-2 text-textPrimary focus:outline-none focus:border-primary text-xs"
                    >
                      <option value="Brand New / Unopened" className="bg-secondaryBg text-textPrimary">Brand New / Unopened</option>
                      <option value="Like New" className="bg-secondaryBg text-textPrimary">Like New (Mint, Barely Used)</option>
                      <option value="Good" className="bg-secondaryBg text-textPrimary">Good (Minor cosmetic wear)</option>
                      <option value="Fair" className="bg-secondaryBg text-textPrimary">Fair (Fully functional, visible wear)</option>
                      <option value="Refurbished" className="bg-secondaryBg text-textPrimary">Refurbished</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-textSecondary font-semibold mb-1">Usage Duration</label>
                    <input
                      type="text"
                      value={formData.usageDuration}
                      onChange={(e) => setFormData({ ...formData, usageDuration: e.target.value })}
                      placeholder="e.g. 8 months, 1 year"
                      className="w-full bg-surface border border-borderColor rounded-xl px-3 py-2 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-textSecondary font-semibold mb-1">Item Location (City / Area)</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-2.5 text-primary" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Indiranagar, Bengaluru"
                        className="w-full bg-surface border border-borderColor rounded-xl pl-8 pr-3 py-2 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-textSecondary font-semibold mb-1">Delivery / Handoff Mode</label>
                    <select
                      value={formData.deliveryType}
                      onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value })}
                      className="w-full bg-surface border border-borderColor rounded-xl px-3 py-2 text-textPrimary focus:outline-none focus:border-primary text-xs"
                    >
                      <option value="Meetup & Courier" className="bg-secondaryBg text-textPrimary">Meetup & Courier</option>
                      <option value="Local Pickup Only" className="bg-secondaryBg text-textPrimary">Local Pickup / Meetup Only</option>
                      <option value="Courier" className="bg-secondaryBg text-textPrimary">Courier Dispatch Only</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2 border-t border-borderColor">
                  <label className="flex items-center gap-2 cursor-pointer text-textSecondary hover:text-textPrimary">
                    <input
                      type="checkbox"
                      checked={formData.hasBox}
                      onChange={(e) => setFormData({ ...formData, hasBox: e.target.checked })}
                      className="accent-primary w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Original Box Available</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-textSecondary hover:text-textPrimary">
                    <input
                      type="checkbox"
                      checked={formData.hasBill}
                      onChange={(e) => setFormData({ ...formData, hasBill: e.target.checked })}
                      className="accent-primary w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Original Purchase Invoice / Bill</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-textSecondary hover:text-textPrimary">
                    <input
                      type="checkbox"
                      checked={formData.negotiable}
                      onChange={(e) => setFormData({ ...formData, negotiable: e.target.checked })}
                      className="accent-primary w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Price is Open to Negotiation</span>
                  </label>
                </div>
              </div>
            )}

            {/* BUSINESS SPECIFIC FIELDS */}
            {sellerType === 'business' && (
              <div className="bg-accentBlue/5 border border-accentBlue/20 p-4 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-accentBlue font-bold">
                  <FiLayers />
                  <span>Small Business & Retail Inventory Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-textSecondary font-semibold mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g. Studio Terra"
                      className="w-full bg-surface border border-borderColor rounded-xl px-3 py-2 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-accentBlue text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-textSecondary font-semibold mb-1">SKU / Barcode</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="e.g. NX-MUG-04"
                      className="w-full bg-surface border border-borderColor rounded-xl px-3 py-2 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-accentBlue text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-textSecondary font-semibold mb-1">Warranty Policy</label>
                    <input
                      type="text"
                      value={formData.warranty}
                      onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                      placeholder="e.g. 1 Year Replacement"
                      className="w-full bg-surface border border-borderColor rounded-xl px-3 py-2 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-accentBlue text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-textSecondary font-bold mb-1.5">Description & Key Highlights</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe details, specifications, packaging, and any flaws or highlights..."
                className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary transition-colors text-xs font-medium"
              />
            </div>

            {/* Image Selection */}
            <div>
              <label className="block text-textSecondary font-bold mb-1.5">
                Product Image URL / Sample Selection
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
                className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs font-mono mb-2"
              />

              {/* Sample Images Palette */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {SAMPLE_IMAGES.map((img) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, image: img.url })}
                    className={`relative rounded-xl overflow-hidden border flex-shrink-0 w-14 h-14 transition-all ${
                      formData.image === img.url ? 'border-primary shadow-yellow-glow scale-105' : 'border-borderColor opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-borderColor">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold bg-surface text-textSecondary hover:text-textPrimary border border-borderColor transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold bg-primary text-black hover:bg-primary-light shadow-yellow-glow transition-all flex items-center gap-2"
              >
                <FiCheckCircle size={16} />
                <span>{editingProduct ? 'Save Changes' : 'Publish Listing'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddProductModal;
