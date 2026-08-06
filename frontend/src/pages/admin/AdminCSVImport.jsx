import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUploadCloud, FiFileText, FiCheckCircle, FiAlertCircle, FiDownload,
  FiArrowRight, FiCheck, FiX, FiRefreshCw, FiDatabase
} from 'react-icons/fi';
import adminService from '../../services/adminService';

const IMPORT_TYPES = [
  { id: 'products', label: 'Product Catalog', icon: FiDatabase, desc: 'Batch import items, prices, SKUs & descriptions' },
  { id: 'users', label: 'Customer Accounts', icon: FiDatabase, desc: 'Batch register users with roles and contact metadata' },
  { id: 'inventory', label: 'Stock & Inventory', icon: FiDatabase, desc: 'Update warehouse quantity and pricing records' },
];

const AdminCSVImport = () => {
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
          setSummary(res.data.summary || {});
          setStage('mapping');
        }
      } catch (err) {
        console.error('File preview error:', err);
        setErrorMsg(err.response?.data?.message || 'Failed to parse CSV file.');
      }
    }
  };

  const startImport = async () => {
    setStage('importing');
    setProgress(20);
    setErrorMsg(null);

    try {
      setProgress(50);
      const res = await adminService.executeImport(selectedType, previewRows);
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

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium">
          {errorMsg}
        </div>
      )}

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
                accept=".csv, .xlsx, .xls, .json"
                onChange={handleFileDrop}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FiUploadCloud size={48} className="mx-auto text-yellow-400 mb-3 animate-bounce" />
              <h3 className="text-base font-bold text-white mb-1">Drag and drop your dataset here</h3>
              <p className="text-xs text-gray-400">Supports standard .csv, .xlsx, and .json archives</p>
              <button className="mt-4 px-4 py-2 bg-yellow-500 text-black text-xs font-bold rounded-xl pointer-events-none">
                Browse Files
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/3 border border-white/5 rounded-xl p-4 text-xs">
              <div>
                <p className="font-bold text-white">Need schema guidelines?</p>
                <p className="text-gray-500 mt-1">
                  {selectedType === 'products' && 'Expected fields: name, category, price, stock, sku, description (name, category, price are required)'}
                  {selectedType === 'users' && 'Expected fields: email, firstName, lastName, phone, role (email, firstName are required)'}
                  {selectedType === 'inventory' && 'Expected fields: name, price, stock (name, stock are required)'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const csvTemplates = {
                      products: "name,category,price,stock,sku,description\nQuantum Earbuds,Electronics,2999,50,QE-100,Premium wireless earbuds\nGaming Mouse,Gaming,1499,30,GM-200,High precision gaming mouse",
                      users: "email,firstName,lastName,phone,role\njohn.doe@example.com,John,Doe,9876543210,customer\njane.smith@example.com,Jane,Smith,9876543211,seller",
                      inventory: "name,price,stock\nQuantum Earbuds,2999,60\nGaming Mouse,1499,45"
                    };
                    const csvContent = csvTemplates[selectedType] || csvTemplates.products;
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", `sample_${selectedType}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-lg font-bold transition-all"
                >
                  <FiDownload size={13} /> CSV Template
                </button>
                <button
                  onClick={() => {
                    const jsonTemplates = {
                      products: [
                        { name: "Quantum Earbuds", category: "Electronics", price: 2999, stock: 50, sku: "QE-100", description: "Premium wireless earbuds" },
                        { name: "Gaming Mouse", category: "Gaming", price: 1499, stock: 30, sku: "GM-200", description: "High precision gaming mouse" }
                      ],
                      users: [
                        { email: "john.doe@example.com", firstName: "John", lastName: "Doe", phone: "9876543210", role: "customer" },
                        { email: "jane.smith@example.com", firstName: "Jane", lastName: "Smith", phone: "9876543211", role: "seller" }
                      ],
                      inventory: [
                        { name: "Quantum Earbuds", price: 2999, stock: 60 },
                        { name: "Gaming Mouse", price: 1499, stock: 45 }
                      ]
                    };
                    const sample = jsonTemplates[selectedType] || jsonTemplates.products;
                    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json;charset=utf-8;' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", `sample_${selectedType}.json`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-lg font-bold transition-all"
                >
                  <FiDownload size={13} /> JSON Sample
                </button>
                <button
                  onClick={() => {
                    const jsonSchemas = {
                      products: {
                        "$schema": "http://json-schema.org/draft-07/schema#",
                        "title": "Product Catalog Ingestion Schema",
                        "type": "array",
                        "description": "JSON array of products to import into Nexcart",
                        "items": {
                          "type": "object",
                          "properties": {
                            "name": { "type": "string", "description": "Product name or title" },
                            "category": { "type": "string", "description": "Product category name" },
                            "price": { "type": "number", "minimum": 0, "description": "Unit price in INR" },
                            "stock": { "type": "integer", "minimum": 0, "description": "Available stock quantity" },
                            "sku": { "type": "string", "description": "Unique SKU code" },
                            "description": { "type": "string", "description": "Long-form product description" }
                          },
                          "required": ["name", "category", "price"]
                        }
                      },
                      users: {
                        "$schema": "http://json-schema.org/draft-07/schema#",
                        "title": "Customer Account Ingestion Schema",
                        "type": "array",
                        "description": "JSON array of users/customers to register in Nexcart",
                        "items": {
                          "type": "object",
                          "properties": {
                            "email": { "type": "string", "format": "email", "description": "Valid email address" },
                            "firstName": { "type": "string", "description": "User's first name" },
                            "lastName": { "type": "string", "description": "User's last name" },
                            "phone": { "type": "string", "description": "Contact phone number" },
                            "role": { "type": "string", "enum": ["customer", "seller", "admin"], "description": "Account role on the platform" }
                          },
                          "required": ["email", "firstName"]
                        }
                      },
                      inventory: {
                        "$schema": "http://json-schema.org/draft-07/schema#",
                        "title": "Stock & Inventory Ingestion Schema",
                        "type": "array",
                        "description": "JSON array of inventory updates for Nexcart",
                        "items": {
                          "type": "object",
                          "properties": {
                            "name": { "type": "string", "description": "Item name, title or SKU code to update" },
                            "price": { "type": "number", "minimum": 0, "description": "Updated item price" },
                            "stock": { "type": "integer", "minimum": 0, "description": "Updated stock quantity" }
                          },
                          "required": ["name", "stock"]
                        }
                      }
                    };
                    const schema = jsonSchemas[selectedType] || jsonSchemas.products;
                    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json;charset=utf-8;' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", `schema_${selectedType}.json`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40 rounded-lg font-bold transition-all"
                >
                  <FiDownload size={13} /> JSON Schema
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stage 2: Schema Mapping */}
        {stage === 'mapping' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Map Spreadsheet Columns</h3>
                <p className="text-xs text-gray-400">Selected file: <strong className="text-yellow-400">{file?.name}</strong></p>
              </div>
            </div>

            <div className="bg-white/2 border border-white/5 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="font-mono text-gray-300 bg-white/5 px-2 py-1 rounded">Parsed Rows Count</span>
                <span className="font-bold text-white">{summary?.totalRows || previewRows.length}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {summary?.validRows || previewRows.length} Valid
                </span>
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
              <p className="text-xs text-gray-400">
                {previewRows.length} record(s) parsed from file. Verify before committing.
              </p>
            </div>

            <div className="overflow-x-auto border border-white/5 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-white/5 text-gray-400 font-bold border-b border-white/5">
                    <th className="p-3">Title / Name</th>
                    <th className="p-3">Category / Role</th>
                    <th className="p-3">Price / Email</th>
                    <th className="p-3">Stock / SKU</th>
                    <th className="p-3">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/3">
                  {previewRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-bold text-white">{row.name || row.title || row.firstName || 'Item'}</td>
                      <td className="p-3 text-gray-400">{row.category || row.role || 'General'}</td>
                      <td className="p-3 text-white font-medium">{row.price ? `₹${row.price}` : (row.email || '—')}</td>
                      <td className="p-3 text-gray-300">{row.stock || row.sku || row.quantity || '0'}</td>
                      <td className="p-3">
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <FiCheckCircle /> Ready
                        </span>
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
              Successfully imported {importResult?.insertedCount || previewRows.length} entities into the database.
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
