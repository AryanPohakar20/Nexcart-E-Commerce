import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout templates
import RootLayout from '../layouts/RootLayout';
import SellerLayout from '../layouts/SellerLayout';
import AdminLayout from '../layouts/AdminLayout';

// Customer Page imports
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetails from '../pages/ProductDetails';
import Category from '../pages/Category';
import Categories from '../pages/Categories';
import OrderSuccess from '../pages/OrderSuccess';
import Search from '../pages/Search';
import Wishlist from '../pages/Wishlist';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import OrderDetails from '../pages/OrderDetails';
import TrackOrder from '../pages/TrackOrder';
import UserProfile from '../pages/UserProfile';
import Addresses from '../pages/Addresses';
import Notifications from '../pages/Notifications';

// Dashboards imports
import SellerDashboard from '../pages/SellerDashboard';
import AdminDashboard from '../pages/AdminDashboard';

// Authentication imports
import Login from '../pages/Login';
import Register from '../pages/Register';
import OTPVerification from '../pages/OTPVerification';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

// Info content imports
import About from '../pages/About';
import Contact from '../pages/Contact';
import FAQ from '../pages/FAQ';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import Terms from '../pages/Terms';
import NotFound from '../pages/NotFound';

import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Customer Storefront Layout Routes */}
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="category/:id" element={<Category />} />
        <Route path="categories" element={<Categories />} />
        <Route path="search" element={<Search />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="order-details/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
        <Route path="track-order/:id" element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<Terms />} />
        
        {/* Auth routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="otp-verification" element={<OTPVerification />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        
        {/* Fallback 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 2. Seller Layout Routes */}
      <Route path="/seller" element={<ProtectedRoute allowedRoles={['seller']}><SellerLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="products" element={<SellerDashboard />} />
        <Route path="orders" element={<SellerDashboard />} />
        <Route path="analytics" element={<SellerDashboard />} />
        <Route path="inventory" element={<SellerDashboard />} />
        <Route path="settings" element={<SellerDashboard />} />
        <Route path="profile" element={<SellerDashboard />} />
      </Route>

      {/* 3. Admin Layout Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminDashboard />} />
        <Route path="products" element={<AdminDashboard />} />
        <Route path="orders" element={<AdminDashboard />} />
        <Route path="categories" element={<AdminDashboard />} />
        <Route path="brands" element={<AdminDashboard />} />
        <Route path="reports" element={<AdminDashboard />} />
        <Route path="settings" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
