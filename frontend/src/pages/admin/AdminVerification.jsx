import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckSquare, FiCheckCircle, FiXCircle, FiAlertCircle, FiFileText,
  FiEye, FiClock, FiX, FiShield, FiExternalLink, FiHelpCircle
} from 'react-icons/fi';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import ConfirmDialog from '../../components/admin/shared/ConfirmDialog';
import { ADMIN_VERIFICATIONS } from '../../constants/adminDummyData';

const TABS = [
  { id: 'all', label: 'All Requests' },
  { id: 'pending', label: 'Pending Review' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const AdminVerification = () => {
  const [verifications, setVerifications] = useState(ADMIN_VERIFICATIONS);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [remarksModal, setRemarksModal] = useState({ open: false, item: null, action: '' });
  const [remarksText, setRemarksText] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false });

  const filtered = useMemo(() => {
    if (activeTab === 'all') return verifications;
    return verifications.filter((v) => v.status === activeTab);
  }, [verifications, activeTab]);

  const counts = useMemo(() => {
    return {
      all: verifications.length,
      pending: verifications.filter((v) => v.status === 'pending').length,
      approved: verifications.filter((v) => v.status === 'approved').length,
      rejected: verifications.filter((v) => v.status === 'rejected').length,
    };
  }, [verifications]);

  const handleQuickApprove = (item) => {
    setConfirmDialog({
      open: true,
      title: 'Approve Merchant KYC',
      message: `Approve verification for "${item.seller}"? This will grant them full marketplace seller privileges.`,
      type: 'info',
      confirmLabel: 'Approve Seller',
      onConfirm: () => {
        setVerifications((prev) =>
          prev.map((v) => (v.id === item.id ? { ...v, status: 'approved' } : v))
        );
        setConfirmDialog({ open: false });
      },
    });
  };

  const openRemarksModal = (item, action) => {
    setRemarksModal({ open: true, item, action });
    setRemarksText('');
  };

  const handleRemarksSubmit = (e) => {
    e.preventDefault();
    if (!remarksModal.item) return;

    setVerifications((prev) =>
      prev.map((v) =>
        v.id === remarksModal.item.id
          ? {
              ...v,
              status: remarksModal.action === 'reject' ? 'rejected' : 'pending',
              notes: remarksText,
            }
          : v
      )
    );
    setRemarksModal({ open: false, item: null, action: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white tracking-tight">Merchant KYC & Verification Queue</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review business credentials, verify GST identification, and govern seller onboarding
        </p>
      </motion.div>

      {/* Tabs bar */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-yellow-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id
                  ? 'bg-black/20 text-black font-black'
                  : 'bg-white/10 text-gray-400'
              }`}
            >
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Verification Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1A1A1A] border border-white/5 hover:border-white/15 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
          >
            {/* Merchant Header */}
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={item.logo}
                    alt={item.seller}
                    className="w-11 h-11 rounded-xl object-cover border border-white/10"
                  />
                  <div>
                    <h4 className="font-bold text-white text-base">{item.seller}</h4>
                    <p className="text-[10px] text-gray-500 font-mono">KYC REF #{item.id}</p>
                  </div>
                </div>
                <StatusBadge status={item.status} size="sm" />
              </div>

              {/* Document Overview */}
              <div className="mt-4 bg-white/3 border border-white/5 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Document Type</span>
                  <span className="text-white font-bold">{item.documentType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Document ID</span>
                  <span className="text-yellow-400 font-mono font-bold">{item.docNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Submission Date</span>
                  <span className="text-gray-300">{item.submittedDate}</span>
                </div>
              </div>

              {/* Document Thumbnail Preview */}
              <div
                onClick={() => setSelectedDoc(item)}
                className="mt-3 relative group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-black/40 h-28 flex items-center justify-center"
              >
                <div className="text-center p-3">
                  <FiFileText size={24} className="mx-auto text-yellow-400 mb-1" />
                  <p className="text-xs font-bold text-gray-300">Click to Inspect Document</p>
                  <p className="text-[10px] text-gray-500">PDF / Verified Image Scan</p>
                </div>
                <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                    <FiEye size={12} /> View Document
                  </span>
                </div>
              </div>

              {item.notes && (
                <div className="mt-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
                  <strong className="block text-[10px] uppercase tracking-wider text-red-400">Rejection Note:</strong>
                  {item.notes}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-white/5 flex gap-2">
              {item.status === 'pending' ? (
                <>
                  <button
                    onClick={() => handleQuickApprove(item)}
                    className="flex-1 h-9 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  >
                    <FiCheckCircle size={13} /> Approve
                  </button>
                  <button
                    onClick={() => openRemarksModal(item, 'reject')}
                    className="flex-1 h-9 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <FiXCircle size={13} /> Reject
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedDoc(item)}
                  className="w-full h-9 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-xl transition-all"
                >
                  Review Stored Record
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Document Inspector Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedDoc(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#181818] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <h3 className="text-base font-bold text-white">KYC Document Inspector</h3>
                  <p className="text-xs text-gray-500">{selectedDoc.seller} • {selectedDoc.documentType}</p>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-white">
                  <FiX size={20} />
                </button>
              </div>

              {/* Preview Box */}
              <div className="h-80 bg-black/60 rounded-xl border border-white/10 flex flex-col items-center justify-center p-6 text-center">
                <FiShield size={48} className="text-yellow-400 mb-3 animate-pulse" />
                <h4 className="font-bold text-white text-sm">Encrypted Government Identity File</h4>
                <p className="text-xs text-gray-400 font-mono mt-1">Ref ID: {selectedDoc.docNumber}</p>
                <p className="text-[11px] text-gray-500 max-w-sm mt-2">
                  Official GST/PAN credentials certified via National Verification Authority API.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-xl"
                >
                  Close Preview
                </button>
                {selectedDoc.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleQuickApprove(selectedDoc);
                      setSelectedDoc(null);
                    }}
                    className="px-5 py-2 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 shadow-[0_0_12px_rgba(255,193,7,0.3)]"
                  >
                    Approve Merchant KYC
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection / Request Remarks Modal */}
      <AnimatePresence>
        {remarksModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setRemarksModal({ open: false, item: null, action: '' })}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#1C1C1C] border border-white/10 rounded-2xl p-6 shadow-2xl z-10"
            >
              <h3 className="text-base font-bold text-white mb-2">Rejection Reason & Notification</h3>
              <p className="text-xs text-gray-400 mb-4">
                Please explain why this submission for <strong className="text-white">{remarksModal.item?.seller}</strong> is being rejected. This note will be sent directly to the merchant.
              </p>

              <form onSubmit={handleRemarksSubmit} className="space-y-4">
                <textarea
                  required
                  rows={4}
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  placeholder="e.g. GST certificate expired or business name mismatch..."
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-red-500/50 resize-none"
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRemarksModal({ open: false, item: null, action: '' })}
                    className="flex-1 h-9 rounded-xl font-bold text-xs text-gray-300 bg-white/5 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-9 rounded-xl font-bold text-xs text-white bg-red-500 hover:bg-red-600 shadow-md"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmLabel={confirmDialog.confirmLabel}
      />
    </div>
  );
};

export default AdminVerification;
