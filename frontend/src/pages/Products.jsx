import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import { FiSliders, FiX, FiCheck, FiChevronDown, FiStar, FiRefreshCw } from 'react-icons/fi';
import productService from '../services/productService';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQ = searchParams.get('q') || '';
  const searchCat = searchParams.get('cat') || searchParams.get('category') || 'All';
  const urlBrand = searchParams.get('brand') || '';
  const urlSort = searchParams.get('sort') || 'featured';

  // Products & Categories from MongoDB
  const [allProducts, setAllProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState(400000); // Max Price Limit
  const [minRating, setMinRating] = useState(0);
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const [sortOption, setSortOption] = useState(urlSort); // featured, price-low-high, price-high-low, rating
  
  // Mobile Filter Sidebar Toggle
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);

  // Fetch real data from MongoDB
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getProducts({ limit: 600 }).catch(() => null),
          productService.getCategories().catch(() => null),
        ]);

        if (isMounted) {
          if (prodRes?.data?.products) {
            setAllProducts(prodRes.data.products);
          }
          if (catRes?.data?.categories && catRes.data.categories.length > 0) {
            const formatted = catRes.data.categories.map((c) => {
              return {
                id: c.slug || c._id,
                name: c.name,
                image: c.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&q=80',
              };
            });
            setCategoriesList(formatted);
          }
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state with URL params
  useEffect(() => {
    if (searchCat !== 'All' && !selectedCategories.includes(searchCat)) {
      setSelectedCategories([searchCat]);
    } else if (searchCat === 'All') {
      setSelectedCategories([]);
    }
  }, [searchCat]);

  useEffect(() => {
    if (urlBrand && !selectedBrands.includes(urlBrand)) {
      setSelectedBrands([urlBrand]);
    }
  }, [urlBrand]);

  useEffect(() => {
    if (urlSort && urlSort !== sortOption) {
      setSortOption(urlSort);
    }
  }, [urlSort]);

  // Unique Brands in Database
  const availableBrands = useMemo(() => {
    const brands = allProducts.map((p) => p.brand).filter(Boolean);
    return [...new Set(brands)].sort();
  }, [allProducts]);

  // Filtered Products Logic
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Search query match
    if (searchQ) {
      const q = searchQ.toLowerCase();
      result = result.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Categories filter
    if (selectedCategories.length > 0) {
      const CATEGORY_ALIASES = {
        'mobiles': 'mobile-phones',
        'mobile': 'mobile-phones',
        'laptops': 'laptops-computers',
        'laptop': 'laptops-computers',
        'fashion': 'fashion-apparel',
        'beauty': 'beauty-personal-care',
        'home': 'home-living',
        'appliances': 'home-appliances',
        'kitchen': 'home-kitchen',
      };
      result = result.filter((p) => {
        const prodCat = (p.category || '').toLowerCase();
        const prodCatSlug = (p.categorySlug || p.category || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return selectedCategories.some((rawSc) => {
          const sc = rawSc.toLowerCase();
          const mappedSc = CATEGORY_ALIASES[sc] || sc;
          return (
            prodCat.includes(sc) ||
            prodCat.includes(mappedSc) ||
            prodCatSlug.includes(sc) ||
            prodCatSlug.includes(mappedSc) ||
            sc.includes(prodCat) ||
            mappedSc.includes(prodCat)
          );
        });
      });
    }

    // Brands filter
    if (selectedBrands.length > 0) {
      result = result.filter((p) =>
        selectedBrands.some(
          (sb) => (p.brand || '').toLowerCase() === sb.toLowerCase()
        )
      );
    }

    // Price range filter
    result = result.filter((p) => (p.price || 0) <= priceRange);

    // Rating filter
    if (minRating > 0) {
      result = result.filter((p) => (p.rating || p.averageRating || 0) >= minRating);
    }

    // Stock availability filter
    if (hideOutOfStock) {
      result = result.filter((p) => (p.stock !== undefined ? p.stock : p.stockQuantity) > 0);
    }

    // Sorting Logics
    if (sortOption === 'price-low-high') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOption === 'price-high-low') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortOption === 'rating') {
      result.sort((a, b) => (b.rating || b.averageRating || 0) - (a.rating || a.averageRating || 0));
    } else if (sortOption === 'popular') {
      result.sort((a, b) => (b.reviewsCount || b.reviewCount || 0) - (a.reviewsCount || a.reviewCount || 0));
    }

    return result;
  }, [allProducts, searchQ, selectedCategories, selectedBrands, priceRange, minRating, hideOutOfStock, sortOption]);

  const handleCategoryToggle = (id) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleBrandToggle = (name) => {
    setSelectedBrands(prev => 
      prev.includes(name) ? prev.filter(b => b !== name) : [...prev, name]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange(400000);
    setMinRating(0);
    setHideOutOfStock(false);
    setSortOption('featured');
    setSearchParams({});
  };

  return (
    <div className="space-y-8">
      {/* Search Header Banner */}
      <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {searchQ ? `Search Results for "${searchQ}"` : 'Browse Collections'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {loading ? 'Searching catalog...' : `Found ${filteredProducts.length} live products in database.`}
          </p>
        </div>

        {/* Sort & Filter controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button 
            onClick={() => setIsFilterMobileOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold"
          >
            <FiSliders />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold hidden sm:inline">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-cardBg border border-white/10 rounded-lg text-xs font-bold text-white px-3 py-2 focus:outline-none focus:border-primary/40 cursor-pointer"
            >
              <option value="featured">Featured Items</option>
              <option value="popular">Most Popular</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Sidebar Filter Section (Desktop) */}
        <aside className="hidden md:block space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FiSliders className="text-primary" />
              <span>Filters</span>
            </h3>
            <button onClick={clearFilters} className="text-[10px] text-primary font-bold hover:underline">
              Clear All
            </button>
          </div>

          {/* Categories Filter list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wide">Category</h4>
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-2 scrollbar-thin">
              {categoriesList.map((cat) => {
                const checked = selectedCategories.includes(cat.id) || selectedCategories.includes(cat.name);
                return (
                  <label key={cat.id} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={checked}
                      onChange={() => handleCategoryToggle(cat.id)}
                      className="rounded border-white/10 text-primary focus:ring-primary/40 bg-transparent"
                    />
                    <span>{cat.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Brands Filter List */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h4 className="text-xs font-bold text-white tracking-wide">Brands</h4>
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-2 scrollbar-thin">
              {availableBrands.map((brand) => {
                const checked = selectedBrands.includes(brand);
                return (
                  <label key={brand} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={checked}
                      onChange={() => handleBrandToggle(brand)}
                      className="rounded border-white/10 text-primary focus:ring-primary/40 bg-transparent"
                    />
                    <span>{brand}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter Slider */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Max Price</span>
              <span>₹{priceRange.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range" 
              min={1000} 
              max={400000} 
              step={5000}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-primary bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-bold">
              <span>₹1K</span>
              <span>₹400K</span>
            </div>
          </div>

          {/* Ratings minimum selection */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h4 className="text-xs font-bold text-white tracking-wide">Ratings</h4>
            <div className="flex flex-col gap-2">
              {[4, 3, 2].map((num) => (
                <button 
                  key={num}
                  onClick={() => setMinRating(minRating === num ? 0 : num)}
                  className={`flex items-center gap-1.5 text-xs text-left px-2 py-1.5 rounded-lg border transition-all ${
                    minRating === num 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-white/5 border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <FiStar className="fill-current text-primary" />
                  <span>{num}★ & above</span>
                </button>
              ))}
            </div>
          </div>

          {/* Availability Switch */}
          <div className="pt-4 border-t border-white/5">
            <label className="flex items-center gap-2 text-xs text-gray-400 hover:text-white cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={hideOutOfStock}
                onChange={() => setHideOutOfStock(!hideOutOfStock)}
                className="rounded border-white/10 text-primary focus:ring-primary/40 bg-transparent"
              />
              <span>In Stock Items Only</span>
            </label>
          </div>

        </aside>

        {/* Right side Grid Lists */}
        <section className="col-span-1 md:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FiRefreshCw className="animate-spin text-3xl text-primary mb-3" />
              <p className="text-gray-400 font-semibold">Loading marketplace products...</p>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </section>

      </div>

      {/* Mobile Drawer Slide panel */}
      {isFilterMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="max-w-xs w-full bg-[#141414] h-full p-6 flex flex-col justify-between overflow-y-auto animate-slide-left border-l border-white/10">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-sm font-bold text-white">Filters</h3>
                <button onClick={() => setIsFilterMobileOpen(false)} className="text-gray-400 hover:text-white">
                  <FiX size={20} />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Category</h4>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {categoriesList.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 text-xs text-gray-400 select-none">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(cat.id) || selectedCategories.includes(cat.name)}
                        onChange={() => handleCategoryToggle(cat.id)}
                        className="rounded border-white/10 text-primary focus:ring-primary/40 bg-transparent"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="space-y-2 pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Brands</h4>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {availableBrands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 text-xs text-gray-400 select-none">
                      <input 
                        type="checkbox" 
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandToggle(brand)}
                        className="rounded border-white/10 text-primary focus:ring-primary/40 bg-transparent"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Price Range</span>
                  <span className="text-primary">₹{priceRange.toLocaleString('en-IN')}</span>
                </div>
                <input 
                  type="range" 
                  min={1000} 
                  max={400000} 
                  step={5000}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Ratings */}
              <div className="space-y-2 pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Ratings</h4>
                <div className="flex gap-2">
                  {[4, 3].map(num => (
                    <button 
                      key={num}
                      onClick={() => setMinRating(minRating === num ? 0 : num)}
                      className={`flex-grow py-1 px-3 border rounded-lg text-xs ${minRating === num ? 'border-primary text-primary bg-primary/10' : 'border-white/10 text-gray-400'}`}
                    >
                      {num}★+
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex gap-2">
              <button onClick={clearFilters} className="flex-1 py-2 bg-white/5 text-gray-400 rounded-lg text-xs font-bold">
                Reset
              </button>
              <button onClick={() => setIsFilterMobileOpen(false)} className="flex-1 btn-glow-yellow !py-2 text-xs text-black">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
