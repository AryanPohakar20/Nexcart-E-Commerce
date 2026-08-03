import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { DUMMY_PRODUCTS } from '../config/seed.js';
import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Shared in-memory mock database for cart
export const MOCK_CARTS = {};

export const getMockCart = (userId) => {
  if (!MOCK_CARTS[userId]) {
    MOCK_CARTS[userId] = {
      userId,
      items: [],
      saveForLater: [],
      couponApplied: { code: null, discountPercent: 0, discountAmount: 0 }
    };
  }
  return MOCK_CARTS[userId];
};

// Calculate cart totals and coupon discounts
const calculateCartTotals = (cart) => {
  let subtotal = 0;
  const priceChanges = [];

  // Recalculate item subtotals
  cart.items.forEach(item => {
    // If running mock mode, productId is already the product object
    const product = process.env.MOCK_DB === 'true' ? item.productId : item.productId;
    if (!product || product.isDeleted) {
      item.isAvailable = false;
      item.stock = 0;
      item.currentPrice = item.priceAtAddition;
      item.subtotal = 0;
    } else {
      item.isAvailable = product.stock > 0;
      item.stock = product.stock;
      
      if (item.quantity > product.stock) {
        item.quantity = product.stock > 0 ? product.stock : 1;
      }

      if (product.price !== item.currentPrice) {
        priceChanges.push({
          productId: product._id,
          title: product.title,
          oldPrice: item.currentPrice,
          newPrice: product.price
        });
        item.currentPrice = product.price;
      }
      
      item.subtotal = item.currentPrice * item.quantity;
      subtotal += item.subtotal;
    }
  });

  cart.saveForLater.forEach(item => {
    const product = item.productId;
    if (product && !product.isDeleted) {
      item.stock = product.stock;
      item.isAvailable = product.stock > 0;
      if (product.price !== item.currentPrice) {
        item.currentPrice = product.price;
      }
      item.subtotal = item.currentPrice * item.quantity;
    }
  });

  const tax = Math.round(subtotal * 0.12);
  const isFreeShipping = subtotal >= 20000 || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : 150;

  let discount = 0;
  if (cart.couponApplied && cart.couponApplied.code) {
    const code = cart.couponApplied.code.toUpperCase();
    
    if (code === 'FREESHIP' && subtotal >= 10000) {
      discount = shippingFee;
      cart.couponApplied.discountAmount = discount;
    } else if (code === 'FLASH50' && subtotal >= 5000) {
      discount = Math.min(Math.round(subtotal * 0.5), 10000);
      cart.couponApplied.discountPercent = 50;
      cart.couponApplied.discountAmount = discount;
    } else if (code === 'WELCOME20' && subtotal >= 1000) {
      discount = Math.round(subtotal * 0.2);
      cart.couponApplied.discountPercent = 20;
      cart.couponApplied.discountAmount = discount;
    } else {
      cart.couponApplied = { code: null, discountPercent: 0, discountAmount: 0 };
    }
  }

  const grandTotal = subtotal + tax + shippingFee - discount;

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const estimatedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return {
    subtotal,
    tax,
    shippingFee,
    discount,
    grandTotal,
    estimatedDelivery,
    priceChanges
  };
};

const saveCartHelper = async (cart) => {
  // Compute custom pre-save subtotals logic if using in-memory mock
  if (process.env.MOCK_DB === 'true') {
    cart.items.forEach(item => {
      item.subtotal = item.currentPrice * item.quantity;
    });
    cart.saveForLater.forEach(item => {
      item.subtotal = item.currentPrice * item.quantity;
    });
  } else {
    await cart.save();
  }
};

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (process.env.MOCK_DB === 'true') {
    const cart = getMockCart(userId);
    const calculations = calculateCartTotals(cart);
    return successResponse(res, 'Cart fetched successfully (Mock)', {
      cart,
      summary: calculations
    });
  }

  let cart = await Cart.findOne({ userId })
    .populate('items.productId')
    .populate('saveForLater.productId');

  if (!cart) {
    cart = await Cart.create({ userId, items: [], saveForLater: [] });
  }

  const calculations = calculateCartTotals(cart);
  await saveCartHelper(cart);

  return successResponse(res, 'Cart fetched successfully', {
    cart,
    summary: calculations
  });
});

