🛍️ NexCart — Modern Full-Stack E-Commerce Platform

«NexCart is a full-stack, multi-role e-commerce platform designed to provide a complete shopping experience for customers while providing sellers and administrators with dedicated tools for marketplace operations, order management, verification, analytics, notifications, and platform control.»

---

✨ Overview

NexCart is a modular e-commerce platform built around three major experiences:

- 🛒 Customer Experience — discover products, manage accounts and addresses, add products to cart/wishlist, place and track orders, communicate with sellers, and receive notifications.
- 🏪 Seller Experience — complete seller onboarding, manage products and inventory, process orders, view analytics, manage store settings, and complete verification.
- 🛡️ Admin Experience — manage users, sellers, products, categories, orders, verification, reports, analytics, notifications, imports, exports, settings, audit logs, roles, permissions, and system health.

The platform uses a modern React frontend, Node.js/Express backend, MongoDB with Mongoose, JWT authentication, role/permission-based authorization, Cloudinary media storage, SMTP email services, and Socket.IO real-time communication.

---

🚀 Key Features

Module| Features
👤 Authentication| Registration, Login, Logout, JWT Authentication, OTP Verification, Password Recovery, Google & Apple Authentication
🛒 Shopping| Product Browsing, Categories, Search, Filters, Sorting, Product Details, Cart, Wishlist, Checkout
📦 Orders| Order Creation, Order History, Order Details, Order Status, Tracking, Cancellation, Return/Refund Information
🏪 Seller| Seller Registration, Onboarding, Verification, Products, Inventory, Orders, Analytics, Store Management
🛡️ Admin| Dashboard, User Management, Seller Management, Product Management, Category Management, Orders, Verification, Reports, Analytics
💬 Communication| Real-Time Chat, Conversations, Messaging, Online/Offline Presence, Offers, Blocking & Reporting
🔔 Notifications| Notification Centre, Unread Count, Read/Unread State, Order/System/Verification Notifications
⭐ Reviews| Seller Reviews, Ratings, Buyer Information, Review Comments
🔎 Search| Product Search, Seller Search, Filters, Search History
☁️ Media| Product Images, Seller Images, Banners, Identity Documents, Cloudinary Uploads
📊 Analytics| Seller Analytics, Marketplace Analytics, Dashboard Statistics
🔐 Security| JWT, bcrypt, RBAC, Permissions, Helmet, CORS, Rate Limiting, Validation, Centralized Error Handling

---

🧱 Technology Stack

Frontend

- React 18
- Vite
- React Router
- Axios
- Tailwind CSS
- Framer Motion
- React Hook Form
- Zod
- Recharts
- Swiper
- Socket.IO Client
- Google OAuth
- Apple Sign-In

Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Socket.IO
- Nodemailer
- Cloudinary
- Multer
- Express Validator
- Helmet
- CORS
- Express Rate Limit
- Winston
- Morgan
- Compression

Data & File Processing

- MongoDB
- Mongoose
- CSV Processing
- XLSX Import/Export
- Cloudinary Media Storage

---

🏗️ System Architecture

                         ┌──────────────────────────┐
                         │       NexCart UI         │
                         │      React + Vite        │
                         └────────────┬─────────────┘
                                      │
                              REST API / Socket.IO
                                      │
                         ┌────────────▼─────────────┐
                         │    Node.js + Express     │
                         │        Backend           │
                         └────────────┬─────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
       Authentication          Business Logic          Real-Time Layer
       & Authorization          & Services                 Socket.IO
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      │
                         ┌────────────▼─────────────┐
                         │     MongoDB + Mongoose   │
                         └──────────────────────────┘
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                  Cloudinary Media            SMTP Email

---

📁 Project Structure

Nexcart-E-Commerce/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── helpers/
│   │   ├── mappers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   ├── utils/
│   │   └── validations/
│   ├── public/
│   ├── package.json
│   └── .env.example
│
└── README.md

---

👤 Customer Experience

🔐 Authentication & Account

- Customer registration and login
- JWT-based authentication
- Current-user session management
- Logout
- Forgot password
- OTP verification
- Password reset
- Google authentication
- Apple authentication
- Profile management

🛍️ Shopping

- Home page
- Product catalogue
- Product details
- Category browsing
- Subcategory support
- Brand support
- Product search
- Search history
- Product filtering
- Product sorting
- Wishlist
- Shopping cart
- Checkout
- Address management

📦 Order Management

Customers can:

