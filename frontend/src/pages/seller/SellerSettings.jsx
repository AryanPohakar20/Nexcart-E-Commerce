import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { SellerContext } from '../../context/SellerContext';
import { 
  FiSettings, FiUser, FiCreditCard, FiTruck, FiBell, 
  FiCheckCircle, FiSave, FiTag, FiLayers, FiShield, FiAlertCircle 
} from 'react-icons/fi';

const SellerSettings = () => {
  const { settings, updateSettings } = useContext(SellerContext);
  const [formState, setFormState] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isBusiness = settings.sellerType === 'business';

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formState);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 text-left max-w-5xl">
      {/* ── 1. Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-borderColor pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-textPrimary tracking-tight flex items-center gap-2.5">
            <FiSettings className="text-primary" />
            <span>Studio Settings & Preferences</span>
          </h1>
          <p className="text-xs text-textSecondary mt-1">
            Configure your {isBusiness ? 'business profile' : 'personal profile'}, automated payouts, dispatch rules, and alerts.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-2xl text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <FiCheckCircle size={16} />
            <span>Studio Settings Updated Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        {/* ── 2. Store Identity & Contact ────────────────────────────────────── */}
        <div className="bg-cardBg border border-borderColor p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-textPrimary font-bold text-sm">
            <FiUser className="text-primary" />
            <span>{isBusiness ? 'Business Profile Details' : 'Personal Profile Details'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Common Fields */}
            <div>
              <label className="block text-textSecondary font-bold mb-1.5">
                {isBusiness ? 'Owner Name' : 'Full Name'}
              </label>
              <input
                type="text"
                value={formState.displayName || ''}
                onChange={(e) => setFormState({ ...formState, displayName: e.target.value })}
                className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
              />
            </div>

            {/* Business Only Fields */}
            {isBusiness && (
              <>
                <div>
                  <label className="block text-textSecondary font-bold mb-1.5">Legal / Business Entity Name</label>
                  <input
                    type="text"
                    value={formState.businessName || ''}
                    onChange={(e) => setFormState({ ...formState, businessName: e.target.value })}
                    className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-textSecondary font-bold mb-1.5">Business Description</label>
                  <textarea
                    rows={3}
                    value={formState.bio || ''}
                    onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                    className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
                  />
                </div>
                <div>
                  <label className="block text-textSecondary font-bold mb-1.5">Business Category</label>
                  <input
                    type="text"
                    value={formState.businessCategory || ''}
                    onChange={(e) => setFormState({ ...formState, businessCategory: e.target.value })}
                    className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
                  />
                </div>
                <div>
                  <label className="block text-textSecondary font-bold mb-1.5">GST Number</label>
                  <input
                    type="text"
                    value={formState.gst || ''}
                    onChange={(e) => setFormState({ ...formState, gst: e.target.value })}
                    className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-textSecondary font-bold mb-1.5">Store Website</label>
                  <input
                    type="url"
                    value={formState.website || ''}
                    onChange={(e) => setFormState({ ...formState, website: e.target.value })}
                    className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
                  />
                </div>
                <div>
                  <label className="block text-textSecondary font-bold mb-1.5">Social Links (e.g. Instagram)</label>
                  <input
                    type="text"
                    value={formState.socialLinks || ''}
                    onChange={(e) => setFormState({ ...formState, socialLinks: e.target.value })}
                    className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
                  />
                </div>
              </>
            )}

            {/* Individual Only Fields */}
            {!isBusiness && (
              <div className="sm:col-span-2">
                <label className="block text-textSecondary font-bold mb-1.5">About Me</label>
                <textarea
                  rows={3}
                  value={formState.bio || ''}
                  onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                  className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-textSecondary font-bold mb-1.5">Contact Phone Number</label>
              <input
                type="tel"
                value={formState.phone || ''}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
              />
            </div>

            <div>
              <label className="block text-textSecondary font-bold mb-1.5">Registered Email</label>
              <input
                type="email"
                value={formState.email || ''}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
                disabled
              />
            </div>

            <div className="sm:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-textSecondary font-bold mb-1.5">Operating City</label>
                <input
                  type="text"
                  value={formState.city || ''}
                  onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                  className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
                />
              </div>
              <div>
                <label className="block text-textSecondary font-bold mb-1.5">Operating State</label>
                <input
                  type="text"
                  value={formState.state || ''}
                  onChange={(e) => setFormState({ ...formState, state: e.target.value })}
                  className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Payout & Bank Account Setup ─────────────────────────────────── */}
        <div className="bg-cardBg border border-borderColor p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-textPrimary font-bold text-sm">
            <FiCreditCard className="text-primary" />
            <span>Direct Bank & UPI Payout Gateway</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-textSecondary font-bold mb-1.5">Instant UPI ID</label>
              <input
                type="text"
                value={formState.payoutUPI || ''}
                onChange={(e) => setFormState({ ...formState, payoutUPI: e.target.value })}
                placeholder="aryan@okhdfcbank"
                className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-textSecondary font-bold mb-1.5">Bank Name</label>
              <input
                type="text"
                value={formState.bankName || ''}
                onChange={(e) => setFormState({ ...formState, bankName: e.target.value })}
                placeholder="HDFC Bank"
                className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
              />
            </div>

            <div>
              <label className="block text-textSecondary font-bold mb-1.5">Account Number</label>
              <input
                type="text"
                value={formState.accountNumber || ''}
                onChange={(e) => setFormState({ ...formState, accountNumber: e.target.value })}
                placeholder="50100492819283"
                className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-textSecondary font-bold mb-1.5">IFSC Code</label>
              <input
                type="text"
                value={formState.ifscCode || ''}
                onChange={(e) => setFormState({ ...formState, ifscCode: e.target.value })}
                placeholder="HDFC0001234"
                className="w-full bg-surface border border-borderColor rounded-xl px-3.5 py-2.5 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* ── 4. Delivery & Shipping Preferences ──────────────────────────────── */}
        <div className="bg-cardBg border border-borderColor p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-textPrimary font-bold text-sm">
            <FiTruck className="text-primary" />
            <span>Fulfillment & Dispatch Policies</span>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-surface rounded-2xl border border-borderColor cursor-pointer hover:border-borderColor/60">
              <input
                type="checkbox"
                checked={formState.enableLocalMeetup ?? true}
                onChange={(e) => setFormState({ ...formState, enableLocalMeetup: e.target.checked })}
                className="accent-primary w-4 h-4 rounded cursor-pointer"
              />
              <div>
                <span className="font-bold text-textPrimary block">Enable Buyer Local Meetup (Handshake)</span>
                <span className="text-[11px] text-textSecondary">
                  Allows buyers in your city to choose safe public meetup points without courier shipping fees.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-surface rounded-2xl border border-borderColor cursor-pointer hover:border-borderColor/60">
              <input
                type="checkbox"
                checked={formState.notifyOnNewOrder ?? true}
                onChange={(e) => setFormState({ ...formState, notifyOnNewOrder: e.target.checked })}
                className="accent-primary w-4 h-4 rounded cursor-pointer"
              />
              <div>
                <span className="font-bold text-textPrimary block">Instant Order SMS & Email Notifications</span>
                <span className="text-[11px] text-textSecondary">
                  Receive automated real-time dispatch reminders as soon as buyers pay.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* ── 5. Save Button ─────────────────────────────────────────────────── */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl font-black bg-primary text-black hover:bg-primary-light shadow-yellow-glow transition-all flex items-center gap-2 text-sm"
          >
            <FiSave size={18} />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerSettings;
