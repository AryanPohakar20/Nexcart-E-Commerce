import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { COUPONS } from '../constants/dummyData';
import profileService from '../services/profileService';
import addressService from '../services/addressService';
import authService from '../services/authService';
import chatService from '../services/chatService';
import socketService from '../services/socketService';
import notificationService from '../services/notificationService';
import { AuthContext } from './AuthContext';
import orderService from '../services/orderService';

export const AppContext = createContext();

const ORDER_STATUS_MAP = {
  pending: 'Pending',
  confirmed: 'Processing',
  processing: 'Processing',
  packed: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

const toDateString = (value) => {
  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const formatAddressText = (address) => {
  if (!address) return '';
  if (typeof address === 'string') return address;
  return [
    address.fullName || `${address.firstName || ''} ${address.lastName || ''}`.trim(),
    address.addressLine1 || address.street,
    address.addressLine2,
    [address.city, address.state].filter(Boolean).join(', '),
    address.pincode || address.zipCode,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
};

const normalizeBuyerOrder = (ord) => ({
  id: ord.orderId || ord.orderNumber || ord._id,
  date: toDateString(ord.createdAt || ord.orderDate) || new Date().toISOString().split('T')[0],
  amount: ord.totalAmount ?? ord.grandTotal ?? ord.pricing?.total ?? 0,
  status: ORDER_STATUS_MAP[ord.orderStatus] || 'Pending',
  deliveryEstimate: ord.orderStatus === 'delivered' ? 'Delivered' : 'Delivery expected within 2 days',
  paymentMethod: ord.paymentMethod || ord.paymentInfo?.method || 'COD',
  paymentStatus: ord.paymentStatus || ord.paymentInfo?.status || 'pending',
  pricing: ord.pricing || null,
  shippingAddress: ord.shippingAddress,
  shippingAddressText: formatAddressText(ord.shippingAddress),
  items: (ord.items || []).map(item => {
    const productId = item.product?._id || item.product || item.productId;
    return {
      product: {
        id: productId,
        title: item.title || item.name || item.product?.title || item.product?.name || 'Product',
        brand: item.product?.brand || 'NexCart',
        price: item.price || 0,
        image: item.image || item.thumbnail || item.product?.image || item.product?.thumbnail ||
          item.product?.images?.find(img => img.isPrimary)?.url ||
          item.product?.images?.[0]?.url || '',
      },
      quantity: item.quantity || 1,
      price: item.price || 0,
      subtotal: item.subtotal || ((item.price || 0) * (item.quantity || 1)),
    };
  }),
});

export const AppProvider = ({ children }) => {
  const { user: authUser } = useContext(AuthContext) || {};
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('nexcart-user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (authUser !== undefined && authUser !== user) {
      setUser(authUser);
    }
  }, [authUser, user]);

  const [theme, setTheme] = useState(() => localStorage.getItem('nexcart-theme') || 'dark');
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('nexcart-guest-cart') || '[]'));
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('nexcart-guest-wishlist') || '[]'));
  const [saveForLater, setSaveForLater] = useState(() => JSON.parse(localStorage.getItem('nexcart-guest-save-later') || '[]'));
  const [comparedProducts, setComparedProducts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // New notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const [toasts, setToasts] = useState([]);
  const [prevUser, setPrevUser] = useState(null);

  // Chat Unread Count State
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const fetchUnreadChatCount = async () => {
    try {
      const res = await chatService.getUnreadCount();
      if (res.success) {
        setUnreadChatCount(res.count);
      }
    } catch (error) {
      console.error('Error fetching unread chat count:', error);
    }
  };

  useEffect(() => {
    if (user) {
      socketService.connect();
      fetchUnreadChatCount();

      const handleUnreadCountUpdate = (totalUnread) => {
        setUnreadChatCount(totalUnread);
      };

      socketService.on('updateTotalUnreadCount', handleUnreadCountUpdate);

      return () => {
        socketService.off('updateTotalUnreadCount', handleUnreadCountUpdate);
      };
    } else {
      socketService.disconnect();
      setUnreadChatCount(0);
    }
  }, [user]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  };

  const logoutUser = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setCart([]);
      setWishlist([]);
      setSaveForLater([]);
      localStorage.removeItem('nexcart-user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      showToast('Logged out successfully', 'info');
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('nexcart-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nexcart-user');
    }
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !user) {
      setProfileLoading(true);
      profileService
        .getProfile()
        .then((res) => {
          if (res?.data?.user) setUser(res.data.user);
        })
        .catch(() => {})
        .finally(() => setProfileLoading(false));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nexcart-theme', theme);
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    body.style.backgroundColor = 'var(--bg-primary)';
    body.style.color = 'var(--text-primary)';
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    if (user) {
      if (!prevUser) {
        const guestCart = JSON.parse(localStorage.getItem('nexcart-guest-cart') || '[]');
        const guestWishlist = JSON.parse(localStorage.getItem('nexcart-guest-wishlist') || '[]');
        const guestSaveLater = JSON.parse(localStorage.getItem('nexcart-guest-save-later') || '[]');

        const userId = user.id || user._id;
        const userCart = JSON.parse(localStorage.getItem(`nexcart-cart-${userId}`) || '[]');
        const userWishlist = JSON.parse(localStorage.getItem(`nexcart-wishlist-${userId}`) || '[]');
        const userSaveLater = JSON.parse(localStorage.getItem(`nexcart-save-later-${userId}`) || '[]');

        let mergedCart = [...userCart];
        let mergedAny = false;

        if (guestCart.length > 0) {
          guestCart.forEach((guestItem) => {
            const existing = mergedCart.find((item) => item.product.id === guestItem.product.id);
            if (existing) {
              existing.quantity = Math.min(existing.quantity + guestItem.quantity, guestItem.product.stock || 10);
            } else {
              mergedCart.push(guestItem);
            }
          });
          localStorage.removeItem('nexcart-guest-cart');
          mergedAny = true;
        }

        let mergedWish = [...userWishlist];
        if (guestWishlist.length > 0) {
          guestWishlist.forEach((guestItem) => {
            if (!mergedWish.some((item) => item.id === guestItem.id)) {
              mergedWish.push(guestItem);
            }
          });
          localStorage.removeItem('nexcart-guest-wishlist');
        }

        let mergedSave = [...userSaveLater];
        if (guestSaveLater.length > 0) {
          guestSaveLater.forEach((guestItem) => {
            if (!mergedSave.some((item) => item.product.id === guestItem.product.id)) {
              mergedSave.push(guestItem);
            }
          });
          localStorage.removeItem('nexcart-guest-save-later');
        }

        setCart(mergedCart);
        setWishlist(mergedWish);
        setSaveForLater(mergedSave);

        if (mergedAny) {
          showToast('Your guest cart has been merged.', 'success');
        }
      } else {
        const userId = user.id || user._id;
        localStorage.setItem(`nexcart-cart-${userId}`, JSON.stringify(cart));
        localStorage.setItem(`nexcart-wishlist-${userId}`, JSON.stringify(wishlist));
        localStorage.setItem(`nexcart-save-later-${userId}`, JSON.stringify(saveForLater));
      }
    } else if (prevUser) {
      setCart(JSON.parse(localStorage.getItem('nexcart-guest-cart') || '[]'));
      setWishlist(JSON.parse(localStorage.getItem('nexcart-guest-wishlist') || '[]'));
      setSaveForLater(JSON.parse(localStorage.getItem('nexcart-guest-save-later') || '[]'));
    } else {
      localStorage.setItem('nexcart-guest-cart', JSON.stringify(cart));
      localStorage.setItem('nexcart-guest-wishlist', JSON.stringify(wishlist));
      localStorage.setItem('nexcart-guest-save-later', JSON.stringify(saveForLater));
    }

    setPrevUser(user);
  }, [cart, wishlist, saveForLater, user, prevUser]);

  const sanitizeCart = (cartArray) => {
    if (!Array.isArray(cartArray)) return [];
    return cartArray.filter((item) => item && item.product && typeof item.product === 'object' && (item.product.id || item.product._id));
  };

  const addToCart = (product, quantity = 1) => {
    if (!product) return;
    const prodId = product.id || product._id;
    const maxStock = product.stock !== undefined ? product.stock : 10;
    if (maxStock <= 0) {
      showToast(`${product.title || 'Item'} is out of stock!`, 'error');
      return;
    }

    setCart((prev) => {
      const safePrev = sanitizeCart(prev);
      const existing = safePrev.find((item) => (item.product.id || item.product._id) === prodId);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > maxStock) {
          showToast(`Cannot add more. Only ${maxStock} items in stock!`, 'error');
          return safePrev;
        }
        showToast(`Increased quantity of ${product.title || 'item'} in Cart`);
        return safePrev.map((item) =>
          (item.product.id || item.product._id) === prodId ? { ...item, quantity: nextQty } : item
        );
      }

      showToast(`Added ${product.title || 'item'} to Cart`);
      return [...safePrev, { product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    if (!productId) return;
    setCart((prev) => sanitizeCart(prev).filter((item) => (item.product.id || item.product._id) !== productId));
    showToast('Removed item from Cart', 'info');
  };

  const updateCartQty = (productId, quantity) => {
    if (!productId) return;
    const safeCart = sanitizeCart(cart);
    const item = safeCart.find((entry) => (entry.product.id || entry.product._id) === productId);
    if (!item) return;

    const maxStock = item.product.stock !== undefined ? item.product.stock : 10;
    if (quantity > maxStock) {
      showToast(`Only ${maxStock} items left in stock!`, 'error');
      return;
    }

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      sanitizeCart(prev).map((entry) =>
        (entry.product.id || entry.product._id) === productId ? { ...entry, quantity } : entry
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const toggleWishlist = (product) => {
    if (!product) return;
    const prodId = product.id || product._id;
    setWishlist((prev) => {
      const safePrev = (prev || []).filter((item) => item && (item.id || item._id));
      const exists = safePrev.some((item) => (item.id || item._id) === prodId);
      if (exists) {
        showToast('Removed from Wishlist', 'info');
        return safePrev.filter((item) => (item.id || item._id) !== prodId);
      }

      showToast('Added to Wishlist');
      return [...safePrev, product];
    });
  };

  const moveToSaveLater = (product) => {
    if (!product) return;
    const prodId = product.id || product._id;
    setCart((prev) => sanitizeCart(prev).filter((item) => (item.product.id || item.product._id) !== prodId));
    setSaveForLater((prev) => {
      const safePrev = (prev || []).filter((item) => item && item.product);
      const exists = safePrev.some((item) => (item.product.id || item.product._id) === prodId);
      if (exists) return safePrev;
      return [...safePrev, { product }];
    });
    showToast(`Saved ${product.title || 'item'} for later`, 'info');
  };

  const moveToCartFromSaveLater = (product) => {
    if (product.stock <= 0) {
      showToast(`${product.title} is out of stock!`, 'error');
      return;
    }

    setSaveForLater((prev) => prev.filter((item) => item.product.id !== product.id));
    addToCart(product, 1);
  };

  const removeFromSaveLater = (productId) => {
    setSaveForLater((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Removed from Save For Later list', 'info');
  };

  const toggleCompare = (product) => {
    setComparedProducts((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        showToast('Removed from Comparison Shelf', 'info');
        return prev.filter((item) => item.id !== product.id);
      }
      if (prev.length >= 3) {
        showToast('You can compare a maximum of 3 items.', 'error');
        return prev;
      }
      showToast('Added to Comparison Shelf');
      return [...prev, product];
    });
  };

  const clearComparison = () => {
    setComparedProducts([]);
  };

  const loadAddresses = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await addressService.getAddresses();
      if (res?.data?.addresses) setAddresses(res.data.addresses);
    } catch {}
  };

  const loadBuyerOrders = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await orderService.getBuyerOrders();
      const rawOrders = res?.data?.orders || res?.orders || [];
      const formatted = rawOrders.map(normalizeBuyerOrder);

      setOrders(formatted);
      return formatted;
    } catch (err) {
      console.error('Failed to load buyer orders:', err);
    }
  };

  const getOrderById = useCallback(async (orderId) => {
    const local = orders.find(o => o.id === orderId);
    if (local && local.shippingAddress) return local;

    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      const res = await orderService.getOrderDetails(orderId);
      const raw = res?.data?.order || res?.order;
      if (!raw) return null;

      const normalized = normalizeBuyerOrder(raw);
      setOrders(prev => {
        if (prev.some(o => o.id === normalized.id)) {
          return prev.map(o => o.id === normalized.id ? normalized : o);
        }
        return [normalized, ...prev];
      });
      return normalized;
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      return null;
    }
  }, [orders]);

  const relativeTime = (dateValue) => {
    if (!dateValue) return '';
    const diff = Date.now() - new Date(dateValue).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateValue).toLocaleDateString();
  };

  const mapNotification = (item) => ({
    id: item._id,
    _id: item._id,
    title: item.title,
    message: item.message,
    read: Boolean(item.isRead ?? item.read),
    time: relativeTime(item.createdAt),
    actionUrl: item.actionUrl || item.link || '',
    notificationType: item.notificationType || item.type || 'Information',
  });

  const loadNotifications = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const [listRes, countRes] = await Promise.all([
        notificationService.getNotifications({ page: 1, limit: 10, sort: 'createdAt:desc' }),
        notificationService.getUnreadCount(),
      ]);
      if (listRes?.success) {
        setNotifications((listRes.data?.notifications || []).map(mapNotification));
      }
      if (countRes?.success) {
        setUnreadNotificationsCount(countRes.data?.unreadCount ?? 0);
      }
    } catch {
      // Silent — the notifications page surfaces API errors.
    }
  };

  useEffect(() => {
    if (user) {
      loadAddresses();
      loadBuyerOrders();
      loadNotifications();
    }
  }, [user?._id]);

  const addAddress = async (addressData) => {
    try {
      const res = await addressService.createAddress(addressData);
      if (res?.data?.address) {
        setAddresses((prev) => [
          ...prev.map((address) => (addressData.isDefault ? { ...address, isDefault: false } : address)),
          res.data.address,
        ]);
        showToast('Shipping Address Saved');
      }
    } catch (err) {
      showToast(err?.message || 'Failed to save address', 'error');
    }
  };

  const deleteAddress = async (id) => {
    try {
      await addressService.deleteAddress(id);
      setAddresses((prev) => prev.filter((address) => address._id !== id));
      showToast('Address Deleted', 'info');
    } catch (err) {
      showToast(err?.message || 'Failed to delete address', 'error');
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      await addressService.setDefaultAddress(id);
      setAddresses((prev) => prev.map((address) => ({ ...address, isDefault: address._id === id })));
      showToast('Default address updated');
    } catch (err) {
      showToast(err?.message || 'Failed to update default address', 'error');
    }
  };

  const updateAddress = async (id, addressData) => {
    try {
      const res = await addressService.updateAddress(id, addressData);
      if (res?.data?.address) {
        setAddresses((prev) => prev.map((address) => (address._id === id ? res.data.address : address)));
        showToast('Address updated successfully');
      }
    } catch (err) {
      showToast(err?.message || 'Failed to update address', 'error');
    }
  };

  const applyCouponCode = (code) => {
    const coupon = COUPONS.find((item) => item.code.toUpperCase() === code.toUpperCase());
    if (coupon) {
      setAppliedCoupon(coupon);
      showToast(`Coupon ${coupon.code} Applied Successfully!`);
      return { success: true, message: 'Applied!' };
    }

    showToast('Invalid Coupon Code', 'error');
    return { success: false, message: 'Invalid code' };
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
    showToast('Coupon Removed', 'info');
  };

  const markNotificationRead = async (id) => {
    const target = notifications.find((notification) => notification.id === id);
    if (target && !target.read) {
      setUnreadNotificationsCount((count) => Math.max(0, count - 1));
    }
    setNotifications((prev) => prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)));
    try {
      await notificationService.markAsRead(id);
    } catch {
      // Non-critical; state is already updated optimistically.
    }
  };

  const clearNotifications = async () => {
    try {
      await notificationService.deleteReadNotifications();
      setNotifications((prev) => prev.filter((notification) => !notification.read));
    } catch {
      // Non-critical.
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        profileLoading,
        logoutUser,
        theme,
        setTheme,
        toggleTheme,
        cart,
        setCart,
        wishlist,
        saveForLater,
        comparedProducts,
        addresses,
        setAddresses,
        loadAddresses,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        updateAddress,
        orders,
        setOrders,
        loadBuyerOrders,
        getOrderById,
        appliedCoupon,
        notifications,
        unreadNotificationsCount,
        toasts,
        showToast,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        toggleWishlist,
        moveToSaveLater,
        moveToCartFromSaveLater,
        removeFromSaveLater,
        toggleCompare,
        clearComparison,
        applyCouponCode,
        removeCouponCode,
        markNotificationRead,
        clearNotifications,
        unreadChatCount,
        setUnreadChatCount,
        formatPrice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
