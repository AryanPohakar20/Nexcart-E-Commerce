import React, { createContext, useState, useEffect } from 'react';
import { PRODUCTS, COUPONS } from '../constants/dummyData';
import profileService from '../services/profileService';
import addressService from '../services/addressService';
import authService from '../services/authService';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ─── User / Profile State ────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('nexcart-user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const logoutUser = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setCart([]);
      setWishlist([]);
      localStorage.removeItem('nexcart-user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      showToast('Logged out successfully', 'info');
    }
  };

  const loginUser = (email, password, role) => {
    const updatedUser = {
      ...user,
      email: email || user?.email,
      role: role || user?.role || 'customer',
      name: user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.name || 'User Account'),
    };
    setUser(updatedUser);
    localStorage.setItem('nexcart-user', JSON.stringify(updatedUser));
  };

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('nexcart-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nexcart-user');
    }
  }, [user]);

  // Refresh user from API on app load if a token exists
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !user) {
      setProfileLoading(true);
      profileService
        .getProfile()
        .then((res) => {
          if (res?.data?.user) setUser(res.data.user);
        })
        .catch(() => {
          // Token invalid or expired — axios interceptor handles redirect
        })
        .finally(() => setProfileLoading(false));
    }
  }, []);

  // Theme State (Dark mode default, saved in Local Storage)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nexcart-theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('nexcart-theme', theme);
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
      body.style.backgroundColor = '#070B12';
      body.style.color = '#FFFFFF';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      body.classList.remove('dark');
      body.classList.add('light');
      body.style.backgroundColor = '#F8FAFC';
      body.style.color = '#111827';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Shopping States
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [comparedProducts, setComparedProducts] = useState([]);
  const [addresses, setAddresses] = useState([]);

  
  const [orders, setOrders] = useState([
    {
      id: 'ORD-98431',
      date: '2026-07-10',
      items: [
        { product: PRODUCTS[1], quantity: 1 } // Sony WH-1000XM5
      ],
      shippingAddress: 'Penthouse B, Skyview Heights, Hitec City, Hyderabad - 500081',
      paymentMethod: 'UPI (GPay)',
      amount: 24999,
      status: 'Delivered', // Processing, Shipped, Delivered, Cancelled
      deliveryEstimate: 'Delivered on 12th July 2026'
    }
  ]);

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 'n-1', title: 'Order Delivered!', message: 'Your order ORD-98431 has been successfully delivered.', read: false, time: '2 days ago' },
    { id: 'n-2', title: 'Welcome to NexCart', message: 'Shop limits-free! Explore premium dark layout and customized deals.', read: true, time: '5 days ago' }
  ]);

  // Toast System State
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Cart Functions
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        showToast(`Increased quantity of ${product.brand} ${product.title.split(' ')[1]} in Cart`);
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      showToast(`Added ${product.brand} ${product.title.split(' ')[1]} to Cart`);
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Removed item from Cart', 'info');
  };

  const updateCartQty = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Wishlist Functions
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        showToast('Removed from Wishlist', 'info');
        return prev.filter((item) => item.id !== product.id);
      } else {
        showToast('Added to Wishlist');
        return [...prev, product];
      }
    });
  };

  // Compare System
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

  // ─── Address Functions (API-backed) ─────────────────────────────────────
  const loadAddresses = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await addressService.getAddresses();
      if (res?.data?.addresses) setAddresses(res.data.addresses);
    } catch (err) {
      // silently fail — addresses will just be empty
    }
  };

  // Load addresses when user is set
  useEffect(() => {
    if (user) loadAddresses();
  }, [user?._id]);

  const addAddress = async (addressData) => {
    try {
      const res = await addressService.createAddress(addressData);
      if (res?.data?.address) {
        setAddresses((prev) => [
          ...prev.map((a) => addressData.isDefault ? { ...a, isDefault: false } : a),
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
      setAddresses((prev) => prev.filter((addr) => addr._id !== id));
      showToast('Address Deleted', 'info');
    } catch (err) {
      showToast(err?.message || 'Failed to delete address', 'error');
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      await addressService.setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((addr) => ({ ...addr, isDefault: addr._id === id }))
      );
      showToast('Default address updated');
    } catch (err) {
      showToast(err?.message || 'Failed to update default address', 'error');
    }
  };

  const updateAddress = async (id, addressData) => {
    try {
      const res = await addressService.updateAddress(id, addressData);
      if (res?.data?.address) {
        setAddresses((prev) =>
          prev.map((addr) => (addr._id === id ? res.data.address : addr))
        );
        showToast('Address updated successfully');
      }
    } catch (err) {
      showToast(err?.message || 'Failed to update address', 'error');
    }
  };

  // Coupons
  const applyCouponCode = (code) => {
    const coupon = COUPONS.find((c) => c.code.toUpperCase() === code.toUpperCase());
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

  // Notifications
  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        // User / Profile
        user,
        setUser,
        profileLoading,
        logoutUser,
        loginUser,
        // Theme
        theme,
        setTheme,
        toggleTheme,
        // Shopping
        cart,
        setCart,
        wishlist,
        comparedProducts,
        // Addresses
        addresses,
        setAddresses,
        loadAddresses,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        updateAddress,
        // Orders
        orders,
        setOrders,
        appliedCoupon,
        // Notifications
        notifications,
        // Toast
        toasts,
        showToast,
        // Cart functions
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        // Wishlist
        toggleWishlist,
        // Compare
        toggleCompare,
        clearComparison,
        // Coupons
        applyCouponCode,
        removeCouponCode,
        // Notifications
        markNotificationRead,
        clearNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
