import React, { createContext, useState, useEffect, useContext } from 'react';
import { PRODUCTS, COUPONS } from '../constants/dummyData';
import { AuthContext } from './AuthContext';
import chatService from '../services/chatService';
import socketService from '../services/socketService';

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', rate: 1 / 85, locale: 'en-US', label: 'EN / USD' },
  INR: { code: 'INR', symbol: '₹', rate: 1, locale: 'en-IN', label: 'IN / INR' },
  EUR: { code: 'EUR', symbol: '€', rate: 1 / 92, locale: 'de-DE', label: 'EU / EUR' },
  GBP: { code: 'GBP', symbol: '£', rate: 1 / 108, locale: 'en-GB', label: 'UK / GBP' },
};

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  // Currency State
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('nexcart-currency') || 'USD';
  });

  const setCurrency = (newCurrency) => {
    if (CURRENCIES[newCurrency]) {
      setCurrencyState(newCurrency);
      localStorage.setItem('nexcart-currency', newCurrency);
    }
  };

  const formatPrice = (amountInINR) => {
    if (amountInINR === undefined || amountInINR === null || isNaN(amountInINR)) return '';
    const current = CURRENCIES[currency] || CURRENCIES.USD;
    const converted = Number(amountInINR) * current.rate;

    if (current.code === 'INR') {
      return `${current.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
    }

    return `${current.symbol}${converted.toLocaleString(current.locale, {
      minimumFractionDigits: converted < 10 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  };

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
  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem('nexcart-guest-cart') || '[]');
  });
  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem('nexcart-guest-wishlist') || '[]');
  });
  const [saveForLater, setSaveForLater] = useState(() => {
    return JSON.parse(localStorage.getItem('nexcart-guest-save-later') || '[]');
  });
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
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Helper variables for login transition checking
  const [prevUser, setPrevUser] = useState(null);

  // Sync state between guest storage and user storage, and execute Guest Cart Merging on Login
  useEffect(() => {
    if (user) {
      if (!prevUser) {
        // Just logged in! Merge guest cart into user cart
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
          showToast("Your guest cart has been merged.", "success");
        }
      } else {
        // Normal user state sync
        const userId = user.id || user._id;
        localStorage.setItem(`nexcart-cart-${userId}`, JSON.stringify(cart));
        localStorage.setItem(`nexcart-wishlist-${userId}`, JSON.stringify(wishlist));
        localStorage.setItem(`nexcart-save-later-${userId}`, JSON.stringify(saveForLater));
      }
    } else {
      // Guest state sync, or loaded guest data after logout
      if (prevUser) {
        // User logged out, clear states to guest defaults
        const guestCart = JSON.parse(localStorage.getItem('nexcart-guest-cart') || '[]');
        const guestWishlist = JSON.parse(localStorage.getItem('nexcart-guest-wishlist') || '[]');
        const guestSaveLater = JSON.parse(localStorage.getItem('nexcart-guest-save-later') || '[]');
        setCart(guestCart);
        setWishlist(guestWishlist);
        setSaveForLater(guestSaveLater);
      } else {
        // Save current changes to guest local storage
        localStorage.setItem('nexcart-guest-cart', JSON.stringify(cart));
        localStorage.setItem('nexcart-guest-wishlist', JSON.stringify(wishlist));
        localStorage.setItem('nexcart-guest-save-later', JSON.stringify(saveForLater));
      }
    }
    setPrevUser(user);
  }, [cart, wishlist, saveForLater, user]);

  // Cart Functions
  const addToCart = (product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast(`${product.title} is out of stock!`, 'error');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        const maxStock = product.stock || 10;
        if (nextQty > maxStock) {
          showToast(`Cannot add more. Only ${maxStock} items in stock!`, 'error');
          return prev;
        }
        showToast(`Increased quantity of ${product.brand} ${product.title.split(' ')[1]} in Cart`);
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: nextQty }
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
    const item = cart.find((i) => i.product.id === productId);
    if (!item) return;

    const maxStock = item.product.stock || 10;
    if (quantity > maxStock) {
      showToast(`Only ${maxStock} items left in stock!`, 'error');
      return;
    }

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

  // Save For Later Functions
  const moveToSaveLater = (product) => {
    // Remove from cart
    setCart((prev) => prev.filter((item) => item.product.id !== product.id));
    // Add to Save For Later if not already there
    setSaveForLater((prev) => {
      const exists = prev.some((item) => item.product.id === product.id);
      if (exists) return prev;
      return [...prev, { product }];
    });
    showToast(`Saved ${product.brand} ${product.title.split(' ')[1]} for later`, 'info');
  };

  const moveToCartFromSaveLater = (product) => {
    if (product.stock <= 0) {
      showToast(`${product.title} is out of stock!`, 'error');
      return;
    }
    // Remove from Save For Later
    setSaveForLater((prev) => prev.filter((item) => item.product.id !== product.id));
    // Add to Cart
    addToCart(product, 1);
  };

  const removeFromSaveLater = (productId) => {
    setSaveForLater((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Removed from Save For Later list', 'info');
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

  return (
    <AppContext.Provider
      value={{
        user,
        currency,
        setCurrency,
        formatPrice,
        CURRENCIES,
        theme,
        setTheme,
        toggleTheme,
        cart,
        setCart,
        wishlist,
        saveForLater,
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
        moveToSaveLater,
        moveToCartFromSaveLater,
        removeFromSaveLater,
        toggleCompare,
        clearComparison,
        addAddress,
        deleteAddress,
        applyCouponCode,
        removeCouponCode,
        markNotificationRead,
        clearNotifications,
        unreadChatCount,
        setUnreadChatCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
