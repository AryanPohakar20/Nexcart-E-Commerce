import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiClock, FiTag, FiRefreshCw } from 'react-icons/fi';
import marketplaceService from '../services/marketplaceService';

const Marketplace = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Vehicles', 'Others'];

  useEffect(() => {
    let isMounted = true;
    const fetchMarketplace = async () => {
      setLoading(true);
      try {
        const res = await marketplaceService.getListings({ limit: 100 });
        if (isMounted && res?.data?.listings) {
          setProducts(res.data.listings);
        }
      } catch (error) {
        console.error('Failed to load C2C marketplace listings', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMarketplace();
    return () => { isMounted = false; };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      result = result.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== 'All') {
      const sel = selectedCategory.toLowerCase();
      result = result.filter(p => {
        const cat = (p.category || '').toLowerCase();
        if (sel === 'electronics') return cat.includes('electronic') || cat.includes('mobile') || cat.includes('audio') || cat.includes('wearable') || cat.includes('laptop') || cat.includes('tech');
        if (sel === 'fashion') return cat.includes('fashion') || cat.includes('apparel') || cat.includes('clothing') || cat.includes('beauty');
        if (sel === 'home') return cat.includes('home') || cat.includes('living') || cat.includes('kitchen') || cat.includes('appliance');
        if (sel === 'vehicles') return cat.includes('vehicle') || cat.includes('car') || cat.includes('bike') || cat.includes('auto');
        return cat.includes(sel);
      });
    }
    return result;
  }, [products, searchQ, selectedCategory]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Community Marketplace</h1>
          <p className="text-gray-400 text-sm mt-1">Buy and sell items locally with real people.</p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search marketplace..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary shadow-inner transition-all"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
              selectedCategory === cat 
                ? 'bg-primary text-black shadow-lg shadow-primary/30 scale-105' 
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-primary">
          <FiRefreshCw className="animate-spin text-4xl mb-4" />
          <p className="text-gray-400 font-semibold animate-pulse">Loading marketplace...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const listingId = product.id || product._id;
            return (
            <div 
              key={listingId} 
              className="bg-[#18181b]/80 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 group cursor-pointer flex flex-col hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
              onClick={() => navigate(`/marketplace/product/${listingId}`)}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
                <img 
                  src={product.image || (product.images?.length > 0 ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) : 'https://via.placeholder.com/400')} 
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-white/20 shadow-lg">
                  {product.condition || 'Used'}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-white font-bold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.title}</h3>
                <div className="text-xl font-black text-white mb-4">
                  ₹{product.price?.toLocaleString()}
                </div>
                
                <div className="mt-auto space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <FiTag className="text-primary/70 shrink-0" />
                    <span className="truncate">{product.category}</span>
                  </div>
                  {product.location && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <FiMapPin className="text-primary/70 shrink-0" />
                      <span className="truncate">{product.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 pt-4 border-t border-white/5 font-semibold">
                    <FiClock className="shrink-0" />
                    <span>Posted {formatDate(product.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <FiSearch className="text-2xl text-gray-400" />
          </div>
          <p className="text-gray-300 font-bold mb-1">No products found</p>
          <p className="text-sm text-gray-500">Try adjusting your search or category filters.</p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