- Place orders
- View order history
- View order details
- View shipment address
- Track order status
- View order status history
- Cancel eligible orders
- View delivery information
- View refund information
- Access order-success flow

💬 Marketplace & Communication

- Marketplace browsing
- Marketplace product details
- Seller public profiles
- Follow sellers
- Seller reviews and ratings
- Buyer/seller messaging
- Real-time chat
- Offers
- User blocking
- User reporting
- Location sharing
- Meetup scheduling

🔔 Notifications

- Notification centre
- Read/unread state
- Unread notification indicators
- Order notifications
- System notifications
- Seller/verification notifications

---

🏪 Seller Experience

📝 Seller Onboarding

The seller onboarding workflow includes:

1. Account Information
2. Seller Profile
3. Identity & Documents
4. Payment Details
5. Agreement / Terms

The system supports seller verification status management and document uploads.

📊 Seller Dashboard

Sellers have dedicated functionality for:

- Dashboard
- Profile
- Products
- Inventory
- Orders
- Analytics
- Settings
- Verification

🏷️ Seller Operations

- Create and manage seller profile
- Upload profile image
- Upload store banner
- Manage products
- Manage inventory
- Update stock
- View seller orders
- Update order status
- Cancel eligible orders
- View dashboard statistics
- View revenue/analytics information
- Manage seller settings
- Change password
- Deactivate store
- Delete store

---

🛡️ Admin Experience

NexCart provides a dedicated administration layer with authentication, role-based authorization, and permission-based access control.

📊 Admin Dashboard

- Dashboard statistics
- Recent users
- Recent sellers
- Recent activities
- Pending verifications
- Marketplace analytics

👥 User Management

- List users
- View user details
- Update users
- Delete users
- Suspend users
- Activate users
- Block/unblock users
- Update account status
- Bulk user operations

🏪 Seller Management

- View sellers
- View seller details
- Update sellers
- Delete sellers
- Suspend sellers
- Activate sellers
- Block sellers

📦 Product Management

- View products
- Update products
- Update stock
- Delete products
- Restore products
- Approve/reject products
- Toggle featured products
- Bulk product operations

🗂️ Category Management

- Category CRUD
- Category tree management
- Category administration

📋 Order Management

- View all orders
- View order details
- Update order status
- Cancel orders

✅ Verification Center

- View verification requests
- Verification statistics
- Approve verification
- Reject verification
- Request document re-upload

⚖️ Reports & Disputes

- Business reports
- Dispute reports
- Dispute details
- Dispute resolution

📈 Analytics

- Marketplace analytics
- Business-level reporting
- Dashboard metrics

🔔 Notification Management

- View notifications
- View unread count
- Mark notification as read
- Mark all notifications as read
- Delete notifications

📤 Data Operations

- CSV import
- Excel/XLSX import
- Import preview
- Import execution
- Bulk operations
- Entity export

⚙️ Platform Administration

- Platform settings
- Admin profile
- Admin password management
- Roles and permissions
- Audit logs
- System health monitoring
- Global admin search

---

🔐 Authentication & Authorization

NexCart uses a layered security and authorization model.

Authentication Methods

- Email/password
- JWT authentication
- Google authentication
- Apple authentication
- OTP-based password recovery

User Roles

customer
seller
admin
super_admin
moderator
support_staff

Authorization Flow

Request
   │
   ▼
Authentication
   │
   ▼
Role Authorization
   │
   ▼
Permission Check
   │
   ▼
Controller
   │
   ▼
Service

This provides both role-level and permission-level protection for sensitive operations.

---

📦 Order Lifecycle

The order lifecycle follows a structured status pipeline:

pending
   ↓
confirmed
   ↓
processing
   ↓
packed
   ↓
shipped
   ↓
delivered

Additional states include:

cancelled
returned

Orders maintain status history containing:

- Status
- Timestamp
- Note
- User who performed the update

Order records support:

- Customer
- Seller
- Line items
- Quantity
- Price/subtotal
- Shipping address
- Billing address
- Tracking number
- Shipping carrier
- Delivery date
- Cancellation details
- Refund information
- Payment status metadata

«⚠️ Payment Gateway Note: Payment-related fields and payment status handling exist in the order model, but a production external payment gateway is not considered a completed integration. A payment provider should be integrated before accepting real-money transactions.»

---

💬 Real-Time Communication

NexCart integrates Socket.IO for real-time communication.

The communication system supports:

- Real-time messaging
- Conversation rooms
- Online/offline presence
- Last-seen information
- Message read/seen events
- Unread message counts
- Offer actions
- User connection/disconnection handling

The frontend uses Socket.IO Client to communicate with the backend real-time layer.

---

🔔 Notification System

The notification system supports persistent notifications for major platform activities.

Supported notification categories include:

- Verification
- Report
- Order
- Inventory
- Alert
- Import
- System
- Platform

Notifications support:

- Recipient role
- Recipient user
- Priority
- Read/unread state
- Read timestamp
- Metadata
- Related link
- Creation timestamp
- Update timestamp

---

⭐ Reviews & Ratings

Seller reviews and ratings support:

- Buyer identity
- Seller reference
- Rating from 1–5
- Review comment
- Buyer avatar/name
- Product/order context
- Creation timestamp

Seller public profiles can expose review and rating functionality.

---

☁️ Media & File Uploads

NexCart supports file uploads using Multer and Cloudinary.

Media functionality includes:

- Product images
- Seller profile images
- Store banners
- Seller identity documents
- Verification documents

Cloudinary provides external media storage for supported upload workflows.

---

🔒 Security

Security mechanisms include:

- JWT authentication
- Password hashing using bcrypt
- Role-based authorization
- Permission-based authorization
- Request validation
- Helmet security headers
- CORS configuration
- Rate limiting
- Cookie parsing
- Centralized error handling
- Structured logging
- Protected admin APIs
- Environment-based configuration

🔐 Security Rule

Never commit real credentials, API keys, database passwords, JWT secrets, SMTP passwords, OAuth secrets, or Cloudinary secrets to GitHub.

Use environment variables or a secure secret manager.

---

⚙️ Local Development Setup

Prerequisites

Install:

- Node.js
- npm
- MongoDB
- Git

Depending on enabled integrations, you may also need:

- Cloudinary account
- SMTP provider/account
- Google OAuth credentials
- Apple Sign-In credentials

---

1. Clone Repository

git clone <repository-url>
cd Nexcart-E-Commerce

---

2. Install Frontend Dependencies

cd frontend
npm install

---

3. Install Backend Dependencies

Open another terminal:

cd backend
npm install

---

4. Configure Environment Variables

Create the environment file from the provided example:

cp .env.example .env

On Windows, manually copy ".env.example" to ".env".

Configure values such as:

PORT
NODE_ENV
CLIENT_URL
MONGO_URI
JWT_SECRET
JWT_EXPIRES_IN
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
EMAIL
EMAIL_PASSWORD

SMTP host, port, security and sender configuration should be added according to the selected SMTP provider.

---

5. Start Backend

cd backend
npm run dev

The backend runs on the configured port.

API routes are mounted under:

/api

---

6. Start Frontend

Open another terminal:

cd frontend
npm run dev

Vite will provide the local development URL.

---

📜 Available Scripts

Frontend

npm run dev
npm run build
npm run preview
npm run copy-logo

Backend

npm start
npm run dev
npm run lint

---

🔌 API Organization

The backend API is organized into modular route groups:

/api
├── /auth
├── /seller
├── /seller/auth
├── /profile
├── /address
├── /orders
├── /admin
├── /chat
├── /upload
├── /marketplace
├── /products
├── /search
├── /search/history
├── /brands
├── /categories
├── /subcategories
└── /attributes

The backend follows a modular architecture based on:

Routes
   ↓
Controllers
   ↓
Services
   ↓
Repositories
   ↓
Models
   ↓
MongoDB

Middleware handles:

- Authentication
- Authorization
- Validation
- File uploads
- Error handling
- Security

---

🗄️ Core Data Models

The backend contains models covering major marketplace domains, including:

User
Seller
Product
Order
Address
Category
Subcategory
Brand
Attribute
Review
Notification
Conversation
Message
MarketplaceListing
Offer
Follow
Block
Report
AuditLog
SearchHistory
Settings

MongoDB indexes are used for important query patterns across areas such as:

- Orders
- Sellers
- Notifications
- Reviews
- Search history

---

🧩 Backend Architecture

The backend follows separation of concerns:

Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
Mongoose Models
  ↓
MongoDB

Supporting layers include:

Configuration
Middlewares
Validations
Helpers
Mappers
Utilities
Sockets

This structure improves:

- Maintainability
- Scalability
- Debugging
- Reusability
- Testing
- Future feature development

---

📊 Implementation Status

👤 Customer Platform

