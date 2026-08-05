// src/services/adminSearchService.js
// Global search service for admin panel — searches across Users, Sellers, Products, Categories, and Orders.

import User     from '../models/User.js';
import Seller   from '../models/Seller.js';
import Product  from '../models/Product.js';
import Category from '../models/Category.js';
import Order    from '../models/Order.js';

/**
 * Global search across all entities.
 * Supports partial matches on name, email, phone, business name, slug, SKU, order ID, etc.
 *
 * @param {string} query   - search term
 * @param {string} type    - 'users' | 'sellers' | 'products' | 'categories' | 'orders' | 'all' (default: 'all')
 * @param {number} limit   - max results per collection (default: 10)
 */
export const globalSearch = async (query, type = 'all', limit = 10) => {
  if (!query || !query.trim()) {
    return { users: [], sellers: [], products: [], categories: [], orders: [], total: 0 };
  }

  const regex = new RegExp(query.trim(), 'i');
  const result = {
    users: [],
    sellers: [],
    products: [],
    categories: [],
    orders: [],
    total: 0,
  };

  const searchPromises = [];

  // ── Users ──────────────────────────────────────────────────────────────────
  if (type === 'all' || type === 'users') {
    const userSearch = User.find(
      {
        isDeleted: { $ne: true },
        $or: [
          { firstName: regex },
          { lastName: regex },
          { email: regex },
          { phone: regex },
          { username: regex },
        ],
      },
      {
        firstName: 1,
        lastName: 1,
        email: 1,
        phone: 1,
        role: 1,
        status: 1,
        isBlocked: 1,
        avatar: 1,
        createdAt: 1,
      }
    )
      .limit(limit)
      .lean();
    searchPromises.push(
      userSearch.then((r) => {
        result.users = r;
      })
    );
  }

  // ── Sellers ────────────────────────────────────────────────────────────────
  if (type === 'all' || type === 'sellers') {
    const sellerSearch = Seller.find(
      {
        isDeleted: { $ne: true },
        $or: [
          { slug: regex },
          { sellerId: regex },
          { 'business.businessName': regex },
          { 'individual.fullName': regex },
          { 'accountInfo.displayName': regex },
          { 'accountInfo.email': regex },
        ],
      },
      {
        slug: 1,
        sellerId: 1,
        sellerType: 1,
        verificationStatus: 1,
        sellerStatus: 1,
        trustScore: 1,
        rating: 1,
        isActive: 1,
        business: 1,
        individual: 1,
        accountInfo: 1,
        createdAt: 1,
      }
    )
      .populate({ path: 'userId', select: 'firstName lastName email avatar' })
      .limit(limit)
      .lean();
    searchPromises.push(
      sellerSearch.then((r) => {
        result.sellers = r;
      })
    );
  }

  // ── Products ───────────────────────────────────────────────────────────────
  if (type === 'all' || type === 'products') {
    const productSearch = Product.find(
      {
        isDeleted: { $ne: true },
        $or: [
          { name: regex },
          { sku: regex },
          { slug: regex },
          { tags: regex },
        ],
      },
      {
        name: 1,
        sku: 1,
        slug: 1,
        price: 1,
        stock: 1,
        status: 1,
        featured: 1,
        images: 1,
        category: 1,
        seller: 1,
        createdAt: 1,
      }
    )
      .populate('category', 'name slug')
      .populate('seller', 'business individual accountInfo slug')
      .limit(limit)
      .lean();
    searchPromises.push(
      productSearch.then((r) => {
        result.products = r;
      })
    );
  }

  // ── Categories ─────────────────────────────────────────────────────────────
  if (type === 'all' || type === 'categories') {
    const categorySearch = Category.find(
      {
        isDeleted: { $ne: true },
        $or: [{ name: regex }, { slug: regex }],
      },
      { name: 1, slug: 1, parent: 1, status: 1, level: 1, order: 1 }
    )
      .populate('parent', 'name slug')
      .limit(limit)
      .lean();
    searchPromises.push(
      categorySearch.then((r) => {
        result.categories = r;
      })
    );
  }

  // ── Orders ─────────────────────────────────────────────────────────────────
  if (type === 'all' || type === 'orders') {
    const orderSearch = Order.find(
      {
        isDeleted: { $ne: true },
        $or: [
          { orderId: regex },
          { 'shippingAddress.fullName': regex },
          { 'shippingAddress.phone': regex },
        ],
      },
      {
        orderId: 1,
        totalAmount: 1,
        orderStatus: 1,
        paymentInfo: 1,
        customer: 1,
        seller: 1,
        createdAt: 1,
      }
    )
      .populate('customer', 'firstName lastName email')
      .populate('seller', 'business individual slug')
      .limit(limit)
      .lean();
    searchPromises.push(
      orderSearch.then((r) => {
        result.orders = r;
      })
    );
  }

  await Promise.all(searchPromises);
  result.total =
    result.users.length +
    result.sellers.length +
    result.products.length +
    result.categories.length +
    result.orders.length;

  return result;
};

