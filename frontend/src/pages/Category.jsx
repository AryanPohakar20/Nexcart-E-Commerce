import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS, CATEGORIES } from '../constants/dummyData';
import ProductGrid from '../components/ProductGrid';
import { FiChevronRight, FiFolder } from 'react-icons/fi';

const Category = () => {
  const { id } = useParams();

  const categoryInfo = useMemo(() => {
    return CATEGORIES.find(c => c.id === id) || { name: 'Category Catalog', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80', description: 'Browse premium collections.' };
  }, [id]);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => p.category === id);
  }, [id]);

  return (
    <div className="space-y-8">
      {/* Category Hero Header Banner */}
      <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex items-center bg-black/40">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
        <img src={categoryInfo.image} alt={categoryInfo.name} className="absolute inset-0 w-full h-full object-cover opacity-50" />
        
        <div className="relative z-20 px-6 md:px-12 space-y-2 text-left">
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
            <Link to="/" className="hover:underline">Home</Link>
            <FiChevronRight />
            <span className="text-white">Category</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{categoryInfo.name}</h1>
          <p className="text-xs md:text-sm text-gray-400 font-medium">Explore top-notch {categoryInfo.name.toLowerCase()} catalog at NexCart.</p>
        </div>
      </div>

      {/* Grid listing */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FiFolder className="text-primary" />
            <span>Items Grid ({filteredProducts.length})</span>
          </h3>
        </div>

        <ProductGrid products={filteredProducts} />
      </div>

    </div>
  );
};

export default Category;
