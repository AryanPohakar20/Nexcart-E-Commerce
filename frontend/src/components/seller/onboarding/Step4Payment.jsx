import React, { useState } from 'react';
import { FiCreditCard, FiHash, FiUser, FiArrowRight, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { BsQrCodeScan } from 'react-icons/bs';

const Step4Payment = ({ onNext, onBack, initialData = {} }) => {
  const [formData, setFormData] = useState({
    type: initialData.type || 'UPI',
    upiId: initialData.upiId || '',
    accountHolder: initialData.bank?.accountHolder || '',
    accountNumber: initialData.bank?.accountNumber || '',
    ifsc: initialData.bank?.ifsc || '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({
      type: formData.type,
      upiId: formData.upiId,
      bank: {
        accountHolder: formData.accountHolder,
        accountNumber: formData.accountNumber,
        ifsc: formData.ifsc,
      }
    });
  };

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Details</h2>
        <p className="text-sm text-gray-500 mt-2">How would you like to receive your earnings?</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: 'UPI' })}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            formData.type === 'UPI'
              ? 'bg-primary text-black border border-primary shadow-yellow-glow'
              : 'bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 text-gray-500 hover:text-white'
          }`}
        >
          <BsQrCodeScan /> UPI
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: 'BankAccount' })}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            formData.type === 'BankAccount'
              ? 'bg-primary text-black border border-primary shadow-yellow-glow'
              : 'bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 text-gray-500 hover:text-white'
          }`}
        >
          <FiCreditCard /> Bank Transfer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {formData.type === 'UPI' ? (
          <div className="space-y-1.5 animate-fade-in-up">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">UPI ID</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
              <input type="text" name="upiId" value={formData.upiId} onChange={handleChange} required placeholder="username@upi" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white" />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Earnings will be transferred instantly to this UPI ID.</p>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in-up">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Account Holder Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" name="accountHolder" value={formData.accountHolder} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Account Number</label>
                <div className="relative">
                  <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">IFSC Code</label>
                <input type="text" name="ifsc" value={formData.ifsc} onChange={handleChange} required placeholder="e.g. SBIN0001234" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white uppercase" />
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mt-4">
          <FiCheckCircle className="text-emerald-500 mt-0.5" />
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            All payments are processed securely through our trusted payment partners. No hidden fees.
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

export default Step4Payment;
