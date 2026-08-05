import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUploadCloud, FiFileText, FiCheckCircle, FiAlertCircle, FiDownload,
  FiArrowRight, FiCheck, FiX, FiRefreshCw, FiDatabase, FiAlertTriangle
} from 'react-icons/fi';
import adminService from '../../services/adminService';

const IMPORT_TYPES = [
  { id: 'products', label: 'Product Catalog', icon: FiDatabase, desc: 'Batch import items, prices, SKUs & descriptions' },
  { id: 'categories', label: 'Categories', icon: FiDatabase, desc: 'Import product categories and hierarchies' },
  { id: 'users', label: 'Customer Accounts', icon: FiDatabase, desc: 'Batch register users with roles and contact metadata' },
  { id: 'sellers', label: 'Sellers', icon: FiDatabase, desc: 'Import seller profiles and business details' },
  { id: 'inventory', label: 'Stock & Inventory', icon: FiDatabase, desc: 'Update warehouse quantity and pricing records' },
];

const AdminDataImport = () => {
  const [selectedType, setSelectedType] = useState('products');
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState('upload'); // 'upload' | 'mapping' | 'preview' | 'importing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [previewRows, setPreviewRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setErrorMsg(null);
      
      const formData = new FormData();
      formData.append('file', droppedFile);
      formData.append('type', selectedType);

      try {
        const res = await adminService.previewImport(formData);
        if (res.data) {
          setPreviewRows(res.data.preview || []);
          setSummary(res.data || {});
          setStage('mapping');
        }
      } catch (err) {
        console.error('File preview error:', err);
        setErrorMsg(err.response?.data?.message || 'Failed to parse file.');
      }
    }
  };

  const startImport = async () => {
    setStage('importing');
    setProgress(20);
    setErrorMsg(null);

    try {
      setProgress(50);
      const res = await adminService.executeImport(selectedType, summary.allRows || previewRows);
      setProgress(100);
      if (res.data) {
        setImportResult(res.data);
        setStage('completed');
      }
    } catch (err) {
      console.error('Import execution error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to complete import.');
      setStage('preview');
    }
  };

  const resetAll = () => {
    setFile(null);
    setStage('upload');
    setProgress(0);
    setPreviewRows([]);
    setSummary(null);
    setImportResult(null);
    setErrorMsg(null);
  };

  const exportErrorReport = () => {
    if (!summary || !summary.allRows) return;
    const errorRows = summary.allRows.filter(r => r.status === 'error');
    if (errorRows.length === 0) return;

    const csvContent = "data:text/csv;charset=utf-8,Row_ID,Name,Errors,Warnings\n" 
      + errorRows.map(e => `${e.id},"${e.name}","${e.error}","${e.warning || ''}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedType}_import_errors.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white tracking-tight">Data Import Center</h1>
        <p className="text-sm text-gray-500 mt-1">
          High-throughput JSON, CSV & Excel data ingestion engine with automated field mapping and schema validation
        </p>
      </motion.div>

      {/* Target Schema Selector */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {IMPORT_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setSelectedType(t.id);
              resetAll();
            }}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedType === t.id
                ? 'bg-yellow-500/10 border-yellow-500/40 shadow-lg'
                : 'bg-[#1A1A1A] border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex flex-col mb-1">
              <span className={`font-bold text-xs ${selectedType === t.id ? 'text-yellow-400' : 'text-white'}`}>
                {t.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Main Wizard Container */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 text-xs font-bold text-gray-400">
          <span className={stage === 'upload' ? 'text-yellow-400' : 'text-gray-500'}>1. Choose File</span>
          <FiArrowRight />
          <span className={stage === 'mapping' ? 'text-yellow-400' : 'text-gray-500'}>2. Validation Overview</span>
          <FiArrowRight />
          <span className={stage === 'preview' ? 'text-yellow-400' : 'text-gray-500'}>3. Data Preview</span>
          <FiArrowRight />
          <span className={stage === 'completed' ? 'text-emerald-400' : 'text-gray-500'}>4. Complete</span>
        </div>

        {/* Stage 1: Upload */}
        {stage === 'upload' && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-white/15 hover:border-yellow-500/50 rounded-2xl p-12 text-center bg-white/2 hover:bg-white/4 transition-all cursor-pointer relative"
            >
              <input
                type="file"
                accept=".csv, .xlsx, .xls, .json"
                onChange={handleFileDrop}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FiUploadCloud size={48} className="mx-auto text-yellow-400 mb-3 animate-bounce" />
              <h3 className="text-base font-bold text-white mb-1">Drag and drop your file here</h3>
              <p className="text-xs text-gray-400">Supports standard .csv, .xlsx, and .json formats</p>
              <button className="mt-4 px-4 py-2 bg-yellow-500 text-black text-xs font-bold rounded-xl pointer-events-none">
                Browse Files
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: Schema Mapping (Validation Overview) */}
        {stage === 'mapping' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Validation Overview</h3>
                <p className="text-xs text-gray-400">Selected file: <strong className="text-yellow-400">{file?.name}</strong></p>
              </div>
            </div>

            <div className="bg-white/2 border border-white/5 rounded-xl p-4 space-y-3 text-xs flex flex-col gap-2">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="font-mono text-gray-300 bg-white/5 px-2 py-1 rounded">Total Rows Parsed</span>
                <span className="font-bold text-white">{summary?.totalRows || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="font-mono text-gray-300 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Valid Rows</span>
                <span className="font-bold text-emerald-400">{summary?.validRows || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-mono text-gray-300 bg-red-500/10 text-red-400 px-2 py-1 rounded">Rows with Errors (Will be skipped)</span>
                <span className="font-bold text-red-400">{summary?.errorRows || 0}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={resetAll} className="px-4 py-2 bg-white/5 text-gray-300 text-xs font-bold rounded-xl">
                Cancel
              </button>
              <button
                onClick={() => setStage('preview')}
                className="px-5 py-2 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 shadow-md"
              >
                Review Data Preview
              </button>
            </div>
          </div>
        )}

        {/* Stage 3: Preview */}
        {stage === 'preview' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Validation Preview Table</h3>
              <p className="text-xs text-gray-400">
                Previewing up to 50 records. Review errors and warnings before committing.
              </p>
            </div>

            <div className="overflow-x-auto border border-white/5 rounded-xl">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-white/5 text-gray-400 font-bold border-b border-white/5">
                    <th className="p-3">ID</th>
                    <th className="p-3">Name / Identifier</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Messages</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/3">
                  {previewRows.map((row, idx) => (
                    <tr key={idx} className={row.status === 'error' ? 'bg-red-500/5' : ''}>
                      <td className="p-3 text-gray-500">{row.id}</td>
                      <td className="p-3 font-bold text-white">{row.name}</td>
                      <td className="p-3">
                        {row.status === 'valid' ? (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <FiCheckCircle /> Valid
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                            <FiX /> Error
                          </span>
                        )}
                      </td>
                      <td className="p-3 max-w-[200px] truncate text-gray-400">
                        {row.error && <div className="text-red-400 text-[10px]">{row.error}</div>}
                        {row.warning && <div className="text-yellow-400 text-[10px]"><FiAlertTriangle className="inline"/> {row.warning}</div>}
                        {!row.error && !row.warning && <span className="text-gray-500 text-[10px]">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setStage('mapping')} className="px-4 py-2 bg-white/5 text-gray-300 text-xs font-bold rounded-xl">
                Back
              </button>
              <button
                onClick={startImport}
                disabled={summary?.validRows === 0}
                className={`px-6 py-2 text-black text-xs font-bold rounded-xl shadow-md ${
                  summary?.validRows === 0 
                  ? 'bg-gray-500 cursor-not-allowed opacity-50' 
                  : 'bg-yellow-500 hover:bg-yellow-400 shadow-[0_0_15px_rgba(255,193,7,0.3)]'
                }`}
              >
                Execute Import ({summary?.validRows} Valid)
              </button>
            </div>
          </div>
        )}

        {/* Stage: Importing */}
        {stage === 'importing' && (
          <div className="py-12 text-center space-y-4">
            <FiRefreshCw size={36} className="mx-auto text-yellow-400 animate-spin" />
            <h3 className="text-base font-bold text-white">Importing Data...</h3>
            <div className="w-64 bg-white/10 rounded-full h-2 mx-auto overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs font-mono text-gray-400">{progress}% Processed</p>
          </div>
        )}

        {/* Stage 4: Completed */}
        {stage === 'completed' && importResult && (
          <div className="py-8 text-center space-y-6">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20">
              <FiCheckCircle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Import Completed</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                Data ingestion workflow finished. See summary below.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-left">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                <div className="text-2xl font-bold text-white">{importResult.total}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Total Processed</div>
              </div>
              <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-center">
                <div className="text-2xl font-bold text-emerald-400">{importResult.imported}</div>
                <div className="text-[10px] text-emerald-500 uppercase tracking-wider mt-1">Successfully Imported</div>
              </div>
              <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20 text-center">
                <div className="text-2xl font-bold text-yellow-400">{importResult.duplicates || 0}</div>
                <div className="text-[10px] text-yellow-500 uppercase tracking-wider mt-1">Duplicates Skipped</div>
              </div>
              <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-center">
                <div className="text-2xl font-bold text-red-400">{importResult.failed}</div>
                <div className="text-[10px] text-red-500 uppercase tracking-wider mt-1">Failed Validation</div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              {importResult.failed > 0 && (
                <button
                  onClick={exportErrorReport}
                  className="px-5 py-2.5 bg-white/5 text-red-400 text-xs font-bold rounded-xl border border-red-500/20 hover:bg-white/10"
                >
                  Export Error Report
                </button>
              )}
              <button
                onClick={resetAll}
                className="px-5 py-2.5 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 shadow-md"
              >
                Start Another Import
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDataImport;
