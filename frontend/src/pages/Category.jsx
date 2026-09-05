import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../constants/dummyData';
import ProductGrid from '../components/ProductGrid';
import { FiChevronRight, FiFolder, FiRefreshCw } from 'react-icons/fi';
import productService from '../services/productService';

const Category = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState({
    name: id ? id.replace(/-/g, ' ').toUpperCase() : 'Category Catalog',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80',
    description: 'Browse premium collections.',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getProducts({ category: id, limit: 100 }).catch(() => null),
          productService.getCategories().catch(() => null),
        ]);

        if (isMounted) {
          if (prodRes?.data?.products) {
            setProducts(prodRes.data.products);
          }

          const matchedDefault = DEFAULT_CATEGORIES.find(
            (c) => c.id.toLowerCase() === id?.toLowerCase() || c.name.toLowerCase() === id?.toLowerCase()
          );

          if (catRes?.data?.categories) {
            const matchedDb = catRes.data.categories.find(
              (c) => c.slug === id || c._id === id || c.name.toLowerCase() === id?.toLowerCase()
            );
            if (matchedDb) {
              setCategoryInfo({
                name: matchedDb.name,
                image: matchedDb.image || matchedDefault?.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80',
                description: matchedDb.description || 'Browse premium collections.',
              });
            } else if (matchedDefault) {
              setCategoryInfo(matchedDefault);
            }
          } else if (matchedDefault) {
            setCategoryInfo(matchedDefault);
          }
        }
      } catch (err) {
        console.error('Failed to load category products:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategoryData();
    return () => {
      isMounted = false;
    };
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
            <span>Items Grid ({products.length})</span>
          </h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FiRefreshCw className="animate-spin text-3xl text-primary mb-3" />
            <p className="text-gray-400 font-semibold">Loading category products...</p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>

    </div>
  );
};

export default Category;
