import React, { createContext, useState, useEffect, useContext } from 'react';
import { PRODUCTS, COUPONS } from '../constants/dummyData';
import { AuthContext } from './AuthContext';
import cartService from '../services/cartService';
import wishlistService from '../services/wishlistService';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

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

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper variables for login transition checking
  const [prevUser, setPrevUser] = useState(null);

  // Helper mapper for backend cart structure to frontend state
  const updateCartStateFromBackend = (cartData) => {
    if (!cartData) return;
    const formattedItems = (cartData.items || []).map(item => ({
      product: {
        id: item.productId?._id || item.productId,
        title: item.productSnapshot?.title || 'Catalog Product',
        image: item.productSnapshot?.image || '',
        price: item.currentPrice,
        stock: item.stock,
        brand: item.productId?.brand || 'Brand',
        category: item.productId?.category || 'Category'
      },
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      selectedVariant: item.selectedVariant,
      priceAtAddition: item.priceAtAddition,
      currentPrice: item.currentPrice,
      subtotal: item.subtotal,
      stock: item.stock,
      isAvailable: item.isAvailable
    }));

    const formattedSaveLater = (cartData.saveForLater || []).map(item => ({
      product: {
        id: item.productId?._id || item.productId,
        title: item.productSnapshot?.title || 'Catalog Product',
        image: item.productSnapshot?.image || '',
        price: item.currentPrice,
        stock: item.stock,
        brand: item.productId?.brand || 'Brand',
        category: item.productId?.category || 'Category'
      },
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      selectedVariant: item.selectedVariant,
      priceAtAddition: item.priceAtAddition,
      currentPrice: item.currentPrice,
      subtotal: item.subtotal,
      stock: item.stock,
      isAvailable: item.isAvailable
    }));

    setCart(formattedItems);
    setSaveForLater(formattedSaveLater);
    
    if (cartData.couponApplied && cartData.couponApplied.code) {
      setAppliedCoupon(cartData.couponApplied);
    } else {
      setAppliedCoupon(null);
    }
  };

  const updateWishlistStateFromBackend = (wishlistData) => {
    if (!wishlistData) return;
    const formattedWish = wishlistData.map(item => ({
      id: item.productId?._id || item.productId,
      title: item.productId?.title || 'Catalog Product',
      image: item.productId?.image || '',
      price: item.productId?.price || 0,
      mrp: item.productId?.mrp || 0,
      stock: item.productId?.stock || 0,
      brand: item.productId?.brand || 'Brand',
      category: item.productId?.category || 'Category',
      rating: item.productId?.rating || 0
    }));
    setWishlist(formattedWish);
  };

  // Sync state between guest storage and user storage, and execute Guest Cart Merging on Login
  useEffect(() => {
    const syncWithBackend = async () => {
      if (user) {
        if (!prevUser) {
          const guestCart = JSON.parse(localStorage.getItem('nexcart-guest-cart') || '[]');
          
          try {
            if (guestCart.length > 0) {
              const guestItemsFormatted = guestCart.map(item => ({
                productId: item.product.id || item.product._id,
                quantity: item.quantity,
                selectedColor: item.selectedColor || '',
                selectedSize: item.selectedSize || '',
                selectedVariant: item.selectedVariant || ''
              }));
              
              const mergeResult = await cartService.mergeCart(guestItemsFormatted);
              if (mergeResult.success) {
                showToast("Your guest cart has been merged.", "success");
              }
              localStorage.removeItem('nexcart-guest-cart');
              localStorage.removeItem('nexcart-guest-wishlist');
              localStorage.removeItem('nexcart-guest-save-later');
            }
            
            // Load backend cart
            const cartData = await cartService.getCart();
            if (cartData.success) {
              updateCartStateFromBackend(cartData.data.cart);

              // Show price drop notifications if any
              if (cartData.data.summary?.priceChanges?.length > 0) {
                cartData.data.summary.priceChanges.forEach(change => {
                  const direction = change.newPrice < change.oldPrice ? 'dropped' : 'changed';
                  showToast(`Price for ${change.title} has ${direction} to ₹${change.newPrice}!`, 'info');
                });
              }
            }

            // Load backend wishlist
            const wishData = await wishlistService.getWishlist();
            if (wishData.success) {
              updateWishlistStateFromBackend(wishData.data);
            }
          } catch (error) {
            console.error('Failed to sync/merge cart with backend', error);
          }
        }
      } else {
        if (prevUser) {
          const guestCart = JSON.parse(localStorage.getItem('nexcart-guest-cart') || '[]');
          const guestWishlist = JSON.parse(localStorage.getItem('nexcart-guest-wishlist') || '[]');
          const guestSaveLater = JSON.parse(localStorage.getItem('nexcart-guest-save-later') || '[]');
          setCart(guestCart);
          setWishlist(guestWishlist);
          setSaveForLater(guestSaveLater);
        }
      }
      setPrevUser(user);
    };

    syncWithBackend();
  }, [user, prevUser]);

  // Guest local storage persistence effect
  useEffect(() => {
    if (!user) {
      localStorage.setItem('nexcart-guest-cart', JSON.stringify(cart));
      localStorage.setItem('nexcart-guest-wishlist', JSON.stringify(wishlist));
      localStorage.setItem('nexcart-guest-save-later', JSON.stringify(saveForLater));
    }
  }, [cart, wishlist, saveForLater, user]);

  // Reviews and Trust state lists
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('nexcart-reviews');
    if (saved) return JSON.parse(saved);
    
    // Fallback Initial mock reviews compiled from catalog PRODUCTS
    const initialReviews = [];
    PRODUCTS.forEach(p => {
      if (p.reviews) {
        p.reviews.forEach((r, index) => {
          initialReviews.push({
            id: r.id || `rev-${p.id}-${index}`,
            productId: p.id,
            productTitle: p.title,
            productImage: p.image,
            customerName: r.user || 'Premium Buyer',
            customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
            rating: r.rating || 5,
            title: r.rating >= 4 ? 'Highly recommend this!' : 'Decent product quality',
            description: r.comment || 'Sealed pack, very quick transit delivery, works as advertised.',
            date: r.date || '2026-07-22',
            verified: true,
            helpfulCount: Math.floor(Math.random() * 20) + 2,
            likes: Math.floor(Math.random() * 8),
            reports: 0,
            isApproved: true,
            isSpam: false,
            isAiFlagged: false,
            qualityScore: Math.floor(Math.random() * 25) + 75, // AI confidence rating
            reply: ''
          });
        });
      }
    });
    return initialReviews;
  });

  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('nexcart-reports');
    return saved ? JSON.parse(saved) : [
      { id: 'rep-1', reviewId: 'rev-p2-0', reporterName: 'Aravind Swamy', reason: 'Fake Review', description: 'This review seems generated by a bot or automated account.', date: '2026-07-26', status: 'pending' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('nexcart-reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('nexcart-reports', JSON.stringify(reports));
  }, [reports]);

  // Review & Trust Action methods
  const addProductReview = (productId, rating, title, description, media = null) => {
    const product = PRODUCTS.find(p => p.id === productId);
    const added = {
      id: `rev-${Date.now()}`,
      productId,
      productTitle: product ? product.title : 'Premium Item',
      productImage: product ? product.image : '',
      customerName: user?.name || 'Guest Buyer',
      customerAvatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
      rating,
      title,
      description,
      date: new Date().toISOString().split('T')[0],
      verified: true,
      helpfulCount: 0,
      likes: 0,
      reports: 0,
      isApproved: true, 
      isSpam: false,
      isAiFlagged: false,
      qualityScore: 95,
      reply: '',
      media
    };
    setReviews(prev => [added, ...prev]);
    showToast('Thank you! Review published successfully.');
  };

  const editProductReview = (reviewId, rating, title, description) => {
    let success = false;
    setReviews(prev => prev.map(rev => {
      if (rev.id === reviewId) {
        const diffTime = Math.abs(new Date() - new Date(rev.date));
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        // Check 24 hour edit window limit
        if (diffHours > 24) {
          showToast('Reviews can only be edited within 24 hours of posting.', 'error');
          return rev;
        }
        success = true;
        return { ...rev, rating, title, description, date: new Date().toISOString().split('T')[0] };
      }
      return rev;
    }));
    if (success) {
      showToast('Review edited successfully.');
    }
  };

  const deleteProductReview = (reviewId) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    showToast('Review removed from listing', 'info');
  };

  const voteHelpful = (reviewId) => {
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        return { ...r, helpfulCount: r.helpfulCount + 1 };
      }
      return r;
    }));
    showToast('Feedback submitted: Marked as helpful.');
  };

  const reportReview = (reviewId, reporterName, reason, description) => {
    const reportId = `rep-${Date.now()}`;
    const newReport = {
      id: reportId,
      reviewId,
      reporterName: reporterName || user?.name || 'Anonymous',
      reason,
      description,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setReports(prev => [newReport, ...prev]);
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        return { ...r, reports: r.reports + 1 };
      }
      return r;
    }));
    showToast('Review reported. Admin moderators will verify.', 'info');
  };

  const addSellerReply = (reviewId, replyText) => {
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        return { ...r, reply: replyText };
      }
      return r;
    }));
    showToast('Reply published successfully.');
  };

  const adminModerationAction = (reviewId, action) => {
    if (action === 'approve') {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, isApproved: true, reports: 0 } : r));
      setReports(prev => prev.map(rep => rep.reviewId === reviewId ? { ...rep, status: 'resolved' } : rep));
      showToast('Review approved successfully.');
    } else if (action === 'reject' || action === 'hide') {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, isApproved: false } : r));
      showToast('Review hidden from listings.');
    } else if (action === 'delete') {
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setReports(prev => prev.filter(rep => rep.reviewId !== reviewId));
      showToast('Review deleted permanently.', 'info');
    } else if (action === 'flagSpam') {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, isSpam: true, isApproved: false } : r));
      showToast('Review flagged as spam.', 'error');
    }
  };

  // Cart Functions
  const addToCart = async (product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast(`${product.title} is out of stock!`, 'error');
      return;
    }
    
    if (user) {
      try {
        const response = await cartService.addToCart(product.id, quantity, product.price);
        if (response.success) {
          updateCartStateFromBackend(response.data.cart);
          showToast(`Added ${product.brand} ${product.title.split(' ')[1]} to Cart`);
        } else {
          showToast(response.message || 'Failed to add to cart', 'error');
        }
      } catch (error) {
        showToast(error.message || 'Failed to add to cart', 'error');
      }
    } else {
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
            item.product.id === product.id ? { ...item, quantity: nextQty } : item
          );
        }
        showToast(`Added ${product.brand} ${product.title.split(' ')[1]} to Cart`);
        return [...prev, { product, quantity }];
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (user) {
      try {
        const response = await cartService.removeCartItem(productId);
        if (response.success) {
          updateCartStateFromBackend(response.data.cart);
          showToast('Removed item from Cart', 'info');
        }
      } catch (error) {
        showToast(error.message || 'Failed to remove item', 'error');
      }
    } else {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      showToast('Removed item from Cart', 'info');
    }
  };

  const updateCartQty = async (productId, quantity) => {
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

    if (user) {
      try {
        const response = await cartService.updateCartItem(productId, quantity);
        if (response.success) {
          updateCartStateFromBackend(response.data.cart);
        }
      } catch (error) {
        showToast(error.message || 'Failed to update quantity', 'error');
      }
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        const response = await cartService.clearCart();
        if (response.success) {
          updateCartStateFromBackend(response.data.cart);
        }
      } catch (error) {
        showToast(error.message || 'Failed to clear cart', 'error');
      }
    } else {
      setCart([]);
      setAppliedCoupon(null);
    }
  };

  // Wishlist Functions
  const toggleWishlist = async (product) => {
    if (user) {
      const exists = wishlist.some((item) => item.id === product.id);
      try {
        if (exists) {
          const response = await wishlistService.removeFromWishlist(product.id);
          if (response.success) {
            setWishlist((prev) => prev.filter((item) => item.id !== product.id));
            showToast('Removed from Wishlist', 'info');
          }
        } else {
          const response = await wishlistService.addToWishlist(product.id);
          if (response.success) {
            setWishlist((prev) => [...prev, product]);
            showToast('Added to Wishlist');
          }
        }
      } catch (error) {
        showToast(error.message || 'Failed to update wishlist', 'error');
      }
    } else {
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
    }
  };

  // Save For Later Functions
  const moveToSaveLater = async (product) => {
    if (user) {
      try {
        const response = await cartService.saveForLater(product.id);
        if (response.success) {
          updateCartStateFromBackend(response.data.cart);
          showToast(`Saved ${product.brand} ${product.title.split(' ')[1]} for later`, 'info');
        }
      } catch (error) {
        showToast(error.message || 'Failed to save for later', 'error');
      }
    } else {
      setCart((prev) => prev.filter((item) => item.product.id !== product.id));
      setSaveForLater((prev) => {
        const exists = prev.some((item) => item.product.id === product.id);
        if (exists) return prev;
        return [...prev, { product }];
      });
      showToast(`Saved ${product.brand} ${product.title.split(' ')[1]} for later`, 'info');
    }
  };

  const moveToCartFromSaveLater = async (product) => {
    if (product.stock <= 0) {
      showToast(`${product.title} is out of stock!`, 'error');
      return;
    }
    
    if (user) {
      try {
        const response = await cartService.moveToCart(product.id);
        if (response.success) {
          updateCartStateFromBackend(response.data.cart);
        }
      } catch (error) {
        showToast(error.message || 'Failed to move to cart', 'error');
      }
    } else {
      setSaveForLater((prev) => prev.filter((item) => item.product.id !== product.id));
      addToCart(product, 1);
    }
  };

  const removeFromSaveLater = async (productId) => {
    if (user) {
      try {
        const response = await cartService.removeCartItem(productId);
        if (response.success) {
          updateCartStateFromBackend(response.data.cart);
          showToast('Removed from Save For Later list', 'info');
        }
      } catch (error) {
        showToast(error.message || 'Failed to remove saved item', 'error');
      }
    } else {
      setSaveForLater((prev) => prev.filter((item) => item.product.id !== productId));
      showToast('Removed from Save For Later list', 'info');
    }
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
  const applyCouponCode = async (code) => {
    if (user) {
      try {
        const response = await cartService.applyCoupon(code);
        if (response.success) {
          updateCartStateFromBackend(response.data.cart);
          showToast(`Coupon ${code.toUpperCase()} Applied Successfully!`);
          return { success: true, message: 'Applied!' };
        }
      } catch (error) {
        showToast(error.message || 'Failed to apply coupon', 'error');
        return { success: false, message: error.message || 'Invalid code' };
      }
    } else {
      const coupon = COUPONS.find((c) => c.code.toUpperCase() === code.toUpperCase());
      if (coupon) {
        setAppliedCoupon(coupon);
        showToast(`Coupon ${coupon.code} Applied Successfully!`);
        return { success: true, message: 'Applied!' };
      }
      showToast('Invalid Coupon Code', 'error');
      return { success: false, message: 'Invalid code' };
    }
  };

  const removeCouponCode = async () => {
    if (user) {
      try {
        const response = await cartService.removeCoupon();
        if (response.success) {
          updateCartStateFromBackend(response.data.cart);
          showToast('Coupon Removed', 'info');
        }
      } catch (error) {
        showToast(error.message || 'Failed to remove coupon', 'error');
      }
    } else {
      setAppliedCoupon(null);
      showToast('Coupon Removed', 'info');
    }
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
        removeToast,
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
        
        // Unified Reviews & Trust System exports
        reviews,
        setReviews,
        reports,
        setReports,
        addProductReview,
        editProductReview,
        deleteProductReview,
        voteHelpful,
        reportReview,
        addSellerReply,
        adminModerationAction
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
