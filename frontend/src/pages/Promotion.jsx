import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiZap } from 'react-icons/fi';
import { PRODUCTS } from '../constants/dummyData';
import ProductGrid from '../components/ProductGrid';

const Promotion = () => {
  const featured = PRODUCTS.slice(0, 12);

  return (
    <div className="space-y-10 text-left">
      <div className="relative overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 via-cardBg to-cardBg p-8 md:p-12">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="relative space-y-4 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-bold uppercase tracking-widest">
            <FiZap className="animate-pulse" /> Limited Time
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Mega <span className="text-yellow-400">Sale</span> is Live
          </h1>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed">
            Unbeatable deals across electronics, fashion, and AI gadgets. Offers valid while stocks last.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/products" className="px-5 py-2.5 rounded-xl bg-yellow-500 text-black text-xs font-bold hover:bg-yellow-400 transition-all shadow-[0_0_15px_rgba(255,193,7,0.3)]">
              Shop All Deals
            </Link>
            <Link to="/categories" className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-gray-200 hover:bg-white/10 transition-all">
              Browse Categories
            </Link>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-4">
          <Link to="/" className="hover:underline">Home</Link>
          <FiChevronRight />
          <span className="text-white">Promotion</span>
        </div>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Promo Picks</h2>
            <p className="text-xs text-gray-500 mt-1">Hand-picked deals at irresistible prices.</p>
          </div>
        </div>
        <ProductGrid products={featured} />
      </div>
    </div>
  );
};

export default Promotion;
