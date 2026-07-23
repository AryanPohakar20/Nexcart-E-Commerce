import React, { useState } from 'react';
import { FiCheck, FiArrowRight, FiArrowLeft, FiShield } from 'react-icons/fi';

const Step5Agreement = ({ onNext, onBack, isSubmitting }) => {
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (agreed) {
      onNext();
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Marketplace Agreement</h2>
        <p className="text-sm text-gray-500 mt-2">Please read and accept our seller policies.</p>
      </div>

      <div className="bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl p-5 mb-6 h-48 overflow-y-auto text-xs text-gray-600 dark:text-gray-400 space-y-4 custom-scrollbar">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">1. Seller Terms & Conditions</h3>
        <p>By registering as a Marketplace Seller on NexCart, you agree to comply with all local, state, and federal laws regarding the sale of goods.</p>
        
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 pt-2">2. Prohibited Items</h3>
        <p>You may not list illegal, counterfeit, or restricted items. NexCart reserves the right to remove any listing and suspend accounts violating this policy.</p>
        
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 pt-2">3. Fees & Payouts</h3>
        <p>NexCart charges a nominal platform fee per successful transaction. Payouts are processed within 2-3 business days after the buyer confirms receipt of the item.</p>

        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 pt-2">4. Community Guidelines</h3>
        <p>Treat all buyers and fellow sellers with respect. Maintain a high response rate and fulfill orders promptly to build trust and improve your seller rating.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center mt-0.5">
            <input 
              type="checkbox" 
              className="peer sr-only"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              required
            />
            <div className="w-5 h-5 rounded border border-gray-400 group-hover:border-primary peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
              <FiCheck className="text-black opacity-0 peer-checked:opacity-100 font-bold" />
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 select-none">
            I have read and agree to the <span className="text-primary hover:underline">Marketplace Policy</span>, <span className="text-primary hover:underline">Seller Terms</span>, and <span className="text-primary hover:underline">Community Guidelines</span>.
          </p>
        </label>

        <div className="flex items-start gap-2 bg-primary/10 border border-primary/20 rounded-lg p-3">
          <FiShield className="text-primary mt-0.5" />
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Upon submission, your profile will be reviewed by our team. Approval usually takes 12-24 hours.
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={onBack} 
            disabled={isSubmitting}
            className="w-1/3 py-3.5 text-sm font-bold text-gray-400 hover:text-white border border-gray-700 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <FiArrowLeft /> Back
          </button>
          <button 
            type="submit" 
            disabled={!agreed || isSubmitting}
            className="w-2/3 btn-glow-yellow py-3.5 text-sm text-black font-extrabold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Complete Registration'} {!isSubmitting && <FiArrowRight />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step5Agreement;
