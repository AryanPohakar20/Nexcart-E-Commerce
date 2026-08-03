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
      <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden border border-gray-200 dark:border-white/5 shadow-2xl flex items-center bg-gray-50 dark:bg-black/40 transition-colors duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-black dark:via-black/70 dark:to-transparent z-10 transition-all duration-500" />
        <img src={categoryInfo.image} alt={categoryInfo.name} className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-50" />
        
        <div className="relative z-20 px-6 md:px-12 space-y-2 text-left">
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
            <Link to="/" className="hover:underline">Home</Link>
            <FiChevronRight />
            <span className="text-slate-800 dark:text-white transition-colors duration-500">Category</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight transition-colors duration-500">{categoryInfo.name}</h1>
          <p className="text-xs md:text-sm text-slate-700 dark:text-gray-400 font-medium transition-colors duration-500">Explore top-notch {categoryInfo.name.toLowerCase()} catalog at NexCart.</p>
        </div>
      </div>

      {/* Grid listing */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 transition-colors duration-500">
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
