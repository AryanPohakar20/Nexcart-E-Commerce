// src/mappers/productMapper.js

/**
 * Transforms a raw MongoDB Product document into a structured Frontend DTO.
 * Ensures backward compatibility while hiding internal database fields.
 *
 * @param {Object} product - The raw Mongoose Product document.
 * @returns {Object} The formatted Product DTO.
 */
export const toProductDTO = (product) => {
  if (!product) return null;

  // Extract primary image or fallback to first available
  let primaryImage = null;
  if (product.images && product.images.length > 0) {
    const primary = product.images.find((img) => img.isPrimary);
    primaryImage = primary ? primary.url : product.images[0].url;
  }
  // Backward compatibility fallback for legacy 'thumbnail' field if it exists during transition
  if (!primaryImage && product.thumbnail) {
    primaryImage = product.thumbnail;
  }

  // Handle populated or unpopulated category
  const categoryStr =
    product.category && typeof product.category === 'object' && product.category.name
      ? product.category.name
      : product.category;

  // Handle populated or unpopulated seller
  let sellerData = product.seller;
  if (product.seller && typeof product.seller === 'object') {
    // If it's populated, we can format it nicely
    sellerData = {
      id: product.seller._id || product.seller.id,
      name: product.sellerDisplayName || product.seller.slug || 'Unknown Seller',
      verified: product.sellerVerified || false,
    };
  } else if (product.sellerDisplayName) {
    sellerData = {
      id: product.seller,
      name: product.sellerDisplayName,
      verified: product.sellerVerified || false,
    };
  }

  return {
    id: product._id ? product._id.toString() : product.id,
    title: product.title || product.name || '', // 'name' fallback for legacy documents
    description: product.description || '',
    shortDescription: product.shortDescription || '',
    brand: product.brand || '',
    category: categoryStr,
    price: product.price || 0,
    mrp: product.mrp || product.compareAtPrice || null, // fallback to compareAtPrice
    discount: product.discountPercentage || 0,
    rating: product.averageRating || (product.ratings && product.ratings.average) || 0,
    reviewsCount: product.reviewCount || (product.ratings && product.ratings.count) || 0,
    image: primaryImage,
    delivery: product.delivery || {
      shippingType: 'Standard',
      deliveryCharge: 0,
      estimatedDays: 5,
      freeDelivery: false,
    },
    stock: product.stock || 0,
    condition: product.condition || 'New',
    seller: sellerData,
    specs: product.specifications || product.attributes || [], // fallback to old attributes
    status: product.status || 'Active',
    tags: product.tags || [],
    slug: product.slug || '',
    sku: product.sku || '',
  };
};

/**
 * Transforms an array of raw MongoDB Product documents into DTOs.
 */
export const toProductDTOList = (products) => {
  if (!Array.isArray(products)) return [];
  return products.map(toProductDTO);
};
