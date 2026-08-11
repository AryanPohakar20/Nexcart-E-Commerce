import mongoose from 'mongoose';

const marketplaceListingSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller ID is required'],
    },
    sellerName: {
      type: String,
      default: '',
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [250, 'Title cannot exceed 250 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    mrp: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    condition: {
      type: String,
      default: 'Like New',
    },
    usageDuration: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    deliveryType: {
      type: String,
      default: 'Meetup & Courier',
    },
    hasBox: {
      type: Boolean,
      default: false,
    },
    hasBill: {
      type: Boolean,
      default: false,
    },
    negotiable: {
      type: Boolean,
      default: false,
    },
    brand: {
      type: String,
      default: '',
    },
    sku: {
      type: String,
      default: '',
    },
    warranty: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      default: 1,
      min: [0, 'Stock cannot be negative'],
    },
    sellerType: {
      type: String,
      enum: ['individual_c2c', 'business'],
      default: 'individual_c2c',
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'sold', 'deleted', 'hidden'],
      default: 'active',
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: null },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for primary image URL
marketplaceListingSchema.virtual('image').get(function () {
  if (this.images && this.images.length > 0) {
    const primary = this.images.find((img) => img.isPrimary);
    return primary ? primary.url : this.images[0].url;
  }
  return 'https://via.placeholder.com/400';
});

marketplaceListingSchema.index({ sellerId: 1 });
marketplaceListingSchema.index({ category: 1 });
marketplaceListingSchema.index({ status: 1 });
marketplaceListingSchema.index({ createdAt: -1 });

const MarketplaceListing = mongoose.model('MarketplaceListing', marketplaceListingSchema);

export default MarketplaceListing;