// POST /api/cart/add
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, selectedColor, selectedSize, selectedVariant, priceAtAddition } = req.body;
  const userId = req.user._id;

  if (process.env.MOCK_DB === 'true') {
    const product = DUMMY_PRODUCTS.find(p => p._id === productId);
    if (!product) {
      throw new ApiError(404, 'Product not found or unavailable');
    }
    if (product.stock <= 0) {
      throw new ApiError(400, 'Product is currently out of stock');
    }

    const cart = getMockCart(userId);
    const existingIndex = cart.items.findIndex(
      item => item.productId._id === productId && item.selectedVariant === (selectedVariant || '')
    );

    if (existingIndex > -1) {
      const nextQty = cart.items[existingIndex].quantity + quantity;
      if (nextQty > product.stock) {
        throw new ApiError(400, `Cannot add more. Only ${product.stock} items available in stock`);
      }
      cart.items[existingIndex].quantity = nextQty;
      cart.items[existingIndex].currentPrice = product.price;
      cart.items[existingIndex].stock = product.stock;
    } else {
      if (quantity > product.stock) {
        throw new ApiError(400, `Cannot add quantity ${quantity}. Only ${product.stock} items available in stock`);
      }
      cart.items.push({
        productId: product, // In mock mode, we embed the product object directly so calculations work without populate!
        sellerId: null,
        productSnapshot: {
          title: product.title,
          image: product.image,
          priceAtAddition
        },
        quantity,
        selectedColor: selectedColor || '',
        selectedSize: selectedSize || '',
        selectedVariant: selectedVariant || '',
        priceAtAddition,
        currentPrice: product.price,
        subtotal: product.price * quantity,
        stock: product.stock,
        isAvailable: true
      });
    }

    const calculations = calculateCartTotals(cart);
    return successResponse(res, 'Item added to cart successfully (Mock)', {
      cart,
      summary: calculations
    }, 201);
  }

  // Database Flow
  const product = await Product.findOne({ _id: productId, isDeleted: false });
  if (!product) {
    throw new ApiError(404, 'Product not found or unavailable');
  }

  if (product.stock <= 0) {
    throw new ApiError(400, 'Product is currently out of stock');
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [], saveForLater: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    item => item.productId === productId && item.selectedVariant === (selectedVariant || '')
  );

  if (existingItemIndex > -1) {
    const nextQty = cart.items[existingItemIndex].quantity + quantity;
    if (nextQty > product.stock) {
      throw new ApiError(400, `Cannot add more. Only ${product.stock} items available in stock`);
    }
    cart.items[existingItemIndex].quantity = nextQty;
    cart.items[existingItemIndex].currentPrice = product.price;
    cart.items[existingItemIndex].stock = product.stock;
    cart.items[existingItemIndex].updatedAt = new Date();
  } else {
    if (quantity > product.stock) {
      throw new ApiError(400, `Cannot add quantity ${quantity}. Only ${product.stock} items available in stock`);
    }
    cart.items.push({
      productId,
      sellerId: product.sellerId,
      productSnapshot: {
        title: product.title,
        image: product.image,
        priceAtAddition
      },
      quantity,
      selectedColor: selectedColor || '',
      selectedSize: selectedSize || '',
      selectedVariant: selectedVariant || '',
      priceAtAddition,
      currentPrice: product.price,
      subtotal: product.price * quantity,
      stock: product.stock,
      isAvailable: true
    });
  }

  await saveCartHelper(cart);
  
  cart = await Cart.findById(cart._id)
    .populate('items.productId')
    .populate('saveForLater.productId');
    
  const calculations = calculateCartTotals(cart);
  await saveCartHelper(cart);

  return successResponse(res, 'Item added to cart successfully', {
    cart,
    summary: calculations
  }, 201);
});

