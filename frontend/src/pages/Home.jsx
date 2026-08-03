import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { CATEGORIES, BRANDS, PRODUCTS, COUPONS, TESTIMONIALS } from '../constants/dummyData';
import { 
  FiChevronLeft, FiChevronRight, FiClock, FiStar, FiPercent, 
  FiCopy, FiCheck, FiArrowRight, FiShoppingCart, FiHeart, FiGift, FiZap
} from 'react-icons/fi';
import ProductCard from '../components/ProductCard';

// Reusable Horizontal Product Slider Component
const ProductSlider = ({ title, products, onViewAll }) => {
  const containerRef = useRef(null);

  const scroll = (direction) => {
    if (containerRef.current) {
      const { scrollLeft, clientWidth } = containerRef.current;
      const scrollAmount = clientWidth * 0.75;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      containerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 text-left relative group py-2">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight">{title}</h3>
        </div>
        <button 
          onClick={onViewAll} 
          className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5"
        >
          <span>View All</span>
          <FiArrowRight />
        </button>
      </div>

      <div className="relative">
        {/* Left Arrow Button */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-[-18px] top-1/2 -translate-y-1/2 z-20 p-2.5 bg-card border border-border text-foreground hover:text-primary rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer hidden md:flex items-center justify-center"
        >
          <FiChevronLeft size={16} />
        </button>

        {/* Scrollable Row */}
        <div 
          ref={containerRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
        >
          {products.map(prod => (
            <div key={prod.id} className="w-[250px] sm:w-[280px] flex-shrink-0 snap-start">
              <ProductCard product={prod} />
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-[-18px] top-1/2 -translate-y-1/2 z-20 p-2.5 bg-card border border-border text-foreground hover:text-primary rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer hidden md:flex items-center justify-center"
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const Home = () => {
  const { addToCart, showToast } = useContext(AppContext);
  const navigate = useNavigate();
  const categoryScrollRef = useRef(null);

  // Parallax Hero Mouse tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: x * 15, y: y * 15 });
  };
  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Hero Slider
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

  // Auto scroll banner slides
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 6500);
    return () => clearInterval(slideInterval);
  }, [heroSlides.length]);

  // Flash sales countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 54, seconds: 48 });
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

  // Coupon copy handler
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    showToast(`Coupon ${code} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCoupon(null), 3000);
  };

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const { scrollLeft, clientWidth } = categoryScrollRef.current;
      const scrollAmount = clientWidth * 0.5;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      categoryScrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Structured content filters
  const bestDeals = PRODUCTS.filter(p => p.discount >= 10);
  const recommended = PRODUCTS;
  const trending = PRODUCTS.filter(p => p.rating >= 4.6);
  const recentlyViewed = [PRODUCTS[0], PRODUCTS[2], PRODUCTS[5], PRODUCTS[7]];
  const newArrivals = [...PRODUCTS].reverse();

  return (
    <div className="space-y-16">
      
      {/* 1. WIDER HERO BANNER SLIDER */}
      <section 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-[400px] md:h-[520px] rounded-3xl overflow-hidden border border-border shadow-2xl bg-muted/20 transition-all duration-300"
      >
        {/* Glow ambient design orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary/10 blur-[80px]" />
          <div className="absolute bottom-10 right-10 w-85 h-85 rounded-full bg-accentBlue/10 blur-[100px]" />
        </div>

        <AnimatePresence mode="wait">
          {heroSlides.map((slide, index) => (
            index === currentSlide && (
              <motion.div 
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, x: mousePos.x * 0.25, y: mousePos.y * 0.25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55 }}
                className="absolute inset-0 flex items-center"
              >
                {/* Visual gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent z-10 transition-all duration-300" />
                <img src={slide.image} alt={slide.title} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                
                {/* Slide content columns */}
                <div className="relative z-20 max-w-xl px-8 md:px-16 space-y-4 md:space-y-6 text-left">
                  <span className="inline-block bg-primary/20 border border-primary/30 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded">
                    {slide.badge}
                  </span>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-accentBlue leading-none">{slide.subtitle}</h3>
                    <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight">{slide.title}</h1>
                  </div>

                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
                    {slide.desc}
                  </p>

                  <button 
                    onClick={() => navigate(slide.actionUrl)}
                    className="btn-glow-yellow text-xs font-bold px-6 py-3.5 flex items-center gap-1.5"
                  >
                    <span>Shop This Deal</span>
                    <FiArrowRight />
                  </button>
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
        
        {/* Slider Controls */}
        <button 
          onClick={() => setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-card/75 border border-border text-foreground hover:text-primary rounded-full hover:bg-card shadow-lg transition-all cursor-pointer"
        >
          <FiChevronLeft size={18} />
        </button>

        <button 
          onClick={() => setCurrentSlide(prev => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-card/75 border border-border text-foreground hover:text-primary rounded-full hover:bg-card shadow-lg transition-all cursor-pointer"
        >
          <FiChevronRight size={18} />
        </button>

        {/* Bullet Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-primary w-8' : 'bg-white/30 hover:bg-white/55'}`}
            />
          ))}
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES SECTION */}
      <section className="space-y-6 text-left relative group">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight">Featured Categories</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Explore standard collections & sectors.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => scrollCategories('left')}
              className="p-1.5 rounded-full border border-border hover:bg-muted text-muted-foreground hover:text-primary"
            >
              <FiChevronLeft size={14} />
            </button>
            <button 
              onClick={() => scrollCategories('right')}
              className="p-1.5 rounded-full border border-border hover:bg-muted text-muted-foreground hover:text-primary"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>

        <div 
          ref={categoryScrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
        >
          {CATEGORIES.map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ y: -4 }}
              className="flex-shrink-0 snap-start"
            >
              <Link 
                to={`/category/${cat.id}`}
                className="flex flex-col items-center gap-3 group w-[100px] md:w-[120px]"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-border group-hover:border-primary/60 group-hover:shadow-yellow-glow transition-all duration-300">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <span className="text-[11px] font-bold text-muted-foreground group-hover:text-primary transition-colors text-center truncate w-full">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. BEST DEALS SECTION */}
      <ProductSlider 
        title="Best Deals of the Day" 
        products={bestDeals} 
        onViewAll={() => navigate('/products')} 
      />

      {/* 4. RECOMMENDED PRODUCTS SECTION */}
      <ProductSlider 
        title="Recommended For You" 
        products={recommended} 
        onViewAll={() => navigate('/products')} 
      />

      {/* 5. TRENDING PRODUCTS SECTION */}
      <ProductSlider 
        title="Trending Products" 
        products={trending} 
        onViewAll={() => navigate('/products')} 
      />

      {/* 6. TOP BRANDS SECTION */}
      <section className="space-y-6 text-left">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight">Shop By Brands</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Authentic collections direct from global suppliers.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {BRANDS.map((br) => (
            <motion.div 
              key={br.id}
              whileHover={{ y: -4, borderColor: 'var(--primary)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/products?brand=${br.name}`)}
              className="bg-card border border-border p-5 rounded-2xl flex items-center justify-center h-20 cursor-pointer transition-all duration-300 group"
            >
              <img 
                src={br.logoUrl} 
                alt={br.name} 
                className="max-h-8 max-w-full object-contain theme-logo-filter opacity-50 group-hover:opacity-100 transition-opacity" 
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7. RECENTLY VIEWED SECTION */}
      <ProductSlider 
        title="Recently Viewed Items" 
        products={recentlyViewed} 
        onViewAll={() => navigate('/products')} 
      />

      {/* 8. NEW ARRIVALS SECTION */}
      <ProductSlider 
        title="New Arrivals" 
        products={newArrivals} 
        onViewAll={() => navigate('/products')} 
      />

      {/* 9. SUPER SAVER COUPONS (Maturity Feature) */}
      <section className="space-y-6 text-left">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight">Super Saver Coupons</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Click discount cards below to copy promo codes.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COUPONS.map((cp) => (
            <motion.div 
              key={cp.code}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => copyCoupon(cp.code)}
              className="p-5 bg-card border border-border rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all duration-300 cursor-pointer"
            >
              <div className="space-y-1">
                <h4 className="text-base font-black text-foreground tracking-widest group-hover:text-primary transition-colors">{cp.code}</h4>
                <p className="text-xs font-bold text-primary">{cp.discountPercent}% OFF</p>
                <p className="text-[10px] text-muted-foreground font-medium">{cp.description}</p>
              </div>

              <div className="flex flex-col items-center gap-1 bg-muted border border-border p-2 rounded-lg min-w-[60px] justify-center">
                <FiPercent className="text-primary text-sm" />
                <span className="text-[9px] font-bold text-muted-foreground">
                  {copiedCoupon === cp.code ? 'Copied' : 'Copy'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 10. SOCIAL TESTIMONIALS SECTION */}
      <section className="space-y-6 text-left">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight">NexCart Client Reviews</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Hear directly from our verified premium buyers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -4 }}
              className="bg-card border border-border p-6 rounded-2xl space-y-4 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-primary/20" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">{t.name}</h4>
                  <span className="text-[9px] text-muted-foreground">{t.role}</span>
                </div>
              </div>

              <div className="flex text-primary text-xs">
                {[...Array(t.rating)].map((_, i) => (
                  <FiStar key={i} className="fill-current" />
                ))}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed italic font-medium">
                "{t.comment}"
              </p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
