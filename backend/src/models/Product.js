import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    // CORE PRODUCT INFORMATION
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [250, 'Product title cannot exceed 250 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Usually Seller or User
      required: [true, 'Seller ID is required'],
    },
    sellerType: {
      type: String,
      enum: ['individual', 'business', 'seller', 'marketplace_seller'],
      default: 'seller',
    },
    condition: {
      type: String,
      enum: ['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Refurbished', 'Used'],
      required: [true, 'Product condition is required'],
      default: 'New',
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Active', 'Hidden', 'Sold', 'Expired', 'Rejected', 'Deleted'],
      required: [true, 'Status is required'],
      default: 'Active',
    },
    visibility: {
      type: Boolean,
      default: true,
    },

    // PRICING
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    mrp: {
      type: Number,
      required: [true, 'MRP is required'],
      min: [0, 'MRP cannot be negative'],
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      default: 0,
    },

    // INVENTORY
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
      default: function () {
        return `SKU-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
      },
    },
    tags: {
      type: [String],
      default: [],
    },

    // MEDIA
    images: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, default: null },
          alt: { type: String, default: '' },
          isPrimary: { type: Boolean, default: false },
          displayOrder: { type: Number, default: 0 },
        }
      ],
      validate: [
        {
          validator: function(val) {
            return val && val.length > 0;
          },
          message: 'At least one image is required'
        }
      ]
    },

    // SPECIFICATIONS
    specs: {
      type: [
        {
          key: { type: String, trim: true, required: true },
          val: { type: String, trim: true, required: true },
        }
      ],
      default: [],
    },

    // DELIVERY
    delivery: {
      type: String,
      default: 'Free Express Delivery by Tomorrow'
    },

    // PRODUCT CONDITION (Optional fields)
    purchaseYear: { type: Number, default: null },
    usageDuration: { type: String, default: '' },
    originalBillAvailable: { type: Boolean, default: false },
    warrantyAvailable: { type: Boolean, default: false },
    warrantyRemaining: { type: String, default: '' },

    // PRODUCT STATISTICS
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    // Advanced Rating Fields (from Reviews Integration)
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    ratingDistribution: {
      type: Map,
      of: Number,
      default: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    },
    lastRatingUpdatedAt: { type: Date, default: null },
    
    views: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },

    // STATUS MODERATION
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
    rejectedReason: { type: String, default: '' },

    // SOFT DELETE
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // MARKETPLACE FLAGS (from manjusha-product — needed by productService queries)
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for backward compatibility and frontend requirement
productSchema.virtual('image').get(function () {
  if (this.images && this.images.length > 0) {
    const primary = this.images.find(img => img.isPrimary);
    return primary ? primary.url : this.images[0].url;
  }
  return null;
});

// JSON Transformation for frontend
productSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    return {
      id: ret._id,
      title: ret.title,
      description: ret.description,
      brand: ret.brand,
      category: ret.category,
      price: ret.price,
      mrp: ret.mrp,
      rating: ret.rating,
      reviewsCount: ret.reviewsCount,
      image: ret.image, // from virtual
      delivery: ret.delivery,
      stock: ret.stock,
      discount: ret.discount,
      specs: ret.specs
    };
  }
});

// Import Transformation Layer
productSchema.statics.importData = function (data) {
  const title = data.name || data.title || 'Untitled Product';
  const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    title,
    slug: data.slug || `${slugBase}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
    description: data.description || title,
    price: data.price || 0,
    mrp: data.mrp || (data.price ? data.price * 1.2 : 0), // sensible default
    discount: data.discount || 0,
    category: data.category || 'Uncategorized',
    stock: data.stock || 0,
    brand: data.brand || 'Generic',
    sellerId: data.sellerId || data.seller || new mongoose.Types.ObjectId(),
    condition: data.condition || 'New',
    status: data.status || 'Active',
    visibility: data.visibility !== undefined ? data.visibility : true,
    sku: data.sku || `SKU-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
    tags: data.tags || [],
    delivery: typeof data.delivery === 'string' ? data.delivery : 'Free Express Delivery by Tomorrow',
    images: data.image ? [{ url: data.image, isPrimary: true }] : (data.images && data.images.length > 0 ? data.images : [{ url: 'https://via.placeholder.com/150', isPrimary: true }]),
    specs: data.specs || []
  };
};

// ─── Indexes ──────────────────────────────────────────────────────────────────
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ sellerId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isTrending: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
