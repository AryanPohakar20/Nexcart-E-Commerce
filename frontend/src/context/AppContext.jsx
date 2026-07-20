import React, { createContext, useState, useEffect } from 'react';
import { PRODUCTS, COUPONS } from '../constants/dummyData';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
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
      body.style.backgroundColor = '#F8F9FB';
      body.style.color = '#111111';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Authentication State (Seeded with a mock premium user profile)
  const [user, setUser] = useState({
    name: 'Aravind Swamy',
    email: 'aravind@nexcart.com',
    role: 'customer', // customer, seller, admin
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    phone: '+91 98765 43210',
    bio: 'Tech enthusiast and premium Shopper',
    joined: 'Jan 2026'
  });

  // Shopping States
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [comparedProducts, setComparedProducts] = useState([]);
  const [addresses, setAddresses] = useState([
    { id: 'addr-1', name: 'Aravind Swamy', street: 'Penthouse B, Skyview Heights, Hitec City', city: 'Hyderabad', state: 'Telangana', pin: '500081', phone: '9876543210', isDefault: true },
    { id: 'addr-2', name: 'Aravind Swamy (Office)', street: '8th Floor, Nex Tower, Gachibowli', city: 'Hyderabad', state: 'Telangana', pin: '500032', phone: '9876543211', isDefault: false }
  ]);
  
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

  // Address Functions
  const addAddress = (address) => {
    const newAddr = { ...address, id: `addr-${Date.now()}` };
    if (newAddr.isDefault) {
      setAddresses((prev) =>
        prev.map((addr) => ({ ...addr, isDefault: false })).concat(newAddr)
      );
    } else {
      setAddresses((prev) => [...prev, newAddr]);
    }
    showToast('Shipping Address Saved');
  };

  const deleteAddress = (id) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    showToast('Address Deleted', 'info');
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

  // Login & Session Manager
  const loginUser = (email, password, role = 'customer') => {
    setUser({
      name: role === 'customer' ? 'Aravind Swamy' : role === 'seller' ? 'Alpha Sellers Inc' : 'Super Admin',
      email: email,
      role: role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
      phone: '+91 99999 88888',
      bio: `Logged in as NexCart ${role}`,
      joined: 'Jul 2026'
    });
    showToast(`Logged in successfully as ${role}!`);
  };

  const logoutUser = () => {
    setUser(null);
    clearCart();
    showToast('Logged out successfully', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        user,
        setUser,
        cart,
        setCart,
        wishlist,
        comparedProducts,
        addresses,
        orders,
        setOrders,
        appliedCoupon,
        notifications,
        toasts,
        showToast,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        toggleWishlist,
        toggleCompare,
        clearComparison,
        addAddress,
        deleteAddress,
        applyCouponCode,
        removeCouponCode,
        markNotificationRead,
        clearNotifications,
        loginUser,
        logoutUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
