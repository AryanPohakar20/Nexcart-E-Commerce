import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { FiHeart, FiShoppingCart, FiTrash2, FiChevronRight } from 'react-icons/fi';

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart } = useContext(AppContext);
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-6 text-left">
        <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-2">
          <Link to="/" className="hover:underline">Home</Link>
          <FiChevronRight />
          <span className="text-white">Wishlist</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <FiHeart className="text-primary fill-current" />
          <span>My Wishlist ({wishlist.length} items)</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Keep track of your favorite premium items.</p>
      </div>

      {/* Wishlist Items Shelf */}
      {wishlist.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto space-y-6 border border-white/5 shadow-2xl">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20">
            <FiHeart size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">Your Wishlist is Empty</h2>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">Add products to your wishlist to buy them later or share them with friends.</p>
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="w-full btn-glow-yellow text-xs font-bold py-3"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {wishlist.map((prod) => (
              <motion.div 
                key={prod.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-cardBg border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover-lift transition-all h-[360px]"
              >
                <div className="space-y-3">
                  {/* Product Photo */}
                  <div 
                    onClick={() => navigate(`/product/${prod.id}`)}
                    className="h-40 rounded-xl overflow-hidden bg-black/20 cursor-pointer"
                  >
                    <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Info details */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-primary uppercase font-bold tracking-widest leading-none">{prod.brand}</span>
                    <h3 
                      onClick={() => navigate(`/product/${prod.id}`)}
                      className="text-xs font-semibold text-white truncate hover:text-primary transition-all cursor-pointer"
                    >
                      {prod.title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-extrabold text-white">₹{prod.price.toLocaleString('en-IN')}</span>
                      {prod.mrp > prod.price && (
                        <span className="text-[10px] text-gray-500 line-through">₹{prod.mrp.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action triggers */}
                <div className="grid grid-cols-5 gap-2 pt-4 border-t border-white/5">
                  <button 
                    onClick={() => handleAddToCart(prod)}
                    disabled={prod.stock <= 0}
                    className="col-span-4 btn-glow-yellow !py-2 text-[10px] text-black font-semibold rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-40 btn-premium-interactive"
                  >
                    <FiShoppingCart size={11} />
                    <span>Add Cart</span>
                  </button>
                  <button 
                    onClick={() => toggleWishlist(prod)}
                    className="col-span-1 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 active:scale-95 transition-all flex items-center justify-center"
                    title="Remove from Wishlist"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Wishlist;
