import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { SELLER_STATS, CATEGORIES } from '../constants/dummyData';
import { FiDollarSign, FiShoppingBag, FiUsers, FiArchive, FiPlus, FiCheck, FiPackage, FiBarChart2 } from 'react-icons/fi';

const SellerDashboard = () => {
  const { showToast } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, products, orders
  
  // Local state for products vendor manages
  const [vendorProducts, setVendorProducts] = useState([
    { id: 'vp1', title: 'Apple iPhone 15 Pro Max', price: 139900, stock: 12, category: 'mobiles' },
    { id: 'vp2', title: 'Sony WH-1000XM5 Wireless Headphones', price: 24999, stock: 8, category: 'electronics' },
    { id: 'vp3', title: 'Nike Air Max Pulse Lifestyle Sneakers', price: 13999, stock: 25, category: 'fashion' }
  ]);

  // Form input states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProd, setNewProd] = useState({ title: '', price: '', stock: '', category: 'electronics' });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (newProd.title && newProd.price && newProd.stock) {
      const added = {
        id: `vp-${Date.now()}`,
        title: newProd.title,
        price: Number(newProd.price),
        stock: Number(newProd.stock),
        category: newProd.category
      };
      setVendorProducts(prev => [...prev, added]);
      setNewProd({ title: '', price: '', stock: '', category: 'electronics' });
      setIsAddOpen(false);
      showToast('Product Listing Published successfully!');
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="border-b border-white/5 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Seller Control Panel</h1>
          <p className="text-xs text-gray-500 mt-1">Configure listings, review payouts, and check client receipts.</p>
        </div>

        {/* Dashboard Tabs switcher */}
        <div className="flex bg-white/5 border border-white/5 rounded-xl p-1 text-xs">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'analytics' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'products' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
          >
            My Products
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'orders' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Vendor Orders
          </button>
        </div>
      </div>

      {/* Tabs panels */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Summary metrics widgets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-cardBg border border-white/5 p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                <span>Revenue</span>
                <FiDollarSign className="text-primary text-base" />
              </div>
              <p className="text-2xl font-black text-white">₹{(SELLER_STATS.revenue).toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-green-400 font-bold">+18.4% this month</span>
            </div>

            <div className="bg-cardBg border border-white/5 p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                <span>Total Orders</span>
                <FiShoppingBag className="text-primary text-base" />
              </div>
              <p className="text-2xl font-black text-white">{SELLER_STATS.ordersCount}</p>
              <span className="text-[10px] text-green-400 font-bold">+12 new today</span>
            </div>

            <div className="bg-cardBg border border-white/5 p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                <span>Customers</span>
                <FiUsers className="text-primary text-base" />
              </div>
              <p className="text-2xl font-black text-white">{SELLER_STATS.customersCount}</p>
              <span className="text-[10px] text-primary font-bold">98 premium buyers</span>
            </div>

            <div className="bg-cardBg border border-white/5 p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                <span>Inventory</span>
                <FiArchive className="text-primary text-base" />
              </div>
              <p className="text-2xl font-black text-white">{SELLER_STATS.inventoryCount}</p>
              <span className="text-[10px] text-yellow-500 font-bold">14 low stock items</span>
            </div>
          </div>

          {/* SVG Sales analytics chart & Recent orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Chart */}
            <div className="lg:col-span-2 bg-cardBg border border-white/5 p-6 rounded-3xl space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FiBarChart2 className="text-primary" />
                <span>Monthly Revenue Analysis</span>
              </h3>
              
              {/* SVG mock bar graph */}
              <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-white/5">
                {SELLER_STATS.monthlySales.map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="text-[9px] text-gray-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{Math.round(item.sales / 1000)}K
                    </div>
                    {/* Dynamic height based on sale figures */}
                    <div 
                      style={{ height: `${(item.sales / 420000) * 100}%` }}
                      className="w-full bg-primary/20 group-hover:bg-primary border border-primary/20 group-hover:border-primary rounded-t-lg transition-all cursor-pointer min-h-[10px]"
                    />
                    <span className="text-[10px] font-bold text-gray-400 pb-2">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders List summary */}
            <div className="lg:col-span-1 bg-cardBg border border-white/5 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Orders</h3>
              <div className="divide-y divide-white/5 space-y-3">
                {SELLER_STATS.recentOrders.map((ord) => (
                  <div key={ord.id} className="pt-3 first:pt-0 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">{ord.id}</span>
                      <span className="text-primary">₹{ord.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Buyer: {ord.customer}</p>
                    <div className="flex items-center justify-between mt-1 text-[9px]">
                      <span className="text-gray-500">{ord.date}</span>
                      <span className="bg-primary/10 border border-primary/20 text-primary px-1.5 rounded">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FiPackage className="text-primary" />
              <span>Published Listings ({vendorProducts.length})</span>
            </h3>
            <button 
              onClick={() => setIsAddOpen(!isAddOpen)}
              className="btn-glow-yellow text-xs font-semibold py-2 flex items-center gap-1.5"
            >
              <FiPlus />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Add Product form slider */}
          {isAddOpen && (
            <form onSubmit={handleAddProduct} className="bg-cardBg border border-white/10 p-6 rounded-3xl grid grid-cols-2 gap-4 text-xs">
              <div className="col-span-2">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Publish New Catalog Listing</h4>
              </div>
              <div className="col-span-2">
                <label className="block text-gray-500 mb-1 font-bold">Product Title</label>
                <input 
                  type="text" 
                  value={newProd.title}
                  onChange={(e) => setNewProd(p => ({ ...p, title: e.target.value }))}
                  placeholder="Nike Air Jordan Custom sneakers" 
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Price (INR)</label>
                <input 
                  type="number" 
                  value={newProd.price}
                  onChange={(e) => setNewProd(p => ({ ...p, price: e.target.value }))}
                  placeholder="24999" 
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Stock Capacity</label>
                <input 
                  type="number" 
                  value={newProd.stock}
                  onChange={(e) => setNewProd(p => ({ ...p, stock: e.target.value }))}
                  placeholder="15" 
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50" 
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-500 mb-1 font-bold">Product Category</label>
                <select
                  value={newProd.category}
                  onChange={(e) => setNewProd(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-cardBg border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50 cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="col-span-2 btn-glow-yellow !py-2.5 text-xs text-black font-bold">
                Publish Product Listing
              </button>
            </form>
          )}

          {/* Grid lists */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vendorProducts.map((p) => (
              <div key={p.id} className="bg-cardBg border border-white/5 p-5 rounded-3xl text-xs space-y-3 relative overflow-hidden">
                <span className="absolute top-4 right-4 bg-primary/10 border border-primary/20 text-primary text-[8px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-full">
                  {p.category}
                </span>
                <h4 className="font-extrabold text-white text-sm line-clamp-1 pr-16">{p.title}</h4>
                <div className="flex justify-between items-center text-gray-400 font-bold border-t border-white/5 pt-3">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Price</p>
                    <p className="text-white text-sm">₹{p.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Units Available</p>
                    <p className={p.stock < 10 ? 'text-yellow-500 text-sm' : 'text-green-500 text-sm'}>{p.stock} units</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-cardBg border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-400 uppercase font-extrabold tracking-wider border-b border-white/5">
                  <th className="p-4">OrderID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Listing Title</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {SELLER_STATS.recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white">{ord.id}</td>
                    <td className="p-4 text-gray-300 font-medium">{ord.customer}</td>
                    <td className="p-4 text-gray-300 truncate max-w-[150px] font-medium">{ord.product}</td>
                    <td className="p-4 text-gray-500">{ord.date}</td>
                    <td className="p-4 font-extrabold text-white">₹{ord.amount.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right">
                      <span className="bg-primary/10 border border-primary/20 text-primary text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default SellerDashboard;
