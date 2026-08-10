// src/mappers/productMapper.js

/**
 * Known Category and Brand lookup caches to seamlessly resolve
 * ObjectIds or slugs stored in legacy/seed MongoDB records to human-readable names.
 */
const CATEGORY_MAP = new Map([
  ['6a6af3cdc98f666d227aed3a', 'Mobile Phones'],
  ['6a6af3cdc98f666d227aed47', 'Laptops & Computers'],
  ['6a6af3cdc98f666d227aed55', 'Electronics & Audio'],
  ['6a6af3cec98f666d227aed63', 'Home Appliances'],
  ['6a6af3cec98f666d227aed73', 'Fashion & Apparel'],
  ['6a6af3cec98f666d227aed81', 'Gaming'],
  ['6a6af3cec98f666d227aed8f', 'Home & Living'],
  ['6a6af3cec98f666d227aed9d', 'Beauty & Personal Care'],
  ['6a722cc37ef1135ad4ed4ebf', 'Electronics'],
  ['6a722cc37ef1135ad4ed4ec3', 'Audio'],
  ['6a722cc37ef1135ad4ed4ec8', 'Wearables'],
  ['6a722cc37ef1135ad4ed4ed0', 'Home & Kitchen'],
  ['mobile-phones', 'Mobile Phones'],
  ['laptops-computers', 'Laptops & Computers'],
  ['electronics-audio', 'Electronics & Audio'],
  ['home-appliances', 'Home Appliances'],
  ['fashion-apparel', 'Fashion & Apparel'],
  ['gaming', 'Gaming'],
  ['home-living', 'Home & Living'],
  ['beauty-personal-care', 'Beauty & Personal Care'],
  ['electronics', 'Electronics'],
  ['audio', 'Audio'],
  ['wearables', 'Wearables'],
  ['home-kitchen', 'Home & Kitchen'],
  ['mobiles', 'Mobile Phones'],
  ['laptops', 'Laptops & Computers'],
  ['accessories', 'Accessories'],
]);

const BRAND_MAP = new Map([
  ['6a6771c10bb57ed52057771a', 'Samsung Electronics'],
  ['6a6786310bb57ed520577723', 'Apple Inc.'],
  ['6a6786580bb57ed520577728', 'Nike'],
  ['6a67866e0bb57ed52057772d', 'IKEA'],
  ['6a67868f0bb57ed520577732', 'Sony'],
  ['6a6857c40febc5aea692e261', 'OPPO'],
  ['6a6b02090571db35344c5e30', 'ASUS'],
  ['samsung-electronics', 'Samsung Electronics'],
  ['apple-inc', 'Apple Inc.'],
  ['nike', 'Nike'],
  ['ikea', 'IKEA'],
  ['sony', 'Sony'],
  ['oppo', 'OPPO'],
  ['asus', 'ASUS'],
]);

/**
 * Transforms a raw MongoDB Product document into a rich, backward-compatible Frontend DTO.
 *
 * @param {Object} product - The raw Mongoose Product document.
 * @returns {Object} The formatted Product DTO.
 */
