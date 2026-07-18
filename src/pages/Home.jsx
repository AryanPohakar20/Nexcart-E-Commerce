import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { CATEGORIES, BRANDS, PRODUCTS, COUPONS, TESTIMONIALS } from '../constants/dummyData';
import { FiChevronLeft, FiChevronRight, FiClock, FiStar, FiPercent, FiCopy, FiCheck, FiArrowRight } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const { addToCart, showToast } = useContext(AppContext);
  const navigate = useNavigate();
  
  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [
    {
      title: 'Next-Gen Audio Experience',
      subtitle: 'SONY WH-1000XM5',
      desc: 'Industry-leading noise cancelling wireless headphones with dual processor controls and 30 hours battery backup.',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=80',
      actionUrl: '/product/p2',
      badge: 'FLAT 29% OFF'
    },
    {
      title: 'Titanium. Strong. Light. Pro.',
      subtitle: 'iPhone 15 Pro Max',
      desc: 'Featuring the groundbreaking A17 Pro chip, a customizable Action button, and a pro-level triple camera system.',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&q=80',
      actionUrl: '/product/p1',
      badge: 'LIMITED STOCK'
    },
    {
      title: 'Ultimate Creative Powerhouse',
      subtitle: 'MacBook Pro 16"',
      desc: 'Unleash extreme speeds with the Apple M3 Max processor, 36GB memory, and liquid Retina HDR screen.',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80',
      actionUrl: '/product/p3',
      badge: 'PRE-ORDER NOW'
    }
  ];

  // Countdown timer for Flash Sale
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 34, seconds: 12 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Slider auto-scroll
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [heroSlides.length]);

  // Copy Coupon Helper
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    showToast(`Coupon ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCoupon(null), 3000);
  };

  return (
    <div className="space-y-16">
      
      {/* 1. Hero Slider Module */}
      <section className="relative w-full h-[380px] md:h-[500px] rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-black/40">
        {heroSlides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Background Image overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/80 to-transparent z-10" />
            <img src={slide.image} alt={slide.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
            
            {/* Slide Content */}
            <div className="relative z-20 max-w-lg px-8 md:px-16 space-y-4 md:space-y-6 text-left">
              <span className="inline-block bg-primary/20 border border-primary/40 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded">
                {slide.badge}
              </span>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-accentBlue leading-none">{slide.subtitle}</h3>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">{slide.title}</h1>
              </div>
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-medium">{slide.desc}</p>
              <button 
                onClick={() => navigate(slide.actionUrl)}
                className="btn-glow-yellow text-xs font-bold px-6 py-3 flex items-center gap-1.5"
              >
                <span>Shop This Deal</span>
                <FiArrowRight />
              </button>
            </div>
          </div>
        ))}
        
        {/* Carousel controls */}
        <button 
          onClick={() => setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/60 border border-white/10 text-white hover:text-primary rounded-full hover:bg-black/80 transition-all cursor-pointer"
        >
          <FiChevronLeft size={20} />
        </button>
        <button 
          onClick={() => setCurrentSlide(prev => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/60 border border-white/10 text-white hover:text-primary rounded-full hover:bg-black/80 transition-all cursor-pointer"
        >
          <FiChevronRight size={20} />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentSlide ? 'bg-primary w-8' : 'bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* 2. Featured Categories List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Featured Categories</h2>
            <p className="text-xs text-gray-500 mt-1">Discover items curated across major domains.</p>
          </div>
          <Link to="/products" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
            <span>Explore All</span>
            <FiArrowRight />
          </Link>
        </div>

        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-thin">
          {CATEGORIES.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/category/${cat.id}`}
              className="flex-shrink-0 flex flex-col items-center gap-3 group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-primary/50 group-hover:shadow-yellow-glow transition-all duration-300">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <span className="text-xs font-semibold text-gray-400 group-hover:text-white transition-all text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Flash Sale & Deals banner */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Flash Sale Countdown Panel */}
        <div className="lg:col-span-1 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-6 md:p-8 flex flex-col justify-between h-[360px]">
          <div className="space-y-4">
            <span className="bg-primary/20 border border-primary/40 text-primary text-[10px] font-extrabold px-2.5 py-1 rounded tracking-wider uppercase">Flash Sale</span>
            <h3 className="text-2xl font-black text-white">Deals of the Day</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">Limited stocks on top items. Prices return to standard soon.</p>
            
            {/* Clock Timer */}
            <div className="flex items-center gap-3 pt-2">
              <FiClock className="text-primary text-xl" />
              <div className="flex gap-1.5 text-center font-mono">
                <div className="bg-black/40 border border-white/5 rounded px-2.5 py-1.5 text-sm font-bold text-white min-w-[36px]">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <span className="text-primary font-bold self-center">:</span>
                <div className="bg-black/40 border border-white/5 rounded px-2.5 py-1.5 text-sm font-bold text-white min-w-[36px]">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <span className="text-primary font-bold self-center">:</span>
                <div className="bg-black/40 border border-white/5 rounded px-2.5 py-1.5 text-sm font-bold text-white min-w-[36px]">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/products')}
            className="w-full btn-glow-yellow text-xs font-bold py-3 text-center"
          >
            Show All Flash Deals
          </button>
        </div>

        {/* Best deals preview grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PRODUCTS.slice(0, 2).map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 4. Coupons Drawer */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Super Saver Coupons</h2>
          <p className="text-xs text-gray-500 mt-1">Click a coupon card to copy code and apply discounts during checkout.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COUPONS.map((cp) => (
            <div 
              key={cp.code} 
              onClick={() => copyCoupon(cp.code)}
              className="bg-cardBg border border-white/5 hover:border-primary/30 p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:shadow-yellow-glow duration-300 relative overflow-hidden"
            >
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-darkBg" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-darkBg" />
              
              <div className="pl-4 space-y-1.5">
                <span className="text-[10px] text-accentBlue font-bold uppercase tracking-wider">Coupon Code</span>
                <h4 className="text-lg font-black text-white tracking-widest">{cp.code}</h4>
                <p className="text-[10px] text-gray-400">{cp.description}</p>
              </div>

              <div className="flex flex-col items-center gap-1 text-center bg-white/5 border border-white/5 p-2 rounded-lg pr-4">
                <FiPercent className="text-primary text-lg" />
                <span className="text-[10px] font-bold text-gray-400">
                  {copiedCoupon === cp.code ? 'Copied' : 'Copy'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Trending & Recommended Items */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Trending Collections</h2>
          <p className="text-xs text-gray-500 mt-1">Best-rated products by shoppers worldwide.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {PRODUCTS.slice(2, 6).map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. Popular Brands Banner */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Shop By Brands</h2>
          <p className="text-xs text-gray-500 mt-1">Explore authentic items from elite global suppliers.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 pt-4">
          {BRANDS.map((br) => (
            <div 
              key={br.id}
              onClick={() => navigate(`/products?brand=${br.name}`)}
              className="bg-cardBg border border-white/5 hover:border-primary/30 p-6 rounded-2xl flex items-center justify-center h-24 hover-lift cursor-pointer transition-all"
            >
              <img src={br.logoUrl} alt={br.name} className="max-h-10 max-w-full object-contain filter invert opacity-60 hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-extrabold text-white">NexCart Reviews</h2>
          <p className="text-xs text-gray-500 mt-1">What our premium customers have to say.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="bg-cardBg border border-white/5 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-primary/20" />
                <div>
                  <h4 className="text-xs font-bold text-white">{t.name}</h4>
                  <span className="text-[10px] text-gray-500">{t.role}</span>
                </div>
              </div>

              <div className="flex text-primary text-xs">
                {[...Array(t.rating)].map((_, i) => (
                  <FiStar key={i} className="fill-current" />
                ))}
              </div>

              <p className="text-xs text-gray-400 leading-relaxed font-medium italic">
                "{t.comment}"
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
