import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from './AppContext';
import sellerAuthService from '../services/sellerAuthService';
import productService from '../services/productService';
import marketplaceService from '../services/marketplaceService';

export const SellerContext = createContext();

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
  const [productsLoading, setProductsLoading] = useState(false);

  // 3. Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  // 4. Dashboard Stats & Analytics State
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersCount: 0,
    deliveredOrdersCount: 0,
    processingOrdersCount: 0,
    shippedOrdersCount: 0,
    totalListings: 0,
    activeListings: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalViews: 0,
    c2cCount: 0,
    businessCount: 0,
    totalInventoryValue: 0,
    rating: 0,
    reviewsCount: 0,
  });
  const [dashboardRecentOrders, setDashboardRecentOrders] = useState([]);
  const [dashboardLowStockItems, setDashboardLowStockItems] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [growthText, setGrowthText] = useState('+0%');
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // 5. C2C Earnings State
  const [c2cEarnings, setC2cEarnings] = useState(null);
  const [c2cEarningsLoading, setC2cEarningsLoading] = useState(false);

  const fetchDashboardSummary = useCallback(async (timeframe = '7D') => {
    setDashboardLoading(true);
    try {
      const res = await sellerAuthService.getDashboardSummary(timeframe);
      if (res?.data?.summary) {
        const sum = res.data.summary;
        if (sum.analytics) setStats(sum.analytics);
        if (sum.recentOrders) setDashboardRecentOrders(sum.recentOrders);
        if (sum.lowStockItems) setDashboardLowStockItems(sum.lowStockItems);
        if (sum.analytics?.revenueChartData) setRevenueChartData(sum.analytics.revenueChartData);
        if (sum.analytics?.growthText) setGrowthText(sum.analytics.growthText);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const fetchSellerProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await marketplaceService.getMyListings();
      if (res?.data?.listings) {
        setProducts(res.data.listings);
      }
    } catch (err) {
      console.error('Error fetching seller listings:', err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const fetchC2CEarnings = useCallback(async () => {
    setC2cEarningsLoading(true);
    try {
      const res = await marketplaceService.getEarnings();
      if (res.success && res.data) {
        setC2cEarnings(res.data);
      }
    } catch (err) {
      console.error('Error fetching C2C earnings:', err);
    } finally {
      setC2cEarningsLoading(false);
    }
  }, []);

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

  // Load seller orders and dashboard summary on mount / user change
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchSellerOrders();
      fetchDashboardSummary('7D');
      fetchSellerProducts();
      fetchC2CEarnings();
    }
  }, [user, fetchSellerOrders, fetchDashboardSummary, fetchSellerProducts, fetchC2CEarnings]);

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

  // ─── CRUD Actions: Products / C2C Listings ───────────────────────────────

  const addProduct = async (formData) => {
    try {
      const res = await marketplaceService.createListing(formData);
      if (res.success && res.data?.listing) {
        setProducts((prev) => [res.data.listing, ...prev]);
        showToast('Listing published to C2C Marketplace successfully!', 'success');
        return res.data.listing;
      }
    } catch (error) {
      console.error('Error adding listing:', error);
      showToast(error.response?.data?.message || 'Failed to publish listing', 'error');
      throw error;
    }
  };

  const updateProduct = async (id, formData) => {
    try {
      const res = await marketplaceService.updateListing(id, formData);
      if (res.success && res.data?.listing) {
        setProducts((prev) =>
          prev.map((item) => (item.id === id || item._id === id ? res.data.listing : item))
        );
        showToast('Product listing updated', 'success');
        return res.data.listing;
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      showToast(error.response?.data?.message || 'Failed to update listing', 'error');
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await marketplaceService.deleteListing(id);
      setProducts((prev) => prev.filter((item) => item.id !== id && item._id !== id));
      showToast('Product listing removed', 'info');
    } catch (error) {
      console.error('Error deleting listing:', error);
      showToast(error.response?.data?.message || 'Failed to delete listing', 'error');
      throw error;
    }
  };

  const markListingAsSold = async (id, finalSalePrice, costPrice) => {
    try {
      const res = await marketplaceService.markAsSold(id, finalSalePrice, costPrice);
      if (res.success && res.data?.listing) {
        setProducts((prev) =>
          prev.map((item) => (item.id === id || item._id === id ? res.data.listing : item))
        );
        showToast('Listing marked as sold!', 'success');
        fetchC2CEarnings(); // Refresh earnings
        return res.data.listing;
      }
    } catch (error) {
      console.error('Error marking as sold:', error);
      showToast(error.response?.data?.message || 'Failed to mark as sold', 'error');
      throw error;
    }
  };

  const toggleProductStatus = async (id) => {
    const item = products.find(p => p.id === id || p._id === id);
    if (!item) return;
    const nextStatus = item.status === 'Active' ? 'Draft' : 'Active';
    
    // We create a dummy formData for status update (not perfect, but it works if backend supports partial updates)
    const formData = new FormData();
    formData.append('status', nextStatus);
    
    try {
      const res = await productService.updateProduct(item._id || item.id, formData);
      if (res.success && res.data?.product) {
         setProducts((prev) =>
            prev.map((p) => (p.id === id || p._id === id ? res.data.product : p))
         );
         showToast(`Listing is now ${nextStatus === 'Active' ? 'Live' : 'Paused'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast(error.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const updateStock = async (id, newStock) => {
    const clamped = Math.max(0, Number(newStock));
    const formData = new FormData();
    formData.append('stock', clamped);
    
    try {
      const res = await productService.updateProduct(id, formData);
      if (res.success && res.data?.product) {
         setProducts((prev) =>
            prev.map((p) => (p.id === id || p._id === id ? res.data.product : p))
         );
         showToast(`Stock updated to ${clamped} units`);
      }
    } catch (error) {
       console.error('Error updating stock:', error);
       showToast(error.response?.data?.message || 'Failed to update stock', 'error');
    }
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

  // stats computation logic was removed to use backend aggregation in fetchDashboardSummary
  return (
    <SellerContext.Provider
      value={{
        settings,
        sellerLoading,
        activePersona,
        setActivePersona,
        products,
        productsLoading,
        orders,
        ordersLoading,
        ordersError,
        fetchSellerOrders,
        stats,
        dashboardRecentOrders,
        dashboardLowStockItems,
        revenueChartData,
        growthText,
        dashboardLoading,
        fetchDashboardSummary,
        c2cEarnings,
        c2cEarningsLoading,
        fetchC2CEarnings,
        // Product Actions
        addProduct,
        updateProduct,
        deleteProduct,
        markListingAsSold,
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