// PATCH /api/cart/update/:productId
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;

  if (process.env.MOCK_DB === 'true') {
    const product = DUMMY_PRODUCTS.find(p => p._id === productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    if (quantity > product.stock) {
      throw new ApiError(400, `Only ${product.stock} items available in stock`);
    }

    const cart = getMockCart(userId);
    const itemIndex = cart.items.findIndex(item => item.productId._id === productId);
    if (itemIndex === -1) {
      throw new ApiError(404, 'Item not found in cart');
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].currentPrice = product.price;
    cart.items[itemIndex].stock = product.stock;

    const calculations = calculateCartTotals(cart);
    return successResponse(res, 'Cart item updated successfully (Mock)', {
      cart,
      summary: calculations
    });
  }

  const product = await Product.findOne({ _id: productId, isDeleted: false });
  if (!product) {
    throw new ApiError(404, 'Product not found or unavailable');
  }

  if (quantity > product.stock) {
    throw new ApiError(400, `Only ${product.stock} items available in stock`);
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const itemIndex = cart.items.findIndex(item => item.productId === productId);
  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }

  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].currentPrice = product.price;
  cart.items[itemIndex].stock = product.stock;
  cart.items[itemIndex].updatedAt = new Date();

  await saveCartHelper(cart);

  cart = await Cart.findById(cart._id)
    .populate('items.productId')
    .populate('saveForLater.productId');
    
  const calculations = calculateCartTotals(cart);
  await saveCartHelper(cart);

  return successResponse(res, 'Cart item updated successfully', {
    cart,
    summary: calculations
  });
});

// DELETE /api/cart/remove/:productId
export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  if (process.env.MOCK_DB === 'true') {
    const cart = getMockCart(userId);
    cart.items = cart.items.filter(item => item.productId._id !== productId);
    cart.saveForLater = cart.saveForLater.filter(item => item.productId._id !== productId);
    const calculations = calculateCartTotals(cart);
    return successResponse(res, 'Item removed from cart (Mock)', {
      cart,
      summary: calculations
    });
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  cart.items = cart.items.filter(item => item.productId !== productId);
  cart.saveForLater = cart.saveForLater.filter(item => item.productId !== productId);
  await saveCartHelper(cart);

  cart = await Cart.findById(cart._id)
    .populate('items.productId')
    .populate('saveForLater.productId');
    
  const calculations = calculateCartTotals(cart);
  await saveCartHelper(cart);

  return successResponse(res, 'Item removed from cart', {
    cart,
    summary: calculations
  });
});

// DELETE /api/cart/clear
export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (process.env.MOCK_DB === 'true') {
    const cart = getMockCart(userId);
    cart.items = [];
    cart.couponApplied = { code: null, discountPercent: 0, discountAmount: 0 };
    const calculations = calculateCartTotals(cart);
    return successResponse(res, 'Cart cleared successfully (Mock)', {
      cart,
      summary: calculations
    });
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  cart.items = [];
  cart.couponApplied = { code: null, discountPercent: 0, discountAmount: 0 };
  await saveCartHelper(cart);

  cart = await Cart.findById(cart._id)
    .populate('items.productId')
    .populate('saveForLater.productId');
    
  const calculations = calculateCartTotals(cart);
  await saveCartHelper(cart);

  return successResponse(res, 'Cart cleared successfully', {
    cart,
    summary: calculations
  });
});

// POST /api/cart/save-for-later
export const saveForLater = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  if (process.env.MOCK_DB === 'true') {
    const cart = getMockCart(userId);
    const itemIndex = cart.items.findIndex(item => item.productId._id === productId);
    if (itemIndex === -1) {
      throw new ApiError(404, 'Item not found in cart');
    }

    const itemToMove = cart.items[itemIndex];
    cart.items.splice(itemIndex, 1);

    const alreadySaved = cart.saveForLater.some(item => item.productId._id === productId);
    if (!alreadySaved) {
      cart.saveForLater.push({
        ...itemToMove,
        addedAt: new Date()
      });
    }

    const calculations = calculateCartTotals(cart);
    return successResponse(res, 'Item saved for later (Mock)', {
      cart,
      summary: calculations
    });
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const itemIndex = cart.items.findIndex(item => item.productId === productId);
  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }

  const itemToMove = cart.items[itemIndex];
  cart.items.splice(itemIndex, 1);

  const alreadySaved = cart.saveForLater.some(item => item.productId === productId);
  if (!alreadySaved) {
    cart.saveForLater.push({
      ...itemToMove.toObject(),
      addedAt: new Date()
    });
  }

  await saveCartHelper(cart);

  cart = await Cart.findById(cart._id)
    .populate('items.productId')
    .populate('saveForLater.productId');
    
  const calculations = calculateCartTotals(cart);
  await saveCartHelper(cart);

  return successResponse(res, 'Item saved for later', {
    cart,
    summary: calculations
  });
});

