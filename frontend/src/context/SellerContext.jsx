import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppContext } from './AppContext';
import sellerAuthService from '../services/sellerAuthService';

export const SellerContext = createContext();

const INITIAL_PRODUCTS = [
  {
    id: 'prod-c2c-1',
    title: 'Apple iPhone 13 (128GB, Midnight Black) - Mint Condition',
    description: 'Selling my carefully used iPhone 13. 88% battery health, zero scratches, applied glass screen protector since day 1. Includes original box, Apple invoice, and fast charging cable.',
    price: 36999,
    originalPrice: 69900,
    category: 'mobiles',
    sellerType: 'individual_c2c',
    condition: 'Like New',
    usageDuration: '8 months',
    hasBox: true,
    hasBill: true,
    location: 'Indiranagar, Bengaluru',
    deliveryType: 'Meetup & Courier',
    negotiable: true,
    stock: 1,
    views: 482,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
    createdAt: '2026-07-28',
  },
  {
    id: 'prod-c2c-2',
    title: 'Sony WH-1000XM4 Wireless Noise Cancelling Headphones',
    description: 'Lightly used for occasional flight travel. Outstanding active noise cancellation and 30-hour battery life. Clean ear cushions and includes travel carry case.',
    price: 14500,
    originalPrice: 29990,
    category: 'electronics',
    sellerType: 'individual_c2c',
    condition: 'Good',
    usageDuration: '1.5 years',
    hasBox: true,
    hasBill: false,
    location: 'Koramangala, Bengaluru',
    deliveryType: 'Courier',
    negotiable: false,
    stock: 1,
    views: 290,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80',
    createdAt: '2026-07-25',
  },
  {
    id: 'prod-biz-1',
    title: 'Minimalist Matte Ceramic Coffee Mug Set (Artisan Pack of 4)',
    description: 'Handcrafted premium ceramic stoneware coffee mugs. Microwave safe, dishwasher friendly, ergonomic grip, and matte earthy glaze finish.',
    price: 1299,
    originalPrice: 1999,
    category: 'home',
    sellerType: 'business',
    condition: 'Brand New',
    sku: 'NX-MUG-04',
    brand: 'Studio Terra',
    stock: 42,
    warranty: '6 Months Replacement',
    views: 1450,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
    createdAt: '2026-07-10',
  },
  {
    id: 'prod-biz-2',
    title: 'Vintage Full-Grain Leather Laptop Messenger Bag 15.6"',
    description: 'Genuine hand-stitched buffalo leather messenger bag. Padded laptop compartment, YKK brass zippers, multiple organizer pockets, and adjustable shoulder strap.',
    price: 4499,
    originalPrice: 7999,
    category: 'accessories',
    sellerType: 'business',
    condition: 'Brand New',
    sku: 'NX-BAG-VN',
    brand: 'CraftedLegacy',
    stock: 12,
    warranty: '1 Year Leather Warranty',
    views: 2310,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    createdAt: '2026-07-05',
  },
  {
    id: 'prod-c2c-3',
    title: 'Solid Sheesham Wood Study & Work Table with Drawers',
    description: 'Moving out sale! Extremely sturdy solid rosewood desk with smooth lacquer finish. 3 deep utility drawers. Buyer can pick up directly from HSR Layout.',
    price: 7499,
    originalPrice: 16500,
    category: 'furniture',
    sellerType: 'individual_c2c',
    condition: 'Good',
    usageDuration: '2 years',
    hasBox: false,
    hasBill: false,
    location: 'HSR Layout, Bengaluru',
    deliveryType: 'Local Pickup Only',
    negotiable: true,
    stock: 1,
    views: 615,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
    createdAt: '2026-07-20',
  },
  {
    id: 'prod-biz-3',
    title: 'Ergonomic Vertical Wireless Mouse (Silent Clicks, 2400 DPI)',
    description: 'Natural handshake ergonomic angle reduces forearm muscle strain. USB 2.4G + Dual Bluetooth 5.0 connection. Rechargeable 500mAh battery lasts up to 60 days.',
    price: 1899,
    originalPrice: 2999,
    category: 'electronics',
    sellerType: 'business',
    condition: 'Brand New',
    sku: 'NX-MOU-V1',
    brand: 'ProClick',
    stock: 4,
    warranty: '1 Year Warranty',
    views: 3120,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80',
    createdAt: '2026-06-28',
  },
  {
    id: 'prod-biz-4',
    title: 'Heavyweight Oversized Streetwear Hoodie (100% French Terry Cotton)',
    description: '450 GSM ultra-heavyweight combed organic cotton hoodie. Drop-shoulder relaxed streetwear fit, double-layered hood, and ribbed cuffs.',
    price: 2199,
    originalPrice: 3499,
    category: 'fashion',
    sellerType: 'business',
    condition: 'Brand New',
    sku: 'NX-HOOD-ST',
    brand: 'UrbanAura',
    stock: 0,
    warranty: '30 Days Exchange',
    views: 4590,
    status: 'draft',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80',
    createdAt: '2026-06-20',
  },
  {
    id: 'prod-c2c-4',
    title: 'PlayStation 4 Pro (1TB) + 2 DualShock 4 Controllers & 4 Games',
    description: 'Console in 100% working condition. Includes God of War, Spider-Man, Horizon Zero Dawn, and FIFA. Original power cord and HDMI cable included.',
    price: 19999,
    originalPrice: 38990,
    category: 'gaming',
    sellerType: 'individual_c2c',
    condition: 'Fair',
    usageDuration: '3 years',
    hasBox: true,
    hasBill: false,
    location: 'Whitefield, Bengaluru',
    deliveryType: 'Meetup & Courier',
    negotiable: true,
    stock: 0,
    views: 890,
    status: 'sold',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80',
    createdAt: '2026-07-15',
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-78291',
    customer: {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@gmail.com',
      phone: '+91 98451 23412',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
    },
    shippingAddress: 'Flat 402, Oakwood Residences, 12th Main, Indiranagar, Bengaluru - 560038',
    items: [
      {
        id: 'prod-c2c-1',
        title: 'Apple iPhone 13 (128GB, Midnight Black)',
        price: 36999,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
        sellerType: 'individual_c2c',
        condition: 'Like New',
      }
    ],
    totalAmount: 36999,
    paymentMethod: 'UPI (PhonePe)',
    paymentStatus: 'Paid',
    status: 'Processing',
    orderDate: '2026-08-03',
    deliveryType: 'Courier Express',
    trackingNumber: 'BLUEDART-89421',
    carrier: 'BlueDart Express',
    deliveryEstimate: 'Expected by Aug 06, 2026',
    customerNote: 'Please bubble wrap well before dispatching.',
  },
  {
    id: 'ORD-78290',
    customer: {
      name: 'Pooja Iyer',
      email: 'pooja.iyer@gmail.com',
      phone: '+91 97120 45892',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    },
    shippingAddress: 'Villa 12, Palm Meadows Phase 2, Whitefield, Bengaluru - 560066',
    items: [
      {
        id: 'prod-biz-1',
        title: 'Minimalist Matte Ceramic Coffee Mug Set (Pack of 4)',
        price: 1299,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
        sellerType: 'business',
        condition: 'Brand New',
      }
    ],
    totalAmount: 2598,
    paymentMethod: 'Credit Card (HDFC)',
    paymentStatus: 'Paid',
    status: 'Shipped',
    orderDate: '2026-08-02',
    deliveryType: 'Express Courier',
    trackingNumber: 'DELHIVERY-54312',
    carrier: 'Delhivery Surface',
    deliveryEstimate: 'Out for delivery tomorrow',
    customerNote: 'Gift packaging requested if possible.',
  },
  {
    id: 'ORD-78289',
    customer: {
      name: 'Karthik Nair',
      email: 'karthik.n@yahoo.com',
      phone: '+91 99881 77213',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    },
    shippingAddress: 'Direct Meetup @ Starbucks, Koramangala 5th Block, Bengaluru',
    items: [
      {
        id: 'prod-c2c-2',
        title: 'Sony WH-1000XM4 Wireless Headphones',
        price: 14500,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80',
        sellerType: 'individual_c2c',
        condition: 'Good',
      }
    ],
    totalAmount: 14500,
    paymentMethod: 'Cash on Meetup',
    paymentStatus: 'Completed',
    status: 'Delivered',
    orderDate: '2026-07-31',
    deliveryType: 'Buyer Meetup (In-Person)',
    trackingNumber: 'LOCAL-MEETUP-KOR',
    carrier: 'Direct Handshake',
    deliveryEstimate: 'Handed over on 31st July',
    customerNote: 'Tested on spot and received nicely!',
  },
  {
    id: 'ORD-78288',
    customer: {
      name: 'Sneha Reddy',
      email: 'sneha.reddy@gmail.com',
      phone: '+91 98450 99881',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
    },
    shippingAddress: 'Flat 101, Prestige Lakeside Habitat, Varthur, Bengaluru - 560087',
    items: [
      {
        id: 'prod-biz-2',
        title: 'Vintage Full-Grain Leather Laptop Messenger Bag 15.6"',
        price: 4499,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
        sellerType: 'business',
        condition: 'Brand New',
      }
    ],
    totalAmount: 4499,
    paymentMethod: 'UPI (GPay)',
    paymentStatus: 'Paid',
    status: 'Delivered',
    orderDate: '2026-07-29',
    deliveryType: 'Courier (DTDC)',
    trackingNumber: 'DTDC-99214',
    carrier: 'DTDC Express',
    deliveryEstimate: 'Delivered on 30th July 2026',
    customerNote: '',
  },
  {
    id: 'ORD-78287',
    customer: {
      name: 'Rohan Gupta',
      email: 'rohan.g@gmail.com',
      phone: '+91 91234 56789',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    },
    shippingAddress: 'House 89, Sector 14, Urban Estate, Gurgaon - 122001',
    items: [
      {
        id: 'prod-biz-3',
        title: 'Ergonomic Vertical Wireless Mouse',
        price: 1899,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80',
        sellerType: 'business',
        condition: 'Brand New',
      }
    ],
    totalAmount: 1899,
    paymentMethod: 'Net Banking (ICICI)',
    paymentStatus: 'Refunded',
    status: 'Cancelled',
    orderDate: '2026-07-28',
    deliveryType: 'Standard Courier',
    trackingNumber: 'CANCELLED',
    carrier: 'N/A',
    deliveryEstimate: 'Order Cancelled',
    customerNote: 'Ordered accidentally, requested cancellation.',
  }
];

