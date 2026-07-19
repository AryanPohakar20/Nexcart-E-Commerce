import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FiHeart, FiEye, FiActivity, FiShoppingCart, FiStar, FiX } from 'react-icons/fi';

const ProductCard = ({ product }) => {
  const { addToCart, wishlist, toggleWishlist, toggleCompare, comparedProducts } = useContext(AppContext);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const navigate = useNavigate();

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const isCompared = comparedProducts.some(item => item.id === product.id);
  const hasStock = product.stock > 0;

  const handleCardClick = (e) => {
    // Avoid triggering navigation when action buttons are clicked
    if (e.target.closest('.card-action-btn')) return;
    navigate(`/product/${product.id}`);
  };

  const handleBuyNow = () => {
    if (hasStock) {
      addToCart(product, 1);
      navigate('/cart');
    }
  };

  return (
    <>
      {/* Product Display Card */}
      <div 
        onClick={handleCardClick}
        className="group relative bg-cardBg rounded-2xl overflow-hidden border border-white/5 shadow-lg hover:border-primary/20 hover:shadow-yellow-glow hover-lift cursor-pointer flex flex-col justify-between h-[450px]"
      >
        
        {/* Upper Image Section */}
        <div className="relative h-48 w-full bg-black/30 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Discount Badge */}
          {product.discount > 0 && (
            <span className="absolute top-3 left-3 bg-primary text-black text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-md badge-glow">
              {product.discount}% OFF
            </span>
          )}

          {/* Action Floating Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
              className={`card-action-btn p-2 rounded-full border shadow-md transition-all ${
                isWishlisted 
                  ? 'bg-primary border-primary text-black' 
                  : 'bg-black/60 border-white/10 text-white hover:text-primary hover:bg-black/80'
              }`}
              title="Add to Wishlist"
            >
              <FiHeart className={isWishlisted ? 'fill-current' : ''} size={15} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsQuickViewOpen(true); }}
              className="card-action-btn p-2 rounded-full bg-black/60 border border-white/10 text-white hover:text-primary hover:bg-black/80 shadow-md transition-all"
              title="Quick View"
            >
              <FiEye size={15} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleCompare(product); }}
              className={`card-action-btn p-2 rounded-full border shadow-md transition-all ${
                isCompared 
                  ? 'bg-accentBlue border-accentBlue text-black animate-pulse' 
                  : 'bg-black/60 border-white/10 text-white hover:text-accentBlue hover:bg-black/80'
              }`}
              title="Compare Product"
            >
              <FiActivity size={15} />
            </button>
          </div>

          {/* Out of Stock banner overlay */}
          {!hasStock && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center">
              <span className="border border-red-500 text-red-500 px-3 py-1 text-xs uppercase font-extrabold tracking-widest rounded-lg">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Lower Info Details */}
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
              <span>{product.brand}</span>
              <span className={hasStock ? 'text-green-500' : 'text-red-500'}>
                {hasStock ? 'In Stock' : 'Sold Out'}
              </span>
            </div>
            
            <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-all line-clamp-2 h-10">
              {product.title}
            </h3>

            {/* Ratings stars */}
            <div className="flex items-center gap-1.5 pt-1">
              <div className="flex items-center text-primary text-xs">
                <FiStar className="fill-current" />
                <span className="font-bold text-xs ml-0.5">{product.rating}</span>
              </div>
              <span className="text-[10px] text-gray-500 font-medium">({product.reviewsCount} reviews)</span>
            </div>
          </div>

          {/* Pricing area */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-white">₹{product.price.toLocaleString('en-IN')}</span>
              {product.mrp > product.price && (
                <span className="text-xs text-gray-500 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
              )}
            </div>

            {/* Bottom Call To Action */}
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); if (hasStock) addToCart(product, 1); }}
                disabled={!hasStock}
                className="card-action-btn py-2 border border-white/10 hover:border-primary/40 rounded-lg text-xs font-semibold text-gray-300 hover:text-primary active:scale-95 transition-all flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiShoppingCart size={13} />
                <span>Add Cart</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleBuyNow(); }}
                disabled={!hasStock}
                className="card-action-btn btn-glow-yellow !py-2 text-xs text-black font-semibold rounded-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Quick View Modal Overlay */}
      {isQuickViewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full rounded-2xl border border-white/10 overflow-hidden relative animate-scale-up">
            
            <button 
              onClick={() => setIsQuickViewOpen(false)}
              className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full border border-white/10 text-white hover:text-primary transition-all z-10"
            >
              <FiX size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <img src={product.image} alt={product.title} className="w-full h-64 md:h-full object-cover bg-black/30" />
              
              <div className="p-6 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] text-primary uppercase font-bold tracking-widest">{product.brand}</span>
                  <h2 className="text-lg font-bold text-white mt-1 leading-tight">{product.title}</h2>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">{product.description}</p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xl font-black text-white">₹{product.price.toLocaleString('en-IN')}</span>
                    {product.mrp > product.price && (
                      <span className="text-xs text-gray-500 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-white/5">
                  <p className="text-[10px] text-gray-400 font-semibold">{product.delivery}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => { addToCart(product, 1); setIsQuickViewOpen(false); }}
                      disabled={!hasStock}
                      className="py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:border-primary/50 hover:text-primary transition-all disabled:opacity-40"
                    >
                      Add To Cart
                    </button>
                    <button 
                      onClick={() => { handleBuyNow(); setIsQuickViewOpen(false); }}
                      disabled={!hasStock}
                      className="btn-glow-yellow !py-2.5 text-xs text-black font-bold"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