// POST /api/cart/move-to-cart
export const moveToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  if (process.env.MOCK_DB === 'true') {
    const product = DUMMY_PRODUCTS.find(p => p._id === productId);
    if (!product || product.stock <= 0) {
      throw new ApiError(400, 'Product is out of stock or no longer available');
    }

    const cart = getMockCart(userId);
    const savedIndex = cart.saveForLater.findIndex(item => item.productId._id === productId);
    if (savedIndex === -1) {
      throw new ApiError(404, 'Item not found in save for later list');
    }

    const itemToMove = cart.saveForLater[savedIndex];
    cart.saveForLater.splice(savedIndex, 1);

    const existingIndex = cart.items.findIndex(item => item.productId._id === productId);
    if (existingIndex > -1) {
      const nextQty = cart.items[existingIndex].quantity + itemToMove.quantity;
      cart.items[existingIndex].quantity = Math.min(nextQty, product.stock);
    } else {
      cart.items.push({
        ...itemToMove,
        quantity: Math.min(itemToMove.quantity, product.stock),
        addedAt: new Date()
      });
    }

    const calculations = calculateCartTotals(cart);
    return successResponse(res, 'Item moved back to cart (Mock)', {
      cart,
      summary: calculations
    });
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const savedIndex = cart.saveForLater.findIndex(item => item.productId === productId);
  if (savedIndex === -1) {
    throw new ApiError(404, 'Item not found in save for later list');
  }

  const itemToMove = cart.saveForLater[savedIndex];

  const product = await Product.findOne({ _id: productId, isDeleted: false });
  if (!product || product.stock <= 0) {
    throw new ApiError(400, 'Product is out of stock or no longer available');
  }

  cart.saveForLater.splice(savedIndex, 1);

  const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
  if (existingItemIndex > -1) {
    const nextQty = cart.items[existingItemIndex].quantity + itemToMove.quantity;
    cart.items[existingItemIndex].quantity = Math.min(nextQty, product.stock);
  } else {
    cart.items.push({
      ...itemToMove.toObject(),
      quantity: Math.min(itemToMove.quantity, product.stock),
      addedAt: new Date()
    });
  }

  await saveCartHelper(cart);

  cart = await Cart.findById(cart._id)
    .populate('items.productId')
    .populate('saveForLater.productId');
    
  const calculations = calculateCartTotals(cart);
  await saveCartHelper(cart);

  return successResponse(res, 'Item moved back to cart', {
    cart,
    summary: calculations
  });
});

// POST /api/cart/apply-coupon
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const userId = req.user._id;

  if (process.env.MOCK_DB === 'true') {
    const cart = getMockCart(userId);
    const codeUpper = code.toUpperCase();
    const validCoupons = ['FREESHIP', 'FLASH50', 'WELCOME20'];
    if (!validCoupons.includes(codeUpper)) {
      throw new ApiError(400, 'Invalid coupon code');
    }

    cart.couponApplied = {
      code: codeUpper,
      discountPercent: 0,
      discountAmount: 0
    };

    const calculations = calculateCartTotals(cart);
    
    if (calculations.discount === 0) {
      cart.couponApplied = { code: null, discountPercent: 0, discountAmount: 0 };
      throw new ApiError(400, `Cart does not meet the requirements for coupon ${codeUpper}`);
    }

    return successResponse(res, `Coupon ${codeUpper} applied successfully (Mock)`, {
      cart,
      summary: calculations
    });
  }

  let cart = await Cart.findOne({ userId })
    .populate('items.productId')
    .populate('saveForLater.productId');

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const codeUpper = code.toUpperCase();
  const validCoupons = ['FREESHIP', 'FLASH50', 'WELCOME20'];
  if (!validCoupons.includes(codeUpper)) {
    throw new ApiError(400, 'Invalid coupon code');
  }

  cart.couponApplied = {
    code: codeUpper,
    discountPercent: 0,
    discountAmount: 0
  };

  const calculations = calculateCartTotals(cart);
  
  if (calculations.discount === 0) {
    cart.couponApplied = { code: null, discountPercent: 0, discountAmount: 0 };
    await saveCartHelper(cart);
    throw new ApiError(400, `Cart does not meet the requirements for coupon ${codeUpper}`);
  }

  await saveCartHelper(cart);

  return successResponse(res, `Coupon ${codeUpper} applied successfully`, {
    cart,
    summary: calculations
  });
});

