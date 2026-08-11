import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiMapPin, FiClock, FiShield, FiUser, FiTag, FiRefreshCw } from 'react-icons/fi';
import productService from '../services/productService';
import chatService from '../services/chatService';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import marketplaceService from '../services/marketplaceService';

const MarketplaceProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const { showToast } = useContext(AppContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enquiring, setEnquiring] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await marketplaceService.getListingById(id);
        if (isMounted && res?.data?.listing) {
          setProduct(res.data.listing);
        }
      } catch (error) {
        console.error('Failed to load C2C listing details', error);
        showToast('Failed to load listing details.', 'error');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProduct();
    return () => { isMounted = false; };
  }, [id]);

  const rawSellerId = product?.sellerId?._id || product?.sellerId?.id || product?.sellerId;

  const handleEnquire = async () => {
    if (!isAuthenticated) {
      showToast('Please login to send an enquiry.', 'error');
      navigate('/login');
      return;
    }
    
    // Prevent enquiring own product
    if (user?._id && rawSellerId && user._id.toString() === rawSellerId.toString()) {
      showToast('You cannot enquire about your own listing.', 'error');
      return;
    }

    if (!rawSellerId) {
      showToast('Listing seller information is missing.', 'error');
      return;
    }

    setEnquiring(true);
    try {
      const listingId = product._id || product.id;
      const res = await chatService.createConversation(null, null, listingId);
      if (res.success && res.data) {
        showToast('Conversation opened!', 'success');
        navigate(`/messages?conversationId=${res.data._id || res.data.id}`);
      }
    } catch (error) {
      console.error('Failed to open chat:', error);
      showToast(error.response?.data?.message || 'Failed to start conversation.', 'error');
    } finally {
      setEnquiring(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-32 flex flex-col items-center justify-center text-primary">
        <FiRefreshCw className="animate-spin text-4xl mb-4" />
        <p className="text-gray-400 font-semibold animate-pulse">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-32 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-black text-white mb-2">Product Not Found</h2>
        <p className="text-gray-400 mb-6">This listing may have been removed or sold.</p>
        <button onClick={() => navigate('/marketplace')} className="btn-glow-yellow text-black px-6 py-2">
          Back to Marketplace
        </button>
      </div>
    );
  }

  const isOwnProduct = isAuthenticated && user?._id && rawSellerId && user._id.toString() === rawSellerId.toString();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/3] bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative group">
            <img 
              src={product.image || (product.images?.length > 0 ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) : 'https://via.placeholder.com/600')} 
              alt={product.title} 
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-white/20">
              {product.condition || 'Used'}
            </div>
          </div>
          
          {/* Thumbnails (If any) */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {product.images.map((img, idx) => (
                <div key={idx} className="w-20 h-20 shrink-0 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-primary transition-all">
                  <img src={typeof img === 'string' ? img : img.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & CTA */}
        <div className="flex flex-col">
          {/* Title & Price */}
          <div className="pb-6 border-b border-white/10">
            <h1 className="text-3xl font-black text-white leading-tight mb-4">{product.title}</h1>
            <div className="text-4xl font-black text-primary">
              ₹{product.price?.toLocaleString()}
            </div>
          </div>

          {/* Quick Specs */}
          <div className="py-6 grid grid-cols-2 gap-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                <FiTag className="text-lg" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Category</p>
                <p className="text-sm text-white font-bold">{product.category}</p>
              </div>
            </div>
            {product.location && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                  <FiMapPin className="text-lg" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Location</p>
                  <p className="text-sm text-white font-bold">{product.location}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                <FiClock className="text-lg" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Posted</p>
                <p className="text-sm text-white font-bold">{formatDate(product.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Seller Box */}
          <div className="py-6 border-b border-white/10">
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-white/10">
                  <FiUser className="text-xl text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-0.5">Seller</p>
                  <p className="text-base text-white font-bold">
                    {product.sellerName || (product.sellerId?.firstName ? `${product.sellerId.firstName} ${product.sellerId.lastName || ''}` : 'Verified Seller')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <FiShield /> NexCart Protected
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="py-6 flex-grow">
            <h3 className="text-lg font-bold text-white mb-3">Description</h3>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          {/* Call to Action */}
          <div className="pt-6 sticky bottom-6 mt-auto">
            <button 
              onClick={handleEnquire}
              disabled={enquiring || isOwnProduct}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl text-lg font-black transition-all ${
                isOwnProduct 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                  : 'btn-glow-yellow text-black hover:scale-[1.02]'
              }`}
            >
              {enquiring ? (
                <FiRefreshCw className="animate-spin text-xl" />
              ) : (
                <FiMessageSquare className="text-xl" />
              )}
              {isOwnProduct ? 'This is your listing' : (enquiring ? 'Opening Chat...' : 'Enquire Now 💬')}
            </button>
            {!isOwnProduct && (
              <p className="text-center text-xs text-gray-500 mt-3 font-semibold">
                Replies usually within a few minutes.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MarketplaceProduct;
