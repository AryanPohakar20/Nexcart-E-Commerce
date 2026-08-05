import React, { createContext, useState, useEffect, useContext } from 'react';
import { PRODUCTS, COUPONS } from '../constants/dummyData';
import profileService from '../services/profileService';
import addressService from '../services/addressService';
import authService from '../services/authService';
import { AuthContext } from './AuthContext';

export const AppContext = createContext();

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
  const [orders, setOrders] = useState([
    {
      id: 'ORD-98431',
      date: '2026-07-10',
      items: [{ product: PRODUCTS[1], quantity: 1 }],
      shippingAddress: 'Penthouse B, Skyview Heights, Hitec City, Hyderabad - 500081',
      paymentMethod: 'UPI (GPay)',
      amount: 24999,
      status: 'Delivered',
      deliveryEstimate: 'Delivered on 12th July 2026',
    },
  ]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 'n-1', title: 'Order Delivered!', message: 'Your order ORD-98431 has been successfully delivered.', read: false, time: '2 days ago' },
    { id: 'n-2', title: 'Welcome to NexCart', message: 'Shop limits-free! Explore premium dark layout and customized deals.', read: true, time: '5 days ago' },
  ]);
  const [toasts, setToasts] = useState([]);
  const [prevUser, setPrevUser] = useState(null);

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
        return prev.map((item) => (item.product.id === product.id ? { ...item, quantity: nextQty } : item));
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
    const item = cart.find((entry) => entry.product.id === productId);
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

    setCart((prev) => prev.map((entry) => (entry.product.id === productId ? { ...entry, quantity } : entry)));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        showToast('Removed from Wishlist', 'info');
        return prev.filter((item) => item.id !== product.id);
      }

      showToast('Added to Wishlist');
      return [...prev, product];
    });
  };

  const moveToSaveLater = (product) => {
    setCart((prev) => prev.filter((item) => item.product.id !== product.id));
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

  useEffect(() => {
    if (user) loadAddresses();
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

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)));
  };

  const clearNotifications = () => {
    setNotifications([]);
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
        applyCouponCode,
        removeCouponCode,
        markNotificationRead,
        clearNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