// POST /api/cart/remove-coupon
export const removeCoupon = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (process.env.MOCK_DB === 'true') {
    const cart = getMockCart(userId);
    cart.couponApplied = { code: null, discountPercent: 0, discountAmount: 0 };
    const calculations = calculateCartTotals(cart);
    return successResponse(res, 'Coupon removed successfully (Mock)', {
      cart,
      summary: calculations
    });
  }

  let cart = await Cart.findOne({ userId })
    .populate('items.productId')
    .populate('saveForLater.productId');

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  cart.couponApplied = { code: null, discountPercent: 0, discountAmount: 0 };
  await saveCartHelper(cart);

  const calculations = calculateCartTotals(cart);

  return successResponse(res, 'Coupon removed successfully', {
    cart,
    summary: calculations
  });
});

// POST /api/cart/merge
export const mergeCart = asyncHandler(async (req, res) => {
  const { guestCartItems = [] } = req.body;
  const userId = req.user._id;

  if (process.env.MOCK_DB === 'true') {
    const cart = getMockCart(userId);

    for (const guestItem of guestCartItems) {
      const productId = guestItem.product?.id || guestItem.productId;
      const qty = guestItem.quantity || 1;

      const product = DUMMY_PRODUCTS.find(p => p._id === productId);
      if (!product || product.stock <= 0) continue;

      const existingIndex = cart.items.findIndex(item => item.productId._id === productId);

      if (existingIndex > -1) {
        const mergedQty = cart.items[existingIndex].quantity + qty;
        cart.items[existingIndex].quantity = Math.min(mergedQty, product.stock);
        cart.items[existingIndex].currentPrice = product.price;
        cart.items[existingIndex].stock = product.stock;
      } else {
        cart.items.push({
          productId: product,
          sellerId: null,
          productSnapshot: {
            title: product.title,
            image: product.image,
            priceAtAddition: product.price
          },
          quantity: Math.min(qty, product.stock),
          selectedColor: guestItem.selectedColor || '',
          selectedSize: guestItem.selectedSize || '',
          selectedVariant: guestItem.selectedVariant || '',
          priceAtAddition: product.price,
          currentPrice: product.price,
          subtotal: product.price * Math.min(qty, product.stock),
          stock: product.stock,
          isAvailable: true
        });
      }
    }

    const calculations = calculateCartTotals(cart);
    return successResponse(res, 'Guest cart merged successfully (Mock)', {
      cart,
      summary: calculations
    });
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [], saveForLater: [] });
  }

  for (const guestItem of guestCartItems) {
    const productId = guestItem.product?.id || guestItem.productId;
    const qty = guestItem.quantity || 1;

    const product = await Product.findOne({ _id: productId, isDeleted: false });
    if (!product || product.stock <= 0) continue;

    const existingIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingIndex > -1) {
      const mergedQty = cart.items[existingIndex].quantity + qty;
      cart.items[existingIndex].quantity = Math.min(mergedQty, product.stock);
      cart.items[existingIndex].currentPrice = product.price;
      cart.items[existingIndex].stock = product.stock;
    } else {
      cart.items.push({
        productId,
        sellerId: product.sellerId,
        productSnapshot: {
          title: product.title,
          image: product.image,
          priceAtAddition: product.price
        },
        quantity: Math.min(qty, product.stock),
        selectedColor: guestItem.selectedColor || '',
        selectedSize: guestItem.selectedSize || '',
        selectedVariant: guestItem.selectedVariant || '',
        priceAtAddition: product.price,
        currentPrice: product.price,
        subtotal: product.price * Math.min(qty, product.stock),
        stock: product.stock,
        isAvailable: true
      });
    }
  }

  await saveCartHelper(cart);

  cart = await Cart.findById(cart._id)
    .populate('items.productId')
    .populate('saveForLater.productId');
    
  const calculations = calculateCartTotals(cart);
  await saveCartHelper(cart);

  return successResponse(res, 'Guest cart merged successfully', {
    cart,
    summary: calculations
  });
});
