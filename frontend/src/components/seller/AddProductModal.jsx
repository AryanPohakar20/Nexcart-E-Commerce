import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SellerContext } from '../../context/SellerContext';
import { CATEGORIES } from '../../constants/dummyData';
import { 
  FiX, FiPlus, FiTag, FiDollarSign, FiPackage, FiMapPin, 
  FiCheckCircle, FiImage, FiLayers, FiShield, FiInfo, FiEdit3,
  FiUploadCloud, FiTrash2, FiStar
} from 'react-icons/fi';

const AddProductModal = ({ isOpen, onClose, editingProduct = null }) => {
  const { addProduct, updateProduct, settings } = useContext(SellerContext);

  const [sellerType, setSellerType] = useState('individual_c2c'); // 'individual_c2c' | 'business'
  
  // Image Upload State
  const [uploadedImages, setUploadedImages] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'mobiles',
    price: '',
    originalPrice: '',
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

      // Load existing images if available
      if (editingProduct.images && editingProduct.images.length > 0) {
        setUploadedImages(editingProduct.images.map(img => ({ preview: img, isExisting: true })));
      } else if (editingProduct.image) {
        setUploadedImages([{ preview: editingProduct.image, isExisting: true }]);
      } else {
        setUploadedImages([]);
      }
      setPrimaryImageIndex(0);
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'mobiles',
        price: '',
        originalPrice: '',
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
      setUploadedImages([]);
      setPrimaryImageIndex(0);
    }
  }, [editingProduct, isOpen, settings, sellerType]);

  // Cleanup object URLs on unmount or when modal closes
  useEffect(() => {
    if (!isOpen) {
      uploadedImages.forEach(img => {
        if (img.file && img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false
    }));

    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setUploadedImages(prev => {
      const newImgs = [...prev];
      const removed = newImgs.splice(index, 1)[0];
      if (removed.file && removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return newImgs;
    });
    
    // Adjust primary index if needed
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(prev => prev - 1);
    }
  };

  // Convert File to Base64 to safely store in localStorage via Context
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price) return;
    if (uploadedImages.length === 0) {
      alert("Please upload at least one product image.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      
      const computedStock = sellerType === 'individual_c2c' 
        ? Math.max(1, Number(formData.stock) || 1) 
        : Math.max(0, Number(formData.stock) || 0);
      
      const computedPrice = Number(formData.price) || 0;
      const computedOriginalPrice = formData.originalPrice 
        ? Number(formData.originalPrice) 
        : (computedPrice ? computedPrice * 1.25 : 0);

      const fieldsToAppend = {
        ...formData,
        price: computedPrice,
        originalPrice: computedOriginalPrice,
        mrp: computedOriginalPrice,
        stock: computedStock,
        sellerType: sellerType,
      };

      // Append each key exactly ONCE to FormData
      Object.entries(fieldsToAppend).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          payload.append(key, value);
        }
      });

      // Append new image files. We ensure the primary image comes first if it's a new upload.
      // (Backend assumes first image is primary if it's new).
      const newImages = uploadedImages.filter(img => !img.isExisting);
      if (newImages.length > 0) {
         // Sort so primaryImageIndex file comes first if it's a new image
         const primaryImage = uploadedImages[primaryImageIndex];
         
         if (primaryImage && !primaryImage.isExisting) {
            payload.append('images', primaryImage.file);
            newImages.forEach(img => {
               if (img !== primaryImage) payload.append('images', img.file);
            });
         } else {
            newImages.forEach(img => payload.append('images', img.file));
         }
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id || editingProduct._id, payload);
      } else {
        await addProduct(payload);
      }
      onClose();
    } catch (error) {
      console.error("Error processing form:", error);
    } finally {
      setIsSubmitting(false);
    }
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

            {/* Image Selection - Drag & Drop */}
            <div>
              <label className="block text-textSecondary font-bold mb-1.5 flex items-center justify-between">
                <span>Product Images <span className="text-red-400">*</span></span>
                <span className="text-[10px] font-normal text-textSecondary">JPG, PNG, WEBP (Max 5MB)</span>
              </label>

              {/* Upload Zone */}
              <div 
                className={`w-full border-2 border-dashed rounded-2xl p-6 transition-colors text-center cursor-pointer relative overflow-hidden group ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-borderColor bg-surface hover:border-primary/50 hover:bg-bgSecondary'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    processFiles(Array.from(e.dataTransfer.files));
                  }
                }}
              >
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isDragging ? 'bg-primary text-black' : 'bg-cardBg border border-borderColor text-textSecondary group-hover:text-primary group-hover:border-primary/30'
                  }`}>
                    <FiUploadCloud size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-textPrimary text-sm">Upload Product Images</p>
                    <p className="text-[10px] text-textSecondary mt-0.5">Click to browse or drag & drop images here</p>
                  </div>
                </div>
              </div>

              {/* Image Previews */}
              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {uploadedImages.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 group transition-all ${
                        primaryImageIndex === idx 
                          ? 'border-primary shadow-yellow-glow ring-2 ring-primary/20' 
                          : 'border-borderColor hover:border-primary/50'
                      }`}
                    >
                      <img 
                        src={img.preview} 
                        alt={`Preview ${idx}`} 
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlays */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="w-6 h-6 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                            title="Remove image"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                        <div className="flex justify-center">
                          {primaryImageIndex !== idx && (
                            <button
                              type="button"
                              onClick={() => setPrimaryImageIndex(idx)}
                              className="px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold rounded-lg border border-white/20 hover:bg-primary hover:text-black transition-colors"
                            >
                              Set as Cover
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Primary Badge */}
                      {primaryImageIndex === idx && (
                        <div className="absolute top-2 left-2 bg-primary text-black text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                          <FiStar size={8} className="fill-black" />
                          <span>COVER</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                disabled={isSubmitting}
                className={`px-6 py-2.5 rounded-xl font-bold bg-primary text-black hover:bg-primary-light shadow-yellow-glow transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <FiCheckCircle size={16} />
                    <span>{editingProduct ? 'Save Changes' : 'Publish Listing'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddProductModal;
