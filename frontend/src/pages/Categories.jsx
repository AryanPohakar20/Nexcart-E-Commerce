import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../constants/dummyData';
import { FiChevronRight, FiFolder } from 'react-icons/fi';

const Categories = () => {
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
        <p className="text-xs text-gray-500 mt-1">Explore our range of futuristic items curated across multiple categories.</p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {CATEGORIES.map((cat) => (
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
                <span className="text-[10px] text-gray-500 font-semibold">{cat.count} listings operational</span>
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
