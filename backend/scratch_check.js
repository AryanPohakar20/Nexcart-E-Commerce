import 'dotenv/config';
import connectDB from './src/config/db.js';
import Product from './src/models/Product.js';
import Category from './src/models/Category.js';
import Brand from './src/models/Brand.js';

async function testMapping() {
  await connectDB();
  const allCats = await Category.find().lean();
  const allBrands = await Brand.find().lean();

  const catMap = new Map();
  allCats.forEach(c => {
    catMap.set(c._id.toString(), c.name);
    catMap.set(c.slug, c.name);
  });

  const brandMap = new Map();
  allBrands.forEach(b => {
    brandMap.set(b._id.toString(), b.name);
    brandMap.set(b.slug, b.name);
  });

  const allProds = await Product.find().lean();

  function mapProduct(p) {
    let primaryImage = null;
    let images = [];
    if (p.images && p.images.length > 0) {
      if (typeof p.images[0] === 'string') {
        images = p.images;
        primaryImage = p.images[0];
      } else {
        images = p.images.map(img => (typeof img === 'string' ? img : img?.url)).filter(Boolean);
        const primary = p.images.find(img => img?.isPrimary);
        primaryImage = primary ? primary.url : (images[0] || null);
      }
    }
    if (!primaryImage && p.thumbnail) primaryImage = p.thumbnail;
    if (!primaryImage && p.image) primaryImage = p.image;
    if (!primaryImage) primaryImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

    let catName = 'General';
    if (p.category) {
      if (typeof p.category === 'object' && p.category.name) {
        catName = p.category.name;
      } else {
        const catStr = p.category.toString();
        catName = catMap.get(catStr) || catStr;
      }
    }

    let brandName = 'NexCart';
    if (p.specifications && p.specifications.Brand) {
      brandName = p.specifications.Brand;
    } else if (p.brand) {
      if (typeof p.brand === 'object' && p.brand.name) {
        brandName = p.brand.name;
      } else {
        const brandStr = p.brand.toString();
        brandName = brandMap.get(brandStr) || brandStr;
      }
    }

    let sellerName = 'Direct Store';
    if (typeof p.seller === 'string') {
      sellerName = p.seller;
    } else if (p.seller && typeof p.seller === 'object') {
      sellerName = p.seller.business?.businessName || p.seller.accountInfo?.displayName || p.seller.name || p.seller.slug || 'Direct Store';
    }

    const price = p.price || 0;
    const mrp = p.originalPrice || p.compareAtPrice || p.mrp || price;
    const discount = p.discountPercentage !== undefined ? p.discountPercentage : (p.discount !== undefined ? p.discount : (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0));
    const stock = p.stockQuantity !== undefined ? p.stockQuantity : (p.stock !== undefined ? p.stock : 0);
    const rating = p.rating !== undefined ? p.rating : (p.averageRating !== undefined ? p.averageRating : (p.ratings?.average !== undefined ? p.ratings.average : 4.5));
    const reviewsCount = p.reviewCount !== undefined ? p.reviewCount : (p.reviewsCount !== undefined ? p.reviewsCount : (p.ratings?.count !== undefined ? p.ratings.count : 0));

    return {
      id: p.id || (p._id ? p._id.toString() : ''),
      _id: p._id ? p._id.toString() : (p.id || ''),
      title: p.title || p.name || 'Product',
      name: p.title || p.name || 'Product',
      description: p.description || '',
      shortDescription: p.shortDescription || '',
      brand: brandName,
      category: catName,
      categoryId: p.category?._id ? p.category._id.toString() : (p.category ? p.category.toString() : ''),
      price,
      mrp,
      originalPrice: mrp,
      discount,
      discountPercentage: discount,
      rating,
      reviewsCount,
      reviewCount: reviewsCount,
      reviews: p.reviews || [],
      image: primaryImage,
      images: images.length > 0 ? images : [primaryImage],
      stock,
      stockQuantity: stock,
      inStock: p.inStock !== undefined ? p.inStock : stock > 0,
      isFeatured: p.isFeatured !== undefined ? p.isFeatured : (p.featured !== undefined ? p.featured : false),
      featured: p.featured !== undefined ? p.featured : (p.isFeatured !== undefined ? p.isFeatured : false),
      isTrending: p.isTrending !== undefined ? p.isTrending : (p.trending !== undefined ? p.trending : false),
      trending: p.trending !== undefined ? p.trending : (p.isTrending !== undefined ? p.isTrending : false),
      status: stock <= 0 ? 'out_of_stock' : (p.status?.toLowerCase() === 'approved' || p.status?.toLowerCase() === 'active') ? 'active' : (p.status || 'active'),
      rawStatus: p.status || p.approvalStatus || 'Approved',
      seller: sellerName,
      condition: p.condition || 'new',
      specs: p.specifications || p.specs || p.attributes || {},
      specifications: p.specifications || p.specs || p.attributes || {},
      sku: p.sku || p.id || '',
      slug: p.slug || '',
      tags: p.tags || [],
      color: p.color || '',
      colorOptions: p.colorOptions || [],
      variants: p.variants || [],
      topHighlights: p.topHighlights || [],
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  const mapped = allProds.map(mapProduct);
  console.log('Successfully mapped count:', mapped.length);
  console.log('Sample 1 (seed product):', mapped[0]);
  console.log('Sample 170 (admin product):', mapped[165]);

  // Check unique categories and brands across all mapped
  const uniqueCats = [...new Set(mapped.map(m => m.category))];
  const uniqueBrands = [...new Set(mapped.map(m => m.brand))];
  console.log('Unique categories:', uniqueCats);
  console.log('Unique brands count:', uniqueBrands.length, 'Sample brands:', uniqueBrands.slice(0, 10));

  process.exit(0);
}

testMapping();
