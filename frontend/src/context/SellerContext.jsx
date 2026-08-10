import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
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

const INITIAL_SETTINGS = {
  sellerMode: 'hybrid', // 'individual_c2c', 'business', or 'hybrid'
  sellerType: 'individual',  // synced from backend: 'individual' | 'business'
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
  // Individual-specific
  fullName: '',
  about: '',
  avatar: null,
  // Business-specific
  ownerName: '',
  businessDescription: '',
  businessCategory: '',
  website: '',
  gst: '',
  businessBanner: null,
  // Bank / payment
  bankAccountHolder: 'Aryan Pohakar',
  bankAccountNumber: '987654321012',
  bankIfsc: 'HDFC0001234',
  bankName: 'HDFC Bank',
  upiId: 'aryan@okaxis',
  // Legacy toggles
  autoAcceptMeetups: true,
  enableInstantBuy: true,
  freeShippingThreshold: 1500,
  emailNotifications: true,
  smsNotifications: true,
  orderAlerts: true,
  lowStockAlerts: true,
  // Seller metadata
  slug: '',
  sellerStatus: '',
  verificationStatus: '',
  trustScore: 0,
  sellerLevel: 'bronze',
  rating: 0,
  totalReviews: 0,
  followers: 0,
  profileViews: 0,
  profileCompletion: 0,
  // Settings (synced from backend)
  notificationSettings: null,
  privacySettings: null,
  shippingSettings: null,
  returnsSettings: null,
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

  // Seller backend loading state
  const [sellerLoading, setSellerLoading] = useState(true);

  // Active seller mode filter / persona: 'all' | 'individual_c2c' | 'business'
  const [activePersona, setActivePersona] = useState('all');

  // 2. Products State
  const [products, setProducts] = useState([]);

  // 3. Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  const fetchSellerOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await sellerAuthService.getOrders();
      const rawOrders = res?.data?.orders || res?.orders || [];
      
      // Map backend status/data to UI format
      const formatted = rawOrders.map(ord => {
        const statusMap = {
          pending: 'Pending',
          confirmed: 'Processing',
          processing: 'Processing',
          packed: 'Processing',
          shipped: 'Shipped',
          delivered: 'Delivered',
          cancelled: 'Cancelled',
          returned: 'Returned',
        };

        const paymentMethodMap = {
          'Credit Card': 'Credit/Debit Card',
          'Debit Card': 'Credit/Debit Card',
          'Net Banking': 'Net Banking',
          'UPI': 'UPI',
          'COD': 'Cash on Delivery',
        };

        return {
          ...ord,
          id: ord.orderId || ord._id,
          orderDate: ord.createdAt ? new Date(ord.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          status: statusMap[ord.orderStatus] || 'Pending',
          paymentMethod: paymentMethodMap[ord.paymentInfo?.method] || ord.paymentInfo?.method || 'UPI',
          paymentStatus: ord.paymentInfo?.status || 'pending',
          deliveryType: ord.shippingCarrier ? `Courier (${ord.shippingCarrier})` : 'Courier',
          carrier: ord.shippingCarrier || 'Express',
          deliveryEstimate: ord.orderStatus === 'delivered' ? 'Delivered' : 'Delivery expected within 2 days',
          shippingAddress: ord.shippingAddress && typeof ord.shippingAddress === 'object'
            ? `${ord.shippingAddress.fullName || ''}, ${ord.shippingAddress.addressLine1 || ''}${ord.shippingAddress.addressLine2 ? ', ' + ord.shippingAddress.addressLine2 : ''}, ${ord.shippingAddress.city || ''}, ${ord.shippingAddress.state || ''} - ${ord.shippingAddress.pincode || ''}`
            : (typeof ord.shippingAddress === 'string' ? ord.shippingAddress : 'No address provided'),
          customer: ord.customer 
            ? {
                name: `${ord.customer.firstName || ''} ${ord.customer.lastName || ''}`.trim() || 'John Doe',
                email: ord.customer.email || '',
                phone: ord.customer.phone || '',
                avatar: ord.customer.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
              }
            : {
                name: 'John Doe',
                email: 'john.customer@nexcart.com',
                phone: '9876543210',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
              },
          items: (ord.items || []).map(item => ({
            product: {
              id: item.product?._id || item.product,
              title: item.name || '',
              price: item.price || 0,
              image: item.image || item.product?.thumbnail || item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
              brand: item.product?.brand || 'NexCart',
            },
            title: item.name || '',
            image: item.image || item.product?.thumbnail || item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
            price: item.price || 0,
            quantity: item.quantity || 1,
            sku: item.sku || '',
            subtotal: item.subtotal || (item.price * item.quantity) || 0,
          })),
        };
      });

      setOrders(formatted);
    } catch (err) {
      console.error('Error fetching seller orders:', err);
      setOrdersError(err?.message || 'Failed to retrieve orders.');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // 4. Persistence
  useEffect(() => {
    localStorage.setItem('nexcart-seller-settings', JSON.stringify(settings));
  }, [settings]);

  // Load seller orders on mount / user change
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchSellerOrders();
    }
  }, [user, fetchSellerOrders]);

  // Sync profile data from backend dashboard API
  useEffect(() => {
    setSellerLoading(true);
    sellerAuthService.getDashboardProfile()
      .then((res) => {
        if (res?.data?.seller) {
          const s = res.data.seller;
          const isBusiness = s.sellerType === 'business';

          setSettings((prev) => ({
            ...prev,
            // Core identity
            sellerType: s.sellerType || prev.sellerType,
            email: s.email || prev.email,
            phone: s.phone || prev.phone,
            slug: s.slug || prev.slug,
            sellerStatus: s.sellerStatus || prev.sellerStatus,
            verificationStatus: s.verificationStatus || prev.verificationStatus,
            trustScore: s.trustScore ?? prev.trustScore,
            sellerLevel: s.sellerLevel || prev.sellerLevel,
            rating: s.rating ?? prev.rating,
            totalReviews: s.totalReviews ?? prev.totalReviews,
            followers: s.followers ?? prev.followers,
            profileViews: s.profileViews ?? prev.profileViews,
            profileCompletion: s.dashboard?.profileCompletion ?? prev.profileCompletion,

            // Address
            address: s.address?.address || prev.address,
            city: s.address?.city || prev.city,
            state: s.address?.state || prev.state,
            pincode: s.address?.pincode || prev.pincode,

            // Type-specific display name and avatar
            displayName: isBusiness
              ? (s.businessName || s.ownerName || prev.displayName)
              : (s.fullName || s.displayName || prev.displayName),
            avatar: s.avatar || prev.avatar,

            // Individual-specific
            ...((!isBusiness) && {
              fullName: s.fullName || prev.fullName,
              about: s.about || prev.about,
            }),

            // Business-specific
            ...(isBusiness && {
              businessName: s.businessName || prev.businessName,
              ownerName: s.ownerName || prev.ownerName,
              businessDescription: s.businessDescription || prev.businessDescription,
              businessCategory: s.businessCategory || prev.businessCategory,
              website: s.website || prev.website,
              gst: s.gst || prev.gst,
              businessBanner: s.banner || prev.businessBanner,
            }),

            // Settings (from backend)
            notificationSettings: s.settings?.notifications || prev.notificationSettings,
            privacySettings: s.settings?.privacy || prev.privacySettings,
            shippingSettings: s.settings?.shipping || prev.shippingSettings,
            returnsSettings: s.settings?.returns || prev.returnsSettings,

            // Legacy payment fields (from onboarding data via profile)
            bankAccountHolder: prev.bankAccountHolder,
            bankAccountNumber: prev.bankAccountNumber,
            bankIfsc: prev.bankIfsc,
            upiId: prev.upiId,
          }));
        }
      })
      .catch(() => {
        // Backend not running or offline — local/localStorage state handles seamlessly
      })
      .finally(() => setSellerLoading(false));
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

  const updateOrderStatus = async (orderId, newStatus, trackingInfo = {}) => {
    try {
      const res = await sellerAuthService.updateOrderStatus(orderId, newStatus, trackingInfo);
      if (res.success) {
        await fetchSellerOrders();
        showToast(`Order status updated to ${newStatus}`);
        return true;
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      showToast(err?.message || 'Failed to update order status', 'error');
    }
    return false;
  };

  const cancelOrder = async (orderId, reason = 'Cancelled by vendor') => {
    try {
      const res = await sellerAuthService.cancelOrder(orderId, reason);
      if (res.success) {
        await fetchSellerOrders();
        showToast(`Order cancelled successfully`, 'info');
        return true;
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      showToast(err?.message || 'Failed to cancel order', 'error');
    }
    return false;
  };

  // ─── Settings & Profile Updaters ──────────────────────────────────────────

  const updateSettings = (newFields) => {
    setSettings((prev) => ({ ...prev, ...newFields }));
    showToast('Studio settings saved');
  };

  // Local-only update (immediate UI feedback)
  const updateProfileData = (profileFields) => {
    setSettings((prev) => ({ ...prev, ...profileFields }));
    showToast('Seller Profile updated successfully');
  };

  // Backend-persisting profile update
  const saveProfileToBackend = useCallback(async (profileFields) => {
    try {
      const res = await sellerAuthService.updateDashboardProfile(profileFields);
      if (res?.data?.seller) {
        const s = res.data.seller;
        updateProfileData({
          displayName: s.displayName || profileFields.displayName || '',
          avatar: s.avatar || profileFields.avatar,
          city: s.address?.city || profileFields.city,
          state: s.address?.state || profileFields.state,
          profileCompletion: s.dashboard?.profileCompletion,
          ...profileFields,
        });
      }
      showToast('Profile saved successfully!');
      return res;
    } catch (err) {
      showToast(err?.message || 'Failed to save profile', 'error');
      throw err;
    }
  }, []);

  // Backend-persisting settings update
  const saveSettingsToBackend = useCallback(async (settingsData) => {
    try {
      const res = await sellerAuthService.updateSettings(settingsData);
      if (res?.data?.settings) {
        const s = res.data.settings;
        setSettings((prev) => ({
          ...prev,
          notificationSettings: s.notifications || prev.notificationSettings,
          privacySettings: s.privacy || prev.privacySettings,
          shippingSettings: s.shipping || prev.shippingSettings,
          returnsSettings: s.returns || prev.returnsSettings,
        }));
      }
      showToast('Settings saved successfully!');
      return res;
    } catch (err) {
      showToast(err?.message || 'Failed to save settings', 'error');
      throw err;
    }
  }, []);

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
        sellerLoading,
        activePersona,
        setActivePersona,
        products,
        orders,
        ordersLoading,
        ordersError,
        fetchSellerOrders,
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
        // Settings & Profile (local)
        updateSettings,
        updateProfileData,
        // Settings & Profile (backend-persisting)
        saveProfileToBackend,
        saveSettingsToBackend,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
};
