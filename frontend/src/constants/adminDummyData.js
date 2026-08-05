// ============================================================
// NexCart Admin Panel — Rich Mock Data
// All data here is dummy/mock — ready for backend integration
// ============================================================

// ─── Platform Stats ────────────────────────────────────────────
export const PLATFORM_STATS = {
  totalUsers: 48_291,
  totalSellers: 3_847,
  totalProducts: 124_560,
  totalOrders: 89_234,
  totalRevenue: 84_72_910,
  pendingVerifications: 47,
  blockedUsers: 128,
  openReports: 34,
  userGrowth: '+12.4%',
  sellerGrowth: '+8.7%',
  revenueGrowth: '+23.1%',
  orderGrowth: '+15.6%',
};

// ─── Revenue Chart Data ─────────────────────────────────────────
export const REVENUE_MONTHLY = [
  { month: 'Jan', revenue: 420000, orders: 5200 },
  { month: 'Feb', revenue: 380000, orders: 4800 },
  { month: 'Mar', revenue: 510000, orders: 6100 },
  { month: 'Apr', revenue: 490000, orders: 5900 },
  { month: 'May', revenue: 630000, orders: 7400 },
  { month: 'Jun', revenue: 720000, orders: 8600 },
  { month: 'Jul', revenue: 840000, orders: 9800 },
  { month: 'Aug', revenue: 790000, orders: 9200 },
  { month: 'Sep', revenue: 920000, orders: 10900 },
  { month: 'Oct', revenue: 1050000, orders: 12300 },
  { month: 'Nov', revenue: 1380000, orders: 15800 },
  { month: 'Dec', revenue: 1520000, orders: 17200 },
];

export const USER_GROWTH_MONTHLY = [
  { month: 'Jan', users: 2100, sellers: 140 },
  { month: 'Feb', users: 2400, sellers: 165 },
  { month: 'Mar', users: 3200, sellers: 210 },
  { month: 'Apr', users: 2900, sellers: 195 },
  { month: 'May', users: 4100, sellers: 280 },
  { month: 'Jun', users: 4800, sellers: 320 },
  { month: 'Jul', users: 5200, sellers: 350 },
  { month: 'Aug', users: 4700, sellers: 310 },
  { month: 'Sep', users: 5900, sellers: 390 },
  { month: 'Oct', users: 6400, sellers: 430 },
  { month: 'Nov', users: 7200, sellers: 480 },
  { month: 'Dec', users: 8100, sellers: 540 },
];

// ─── Users ─────────────────────────────────────────────────────
export const ADMIN_USERS = [];

// ─── Sellers ────────────────────────────────────────────────────
export const ADMIN_SELLERS = [];

// ─── Orders ─────────────────────────────────────────────────────
export const ADMIN_ORDERS = [
  {
    id: 'ORD-98431',
    customer: 'Arjun Kapoor',
    customerEmail: 'arjun.kapoor@gmail.com',
    seller: 'TechZone Electronics',
    items: 2,
    total: 48200,
    status: 'delivered',
    paymentStatus: 'paid',
    date: '2026-08-01',
    deliveredDate: '2026-08-03',
    paymentMethod: 'UPI',
  },
  {
    id: 'ORD-98432',
    customer: 'Meghna Sharma',
    customerEmail: 'meghna.s@outlook.com',
    seller: 'FashionHive',
    items: 3,
    total: 8900,
    status: 'processing',
    paymentStatus: 'paid',
    date: '2026-08-02',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'ORD-98433',
    customer: 'Priya Nair',
    customerEmail: 'priya.nair@yahoo.com',
    seller: 'HomeNest Decor',
    items: 1,
    total: 12400,
    status: 'shipped',
    paymentStatus: 'paid',
    date: '2026-08-01',
    paymentMethod: 'Debit Card',
  },
  {
    id: 'ORD-98434',
    customer: 'Sneha Reddy',
    customerEmail: 'sneha.reddy@gmail.com',
    seller: 'BookWorld',
    items: 5,
    total: 2200,
    status: 'delivered',
    paymentStatus: 'paid',
    date: '2026-07-30',
    deliveredDate: '2026-08-02',
    paymentMethod: 'COD',
  },
  {
    id: 'ORD-98435',
    customer: 'Divya Krishnan',
    customerEmail: 'divya.k@protonmail.com',
    seller: 'TechZone Electronics',
    items: 1,
    total: 89999,
    status: 'cancelled',
    paymentStatus: 'refunded',
    date: '2026-07-28',
    paymentMethod: 'Net Banking',
  },
  {
    id: 'ORD-98436',
    customer: 'Aditya Mehta',
    customerEmail: 'aditya.mehta@gmail.com',
    seller: 'SportElite',
    items: 2,
    total: 5600,
    status: 'pending',
    paymentStatus: 'pending',
    date: '2026-08-04',
    paymentMethod: 'UPI',
  },
];

