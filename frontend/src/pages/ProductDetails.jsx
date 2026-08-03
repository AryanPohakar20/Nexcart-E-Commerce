import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { PRODUCTS } from '../constants/dummyData';
import { 
  FiStar, FiHeart, FiActivity, FiShoppingCart, FiTruck, FiShield, 
  FiRefreshCw, FiChevronDown, FiAlertTriangle, FiCheck, FiThumbsUp, 
  FiEdit3, FiTrash2, FiMessageCircle, FiPlay, FiImage 
} from 'react-icons/fi';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
  const id = useParams().id;
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const { 
    addToCart, 
    wishlist, 
    toggleWishlist, 
    toggleCompare, 
    comparedProducts, 
    showToast,
    reviews,
    addProductReview,
    editProductReview,
    deleteProductReview,
    voteHelpful,
    reportReview
  } = useContext(AppContext);

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
  
  // Submit new review form state
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [titleInput, setTitleInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  
  // Filters state
  const [verifiedFilter, setVerifiedFilter] = useState(false);
  const [mediaFilter, setMediaFilter] = useState(false);
  const [sortBy, setSortBy] = useState('helpful'); // helpful, newest, highest, lowest

  // Report modal states
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState('');
  const [reportReason, setReportReason] = useState('Spam');
  const [reportDesc, setReportDesc] = useState('');

  // Editing review inline states
  const [editingId, setEditingId] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDesc, setEditingDesc] = useState('');
  const [editingRating, setEditingRating] = useState(5);

  // Get active product reviews from unified context
  const productReviews = useMemo(() => {
    return reviews.filter(r => r.productId === product.id && r.isApproved && !r.isSpam);
  }, [reviews, product.id]);

  // Apply filters and sorting
  const filteredAndSortedReviews = useMemo(() => {
    let result = [...productReviews];
    if (verifiedFilter) {
      result = result.filter(r => r.verified);
    }
    if (mediaFilter) {
      result = result.filter(r => r.media);
    }
    
    // Sorting
    if (sortBy === 'helpful') {
      result.sort((a, b) => b.helpfulCount - a.helpfulCount);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      result.sort((a, b) => a.rating - b.rating);
    }
    return result;
  }, [productReviews, verifiedFilter, mediaFilter, sortBy]);

  // Statistics calculation for review summarization
  const ratingStats = useMemo(() => {
    const total = productReviews.length;
    if (total === 0) return { average: 5.0, count: 0, distribution: [0, 0, 0, 0, 0] };
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    const average = (sum / total).toFixed(1);
    
    const distribution = [0, 0, 0, 0, 0]; // index 0 represents 5 star, index 4 represents 1 star
    productReviews.forEach(r => {
      const idx = 5 - r.rating;
      if (idx >= 0 && idx < 5) {
        distribution[idx]++;
      }
    });
    const distPercentages = distribution.map(count => Math.round((count / total) * 100));
    return { average, count: total, distribution: distPercentages };
  }, [productReviews]);

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

  // Submit review handler
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to write product reviews.', 'error');
      return;
    }
    if (titleInput.trim() && commentInput.trim()) {
      addProductReview(product.id, ratingInput, titleInput, commentInput);
      setTitleInput('');
      setCommentInput('');
      setRatingInput(5);
    }
  };

  // Trigger report reviewer modal
  const handleOpenReport = (reviewId) => {
    setReportTargetId(reviewId);
    setIsReportOpen(true);
  };

  const submitReport = () => {
    if (reportDesc.trim()) {
      reportReview(reportTargetId, user?.name || 'Guest User', reportReason, reportDesc);
      setIsReportOpen(false);
      setReportDesc('');
    } else {
      showToast('Please describe the reason for reporting this comment.', 'error');
    }
  };

  // Trigger editing review state
  const handleOpenEdit = (rev) => {
    setEditingId(rev.id);
    setEditingTitle(rev.title);
    setEditingDesc(rev.description);
    setEditingRating(rev.rating);
  };

  const handleSaveEdit = () => {
    editProductReview(editingId, editingRating, editingTitle, editingDesc);
    setEditingId('');
  };

  // Get Related Products
  const relatedProducts = useMemo(() => {
    return PRODUCTS.filter(p => p.category === product.category && p.id !== product.id);
  }, [product]);

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left py-6">
      {/* 1. Main Product Overview Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Left Column: Image Gallery Viewer */}
        <div className="space-y-4">
          <motion.div 
            onMouseMove={handleImgMouseMove}
            onMouseLeave={handleImgMouseLeave}
            animate={{ rotateX: imgRotate.x, rotateY: imgRotate.y }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-muted rounded-2xl overflow-hidden border border-border h-[350px] md:h-[450px] cursor-zoom-in relative"
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
              className={`w-20 h-20 bg-muted rounded-xl overflow-hidden border-2 transition-all ${
                selectedImage === product.image ? 'border-primary' : 'border-border hover:border-primary/50'
              }`}
            >
              <img src={product.image} alt="main" className="w-full h-full object-cover" />
            </button>
            <button 
              onClick={() => setSelectedImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80')}
              className={`w-20 h-20 bg-muted rounded-xl overflow-hidden border-2 transition-all ${
                selectedImage === 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80' ? 'border-primary' : 'border-border hover:border-primary/50'
              }`}
            >
              <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80" alt="spec" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        {/* Right Column: Details Info Panel */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-widest font-bold">
              <span>{product.brand}</span>
              <span className={hasStock ? 'text-green-500' : 'text-red-500 font-bold'}>
                {hasStock ? `In Stock (${product.stock} left)` : 'Sold Out'}
              </span>
            </div>
 
            <h1 className="text-2xl md:text-3xl font-black text-foreground leading-tight tracking-tight">
              {product.title}
            </h1>
 
            {/* Ratings stars summary */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-primary text-sm">
                <FiStar className="fill-current" />
                <span className="font-bold ml-1 text-sm">{ratingStats.average}</span>
              </div>
              <span className="text-xs text-muted-foreground font-semibold">|</span>
              <span className="text-xs text-muted-foreground font-semibold">{productReviews.length} Global Reviews</span>
            </div>
 
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              {product.description}
            </p>
 
            {/* Pricing Section */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-black text-foreground">₹{product.price.toLocaleString('en-IN')}</span>
              {product.mrp > product.price && (
                <span className="text-sm text-muted-foreground line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
              )}
              {product.discount > 0 && (
                <span className="text-xs text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  {product.discount}% Save
                </span>
              )}
            </div>
 
            {/* Delivery estimates details */}
            <div className="bg-card border border-border rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <FiTruck className="text-primary text-base flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Fast Shipping</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Delivery by tomorrow</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <FiShield className="text-primary text-base flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Secure Brand</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">100% Original goods</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <FiRefreshCw className="text-primary text-base flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Free Returns</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">7-Day replacement</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger shelf buttons */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={!hasStock}
                className="flex-grow btn-glow-yellow !py-4 text-xs tracking-wider uppercase font-extrabold flex items-center justify-center gap-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiShoppingCart size={15} /> Add to Cart
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={!hasStock}
                className="flex-grow bg-muted hover:bg-muted/80 border border-border text-foreground !py-4 text-xs tracking-wider uppercase font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                Buy Now
              </button>
            </div>
 
            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-4">
                <button 
                  onClick={() => toggleWishlist(product)}
                  className={`flex items-center gap-2 text-xs font-bold transition-colors ${
                    isWishlisted ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FiHeart className={isWishlisted ? 'fill-current' : ''} />
                  <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                </button>
                <button 
                  onClick={() => toggleCompare(product)}
                  className={`flex items-center gap-2 text-xs font-bold transition-colors ${
                    isCompared ? 'text-accentBlue' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FiActivity />
                  <span>{isCompared ? 'Compared' : 'Compare Item'}</span>
                </button>
              </div>
              <span className="text-[10px] text-muted-foreground font-extrabold tracking-widest uppercase">NexCart Elite Platform</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive details Accordion tabs */}
      <section className="space-y-6 pt-6">
        <div className="flex border-b border-border text-xs font-bold uppercase tracking-wider gap-6">
          <button 
            onClick={() => setActiveTab('specs')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'specs' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Technical Specifications
          </button>
          <button 
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'shipping' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Delivery & Policies
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Customer Reviews ({productReviews.length})
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
              transition={{ duration: 0.25 }}
            >
                        {activeTab === 'specs' && (
                <div className="max-w-2xl divide-y divide-border text-left">
                  {product.specs?.map((spec) => (
                    <div key={spec.key} className="grid grid-cols-3 py-3 text-xs">
                      <span className="font-bold text-muted-foreground col-span-1">{spec.key}</span>
                      <span className="text-muted-foreground col-span-2 font-medium">{spec.val}</span>
                    </div>
                  ))}
                </div>
              )}
 
              {activeTab === 'shipping' && (
                <div className="text-xs text-muted-foreground space-y-3 leading-relaxed text-left">
                  <p><strong className="text-foreground">Delivery Estimate:</strong> Standard shipping delivers within 3 business days. Elite member express delivery available within 24 hours.</p>
                  <p><strong className="text-foreground">Return Policy:</strong> Returns are accepted within 7 days of delivery. Product packaging must remain intact with original security seal.</p>
                  <p><strong className="text-foreground">Transit Damage:</strong> In case of damage during transition, report to custom helpline within 2 hours of delivery for immediate refunds.</p>
                </div>
              )}                {activeTab === 'reviews' && (
                <div className="space-y-8">
                  {/* Reviews Summary Section Grid (100% responsive layout) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Left aggregate metrics card */}
                    <div className="lg:col-span-1 bg-card border border-border p-5 rounded-2xl space-y-5">
                      <h4 className="text-xs font-black uppercase text-foreground tracking-wider text-left">Reviews Aggregate</h4>
                      <div className="flex items-center gap-4 text-left">
                        <p className="text-4xl font-black text-foreground">{ratingStats.average}</p>
                        <div className="space-y-0.5">
                          <div className="flex text-primary text-xs">
                            {[...Array(Math.round(Number(ratingStats.average)))].map((_, i) => (
                              <FiStar key={i} className="fill-current" />
                            ))}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">{ratingStats.count} verified ratings</p>
                        </div>
                      </div>
 
                      {/* Ratings distribution bars */}
                      <div className="space-y-2.5 text-xs text-left">
                        {[5, 4, 3, 2, 1].map((stars, idx) => (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="text-muted-foreground w-3 font-semibold">{stars}</span>
                            <FiStar className="text-primary text-[10px] fill-current" />
                            <div className="flex-1 bg-muted h-1.5 rounded-full overflow-hidden border border-border">
                              <div className="h-full bg-primary" style={{ width: `${ratingStats.distribution[idx]}%` }} />
                            </div>
                            <span className="text-muted-foreground w-8 text-right font-semibold">{ratingStats.distribution[idx]}%</span>
                          </div>
                        ))}
                      </div>
 
                      {/* Video reviews carousel preview */}
                      <div className="space-y-2.5 pt-4 border-t border-border">
                        <p className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground text-left">Customer Media</p>
                        <div className="flex gap-2">
                          <div className="w-14 h-14 bg-muted rounded-xl overflow-hidden relative cursor-pointer group border border-border flex-shrink-0">
                            <img src={product.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                            <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-foreground"><FiPlay size={10} /></span>
                          </div>
                          <div className="w-14 h-14 bg-muted rounded-xl overflow-hidden relative cursor-pointer group border border-border flex-shrink-0">
                            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80" alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                            <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-foreground"><FiImage size={10} /></span>
                          </div>
                        </div>
                      </div>
                    </div>
 
                    {/* Right filters toolbar & Reviews flow */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Reviews filters toolbar */}
                      <div className="bg-card border border-border p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between text-xs font-semibold text-muted-foreground">
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                            <input 
                              type="checkbox" 
                              checked={verifiedFilter}
                              onChange={(e) => setVerifiedFilter(e.target.checked)}
                              className="rounded bg-background border-border" 
                            />
                            <span>Verified Buyers</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                            <input 
                              type="checkbox" 
                              checked={mediaFilter}
                              onChange={(e) => setMediaFilter(e.target.checked)}
                              className="rounded bg-background border-border" 
                            />
                            <span>Has Media</span>
                          </label>
                        </div>
 
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none cursor-pointer"
                        >
                          <option value="helpful">Most Helpful</option>
                          <option value="newest">Newest Reviews</option>
                          <option value="highest">Highest Rating</option>
                          <option value="lowest">Lowest Rating</option>
                        </select>
                      </div>
 
                      {/* Reviews comments feeds */}
                      <div className="space-y-4">
                        {filteredAndSortedReviews.length === 0 ? (
                          <div className="text-center py-12 bg-card border border-border rounded-2xl">
                            <FiMessageCircle className="mx-auto text-muted-foreground mb-3" size={24} />
                            <p className="text-xs text-muted-foreground font-bold">No reviews match filters</p>
                          </div>
                        ) : (
                          filteredAndSortedReviews.map((rev) => {
                            const isOwnReview = user && rev.customerName === user.name;
                            const isEditing = editingId === rev.id;
 
                            return (
                              <motion.div 
                                key={rev.id} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-5 bg-card border border-border rounded-2xl text-left space-y-4"
                              >
                                {/* Review header details */}
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <img src={rev.customerAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-border" />
                                    <div className="space-y-0.5 text-xs text-left">
                                      <p className="font-bold text-foreground flex items-center gap-1.5">
                                        <span>{rev.customerName}</span>
                                        {rev.verified && (
                                          <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-black uppercase tracking-wider">Verified Purchase</span>
                                        )}
                                      </p>
                                      <p className="text-[9px] text-muted-foreground">{rev.date}</p>
                                    </div>
                                  </div>
 
                                  {/* User self control edit window within 24h */}
                                  {isOwnReview && !isEditing && (
                                    <div className="flex gap-2">
                                      <button onClick={() => handleOpenEdit(rev)} className="p-2 bg-muted hover:bg-muted/80 rounded-lg text-muted-foreground hover:text-foreground" title="Edit Review">
                                        <FiEdit3 size={12} />
                                      </button>
                                      <button onClick={() => deleteProductReview(rev.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400" title="Delete Review">
                                        <FiTrash2 size={12} />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* EDIT INLINE FORM */}
                                {isEditing ? (
                                  <div className="space-y-3 text-xs bg-background p-4 rounded-xl border border-border">
                                    <div>
                                      <label className="block text-muted-foreground mb-1 font-bold">Edit Rating</label>
                                      <select 
                                        value={editingRating} 
                                        onChange={(e) => setEditingRating(Number(e.target.value))}
                                        className="bg-card border border-border rounded-lg p-2 text-foreground"
                                      >
                                        <option value="5">5 Stars</option>
                                        <option value="4">4 Stars</option>
                                        <option value="3">3 Stars</option>
                                        <option value="2">2 Stars</option>
                                        <option value="1">1 Star</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-muted-foreground mb-1 font-bold">Edit Title</label>
                                      <input 
                                        type="text" 
                                        value={editingTitle} 
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-muted-foreground mb-1 font-bold">Edit Comment</label>
                                      <textarea 
                                        rows="2"
                                        value={editingDesc} 
                                        onChange={(e) => setEditingDesc(e.target.value)}
                                        className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground resize-none"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button onClick={handleSaveEdit} className="bg-primary text-black font-extrabold p-2 px-4 rounded-lg">Save</button>
                                      <button onClick={() => setEditingId('')} className="bg-muted text-foreground p-2 px-4 rounded-lg">Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="space-y-1.5">
                                      {/* Ratings */}
                                      <div className="flex text-primary text-xs">
                                        {[...Array(rev.rating)].map((_, i) => (
                                          <FiStar key={i} className="fill-current" />
                                        ))}
                                      </div>
                                      <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">{rev.title}</h5>
                                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">"{rev.description}"</p>
                                    </div>
 
                                    {/* Seller reply segment */}
                                    {rev.reply && (
                                      <div className="bg-muted border border-border p-4 rounded-xl ml-4 space-y-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-[8px] font-black">S</div>
                                          <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                                            Seller Hub Responded <span className="text-muted-foreground font-normal">• Verified Vendor</span>
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground italic">"{rev.reply}"</p>
                                      </div>
                                    )}
 
                                    {/* Action button likes and report triggers */}
                                    <div className="flex gap-4 pt-2 border-t border-border text-xs text-muted-foreground font-bold">
                                      <button 
                                        onClick={() => voteHelpful(rev.id)}
                                        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                      >
                                        <FiThumbsUp /> Helpful ({rev.helpfulCount})
                                      </button>
                                      <button 
                                        onClick={() => handleOpenReport(rev.id)}
                                        className="flex items-center gap-1.5 hover:text-red-400 transition-colors"
                                      >
                                        <FiAlertTriangle /> Report Spam
                                      </button>
                                    </div>
                                  </>
                                )}
                              </motion.div>
                            );
                          })
                        )}
                    </div>
                  </div>
 
                  {/* Submit Review section form */}
                  <div className="max-w-2xl bg-card border border-border p-6 rounded-3xl space-y-4 text-left">
                    <h4 className="text-xs font-black uppercase text-foreground tracking-wider border-b border-border pb-2">Publish Product Review</h4>
                    
                    <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-muted-foreground mb-1 font-bold">Select Stars Rating</label>
                        <div className="flex gap-1.5 text-lg">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingInput(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(star)}
                              className="text-muted-foreground focus:outline-none transition-colors"
                            >
                              <FiStar 
                                className={`${
                                  (hoverRating || ratingInput) >= star ? 'text-primary fill-current' : 'text-muted-foreground'
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
 
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-muted-foreground mb-1 font-bold">Review Title Heading</label>
                          <input 
                            type="text" 
                            placeholder="Excellent sound! / Sealed packaging..."
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none"
                            required
                          />
                        </div>
                      </div>
 
                      <div>
                        <label className="block text-muted-foreground mb-1 font-bold">Detailed Review Comments</label>
                        <textarea 
                          rows="3"
                          placeholder="Tell other shoppers about shipping duration, packaging quality, setup difficulty..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none resize-none"
                          required
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="btn-glow-yellow py-3 px-8 text-black font-extrabold uppercase tracking-wider rounded-xl text-xs"
                      >
                        Publish Review Listing
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
 
      {/* 3. Report Review Popup Dialog Modal */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border p-6 rounded-3xl max-w-sm w-full text-xs space-y-4 text-left"
            >
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h4 className="text-xs font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                  <FiAlertTriangle /> Report Review Comment
                </h4>
                <button onClick={() => setIsReportOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <FiXCircle size={18} />
                </button>
              </div>
 
              <div className="space-y-4">
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Reason for Report</label>
                  <select 
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground cursor-pointer"
                  >
                    <option value="Spam">Spam/Bot generated</option>
                    <option value="Fake Review">Fake review profile</option>
                    <option value="Abusive Language">Abusive/Inappropriate words</option>
                    <option value="Wrong Product">Wrong item description</option>
                    <option value="Duplicate Review">Duplicate review spam</option>
                  </select>
                </div>
 
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Describe Concern Details</label>
                  <textarea 
                    rows="3"
                    placeholder="Provide additional details regarding how this review violates standards..."
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none resize-none"
                    required
                  />
                </div>

                <button 
                  onClick={submitReport}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-extrabold uppercase py-3 rounded-xl tracking-wider text-xs transition-colors"
                >
                  Submit Abuse Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Related Products Module */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground">Related Products</h2>
            <p className="text-xs text-muted-foreground mt-1">Explore similar items you may like.</p>
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
