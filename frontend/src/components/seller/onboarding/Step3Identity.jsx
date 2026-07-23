import React, { useState, useEffect } from 'react';
import { FiUploadCloud, FiArrowRight, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const Step3Identity = ({ onNext, onBack, initialData = {} }) => {
  const [formData, setFormData] = useState({
    idType: initialData.idType || 'Aadhaar',
    frontImage: initialData.frontImage || null,
    backImage: initialData.backImage || null,
  });

  const [preview, setPreview] = useState({
    front: null,
    back: null,
  });

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (preview.front) URL.revokeObjectURL(preview.front);
      if (preview.back) URL.revokeObjectURL(preview.back);
    };
  }, [preview]);

  const handleFileChange = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [`${side}Image`]: file });
      setPreview({ ...preview, [side]: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Identity Verification</h2>
        <p className="text-sm text-gray-500 mt-2">Upload your government ID to build trust with buyers.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Document Type</label>
          <select 
            value={formData.idType} 
            onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white appearance-none"
          >
            <option value="Aadhaar">Aadhaar Card</option>
            <option value="PAN">PAN Card</option>
            <option value="Driving Licence">Driving Licence</option>
            <option value="Passport">Passport</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Front Image */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Front Image</label>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl h-32 flex flex-col items-center justify-center overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer">
              {preview.front ? (
                <>
                  <img src={preview.front} alt="Front ID" className="w-full h-full object-cover opacity-70" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold flex-col gap-1">
                    <FiUploadCloud className="text-xl" /> Change
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <FiUploadCloud className="mx-auto text-2xl text-gray-400 mb-2 group-hover:text-primary transition-colors" />
                  <span className="text-xs text-gray-500 font-medium group-hover:text-primary transition-colors">Upload Front</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} className="absolute inset-0 opacity-0 cursor-pointer" required />
            </div>
          </div>

          {/* Back Image */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Back Image</label>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl h-32 flex flex-col items-center justify-center overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer">
              {preview.back ? (
                <>
                  <img src={preview.back} alt="Back ID" className="w-full h-full object-cover opacity-70" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold flex-col gap-1">
                    <FiUploadCloud className="text-xl" /> Change
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <FiUploadCloud className="mx-auto text-2xl text-gray-400 mb-2 group-hover:text-primary transition-colors" />
                  <span className="text-xs text-gray-500 font-medium group-hover:text-primary transition-colors">Upload Back</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'back')} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="flex items-start gap-2 bg-primary/10 border border-primary/20 rounded-lg p-3">
          <FiCheckCircle className="text-primary mt-0.5" />
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Please ensure all text is legible. Your documents are securely encrypted and only used for identity verification.
          </p>
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

export default Step3Identity;