// ─── Products ────────────────────────────────────────────────────
export const ADMIN_PRODUCTS = [
  {
    id: 'prd_001',
    name: 'Sony WH-1000XM5 Headphones',
    category: 'Electronics',
    seller: 'TechZone Electronics',
    price: 24999,
    stock: 48,
    rating: 4.8,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80',
    featured: true,
    reviews: 340,
  },
  {
    id: 'prd_002',
    name: 'Nike Air Max 270',
    category: 'Fashion',
    seller: 'FashionHive',
    price: 8999,
    stock: 132,
    rating: 4.5,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80',
    featured: false,
    reviews: 218,
  },
  {
    id: 'prd_003',
    name: 'Bohemian Floor Lamp',
    category: 'Home Decor',
    seller: 'HomeNest Decor',
    price: 3499,
    stock: 22,
    rating: 4.3,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100&q=80',
    featured: false,
    reviews: 89,
  },
  {
    id: 'prd_004',
    name: 'Atomic Habits (Book)',
    category: 'Books',
    seller: 'BookWorld',
    price: 399,
    stock: 850,
    rating: 4.9,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&q=80',
    featured: true,
    reviews: 2100,
  },
  {
    id: 'prd_005',
    name: 'Wilson Tennis Racket Pro',
    category: 'Sports',
    seller: 'SportElite',
    price: 5200,
    stock: 0,
    rating: 4.1,
    status: 'out_of_stock',
    image: 'https://images.unsplash.com/photo-1612889159855-e3c9e2398975?w=100&q=80',
    featured: false,
    reviews: 45,
  },
  {
    id: 'prd_006',
    name: 'Apple MacBook Air M3',
    category: 'Laptops',
    seller: 'TechZone Electronics',
    price: 114900,
    stock: 12,
    rating: 4.9,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1496181130204-7552cc14ac1b?w=100&q=80',
    featured: true,
    reviews: 560,
  },
];

// ─── Categories ──────────────────────────────────────────────────
export const ADMIN_CATEGORIES = [
  { id: 'cat_01', name: 'Electronics', slug: 'electronics', productCount: 1240, parent: null, active: true },
  { id: 'cat_02', name: 'Mobiles', slug: 'mobiles', productCount: 850, parent: 'Electronics', active: true },
  { id: 'cat_03', name: 'Laptops', slug: 'laptops', productCount: 620, parent: 'Electronics', active: true },
  { id: 'cat_04', name: 'Fashion', slug: 'fashion', productCount: 3400, parent: null, active: true },
  { id: 'cat_05', name: 'Men\'s Clothing', slug: 'mens-clothing', productCount: 1800, parent: 'Fashion', active: true },
  { id: 'cat_06', name: 'Women\'s Clothing', slug: 'womens-clothing', productCount: 1600, parent: 'Fashion', active: true },
  { id: 'cat_07', name: 'Beauty', slug: 'beauty', productCount: 1100, parent: null, active: true },
  { id: 'cat_08', name: 'Sports', slug: 'sports', productCount: 980, parent: null, active: true },
  { id: 'cat_09', name: 'Home Decor', slug: 'home', productCount: 1540, parent: null, active: true },
  { id: 'cat_10', name: 'Books', slug: 'books', productCount: 2100, parent: null, active: true },
  { id: 'cat_11', name: 'Grocery', slug: 'grocery', productCount: 3200, parent: null, active: false },
  { id: 'cat_12', name: 'Furniture', slug: 'furniture', productCount: 480, parent: 'Home Decor', active: true },
];

