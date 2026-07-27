import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { 
  FiHeart, FiShoppingCart, FiTrash2, FiChevronRight, 
  FiStar, FiShare2, FiEye, FiActivity 
} from 'react-icons/fi';

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart, showToast } = useContext(AppContext);
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const handleShareProduct = (e, product) => {
    e.stopPropagation();
    const link = `${window.location.origin}/product/${product.id}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        showToast(`Copied link for ${product.brand} ${product.title.split(' ')[1]} to clipboard!`);
      })
      .catch(() => {
        showToast('Failed to copy product link.', 'error');
      });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left py-6">
      {/* Breadcrumb Page Header */}
      <div className="border-b border-white/5 pb-6">
        <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-2">
          <Link to="/" className="hover:underline">Home</Link>
          <FiChevronRight className="text-gray-600" />
          <span className="text-white">Wishlist</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <FiHeart className="text-primary fill-current text-3xl animate-pulse" />
          <span>My Wishlist ({wishlist.length} items)</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage and purchase your saved premium items.</p>
      </div>

      {/* Wishlist Items Shelf */}
      {wishlist.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center max-w-md mx-auto space-y-6 border border-white/5 shadow-2xl bg-[#0c111d]/40 backdrop-blur-xl">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20">
            <FiHeart size={42} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Your Wishlist is Empty</h2>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">Explore our catalog and click the heart icon on any product to save it here.</p>
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="w-full btn-glow-yellow text-xs font-bold py-3.5 rounded-xl uppercase tracking-wider"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <motion.div 
          layout 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {wishlist.map((prod, index) => {
              const discountPercent = prod.mrp > prod.price 
                ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100) 
                : 0;
              const isOutOfStock = (prod.stock || 0) <= 0;
              const isLowStock = prod.stock > 0 && prod.stock <= 3;

              return (
                <motion.div 
                  key={prod.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="bg-cardBg border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover-lift transition-all h-[420px] relative group"
                >
                  <div className="space-y-3">
                    {/* Product Photo */}
                    <div 
                      onClick={() => navigate(`/product/${prod.id}`)}
                      className="h-44 rounded-xl overflow-hidden bg-black/20 cursor-pointer relative"
                    >
                      <img 
                        src={prod.image} 
                        alt={prod.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      
                      {/* Floating actions */}
                      <div className="absolute top-2.5 right-2.5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={(e) => handleShareProduct(e, prod)}
                          className="p-2 rounded-full border border-white/10 bg-black/60 hover:bg-black/80 text-white transition-all active:scale-90"
                          title="Share Product"
                        >
                          <FiShare2 size={12} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${prod.id}`);
                          }}
                          className="p-2 rounded-full border border-white/10 bg-black/60 hover:bg-black/80 text-white transition-all active:scale-90"
                          title="Quick View"
                        >
                          <FiEye size={12} />
                        </button>
                      </div>

                      {/* Discount Badge */}
                      {discountPercent > 0 && (
                        <span className="absolute bottom-2.5 left-2.5 bg-red-500 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full">
                          -{discountPercent}% OFF
                        </span>
                      )}
                    </div>
                    
                    {/* Details Info */}
                    <div className="text-left space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-primary uppercase font-extrabold tracking-widest">{prod.brand}</span>
                        {/* Rating stars */}
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                          <FiStar className="fill-current" />
                          <span>{prod.rating || 4.5}</span>
                          <span className="text-gray-500">({prod.reviewsCount || 120})</span>
                        </div>
                      </div>
                      
                      <h3 
                        onClick={() => navigate(`/product/${prod.id}`)}
                        className="text-xs font-bold text-white line-clamp-2 hover:text-primary transition-all cursor-pointer leading-relaxed h-8"
                      >
                        {prod.title}
                      </h3>

                      {/* Stock Status Badge */}
                      <div className="pt-0.5">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-500/20">
                            🔴 Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-500/20">
                            🟡 Only {prod.stock} Left
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-500/20">
                            🟢 In Stock
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-sm font-black text-white">₹{prod.price.toLocaleString('en-IN')}</span>
                        {prod.mrp > prod.price && (
                          <span className="text-[10px] text-gray-500 line-through">₹{prod.mrp.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="grid grid-cols-5 gap-2 pt-4 border-t border-white/5 mt-4">
                    <button 
                      onClick={() => handleAddToCart(prod)}
                      disabled={isOutOfStock}
                      className="col-span-4 btn-glow-yellow !py-2.5 text-[10px] text-black font-extrabold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed btn-premium-interactive"
                    >
                      <FiShoppingCart size={12} />
                      <span>Add To Cart</span>
                    </button>
                    <button 
                      onClick={() => toggleWishlist(prod)}
                      className="col-span-1 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 active:scale-95 transition-all flex items-center justify-center"
                      title="Remove from Wishlist"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Wishlist;
