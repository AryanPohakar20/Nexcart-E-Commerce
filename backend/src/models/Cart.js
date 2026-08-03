import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String, // String ID matching custom Product ID
      ref: 'Product',
      required: true
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    productSnapshot: {
      title: { type: String, required: true },
      image: { type: String },
      priceAtAddition: { type: Number, required: true }
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity cannot be less than 1'],
      default: 1
    },
    selectedColor: {
      type: String,
      default: ''
    },
    selectedSize: {
      type: String,
      default: ''
    },
    selectedVariant: {
      type: String,
      default: ''
    },
    priceAtAddition: {
      type: Number,
      required: true
    },
    currentPrice: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
    stock: {
      type: Number,
      default: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [cartItemSchema],
    saveForLater: [cartItemSchema],
    couponApplied: {
      code: { type: String, default: null },
      discountPercent: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

// Middleware to calculate subtotals before save
cartSchema.pre('save', function (next) {
  this.items.forEach(item => {
    item.subtotal = item.currentPrice * item.quantity;
  });
  this.saveForLater.forEach(item => {
    item.subtotal = item.currentPrice * item.quantity;
  });
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