// ─── Verifications ───────────────────────────────────────────────
export const ADMIN_VERIFICATIONS = [];

// ─── Audit Logs ──────────────────────────────────────────────────
export const ADMIN_AUDIT_LOGS = [];

// ─── Admin Notifications ─────────────────────────────────────────
export const ADMIN_NOTIFICATIONS = [
  {
    id: 'notif_001',
    type: 'verification',
    title: 'New Verification Request',
    message: 'FashionHive has submitted GST Certificate for review.',
    time: '5 minutes ago',
    read: false,
    priority: 'high',
    link: '/admin/verification',
  },
  {
    id: 'notif_002',
    type: 'report',
    title: 'Product Report Received',
    message: 'User Arjun Kapoor reported a counterfeit product listing.',
    time: '18 minutes ago',
    read: false,
    priority: 'high',
    link: '/admin/reports',
  },
  {
    id: 'notif_003',
    type: 'alert',
    title: 'Server CPU Spike',
    message: 'API server CPU usage reached 91% at 12:45 PM.',
    time: '2 hours ago',
    read: false,
    priority: 'critical',
    link: '/admin/analytics',
  },
  {
    id: 'notif_004',
    type: 'order',
    title: 'High-Value Order Flagged',
    message: 'Order ORD-98431 worth ₹89,999 needs manual review.',
    time: '3 hours ago',
    read: true,
    priority: 'medium',
    link: '/admin/orders',
  },
  {
    id: 'notif_005',
    type: 'seller',
    title: 'Seller Account Warning',
    message: 'SportElite has received 5 negative reviews in last 24 hours.',
    time: '5 hours ago',
    read: true,
    priority: 'medium',
    link: '/admin/sellers',
  },
  {
    id: 'notif_006',
    type: 'verification',
    title: 'Verification Request',
    message: 'MegaMart submitted PAN Card for verification.',
    time: '6 hours ago',
    read: true,
    priority: 'normal',
    link: '/admin/verification',
  },
  {
    id: 'notif_007',
    type: 'platform',
    title: 'Scheduled Maintenance',
    message: 'Database maintenance window: Aug 6, 2:00 AM – 4:00 AM.',
    time: '1 day ago',
    read: true,
    priority: 'normal',
    link: '/admin/settings',
  },
];

// ─── Recent Activity Feed ────────────────────────────────────────
export const RECENT_ACTIVITY = [
  { id: 1, event: 'New user registered', detail: 'sneha.reddy@gmail.com', time: '2 min ago', type: 'user' },
  { id: 2, event: 'Order delivered', detail: 'ORD-98431 — Arjun Kapoor', time: '10 min ago', type: 'order' },
  { id: 3, event: 'Verification submitted', detail: 'FashionHive — GST Certificate', time: '18 min ago', type: 'verification' },
  { id: 4, event: 'Product featured', detail: 'Apple MacBook Air M3', time: '1 hr ago', type: 'product' },
  { id: 5, event: 'Seller suspended', detail: 'SportElite — policy violation', time: '2 hr ago', type: 'seller' },
  { id: 6, event: 'New order placed', detail: 'ORD-98436 — ₹5,600', time: '3 hr ago', type: 'order' },
  { id: 7, event: 'Category updated', detail: 'Electronics → 1,240 products', time: '4 hr ago', type: 'category' },
  { id: 8, event: 'User blocked', detail: 'Ananya Singh — fraudulent activity', time: '5 hr ago', type: 'user' },
];

