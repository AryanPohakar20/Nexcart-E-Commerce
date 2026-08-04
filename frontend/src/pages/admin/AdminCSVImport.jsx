import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUploadCloud, FiFileText, FiCheckCircle, FiAlertCircle, FiDownload,
  FiArrowRight, FiCheck, FiX, FiRefreshCw, FiDatabase
} from 'react-icons/fi';

const IMPORT_TYPES = [
  { id: 'products', label: 'Product Catalog', icon: FiDatabase, desc: 'Batch import items, prices, SKUs & descriptions' },
  { id: 'users', label: 'Customer Accounts', icon: FiDatabase, desc: 'Batch register users with roles and contact metadata' },
  { id: 'inventory', label: 'Stock & Inventory', icon: FiDatabase, desc: 'Update warehouse quantity and pricing records' },
];

const PREVIEW_DATA = [
  { id: 1, name: 'Quantum Pro Earbuds', category: 'Audio', price: 2999, stock: 45, status: 'valid' },
  { id: 2, name: 'ErgoWave Gaming Mouse', category: 'Gaming', price: 1499, stock: 120, status: 'valid' },
  { id: 3, name: 'Invalid Item SKU #99', category: '', price: 'NaN', stock: -2, status: 'error', error: 'Missing category & invalid price' },
  { id: 4, name: 'Smart Fitness Tracker v4', category: 'Wearables', price: 3499, stock: 30, status: 'valid' },
];

const AdminCSVImport = () => {
  const [selectedType, setSelectedType] = useState('products');
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState('upload'); // 'upload' | 'mapping' | 'preview' | 'importing' | 'completed'
  const [progress, setProgress] = useState(0);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setStage('mapping');
    }
  };

  const startImport = () => {
    setStage('importing');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStage('completed');
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  const resetAll = () => {
    setFile(null);
    setStage('upload');
    setProgress(0);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white tracking-tight">Bulk Data Import & Synchronization</h1>
        <p className="text-sm text-gray-500 mt-1">
          High-throughput CSV/Excel data ingestion engine with automated field mapping and schema validation
        </p>
      </motion.div>

      {/* Target Schema Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {IMPORT_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setSelectedType(t.id);
              resetAll();
            }}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedType === t.id
                ? 'bg-yellow-500/10 border-yellow-500/40 shadow-lg'
                : 'bg-[#1A1A1A] border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-bold text-sm ${selectedType === t.id ? 'text-yellow-400' : 'text-white'}`}>
                {t.label}
              </span>
              {selectedType === t.id && <FiCheck className="text-yellow-400" />}
            </div>
            <p className="text-xs text-gray-400">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Main Wizard Container */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 text-xs font-bold text-gray-400">
          <span className={stage === 'upload' ? 'text-yellow-400' : 'text-gray-500'}>1. Choose CSV File</span>
          <FiArrowRight />
          <span className={stage === 'mapping' ? 'text-yellow-400' : 'text-gray-500'}>2. Column Schema Mapping</span>
          <FiArrowRight />
          <span className={stage === 'preview' ? 'text-yellow-400' : 'text-gray-500'}>3. Ingestion Preview</span>
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
                accept=".csv, .xlsx"
                onChange={handleFileDrop}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FiUploadCloud size={48} className="mx-auto text-yellow-400 mb-3 animate-bounce" />
              <h3 className="text-base font-bold text-white mb-1">Drag and drop your spreadsheet here</h3>
              <p className="text-xs text-gray-400">Supports standard .csv, .tsv, and formatted .xlsx archives up to 50MB</p>
              <button className="mt-4 px-4 py-2 bg-yellow-500 text-black text-xs font-bold rounded-xl pointer-events-none">
                Browse Files
              </button>
            </div>

            <div className="flex items-center justify-between bg-white/3 border border-white/5 rounded-xl p-4 text-xs">
              <div>
                <p className="font-bold text-white">Need schema guidelines?</p>
                <p className="text-gray-500">Download sample template file with standard data headers</p>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-yellow-400 border border-yellow-500/20 rounded-lg font-bold">
                <FiDownload size={13} /> Download Template
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: Schema Mapping */}
        {stage === 'mapping' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Map Spreadsheet Columns</h3>
                <p className="text-xs text-gray-400">Selected file: <strong className="text-yellow-400">{file?.name || 'catalog_export.csv'}</strong></p>
              </div>
            </div>

            <div className="bg-white/2 border border-white/5 rounded-xl p-4 space-y-3 text-xs">
              {[
                { source: 'Product_Title', target: 'name', status: 'Matched' },
                { source: 'Category_Name', target: 'category', status: 'Matched' },
                { source: 'Selling_Price_INR', target: 'price', status: 'Matched' },
                { source: 'Available_Qty', target: 'stock', status: 'Matched' },
              ].map((row, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="font-mono text-gray-300 bg-white/5 px-2 py-1 rounded">{row.source}</span>
                  <FiArrowRight className="text-gray-600" />
                  <span className="font-bold text-white">{row.target}</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {row.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={resetAll} className="px-4 py-2 bg-white/5 text-gray-300 text-xs font-bold rounded-xl">
                Cancel
              </button>
              <button
                onClick={() => setStage('preview')}
                className="px-5 py-2 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 shadow-md"
              >
                Proceed to Data Validation
              </button>
            </div>
          </div>
        )}

        {/* Stage 3: Preview */}
        {stage === 'preview' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Validation Preview Table</h3>
              <p className="text-xs text-gray-400">3 valid records ready, 1 record has schema violations</p>
            </div>

            <div className="overflow-x-auto border border-white/5 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-white/5 text-gray-400 font-bold border-b border-white/5">
                    <th className="p-3">Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {PREVIEW_DATA.map((row) => (
                    <tr key={row.id} className={row.status === 'error' ? 'bg-red-500/5' : ''}>
                      <td className="p-3 font-bold text-white">{row.name}</td>
                      <td className="p-3 text-gray-400">{row.category || '—'}</td>
                      <td className="p-3 text-white font-medium">₹{row.price}</td>
                      <td className="p-3 text-gray-300">{row.stock}</td>
                      <td className="p-3">
                        {row.status === 'valid' ? (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <FiCheckCircle /> Ready
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                            <FiAlertCircle /> {row.error}
                          </span>
                        )}
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
                className="px-6 py-2 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 shadow-[0_0_15px_rgba(255,193,7,0.3)]"
              >
                Execute Bulk Ingestion
              </button>
            </div>
          </div>
        )}

        {/* Stage: Importing */}
        {stage === 'importing' && (
          <div className="py-12 text-center space-y-4">
            <FiRefreshCw size={36} className="mx-auto text-yellow-400 animate-spin" />
            <h3 className="text-base font-bold text-white">Ingesting Marketplace Records...</h3>
            <div className="w-64 bg-white/10 rounded-full h-2 mx-auto overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs font-mono text-gray-400">{progress}% Processed</p>
          </div>
        )}

        {/* Stage 4: Completed */}
        {stage === 'completed' && (
          <div className="py-10 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20">
              <FiCheckCircle size={32} />
            </div>
            <h3 className="text-lg font-black text-white">Ingestion Complete</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Successfully imported valid entities into database. 1 invalid row was isolated to the quarantine log.
            </p>
            <button
              onClick={resetAll}
              className="px-5 py-2.5 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 shadow-md"
            >
              Start Another Import
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCSVImport;
