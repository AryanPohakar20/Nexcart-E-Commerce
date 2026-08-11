import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { FiStar, FiHeart, FiActivity, FiShoppingCart, FiTruck, FiShield, FiRefreshCw, FiChevronDown } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, wishlist, toggleWishlist, toggleCompare, comparedProducts, showToast, formatCurrency } = useContext(AppContext);

  // Dynamic Product State from MongoDB
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery view State
  const [selectedImage, setSelectedImage] = useState('');

  // Quantity Selector state
  const [quantity, setQuantity] = useState(1);

  // Custom Accordions state
  const [activeTab, setActiveTab] = useState('specs'); // specs, shipping, reviews
  
  // Reviews addition state
  const [reviewsList, setReviewsList] = useState([]);
  const [newReview, setNewReview] = useState({ user: '', rating: 5, comment: '' });

  // 3D image tilt & magnifier states
  const [imgRotate, setImgRotate] = useState({ x: 0, y: 0 });
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center', scale: 1 });

  // Fetch product from MongoDB by ID / Slug
  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productService.getProductById(id);
        if (res?.data?.product && isMounted) {
          const p = res.data.product;
          setProduct(p);
          setSelectedImage(p.image || p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80');
          setReviewsList(p.reviews || []);
          setQuantity(1);

          // Fetch related products in the same category or recommendations
          try {
            const relRes = await productService.getProducts({ 
              category: p.category, 
              limit: 5 
            });
            if (relRes?.data?.products && isMounted) {
              setRelatedProducts(
                relRes.data.products.filter(item => item.id !== p.id && item.id !== id).slice(0, 4)
              );
            }
          } catch (relErr) {
            console.error('Failed to load related products:', relErr);
          }
        } else if (isMounted) {
          setError('Product not found in catalogue.');
        }
      } catch (err) {
        console.error('Failed to fetch product details:', err);
        if (isMounted) {
          setError('Unable to load product information.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

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

  const isWishlisted = product ? wishlist.some(item => item.id === product.id) : false;
  const isCompared = product ? comparedProducts.some(item => item.id === product.id) : false;
  const hasStock = product ? (product.stock > 0) : false;

  const handleAddToCart = () => {
    if (product && hasStock) {
      addToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product && hasStock) {
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <FiRefreshCw className="animate-spin text-4xl text-primary mb-4" />
        <p className="text-gray-400 font-semibold">Loading product specifications from database...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center space-y-4">
        <p className="text-xl font-bold text-red-400">{error || 'Product Not Found'}</p>
        <button 
          onClick={() => navigate('/products')}
          className="btn-glow-yellow px-6 py-2.5 text-xs text-black font-bold rounded-xl"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  // Build images array
  const allImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.image].filter(Boolean);

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
              src={selectedImage || product.image} 
              alt={product.title} 
              className="w-full h-full object-cover select-none"
              style={{ ...zoomStyle }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          </motion.div>

          {/* Thumbnails list */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {allImages.map((imgUrl, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-20 h-20 bg-black/40 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === imgUrl ? 'border-primary' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
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
              <span className="text-xs text-gray-400 font-semibold">{product.reviewsCount || reviewsList.length} Global Reviews</span>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              {product.description}
            </p>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-black text-white">{formatCurrency(product.price)}</span>
              {product.mrp > product.price && (
                <span className="text-sm text-gray-500 line-through">{formatCurrency(product.mrp)}</span>
              )}
              {product.discount > 0 && (
                <span className="text-xs text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  {product.discount}% Save
                </span>
              )}
            </div>

            {/* Seller Information Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={product.sellerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'}
                  alt="Seller"
                  className="w-12 h-12 rounded-full object-cover border border-primary/20"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {product.sellerDisplayName || 'NexCart Official Merchant'}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold uppercase tracking-wider">
                      {product.seller?.sellerType === 'business' ? 'Small Business' : 'Verified Merchant'}
                    </span>
                    <span className="text-xs text-gray-500 font-bold flex items-center gap-1">
                      <FiStar className="text-primary fill-current" /> 4.9
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Trust Score</p>
                <p className="text-sm font-black text-emerald-400">98%</p>
              </div>
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
                  {product.specs && product.specs.length > 0 ? (
                    product.specs.map((spec, i) => (
                      <div key={spec.key || spec.name || i} className="grid grid-cols-3 py-3 text-xs">
                        <span className="font-bold text-gray-500 col-span-1">{spec.key || spec.name}</span>
                        <span className="text-gray-300 col-span-2 font-medium">{spec.val || spec.value}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-xs text-gray-500">
                      Standard manufacturer specifications and user guides included with packaging.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="text-xs text-gray-400 space-y-3 leading-relaxed">
                  <p><strong className="text-white">Delivery Estimate:</strong> {typeof product.delivery === 'string' ? product.delivery : 'Standard shipping delivers within 3 business days. Elite member express delivery available within 24 hours.'}</p>
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
                          key={rev.id || idx} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{rev.user || 'Verified Buyer'}</span>
                            <span className="text-gray-500">{rev.date || 'Recently'}</span>
                          </div>
                          <div className="flex text-primary text-xs">
                            {[...Array(rev.rating || 5)].map((_, i) => (
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
            <p className="text-xs text-gray-500 mt-1">Explore similar items you may like from MongoDB.</p>
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
