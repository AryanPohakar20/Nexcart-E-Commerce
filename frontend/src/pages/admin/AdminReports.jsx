import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAlertTriangle, FiCheckCircle, FiXCircle, FiSlash, FiMessageSquare,
  FiEye, FiFilter, FiX, FiShield, FiUser, FiPackage, FiShoppingBag, FiLoader
} from 'react-icons/fi';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import ConfirmDialog from '../../components/admin/shared/ConfirmDialog';
import adminService from '../../services/adminService';

const TABS = [
  { id: 'all', label: 'All Incidents' },
  { id: 'open', label: 'Open / Pending' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'dismissed', label: 'Dismissed' },
];

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('open');
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const [remarks, setRemarks] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDisputeReports({ tab: activeTab });
      if (res && res.data && res.data.reports) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error('Error fetching dispute reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const handleResolve = async (report, action) => {
    if (action === 'ban_entity') {
      setConfirmDialog({
        open: true,
        title: 'Enforce Suspension on Entity',
        message: `Permanently suspend or penalize "${report.target}" based on this dispute?`,
        type: 'danger',
        confirmLabel: 'Enforce Suspension',
        onConfirm: async () => {
          try {
            await adminService.resolveDisputeReport(report._id || report.id, {
              action: 'ban_entity',
              remarks: remarks || 'Suspension enforced via dispute investigation.',
            });
            setSelectedReport(null);
            setRemarks('');
            setConfirmDialog({ open: false });
            fetchReports();
          } catch (err) {
            console.error('Failed to resolve dispute:', err);
          }
        },
      });
      return;
    }

    try {
      await adminService.resolveDisputeReport(report._id || report.id, {
        action,
        remarks: remarks || `Dispute marked as ${action}`,
      });
      setSelectedReport(null);
      setRemarks('');
      fetchReports();
    } catch (err) {
      console.error('Failed to resolve dispute:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white tracking-tight">Marketplace Trust & Dispute Center</h1>
        <p className="text-sm text-gray-500 mt-1">
          Investigate consumer claims, counterfeit reports, fraudulent merchant alerts, and terms violations
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-yellow-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports Table Card */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-white/3 border-b border-white/5 text-gray-500 uppercase tracking-wider font-bold">
                <th className="p-4">Dispute ID</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Report Reason</th>
                <th className="p-4">Filed By</th>
                <th className="p-4">Priority Level</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    <FiLoader className="animate-spin inline-block mr-2" size={16} /> Loading incidents...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    No dispute incidents found in this category.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r._id || r.id} className="hover:bg-white/3 transition-colors">
                    <td className="p-4 font-mono font-bold text-yellow-400">{r.reportId || r.id}</td>
                    <td className="p-4">
                      <span className="font-bold text-white block">{r.target}</span>
                      <span className="text-[10px] text-gray-500 capitalize">{r.type}</span>
                    </td>
                    <td className="p-4 text-gray-300 font-medium max-w-xs truncate">{r.reason}</td>
                    <td className="p-4 text-gray-400">{r.reporter}</td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.priority === 'critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : r.priority === 'high'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}
                      >
                        {(r.priority || 'NORMAL').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="p-4 text-gray-500">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : r.date || 'Recent'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedReport(r);
                          setRemarks(r.adminRemarks || '');
                        }}
                        className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg font-bold text-xs transition-all"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investigation Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelectedReport(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#1C1C1C] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <span className="text-xs text-yellow-400 font-mono font-bold">CASE INVESTIGATION</span>
                  <h3 className="text-base font-bold text-white">{selectedReport.reportId || selectedReport.id}</h3>
                </div>
                <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-white">
                  <FiX size={18} />
                </button>
              </div>

              {/* Case details */}
              <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Accused Entity</span>
                  <span className="text-white font-bold">{selectedReport.target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Claim Type</span>
                  <span className="text-white capitalize">{selectedReport.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reported By</span>
                  <span className="text-white">{selectedReport.reporter}</span>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <p className="text-gray-500 mb-1">Claim Statement:</p>
                  <p className="text-gray-200 bg-black/40 p-3 rounded-lg border border-white/5">
                    "{selectedReport.reason}"
                  </p>
                </div>

                {selectedReport.status === 'open' && (
                  <div className="pt-2">
                    <label className="text-gray-400 block mb-1">Admin Investigation Remarks:</label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter investigation notes or resolution summary..."
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {selectedReport.status === 'open' ? (
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleResolve(selectedReport, 'resolve')}
                      className="h-10 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all shadow-md"
                    >
                      Resolve & Close Case
                    </button>
                    <button
                      onClick={() => handleResolve(selectedReport, 'dismiss')}
                      className="h-10 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-xl border border-white/10 transition-all"
                    >
                      Dismiss (No Violation)
                    </button>
                  </div>
                  <button
                    onClick={() => handleResolve(selectedReport, 'ban_entity')}
                    className="w-full h-10 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition-all"
                  >
                    Penalize / Restrict Entity
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <span className="text-xs text-gray-400">
                    This dispute has been marked as{' '}
                    <strong className="text-white uppercase">{selectedReport.status}</strong>.
                  </span>
                  {selectedReport.adminRemarks && (
                    <p className="text-[11px] text-gray-500 mt-1">"{selectedReport.adminRemarks}"</p>
                  )}
                </div>
              )}
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

export default AdminReports;
