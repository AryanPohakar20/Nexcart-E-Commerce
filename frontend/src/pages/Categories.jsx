import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../constants/dummyData';
import { FiChevronRight, FiFolder } from 'react-icons/fi';
import productService from '../services/productService';

const Categories = () => {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        const res = await productService.getCategories();
        if (res?.data?.categories && res.data.categories.length > 0 && isMounted) {
          const mapped = res.data.categories.map((c) => {
            const matched = DEFAULT_CATEGORIES.find(
              (dc) => dc.id.toLowerCase() === c.slug?.toLowerCase() || dc.name.toLowerCase() === c.name?.toLowerCase()
            );
            return {
              id: c.slug || c._id,
              name: c.name,
              image: c.image || matched?.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80',
              count: c.productCount || matched?.count || 25,
            };
          });
          setCategories(mapped);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8 text-left">
      {/* Breadcrumb Header */}
      <div className="border-b border-white/5 pb-6">
        <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-2">
          <Link to="/" className="hover:underline">Home</Link>
          <FiChevronRight />
          <span className="text-white">Categories</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <FiFolder className="text-primary" />
          <span>All Categories</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Explore our range of futuristic items curated across multiple categories in MongoDB.</p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link 
            key={cat.id} 
            to={`/category/${cat.id}`}
            className="group bg-cardBg border border-white/5 rounded-3xl overflow-hidden hover:border-primary/20 hover:shadow-yellow-glow duration-300 transition-all hover-lift flex flex-col justify-between h-56 relative"
          >
            {/* Header image overlay */}
            <div className="h-36 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#202020] to-transparent z-10" />
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>

            {/* Category details info */}
            <div className="p-5 relative z-20 flex justify-between items-center bg-[#202020]">
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-primary transition-all">{cat.name}</h3>
                <span className="text-[10px] text-gray-500 font-semibold">{cat.count || 10}+ listings operational</span>
              </div>
              <div className="p-2 bg-white/5 group-hover:bg-primary group-hover:text-black rounded-full transition-all">
                <FiChevronRight size={14} />
              </div>
            </div>

          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;
