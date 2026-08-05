import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { SellerContext } from '../../context/SellerContext';
import QuickStockModal from '../../components/seller/QuickStockModal';
import SellerStatsCard from '../../components/seller/SellerStatsCard';
import { 
  FiArchive, FiAlertTriangle, FiCheckCircle, FiMinus, 
  FiPlus, FiSliders, FiDollarSign, FiBox, FiSearch 
} from 'react-icons/fi';

const SellerInventory = () => {
  const { products, updateStock, stats, settings } = useContext(SellerContext);
  const isBusiness = settings?.sellerType === 'business';

  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  const [stockModalProduct, setStockModalProduct] = useState(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'in_stock' && p.stock > 5) ||
      (stockFilter === 'low_stock' && p.stock > 0 && p.stock <= 5) ||
      (stockFilter === 'out_of_stock' && p.stock === 0);

    return matchesSearch && matchesStock;
  });

  const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);

  return (
    <div className="space-y-6 text-left">
      {/* ── 1. Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-borderColor pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-textPrimary tracking-tight flex items-center gap-2.5">
            <FiArchive className="text-primary" />
            <span>{isBusiness ? 'Store Inventory' : 'My Listings'}</span>
          </h1>
          <p className="text-xs text-textSecondary mt-1">
            Real-time stock capacity management, inline inventory counters, and automated reorder alerts.
          </p>
        </div>
      </div>

      {/* ── 2. Stock Health Summary Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <SellerStatsCard
          title="Total Units in Stock"
          value={totalUnits}
          change={`${products.length} distinct listings`}
          isPositive={true}
          icon={FiBox}
          accent="blue"
          subtitle="Warehouse & C2C items"
        />

        <SellerStatsCard
          title="Total Stock Valuation"
          value={stats.totalInventoryValue}
          prefix="₹"
          formatter={(val) => val.toLocaleString('en-IN')}
          change="Catalog asset worth"
          isPositive={true}
          icon={FiDollarSign}
          accent="yellow"
          subtitle="Estimated selling gross"
        />

        <SellerStatsCard
          title="Low Stock Warnings"
          value={stats.lowStockCount}
          change={stats.lowStockCount > 0 ? 'Requires restocking' : 'Stock healthy'}
          isPositive={stats.lowStockCount === 0}
          icon={FiAlertTriangle}
          accent="amber"
          subtitle="Under 5 units remaining"
        />

        <SellerStatsCard
          title="Out of Stock Items"
          value={stats.outOfStockCount}
          change={stats.outOfStockCount === 0 ? 'Zero stockouts' : 'Paused on storefront'}
          isPositive={stats.outOfStockCount === 0}
          icon={FiArchive}
          accent="purple"
          subtitle="Ready for replenishment"
        />
      </div>

      {/* ── 3. Low Stock Alert Banner ───────────────────────────────────────── */}
      {stats.lowStockCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-cardBg to-cardBg border border-borderColor p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <FiAlertTriangle size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-textPrimary text-xs">
                {stats.lowStockCount} item(s) are nearing stock depletion
              </h4>
              <p className="text-[11px] text-textSecondary">
                Replenish units promptly to avoid losing marketplace search ranking and customer buy box.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStockFilter('low_stock')}
            className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 shadow-yellow-glow"
          >
            Review Low Stock Items
          </button>
        </div>
      )}

      {/* ── 4. Search & Filters ─────────────────────────────────────────────── */}
      <div className="bg-cardBg border border-borderColor p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3.5 top-3 text-textSecondary" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by product name, category, SKU..."
            className="w-full bg-surface border border-borderColor rounded-xl pl-9 pr-3 py-2 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary text-xs"
          />
        </div>

        {/* Stock Level Filter Tabs */}
        <div className="flex items-center bg-surface border border-borderColor p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { key: 'all', label: 'All Items' },
            { key: 'in_stock', label: 'In Stock (>5)' },
            { key: 'low_stock', label: 'Low Stock (≤5)' },
            { key: 'out_of_stock', label: 'Out of Stock (0)' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStockFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                stockFilter === tab.key
                  ? 'bg-primary text-black shadow-yellow-glow'
                  : 'text-textSecondary hover:text-textPrimary hover:bg-bgSecondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 5. Interactive Inventory Table with Inline +/- Adjuster ─────────── */}
      <div className="bg-cardBg border border-borderColor rounded-3xl overflow-hidden shadow-card-hover">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-surface text-textSecondary font-extrabold uppercase text-[10px] tracking-wider border-b border-borderColor">
                <th className="p-4">Catalog Listing</th>
                <th className="p-4">Format</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Total Value</th>
                <th className="p-4">Stock Health</th>
                <th className="p-4 text-center">Inline Stock Adjuster</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderColor">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-surface transition-colors group">
                  {/* Product Details */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-12 h-12 rounded-xl object-cover border border-borderColor flex-shrink-0"
                      />
                      <div className="max-w-[220px]">
                        <h4 className="font-bold text-textPrimary text-xs truncate group-hover:text-primary transition-colors">
                          {p.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-textSecondary mt-0.5">
                          <span className="capitalize">{p.category}</span>
                          {p.sku && <span>• {p.sku}</span>}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Format */}
                  <td className="p-4">
                    <span className="capitalize font-semibold text-textSecondary">
                      {p.sellerType === 'individual_c2c' ? 'C2C Used' : 'Retail'}
                    </span>
                  </td>

                  {/* Unit Price */}
                  <td className="p-4 font-bold text-textPrimary">
                    ₹{p.price.toLocaleString('en-IN')}
                  </td>

                  {/* Total Value */}
                  <td className="p-4 font-black text-primary">
                    ₹{(p.price * p.stock).toLocaleString('en-IN')}
                  </td>

                  {/* Health Indicator */}
                  <td className="p-4">
                    <div className="space-y-1.5 max-w-[120px]">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span
                          className={
                            p.stock === 0
                              ? 'text-red-500'
                              : p.stock <= 5
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {p.stock === 0 ? 'Empty' : p.stock <= 5 ? 'Low Stock' : 'Optimal'}
                        </span>
                        <span className="text-textSecondary">{p.stock} pcs</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-borderColor">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            p.stock === 0
                              ? 'bg-red-500 w-0'
                              : p.stock <= 5
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${Math.min(100, (p.stock / 20) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Inline Stock Counter (+ / -) */}
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-surface border border-borderColor p-1 rounded-xl">
                      <button
                        onClick={() => updateStock(p.id, Math.max(0, p.stock - 1))}
                        className="w-7 h-7 rounded-lg bg-surface border border-borderColor text-textSecondary hover:text-textPrimary hover:bg-bgSecondary flex items-center justify-center font-bold transition-colors"
                        title="Decrease 1 unit"
                      >
                        <FiMinus size={12} />
                      </button>
                      <span className="w-10 text-center font-black text-textPrimary text-xs font-mono">
                        {p.stock}
                      </span>
                      <button
                        onClick={() => updateStock(p.id, p.stock + 1)}
                        className="w-7 h-7 rounded-lg bg-surface border border-borderColor text-textSecondary hover:text-textPrimary hover:bg-bgSecondary flex items-center justify-center font-bold transition-colors"
                        title="Increase 1 unit"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setStockModalProduct(p)}
                      className="px-3 py-1.5 rounded-xl bg-surface border border-borderColor text-textSecondary hover:text-primary hover:bg-bgSecondary font-bold transition-all text-xs inline-flex items-center gap-1.5"
                    >
                      <FiSliders size={12} />
                      <span>Custom Qty</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 6. Modal ────────────────────────────────────────────────────────── */}
      <QuickStockModal
        product={stockModalProduct}
        isOpen={!!stockModalProduct}
        onClose={() => setStockModalProduct(null)}
      />
    </div>
  );
};

export default SellerInventory;