- [x] Authentication
- [x] Social authentication foundations
- [x] Profile management
- [x] Address management
- [x] Product catalogue
- [x] Product search
- [x] Categories
- [x] Subcategories
- [x] Brands
- [x] Marketplace
- [x] Cart and checkout UI
- [x] Wishlist UI
- [x] Order management
- [x] Order tracking UI
- [x] Seller profiles
- [x] Messaging UI
- [x] Notifications UI
- [x] Seller reviews and ratings

🏪 Seller Platform

- [x] Seller registration
- [x] Seller onboarding
- [x] Document upload flow
- [x] Verification status
- [x] Seller dashboard
- [x] Seller profile
- [x] Product management
- [x] Inventory management
- [x] Seller order management
- [x] Seller analytics
- [x] Seller settings

🛡️ Admin Platform

- [x] Admin dashboard
- [x] User management
- [x] Seller management
- [x] Product management
- [x] Category management
- [x] Order management
- [x] Verification center
- [x] Reports
- [x] Disputes
- [x] Analytics
- [x] Notifications
- [x] Audit logs
- [x] Import operations
- [x] Export operations
- [x] Platform settings
- [x] System health
- [x] Roles and permissions

⚙️ Platform Services

- [x] JWT authentication
- [x] Role-based authorization
- [x] Permission-based authorization
- [x] MongoDB/Mongoose integration
- [x] Cloudinary integration
- [x] SMTP email service
- [x] Socket.IO real-time communication
- [x] Request validation
- [x] Security middleware
- [x] Centralized error handling
- [x] Logging

---

🧪 Testing & Verification

The repository contains verification/debug scripts for selected backend functionality.

For production readiness, the project should additionally have comprehensive automated coverage for:

- Unit tests
- Integration/API tests
- Authentication tests
- Authorization tests
- Order lifecycle tests
- Seller workflows
- Admin permission tests
- Real-time communication
- End-to-end workflows

Run the frontend production build:

npm run build

Run backend linting:

npm run lint

---

🚀 Production Readiness Checklist

Before deploying NexCart:

- [ ] Configure production MongoDB
- [ ] Generate a strong production JWT secret
- [ ] Configure production frontend/backend origins
- [ ] Configure Cloudinary production credentials
- [ ] Configure production SMTP
- [ ] Configure Google/Apple OAuth credentials if required
- [ ] Review CORS configuration
- [ ] Review rate limits
- [ ] Disable development/debug functionality
- [ ] Verify protected routes
- [ ] Run frontend production build
- [ ] Run backend linting
- [ ] Verify Socket.IO deployment/proxy configuration
- [ ] Verify persistent media storage
- [ ] Add comprehensive automated test coverage
- [ ] Configure production logging and monitoring
- [ ] Integrate and verify a production payment gateway before accepting real payments

---

🗺️ Future Enhancements

Potential future improvements include:

- 💳 Production payment gateway integration
- 🧪 Comprehensive automated testing
- 📦 Advanced shipping/carrier integrations
- 🤖 AI-powered product recommendations
- 📈 Advanced seller/business intelligence
- 🔍 Advanced search and recommendation ranking
- 🛡️ Fraud and risk detection
- 📱 Progressive Web App/mobile applications
- ⚡ Expanded real-time notification delivery
- 🌍 Multi-language and multi-region support

---

🤝 Contributing

Contributions should follow the project's modular architecture and maintain separation between:

- Routes
- Controllers
- Services
- Repositories
- Models
- Validation
- Middleware
- Frontend services
- Frontend components

Before submitting changes:

# Frontend
npm run build

# Backend
npm run lint

Use meaningful commit messages and never commit environment secrets.

---

🔒 Environment & Secrets

The repository provides environment configuration through ".env.example".

Never commit:

.env
Production credentials
Private API keys
JWT secrets
Database passwords
SMTP passwords
OAuth secrets
Cloudinary secrets

Use environment variables or a secure deployment secret manager.

---

👥 Team

NexCart Development Team

NexCart is designed as a collaborative full-stack e-commerce project with dedicated customer, seller, and administrator experiences.

---

📄 License

The backend package currently declares an ISC license.

Confirm the final project-wide licensing terms before public distribution.

---

💙 NexCart

«One Platform. Three Experiences. A Complete Marketplace Ecosystem.»

Built with React, Node.js, Express, MongoDB, Socket.IO, Cloudinary, and modern web technologies.

NexCart — Shop. Sell. Manage. Connect.