export const toProductDTO = (product) => {
  if (!product) return null;

  // 1. Extract & normalize images
  let primaryImage = null;
  let normalizedImages = [];

  if (Array.isArray(product.images) && product.images.length > 0) {
    if (typeof product.images[0] === 'string') {
      normalizedImages = product.images;
      primaryImage = product.images[0];
    } else {
      normalizedImages = product.images
        .map((img) => (typeof img === 'string' ? img : img?.url))
        .filter(Boolean);
      const primaryObj = product.images.find((img) => img?.isPrimary);
      primaryImage = primaryObj?.url || normalizedImages[0] || null;
    }
  }

  if (!primaryImage && product.thumbnail) primaryImage = product.thumbnail;
  if (!primaryImage && product.image) primaryImage = product.image;
  if (!primaryImage) {
    primaryImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80';
  }
  if (normalizedImages.length === 0) {
    normalizedImages = [primaryImage];
  }

  // 2. Resolve Category
  let categoryName = 'Electronics';
  let categoryId = '';
  if (product.category) {
    if (typeof product.category === 'object' && product.category.name) {
      categoryName = product.category.name;
      categoryId = product.category._id ? product.category._id.toString() : '';
    } else {
      const catStr = product.category.toString();
      categoryId = catStr;
      categoryName = CATEGORY_MAP.get(catStr) || catStr;
    }
  }

  // 3. Resolve Brand
  let brandName = 'NexCart';
  let brandId = '';
  if (product.specifications && product.specifications.Brand) {
    brandName = product.specifications.Brand;
  } else if (product.brand) {
    if (typeof product.brand === 'object' && product.brand.name) {
      brandName = product.brand.name;
      brandId = product.brand._id ? product.brand._id.toString() : '';
    } else {
      const brandStr = product.brand.toString();
      brandId = brandStr;
      brandName = BRAND_MAP.get(brandStr) || (BRAND_MAP.get(brandStr.toLowerCase()) || brandStr);
    }
  }

  // 4. Resolve Seller
  let sellerData = product.seller;
  let sellerDisplayName = 'NexCart Verified Store';
  if (typeof product.seller === 'string') {
    sellerDisplayName = product.seller;
    sellerData = {
      id: product.seller,
      name: product.seller,
      verified: true,
    };
  } else if (product.seller && typeof product.seller === 'object') {
    sellerDisplayName =
      product.seller.business?.businessName ||
      product.seller.accountInfo?.displayName ||
      product.seller.name ||
      product.seller.slug ||
      'NexCart Verified Store';
    sellerData = {
      id: product.seller._id || product.seller.id,
      name: sellerDisplayName,
      verified: product.seller.verificationStatus === 'Approved' || product.sellerVerified || false,
    };
  }

  // 5. Calculate Pricing & Discounts
  const price = Number(product.price) || 0;
  const rawMrp = product.originalPrice || product.compareAtPrice || product.mrp;
  const mrp = rawMrp ? Number(rawMrp) : (price > 0 ? Math.round(price * 1.15) : 0);
  let discount = 0;
  if (product.discountPercentage !== undefined && product.discountPercentage !== null) {
    discount = Number(product.discountPercentage);
  } else if (product.discount !== undefined && product.discount !== null) {
    discount = Number(product.discount);
  } else if (mrp > price && mrp > 0) {
    discount = Math.round(((mrp - price) / mrp) * 100);
  }

  // 6. Stock and Inventory
  const stock =
    product.stockQuantity !== undefined
      ? Number(product.stockQuantity)
      : (product.stock !== undefined ? Number(product.stock) : 0);
  const inStock = product.inStock !== undefined ? Boolean(product.inStock) : stock > 0;

  // 7. Ratings and Reviews
  const rating =
    product.rating !== undefined && product.rating !== null
      ? Number(product.rating)
      : (product.averageRating !== undefined
        ? Number(product.averageRating)
        : (product.ratings?.average !== undefined ? Number(product.ratings.average) : 4.5));

  const reviewCount =
    product.reviewCount !== undefined && product.reviewCount !== null
      ? Number(product.reviewCount)
      : (product.reviewsCount !== undefined
        ? Number(product.reviewsCount)
        : (product.ratings?.count !== undefined ? Number(product.ratings.count) : 0));

  // 8. ID resolution (support MongoDB _id, custom id like PROD-MOB-0001, or slug)
  const id = product.id || (product._id ? product._id.toString() : '');
  const _id = product._id ? product._id.toString() : (product.id || '');
  const title = product.title || product.name || 'Untitled Product';

  const isFeatured =
    product.isFeatured !== undefined
      ? Boolean(product.isFeatured)
      : (product.featured !== undefined ? Boolean(product.featured) : false);

  const isTrending =
    product.isTrending !== undefined
      ? Boolean(product.isTrending)
      : (product.trending !== undefined ? Boolean(product.trending) : false);

  const status =
    stock <= 0
      ? 'out_of_stock'
      : (product.status?.toLowerCase() === 'approved' || product.status?.toLowerCase() === 'active')
        ? 'active'
        : (product.status || 'active');

  return {
    id,
    _id,
    title,
    name: title,
    description: product.description || '',
    shortDescription: product.shortDescription || '',
    brand: brandName,
    brandId,
    category: categoryName,
    categoryId,
    price,
    mrp,
    originalPrice: mrp,
    discount,
    discountPercentage: discount,
    rating,
    reviewsCount: reviewCount,
    reviewCount,
    reviews: Array.isArray(product.reviews) ? product.reviews : [],
    image: primaryImage,
    images: normalizedImages,
    thumbnail: primaryImage,
    stock,
    stockQuantity: stock,
    inStock,
    isFeatured,
    featured: isFeatured,
    isTrending,
    trending: isTrending,
    condition: product.condition || 'New',
    delivery: product.delivery || {
      shippingType: 'Standard Delivery',
      deliveryCharge: 0,
      estimatedDays: 3,
      freeDelivery: true,
    },
    seller: sellerData,
    sellerDisplayName,
    specs: product.specifications || product.specs || product.attributes || {},
    specifications: product.specifications || product.specs || product.attributes || {},
    status,
    rawStatus: product.status || product.approvalStatus || 'Approved',
    sku: product.sku || product.id || `SKU-${_id.slice(-6).toUpperCase()}`,
    slug: product.slug || '',
    tags: Array.isArray(product.tags) ? product.tags : [],
    color: product.color || '',
    colorOptions: Array.isArray(product.colorOptions) ? product.colorOptions : [],
    variants: Array.isArray(product.variants) ? product.variants : [],
    topHighlights: Array.isArray(product.topHighlights) ? product.topHighlights : [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

/**
 * Transforms an array of raw MongoDB Product documents into DTOs.
 *
 * @param {Array} products - Array of raw Mongoose Product documents.
 * @returns {Array} Array of formatted Product DTOs.
 */
export const toProductDTOList = (products) => {
  if (!Array.isArray(products)) return [];
  return products.map(toProductDTO).filter(Boolean);
};
