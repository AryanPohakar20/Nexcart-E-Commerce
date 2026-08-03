import mongoose from 'mongoose';

const productSpecSchema = new mongoose.Schema({
  key: { type: String, required: true },
  val: { type: String, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // Allow custom IDs like "p1", "p2", etc.
      required: true
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    brand: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be positive']
    },
    mrp: {
      type: Number,
      min: [0, 'MRP must be positive']
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewsCount: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      trim: true
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    specs: [productSpecSchema],
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