// ─── System Alerts ───────────────────────────────────────────────
export const SYSTEM_ALERTS = [
  { id: 1, type: 'critical', title: 'CPU Spike Detected', desc: 'API server reached 91% CPU at 12:45 PM', time: '2 hr ago' },
  { id: 2, type: 'warning', title: 'Disk Usage 78%', desc: 'Storage server at 78% capacity — consider cleanup', time: '6 hr ago' },
  { id: 3, type: 'info', title: 'CDN Cache Hit Rate', desc: 'Cache hit rate at 94.2% — excellent performance', time: '12 hr ago' },
  { id: 4, type: 'success', title: 'Database Backup', desc: 'Full database backup completed successfully', time: '1 day ago' },
];

// ─── Analytics Data ──────────────────────────────────────────────
export const CATEGORY_ANALYTICS = [
  { name: 'Electronics', share: 28, revenue: 2360000 },
  { name: 'Fashion', share: 22, revenue: 1850000 },
  { name: 'Books', share: 15, revenue: 1260000 },
  { name: 'Home Decor', share: 12, revenue: 1010000 },
  { name: 'Sports', share: 10, revenue: 840000 },
  { name: 'Beauty', share: 8, revenue: 670000 },
  { name: 'Others', share: 5, revenue: 420000 },
];

export const QUICK_STATS_WEEKLY = {
  newUsers: 1240,
  newSellers: 34,
  newOrders: 5820,
  newRevenue: 4820000,
  pendingApprovals: 47,
  resolvedReports: 12,
};

// ─── CSV Import Mock Result ──────────────────────────────────────
export const CSV_IMPORT_MOCK_RESULT = {
  totalRows: 250,
  imported: 238,
  failed: 8,
  warnings: 4,
  duplicates: 6,
  errors: [
    { row: 14, field: 'price', message: 'Invalid price format (negative value)' },
    { row: 27, field: 'category', message: 'Category "Gadgets" does not exist' },
    { row: 53, field: 'stock', message: 'Stock must be a non-negative integer' },
    { row: 88, field: 'email', message: 'Invalid seller email format' },
    { row: 102, field: 'name', message: 'Product name exceeds 200 character limit' },
    { row: 134, field: 'gst', message: 'GST number format invalid' },
    { row: 167, field: 'images', message: 'Image URL returns 404' },
    { row: 201, field: 'weight', message: 'Weight must be a positive number' },
  ],
};

// ─── Platform Settings Mock ──────────────────────────────────────
export const PLATFORM_SETTINGS = {
  general: {
    siteName: 'NexCart',
    tagline: 'Shop Limitless',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'English',
    contactEmail: 'support@nexcart.in',
    supportPhone: '+91 1800 123 4567',
  },
  commission: {
    electronics: 6,
    fashion: 8,
    books: 5,
    sports: 7,
    beauty: 10,
    grocery: 4,
    default: 7,
  },
  maintenance: {
    enabled: false,
    message: 'NexCart is under maintenance. We\'ll be back shortly.',
    scheduledAt: '',
  },
};

export const AUDIT_LOGS = ADMIN_AUDIT_LOGS;

export const ADMIN_REPORTS = [
  {
    id: 'DSP-88410',
    type: 'counterfeit',
    target: 'TechZone Electronics',
    reason: 'Customer reported receiving duplicate copy of Sony WH-1000XM5 headphones with serial number mismatch.',
    reporter: 'Arjun Kapoor',
    priority: 'critical',
    status: 'open',
    date: '2026-08-03',
  },
  {
    id: 'DSP-88411',
    type: 'payment',
    target: 'FashionHive',
    reason: 'Merchant cancelled order without initiating refund processing in system backend.',
    reporter: 'Meghna Sharma',
    priority: 'high',
    status: 'open',
    date: '2026-08-04',
  },
  {
    id: 'DSP-88412',
    type: 'abuse',
    target: 'SportElite',
    reason: 'Inappropriate responses to customer queries in chat portal using offensive language.',
    reporter: 'Rahul Joshi',
    priority: 'medium',
    status: 'resolved',
    date: '2026-07-29',
  },
];

