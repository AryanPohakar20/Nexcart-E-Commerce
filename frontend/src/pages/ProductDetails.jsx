import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { PRODUCTS } from '../constants/dummyData';
import { FiStar, FiHeart, FiActivity, FiShoppingCart, FiTruck, FiShield, FiRefreshCw, FiChevronDown } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
  const id = useParams().id;
  const navigate = useNavigate();
  const { addToCart, wishlist, toggleWishlist, toggleCompare, comparedProducts, showToast } = useContext(AppContext);

  // Retrieve current product
  const product = useMemo(() => {
    return PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
  }, [id]);

  // Gallery view State
  const [selectedImage, setSelectedImage] = useState(product.image);
  
  // Sync image when product changes
  useEffect(() => {
    setSelectedImage(product.image);
  }, [product]);

  // Quantity Selector state
  const [quantity, setQuantity] = useState(1);

  // Custom Accordions state
  const [activeTab, setActiveTab] = useState('specs'); // specs, shipping, reviews
  
  // Localized Reviews addition state (Mock adding reviews)
  const [reviewsList, setReviewsList] = useState(product.reviews || []);
  const [newReview, setNewReview] = useState({ user: '', rating: 5, comment: '' });

  // 3D image tilt & magnifier states
  const [imgRotate, setImgRotate] = useState({ x: 0, y: 0 });
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center', scale: 1 });

  const handleImgMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Rotate calculations (3D Tilt)
    const rotateX = (y - 0.5) * -12; // tilt max 12 degrees
    const rotateY = (x - 0.5) * 12;
    setImgRotate({ x: rotateX, y: rotateY });

    // Magnifier origin calculation
    const originX = x * 100;
    const originY = y * 100;
    setZoomStyle({
      transformOrigin: `${originX}% ${originY}%`,
      scale: 1.55
    });
  };

  const handleImgMouseLeave = () => {
    setImgRotate({ x: 0, y: 0 });
    setZoomStyle({ transformOrigin: 'center', scale: 1 });
  };

  useEffect(() => {
    setReviewsList(product.reviews || []);
  }, [product]);

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const isCompared = comparedProducts.some(item => item.id === product.id);
  const hasStock = product.stock > 0;

  const handleAddToCart = () => {
    if (hasStock) {
      addToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (hasStock) {
      addToCart(product, quantity);
      navigate('/cart');
    }
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (newReview.user.trim() && newReview.comment.trim()) {
      const added = {
        id: `rev-${Date.now()}`,
        user: newReview.user,
        rating: Number(newReview.rating),
        comment: newReview.comment,
        date: new Date().toISOString().split('T')[0]
      };
      setReviewsList(prev => [added, ...prev]);
      setNewReview({ user: '', rating: 5, comment: '' });
      showToast('Thank you! Review published successfully.');
    }
  };

  // Get Related Products
  const relatedProducts = useMemo(() => {
    return PRODUCTS.filter(p => p.category === product.category && p.id !== product.id);
  }, [product]);

  return (
    <div className="space-y-12">
      {/* 1. Main Product Overview Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Left Column: Image Gallery Viewer */}
        <div className="space-y-4">
          <motion.div 
            onMouseMove={handleImgMouseMove}
            onMouseLeave={handleImgMouseLeave}
            animate={{ rotateX: imgRotate.x, rotateY: imgRotate.y }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-black/30 rounded-2xl overflow-hidden border border-white/5 h-[350px] md:h-[450px] cursor-zoom-in relative"
            style={{ perspective: 1000 }}
          >
            <motion.img 
              src={selectedImage} 
              alt={product.title} 
              className="w-full h-full object-cover select-none"
              style={{ ...zoomStyle }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          </motion.div>

          {/* Thumbnails list */}
          <div className="flex gap-3">
            <button 
              onClick={() => setSelectedImage(product.image)}
              className={`w-20 h-20 bg-black/40 rounded-xl overflow-hidden border-2 transition-all ${
                selectedImage === product.image ? 'border-primary' : 'border-white/5 hover:border-white/20'
              }`}
            >
              <img src={product.image} alt="main" className="w-full h-full object-cover" />
            </button>
            {/* Added secondary dummy thumbnail to make it premium */}
            <button 
              onClick={() => setSelectedImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80')}
              className={`w-20 h-20 bg-black/40 rounded-xl overflow-hidden border-2 transition-all ${
                selectedImage === 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80' ? 'border-primary' : 'border-white/5 hover:border-white/20'
              }`}
            >
              <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80" alt="spec" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        {/* Right Column: Details Info Panel */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-widest font-bold">
              <span>{product.brand}</span>
              <span className={hasStock ? 'text-green-500' : 'text-red-500 font-bold'}>
                {hasStock ? `In Stock (${product.stock} left)` : 'Sold Out'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
              {product.title}
            </h1>

            {/* Ratings stars */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-primary text-sm">
                <FiStar className="fill-current" />
                <span className="font-bold ml-1 text-sm">{product.rating}</span>
              </div>
              <span className="text-xs text-gray-500 font-semibold">|</span>
              <span className="text-xs text-gray-400 font-semibold">{reviewsList.length} Global Reviews</span>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              {product.description}
            </p>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-black text-white">₹{product.price.toLocaleString('en-IN')}</span>
              {product.mrp > product.price && (
                <span className="text-sm text-gray-500 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
              )}
              {product.discount > 0 && (
                <span className="text-xs text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  {product.discount}% Save
                </span>
              )}
            </div>

            {/* Delivery estimates details */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <FiTruck className="text-primary text-base flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Fast Shipping</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Delivery by tomorrow</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <FiShield className="text-primary text-base flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Warranty</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">1 Year Brand Warranty</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <FiRefreshCw className="text-primary text-base flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Easy Returns</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">7 days replacement policy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Shelf */}
          <div className="space-y-4 pt-6 border-t border-white/5">
            {hasStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400">Quantity:</span>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 hover:bg-white/10 text-white font-bold transition-all text-xs"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-white min-w-[36px] text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className="px-3 py-1.5 hover:bg-white/10 text-white font-bold transition-all text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Checkout buttons and action tags */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleAddToCart}
                disabled={!hasStock}
                className="flex-1 py-3 bg-white/5 border border-white/10 hover:border-primary/40 rounded-xl text-sm font-bold text-gray-300 hover:text-primary active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiShoppingCart />
                <span>Add to Cart</span>
              </button>
              
              <button 
                onClick={handleBuyNow}
                disabled={!hasStock}
                className="flex-1 btn-glow-yellow !py-3 text-sm text-black font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <span>Buy Now</span>
              </button>
            </div>

            {/* Secondary actions: Wishlist & Compare */}
            <div className="flex items-center gap-4 pt-2">
              <button 
                onClick={() => toggleWishlist(product)}
                className={`flex items-center gap-2 text-xs font-bold transition-all ${
                  isWishlisted ? 'text-primary' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiHeart className={isWishlisted ? 'fill-current' : ''} />
                <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
              </button>
              
              <button 
                onClick={() => toggleCompare(product)}
                className={`flex items-center gap-2 text-xs font-bold transition-all ${
                  isCompared ? 'text-accentBlue' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiActivity />
                <span>{isCompared ? 'Compared' : 'Add to Compare'}</span>
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* 2. Technical Details & Reviews Tabs Panel */}
      <section className="bg-cardBg border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex border-b border-white/5 pb-2 gap-4 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'specs' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            Product Specifications
          </button>
          <button 
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'shipping' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            Delivery & Policies
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            Customer Reviews ({reviewsList.length})
          </button>
        </div>

        {/* Tab content panel */}
        <div className="min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {activeTab === 'specs' && (
                <div className="max-w-2xl divide-y divide-white/5">
                  {product.specs?.map((spec) => (
                    <div key={spec.key} className="grid grid-cols-3 py-3 text-xs">
                      <span className="font-bold text-gray-500 col-span-1">{spec.key}</span>
                      <span className="text-gray-300 col-span-2 font-medium">{spec.val}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="text-xs text-gray-400 space-y-3 leading-relaxed">
                  <p><strong className="text-white">Delivery Estimate:</strong> Standard shipping delivers within 3 business days. Elite member express delivery available within 24 hours.</p>
                  <p><strong className="text-white">Return Policy:</strong> Returns are accepted within 7 days of delivery. Product packaging must remain intact with original security seal.</p>
                  <p><strong className="text-white">Transit Damage:</strong> In case of damage during transition, report to custom helpline within 2 hours of delivery for immediate refunds.</p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Reviews listing */}
                  <div className="lg:col-span-2 space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
                    {reviewsList.length === 0 ? (
                      <p className="text-xs text-gray-500 py-4">No reviews recorded yet for this item. Be the first to review!</p>
                    ) : (
                      reviewsList.map((rev, idx) => (
                        <motion.div 
                          key={rev.id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{rev.user}</span>
                            <span className="text-gray-500">{rev.date}</span>
                          </div>
                          <div className="flex text-primary text-xs">
                            {[...Array(rev.rating)].map((_, i) => (
                              <FiStar key={i} className="fill-current" />
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed font-medium">{rev.comment}</p>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Review submit form */}
                  <div className="bg-black/30 border border-white/5 p-5 rounded-2xl space-y-4 self-start">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Leave a Review</h4>
                    <form onSubmit={handleAddReview} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-gray-500 mb-1 font-bold">Your Name</label>
                        <input 
                          type="text" 
                          placeholder="Alex Johnson" 
                          value={newReview.user}
                          onChange={(e) => setNewReview(prev => ({ ...prev, user: e.target.value }))}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1 font-bold">Rating Score</label>
                        <select
                          value={newReview.rating}
                          onChange={(e) => setNewReview(prev => ({ ...prev, rating: Number(e.target.value) }))}
                          className="w-full bg-cardBg border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50 cursor-pointer"
                        >
                          <option value="5">5 Stars (Excellent)</option>
                          <option value="4">4 Stars (Good)</option>
                          <option value="3">3 Stars (Average)</option>
                          <option value="2">2 Stars (Poor)</option>
                          <option value="1">1 Star (Very Bad)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1 font-bold">Review Comment</label>
                        <textarea 
                          rows="3"
                          placeholder="Type details about shipping packaging, quality, usability..." 
                          value={newReview.comment}
                          onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50 resize-none"
                          required
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="w-full btn-glow-yellow !py-2.5 text-xs text-black btn-premium-interactive"
                      >
                        Submit Review
                      </button>
                    </form>
                  </div>

                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 3. Related Products Module */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">Related Products</h2>
            <p className="text-xs text-gray-500 mt-1">Explore similar items you may like.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
