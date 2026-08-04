import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiActivity, FiShield, FiUser, FiShoppingBag, FiPackage,
  FiSettings, FiGrid, FiList, FiClock, FiX, FiCheckCircle,
  FiAlertTriangle, FiDownload
} from 'react-icons/fi';
import TableToolbar from '../../components/admin/shared/TableToolbar';
import Pagination from '../../components/admin/shared/Pagination';
import Timeline from '../../components/admin/shared/Timeline';
import { AUDIT_LOGS } from '../../constants/adminDummyData';

const ACTION_TYPE_OPTIONS = ['All Actions', 'user', 'seller', 'product', 'category', 'order', 'settings'];

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState(AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Actions');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'timeline'
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const perPage = 10;

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        !search ||
        l.admin.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.target.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'All Actions' || l.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [logs, search, typeFilter]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Security & Governance Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tamper-evident chronological trail of all administrative events, privileged actions, and security operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 border border-white/5 rounded-xl p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-yellow-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Table View"
            >
              <FiList size={15} />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'timeline'
                  ? 'bg-yellow-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Timeline View"
            >
              <FiClock size={15} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Container */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <TableToolbar
          search={search}
          onSearch={setSearch}
          onSearchClear={() => setSearch('')}
          searchPlaceholder="Search actor, action, or target entity..."
          onExport={() => {}}
          filters={
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 px-3 text-xs font-semibold bg-white/5 border border-white/8 rounded-xl text-gray-300 outline-none hover:border-white/20"
            >
              {ACTION_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t === 'All Actions' ? t : t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          }
        />

        {/* View Mode: Table */}
        {viewMode === 'table' ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-white/3 border-b border-white/5 text-gray-500 uppercase tracking-wider font-bold">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Staff Member</th>
                    <th className="p-4">Operation</th>
                    <th className="p-4">Target Resource</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4">Outcome</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/3">
                  {paged.map((l) => (
                    <tr key={l.id} className="hover:bg-white/3 transition-colors">
                      <td className="p-4 font-mono text-gray-400">{l.timestamp}</td>
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center text-[10px]">
                          {l.admin[0]}
                        </div>
                        {l.admin}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-200">{l.action}</span>
                      </td>
                      <td className="p-4 text-yellow-400 font-mono">{l.target}</td>
                      <td className="p-4 font-mono text-gray-500">{l.ip}</td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            l.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {l.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedLog(l)}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-semibold"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={filtered.length}
              itemsPerPage={perPage}
            />
          </>
        ) : (
          /* View Mode: Timeline */
          <div className="p-6">
            <Timeline events={filtered} />
          </div>
        )}
      </div>

      {/* Log Inspection Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelectedLog(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#1C1C1C] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <span className="text-[10px] text-yellow-400 font-mono font-bold">EVENT LOG METADATA</span>
                  <h3 className="text-sm font-bold text-white">{selectedLog.id}</h3>
                </div>
                <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-white">
                  <FiX size={18} />
                </button>
              </div>

              <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Executing Admin</span>
                  <span className="text-white font-bold">{selectedLog.admin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Operation</span>
                  <span className="text-white">{selectedLog.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Resource</span>
                  <span className="text-yellow-400 font-mono">{selectedLog.target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Client IP Address</span>
                  <span className="text-gray-300 font-mono">{selectedLog.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Event Time</span>
                  <span className="text-gray-300">{selectedLog.timestamp}</span>
                </div>
                {selectedLog.remarks && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-gray-500 block mb-1">Administrative Remarks:</span>
                    <span className="text-gray-300 italic">"{selectedLog.remarks}"</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="w-full h-9 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 shadow-md"
              >
                Close Audit Record
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAuditLogs;
