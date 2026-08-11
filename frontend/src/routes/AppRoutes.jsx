import React from "react";
import { Routes, Route } from "react-router-dom";

// Layout templates
import RootLayout from "../layouts/RootLayout";
import SellerLayout from "../layouts/SellerLayout";
import AdminLayout from "../layouts/AdminLayout";

// Customer Page imports
import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Marketplace from "../pages/Marketplace";
import MarketplaceProduct from "../pages/MarketplaceProduct";
import Category from "../pages/Category";
import Categories from "../pages/Categories";
import OrderSuccess from "../pages/OrderSuccess";
import Search from "../pages/Search";
import Wishlist from "../pages/Wishlist";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import OrderDetails from "../pages/OrderDetails";
import TrackOrder from "../pages/TrackOrder";
import UserProfile from "../pages/UserProfile";
import Addresses from "../pages/Addresses";
import Notifications from "../pages/Notifications";
import Messages from "../pages/Messages";

// Dashboards & Seller Studio imports
import SellerDashboard from "../pages/SellerDashboard";
import SellerProducts from "../pages/seller/SellerProducts";
import SellerOrders from "../pages/seller/SellerOrders";
import SellerAnalytics from "../pages/seller/SellerAnalytics";
import SellerInventory from "../pages/seller/SellerInventory";
import SellerSettings from "../pages/seller/SellerSettings";
import SellerProfile from "../pages/seller/SellerProfile";
import AdminOverview from "../pages/admin/AdminOverview";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminSellers from "../pages/admin/AdminSellers";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminVerification from "../pages/admin/AdminVerification";
import AdminReports from "../pages/admin/AdminReports";
import AdminCSVImport from "../pages/admin/AdminCSVImport";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminSettings from "../pages/admin/AdminSettings";
import AdminProfile from "../pages/admin/AdminProfile";

// Authentication imports
import Login from "../pages/Login";
import Register from "../pages/Register";
import OTPVerification from "../pages/OTPVerification";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

// Seller Onboarding imports
import BecomeSeller from "../pages/seller/BecomeSeller";
import SellerOnboarding from "../pages/seller/SellerOnboarding";
import VerificationStatus from "../pages/seller/VerificationStatus";

// Info content imports
import About from "../pages/About";
import Contact from "../pages/Contact";
import FAQ from "../pages/FAQ";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Terms from "../pages/Terms";
import NotFound from "../pages/NotFound";

import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Standalone Seller Onboarding Routes */}
      {/* BUG FIX: /seller/onboarding must NOT be protected — Step 1 handles its own
          registration (register → auto-login → proceed). Wrapping in ProtectedRoute
          was redirecting unauthenticated visitors straight to /login. */}
      <Route path="/seller/become-seller" element={<BecomeSeller />} />
      <Route path="/seller/onboarding" element={<SellerOnboarding />} />
      {/* /seller/verification-status still requires login (user must exist) */}
      <Route
        path="/seller/verification-status"
        element={
          <ProtectedRoute>
            <VerificationStatus />
          </ProtectedRoute>
        }
      />

      {/* 1. Customer Storefront Layout Routes */}
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="marketplace/product/:id" element={<MarketplaceProduct />} />
        <Route path="category/:id" element={<Category />} />
        <Route path="categories" element={<Categories />} />
        <Route path="search" element={<Search />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="cart" element={<Cart />} />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="order-success/:id"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="order-details/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="track-order/:id"
          element={
            <ProtectedRoute>
              <TrackOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        {/* Public Profile View Routes */}
        <Route path="profile/:userId" element={<SellerProfile />} />
        <Route path="seller/:id" element={<SellerProfile />} />
        <Route path="store/:slug" element={<SellerProfile />} />
        <Route
          path="addresses"
          element={
            <ProtectedRoute>
              <Addresses />
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
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
      {/* BUG FIX: role was 'marketplaceseller' (no underscore), backend uses 'marketplace_seller' */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute allowedRoles={["seller", "marketplace_seller"]}>
            <SellerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="products" element={<SellerProducts />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="analytics" element={<SellerAnalytics />} />
        <Route path="inventory" element={<SellerInventory />} />
        <Route path="settings" element={<SellerSettings />} />
        <Route path="profile" element={<SellerProfile />} />
      </Route>

      {/* 3. Admin Layout Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="dashboard" element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="sellers" element={<AdminSellers />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="verification" element={<AdminVerification />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="csv-import" element={<AdminCSVImport />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
