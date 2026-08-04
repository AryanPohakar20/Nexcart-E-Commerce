import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiSettings, FiShield, FiDollarSign, FiMail, FiSliders,
  FiCheck, FiSave, FiAlertTriangle, FiLock, FiCpu, FiLoader
} from 'react-icons/fi';
import adminService from '../../services/adminService';

const TABS = [
  { id: 'general', label: 'Platform General', icon: FiSliders },
  { id: 'marketplace', label: 'Marketplace & Fees', icon: FiDollarSign },
  { id: 'security', label: 'Security & Auth', icon: FiShield },
  { id: 'notifications', label: 'Email & Gateways', icon: FiMail },
];

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    platformName: 'NexCart Marketplace',
    supportEmail: 'support@nexcart.in',
    currency: 'INR (₹)',
    commissionRate: 10,
    minPayout: 1000,
    autoApproveSellers: false,
    maintenanceMode: false,
    require2FA: true,
    sessionTimeout: 60,
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
    razorpayKey: 'rzp_live_9948291048102',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await adminService.getPlatformSettings();
        if (res && res.data && res.data.settings) {
          const s = res.data.settings;
          setSettings({
            platformName: s.general?.siteName || s.platformName || 'NexCart Marketplace',
            supportEmail: s.general?.contactEmail || s.supportEmail || 'support@nexcart.in',
            currency: s.general?.currency || s.currency || 'INR (₹)',
            commissionRate: s.marketplace?.commissionRate ?? 10,
            minPayout: s.marketplace?.minPayout ?? 1000,
            autoApproveSellers: s.marketplace?.autoApproveSellers ?? false,
            maintenanceMode: s.maintenance?.enabled ?? false,
            require2FA: s.security?.require2FA ?? true,
            sessionTimeout: s.security?.sessionTimeout ?? 60,
            smtpHost: s.email?.smtpHost || 'smtp.sendgrid.net',
            smtpPort: s.email?.smtpPort || 587,
            razorpayKey: s.branding?.razorpayKey || 'rzp_live_9948291048102',
          });
        }
      } catch (err) {
        console.error('Failed to load platform settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminService.updatePlatformSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">System & Platform Governance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Global configurations, commission fee rules, payment gateway parameters, and security policies
          </p>
        </div>
        {saved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl"
          >
            <FiCheck /> Settings Saved Successfully
          </motion.div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-yellow-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Form */}
      {loading ? (
        <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-12 text-center text-gray-400">
          <FiLoader className="animate-spin inline-block mr-2" size={20} /> Loading platform configuration...
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Tab 1: General */}
          {activeTab === 'general' && (
            <div className="space-y-5 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Core Branding & Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold mb-1.5">Platform Brand Name</label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1.5">Customer Support Desk Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
                  />
                </div>
              </div>

              <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-yellow-400">Emergency Maintenance Mode</h4>
                    <p className="text-gray-400 text-[11px]">
                      Taking platform offline will restrict storefront shopping and show maintenance splash to customers.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="w-5 h-5 rounded accent-yellow-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Marketplace Fees */}
          {activeTab === 'marketplace' && (
            <div className="space-y-5 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Monetization & Seller Rules</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold mb-1.5">Global Platform Commission Fee (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.commissionRate}
                    onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-yellow-500/50"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Deducted automatically on each completed cart checkout.</p>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1.5">Minimum Merchant Payout Threshold (₹)</label>
                  <input
                    type="number"
                    value={settings.minPayout}
                    onChange={(e) => setSettings({ ...settings, minPayout: Number(e.target.value) })}
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-yellow-500/50"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Minimum accrued balance required before initiating bank settlement.</p>
                </div>
              </div>

              <div className="p-4 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Automated KYC Auto-Approval</h4>
                  <p className="text-gray-400 text-[11px]">Automatically verify merchant onboarding without manual admin review queue.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoApproveSellers}
                  onChange={(e) => setSettings({ ...settings, autoApproveSellers: e.target.checked })}
                  className="w-5 h-5 rounded accent-yellow-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Security */}
          {activeTab === 'security' && (
            <div className="space-y-5 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Access Control & Session Tokens</h3>

              <div className="p-4 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Enforce 2FA on Administrative Accounts</h4>
                  <p className="text-gray-400 text-[11px]">Require OTP verification on all root and staff login sessions.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.require2FA}
                  onChange={(e) => setSettings({ ...settings, require2FA: e.target.checked })}
                  className="w-5 h-5 rounded accent-yellow-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Inactivity Session Timeout (Minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                  className="w-full md:w-1/2 h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
                />
              </div>
            </div>
          )}

          {/* Tab 4: Notifications / Gateways */}
          {activeTab === 'notifications' && (
            <div className="space-y-5 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Payment Gateways & SMTP Relay</h3>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Razorpay Live Key ID</label>
                <input
                  type="text"
                  value={settings.razorpayKey}
                  onChange={(e) => setSettings({ ...settings, razorpayKey: e.target.value })}
                  className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-yellow-400 font-mono outline-none focus:border-yellow-500/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold mb-1.5">SMTP Host Server</label>
                  <input
                    type="text"
                    value={settings.smtpHost}
                    onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1.5">SMTP Server Port</label>
                  <input
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-yellow-500/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_15px_rgba(255,193,7,0.3)] cursor-pointer"
            >
              {saving ? <FiLoader className="animate-spin" size={14} /> : <FiSave size={14} />}
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminSettings;