const INITIAL_SETTINGS = {
  sellerMode: 'hybrid', // 'individual_c2c', 'business', or 'hybrid'
  businessName: 'NexCraft & Resale Studio',
  displayName: 'Aryan Pohakar',
  handle: '@nexseller_hub',
  email: 'seller@nexcart.com',
  phone: '+91 98450 12345',
  pincode: '560038',
  city: 'Bengaluru',
  state: 'Karnataka',
  address: '12th Main Road, HAL 2nd Stage, Indiranagar',
  bio: 'Curated boutique crafts, certified electronics & transparent second-hand tech gear. Fast response & verified quality guarantee.',
  bankAccountHolder: 'Aryan Pohakar',
  bankAccountNumber: '987654321012',
  bankIfsc: 'HDFC0001234',
  bankName: 'HDFC Bank',
  upiId: 'aryan@okaxis',
  autoAcceptMeetups: true,
  enableInstantBuy: true,
  freeShippingThreshold: 1500,
  emailNotifications: true,
  smsNotifications: true,
  orderAlerts: true,
  lowStockAlerts: true,
};

export const SellerProvider = ({ children }) => {
  const { showToast, user } = useContext(AppContext);

  // 1. Seller Profile & Settings State
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('nexcart-seller-settings');
      return stored ? JSON.parse(stored) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Active seller mode filter / persona: 'all' | 'individual_c2c' | 'business'
  const [activePersona, setActivePersona] = useState('all');

  // 2. Products State
  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem('nexcart-seller-products');
      return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // 3. Orders State
  const [orders, setOrders] = useState(() => {
    try {
      const stored = localStorage.getItem('nexcart-seller-orders');
      return stored ? JSON.parse(stored) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // 4. Persistence
  useEffect(() => {
    localStorage.setItem('nexcart-seller-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('nexcart-seller-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nexcart-seller-orders', JSON.stringify(orders));
  }, [orders]);

  // Sync profile data from backend if available
  useEffect(() => {
    sellerAuthService.getProfile().then((res) => {
      if (res?.data?.seller) {
        const s = res.data.seller;
        setSettings((prev) => ({
          ...prev,
          displayName: s.accountInfo?.displayName || prev.displayName,
          businessName: s.profile?.shopName || prev.businessName,
          phone: s.accountInfo?.phone || prev.phone,
          email: s.accountInfo?.email || prev.email,
          city: s.profile?.city || prev.city,
          state: s.profile?.state || prev.state,
          pincode: s.profile?.pincode || prev.pincode,
          address: s.profile?.address || prev.address,
          bio: s.profile?.description || prev.bio,
          bankAccountHolder: s.payment?.accountHolder || prev.bankAccountHolder,
          bankAccountNumber: s.payment?.accountNumber || prev.bankAccountNumber,
          bankIfsc: s.payment?.ifsc || prev.bankIfsc,
          upiId: s.payment?.upiId || prev.upiId,
        }));
      }
    }).catch(() => {
      // Backend not running or offline; local state handles seamlessly
    });
  }, []);

  // ─── CRUD Actions: Products ───────────────────────────────────────────────

  const addProduct = (prodData) => {
    const newId = `prod-${prodData.sellerType === 'individual_c2c' ? 'c2c' : 'biz'}-${Date.now()}`;
    const newProduct = {
      id: newId,
      views: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      ...prodData,
      price: Number(prodData.price) || 0,
      originalPrice: Number(prodData.originalPrice) || Number(prodData.price) * 1.25,
      stock: Number(prodData.stock) || 1,
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast('Listing published to Marketplace successfully!');
    return newProduct;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updatedFields,
              price: updatedFields.price !== undefined ? Number(updatedFields.price) : item.price,
              stock: updatedFields.stock !== undefined ? Number(updatedFields.stock) : item.stock,
            }
          : item
      )
    );
    showToast('Product listing updated');
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    showToast('Product listing removed', 'info');
  };

  const toggleProductStatus = (id) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'active' ? 'draft' : 'active';
          showToast(`Listing is now ${nextStatus === 'active' ? 'Live' : 'Paused'}`);
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const updateStock = (id, newStock) => {
    const clamped = Math.max(0, Number(newStock));
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: clamped } : item))
    );
    showToast(`Stock updated to ${clamped} units`);
  };

  // ─── CRUD Actions: Orders ─────────────────────────────────────────────────

  const updateOrderStatus = (orderId, newStatus, trackingInfo = {}) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: newStatus,
            trackingNumber: trackingInfo.trackingNumber || ord.trackingNumber,
            carrier: trackingInfo.carrier || ord.carrier,
            deliveryEstimate: trackingInfo.deliveryEstimate || ord.deliveryEstimate,
          };
        }
        return ord;
      })
    );
    showToast(`Order #${orderId} marked as ${newStatus}`);
  };

  const cancelOrder = (orderId, reason = 'Cancelled by vendor') => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId ? { ...ord, status: 'Cancelled', customerNote: reason } : ord
      )
    );
    showToast(`Order #${orderId} has been cancelled`, 'info');
  };

  // ─── Settings & Profile Updaters ──────────────────────────────────────────

  const updateSettings = (newFields) => {
    setSettings((prev) => ({ ...prev, ...newFields }));
    showToast('Studio settings saved');
  };

  const updateProfileData = (profileFields) => {
    setSettings((prev) => ({ ...prev, ...profileFields }));
    showToast('Seller Profile updated successfully');
  };

  // ─── Computed Dynamic Stats ───────────────────────────────────────────────

  const stats = React.useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'Cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const activeProducts = products.filter((p) => p.status === 'active');
    const lowStockItems = products.filter((p) => p.status === 'active' && p.stock > 0 && p.stock <= 5);
    const outOfStockItems = products.filter((p) => p.stock === 0);
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
    const c2cCount = products.filter((p) => p.sellerType === 'individual_c2c').length;
    const businessCount = products.filter((p) => p.sellerType === 'business').length;
    const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

    return {
      totalRevenue,
      ordersCount: orders.length,
      deliveredOrdersCount: orders.filter((o) => o.status === 'Delivered').length,
      processingOrdersCount: orders.filter((o) => o.status === 'Processing' || o.status === 'Pending').length,
      shippedOrdersCount: orders.filter((o) => o.status === 'Shipped').length,
      totalListings: products.length,
      activeListings: activeProducts.length,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      totalViews,
      c2cCount,
      businessCount,
      totalInventoryValue,
      rating: 4.9,
      reviewsCount: 142,
    };
  }, [orders, products]);

  return (
    <SellerContext.Provider
      value={{
        settings,
        activePersona,
        setActivePersona,
        products,
        orders,
        stats,
        // Product Actions
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        updateStock,
        // Order Actions
        updateOrderStatus,
        cancelOrder,
        // Settings & Profile
        updateSettings,
        updateProfileData,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
};
