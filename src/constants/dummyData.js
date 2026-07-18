// Dummy Database for NexCart (Billion-Dollar eCommerce Startup)

export const CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: 'MdOutlineElectricalServices', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80', count: 1240 },
  { id: 'mobiles', name: 'Mobiles', icon: 'FiSmartphone', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', count: 850 },
  { id: 'laptops', name: 'Laptops', icon: 'FiLaptop', image: 'https://images.unsplash.com/photo-1496181130204-7552cc14ac1b?w=400&q=80', count: 620 },
  { id: 'fashion', name: 'Fashion', icon: 'FiTrendingUp', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80', count: 3400 },
  { id: 'beauty', name: 'Beauty', icon: 'MdOutlineBrush', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80', count: 1100 },
  { id: 'sports', name: 'Sports', icon: 'MdSportsBasketball', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80', count: 980 },
  { id: 'home', name: 'Home Decor', icon: 'FiHome', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80', count: 1540 },
  { id: 'furniture', name: 'Furniture', icon: 'MdOutlineChair', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80', count: 480 },
  { id: 'books', name: 'Books', icon: 'FiBookOpen', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80', count: 2100 },
  { id: 'grocery', name: 'Grocery', icon: 'MdLocalGroceryStore', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80', count: 3200 },
  { id: 'accessories', name: 'Accessories', icon: 'FiWatch', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80', count: 1890 },
  { id: 'vehicles', name: 'Vehicles', icon: 'FiActivity', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80', count: 150 },
  { id: 'gaming', name: 'Gaming', icon: 'FiTv', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80', count: 940 },
];

export const BRANDS = [
  { id: 'apple', name: 'Apple', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', count: 340 },
  { id: 'nike', name: 'Nike', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', count: 220 },
  { id: 'samsung', name: 'Samsung', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', count: 450 },
  { id: 'sony', name: 'Sony', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', count: 180 },
  { id: 'dell', name: 'Dell', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg', count: 120 },
  { id: 'adidas', name: 'Adidas', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', count: 190 },
];

export const PRODUCTS = [
  {
    id: 'p1',
    title: 'Apple iPhone 15 Pro Max (256GB, Titanium Black)',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
    brand: 'Apple',
    category: 'mobiles',
    price: 139900,
    mrp: 159900,
    rating: 4.8,
    reviewsCount: 1840,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',
    delivery: 'Free Express Delivery by Tomorrow',
    stock: 12,
    discount: 13,
    specs: [
      { key: 'Display', val: '6.7-inch Super Retina XDR' },
      { key: 'Processor', val: 'A17 Pro chip with 6-core GPU' },
      { key: 'Camera', val: '48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto' },
      { key: 'Battery', val: 'Up to 29 hours video playback' },
    ],
    reviews: [
      { id: 'r1', user: 'Vikram Singh', rating: 5, comment: 'Phenomenal device! The battery life easily lasts a day and a half. Titanium build feels extremely premium.', date: '2026-06-15' },
      { id: 'r2', user: 'Priya Sharma', rating: 4, comment: 'Camera zoom is amazing, but it gets slightly warm when playing high-end games.', date: '2026-07-02' }
    ]
  },
  {
    id: 'p2',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    description: 'Industry-leading noise cancelling wireless headphones with dual processor control, 8 microphones, and Auto NC Optimizer.',
    brand: 'Sony',
    category: 'electronics',
    price: 24999,
    mrp: 34999,
    rating: 4.6,
    reviewsCount: 3410,
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80',
    delivery: 'Free Delivery within 2 Days',
    stock: 8,
    discount: 29,
    specs: [
      { key: 'Battery Life', val: 'Up to 30 hours' },
      { key: 'Bluetooth Version', val: '5.2' },
      { key: 'Sound Driver', val: '30mm high-compliance driver unit' },
      { key: 'Features', val: 'Active Noise Cancelling, Speak-to-chat' },
    ],
    reviews: [
      { id: 'r3', user: 'Amit Patel', rating: 5, comment: 'Best noise-cancelling headphones on the planet. Block out aircraft engines perfectly!', date: '2026-05-18' }
    ]
  },
  {
    id: 'p3',
    title: 'MacBook Pro 16-inch (M3 Max chip, 36GB Unified Memory, 1TB SSD)',
    description: 'The ultimate pro laptop. With an 8-core CPU and 10-core GPU, the M3 chip makes editing high-res photos and rendering 4K video exceptionally fast.',
    brand: 'Apple',
    category: 'laptops',
    price: 349900,
    mrp: 379900,
    rating: 4.9,
    reviewsCount: 780,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
    delivery: 'Free Next-Day Delivery',
    stock: 4,
    discount: 8,
    specs: [
      { key: 'Processor', val: 'Apple M3 Max Chip' },
      { key: 'RAM', val: '36GB Unified Memory' },
      { key: 'Storage', val: '1TB SSD' },
      { key: 'Display', val: '16.2-inch Liquid Retina XDR' }
    ],
    reviews: [
      { id: 'r4', user: 'Rohan Mehta', rating: 5, comment: 'The speed is unbelievable. Compiled my complex codebase in seconds. Liquid Retina display is gorgeous.', date: '2026-06-29' }
    ]
  },
  {
    id: 'p4',
    title: 'Nike Air Max Pulse Lifestyle Sneakers',
    description: 'The Air Max Pulse pulls inspiration from the London music scene, bringing an underground touch to the iconic Air Max line.',
    brand: 'Nike',
    category: 'fashion',
    price: 13999,
    mrp: 14999,
    rating: 4.4,
    reviewsCount: 520,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    delivery: 'Free Delivery by Sunday',
    stock: 25,
    discount: 7,
    specs: [
      { key: 'Sole Material', val: 'Rubber sole with Air Max unit' },
      { key: 'Outer Material', val: 'Breathable textile mesh' },
      { key: 'Best For', val: 'Casual wear, Running' }
    ],
    reviews: [
      { id: 'r5', user: 'Siddharth Goel', rating: 4, comment: 'Very comfortable for daily walking. Fits true to size.', date: '2026-07-08' }
    ]
  },
  {
    id: 'p5',
    title: 'Dell XPS 15 9530 Laptop (Intel i9, 32GB RAM, 1TB SSD, RTX 4070)',
    description: 'The XPS 15 laptop is the perfect balance of size and performance to fuel your creative projects. Experience studio-quality sound.',
    brand: 'Dell',
    category: 'laptops',
    price: 264999,
    mrp: 299999,
    rating: 4.5,
    reviewsCount: 340,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80',
    delivery: 'Free Delivery with Secure Packaging',
    stock: 6,
    discount: 11,
    specs: [
      { key: 'Processor', val: '13th Gen Intel Core i9-13900H' },
      { key: 'Graphics Card', val: 'NVIDIA GeForce RTX 4070 8GB GDDR6' },
      { key: 'RAM', val: '32GB DDR5' },
      { key: 'Display', val: '15.6-inch OLED Touchscreen' }
    ],
    reviews: []
  },
  {
    id: 'p6',
    title: 'Samsung Galaxy S24 Ultra 5G (512GB, Titanium Gray)',
    description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity and productivity.',
    brand: 'Samsung',
    category: 'mobiles',
    price: 129999,
    mrp: 139999,
    rating: 4.7,
    reviewsCount: 1420,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80',
    delivery: 'Free Next-Day Delivery',
    stock: 15,
    discount: 7,
    specs: [
      { key: 'Display', val: '6.8-inch Dynamic AMOLED 2X, QHD+' },
      { key: 'Processor', val: 'Snapdragon 8 Gen 3 for Galaxy' },
      { key: 'Camera', val: '200MP + 50MP + 12MP + 10MP Quad camera' },
      { key: 'S-Pen', val: 'Included inside chassis' }
    ],
    reviews: [
      { id: 'r6', user: 'Neha Sen', rating: 5, comment: 'AI search features are very helpful! 200MP camera is out of this world.', date: '2026-04-12' }
    ]
  },
  {
    id: 'p7',
    title: 'Sony PlayStation 5 Slim Console (825GB)',
    description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio.',
    brand: 'Sony',
    category: 'gaming',
    price: 44990,
    mrp: 54990,
    rating: 4.8,
    reviewsCount: 2890,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80',
    delivery: 'Free Delivery by Friday',
    stock: 0, // Out of Stock
    discount: 18,
    specs: [
      { key: 'Processor', val: 'Custom AMD Zen 2 CPU' },
      { key: 'Storage', val: '825GB SSD' },
      { key: 'Output', val: 'Supports 4K 120Hz TVs' }
    ],
    reviews: []
  },
  {
    id: 'p8',
    title: 'Adidas Ultraboost Light Running Shoes',
    description: 'Feel the epic energy in the new Ultraboost Light, our lightest Ultraboost ever. The magic lies in the Light BOOST midsole.',
    brand: 'Adidas',
    category: 'sports',
    price: 18999,
    mrp: 19999,
    rating: 4.3,
    reviewsCount: 460,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
    delivery: 'Free Express Shipping',
    stock: 18,
    discount: 5,
    specs: [
      { key: 'Midsole Technology', val: 'Light BOOST cushioning' },
      { key: 'Outsole', val: 'Continental Better Rubber' },
      { key: 'Fit', val: 'Regular fit, lace closure' }
    ],
    reviews: []
  }
];

export const COUPONS = [
  { code: 'NEXSTART20', discountPercent: 20, minCartValue: 5000, description: '20% Off on purchases above ₹5,000' },
  { code: 'FLASH50', discountPercent: 50, minCartValue: 15000, description: '50% Off (Max ₹10,000 discount)' },
  { code: 'FREESHIP', discountPercent: 100, minCartValue: 1000, description: 'Free Shipping (Mock discount worth ₹150)' }
];

export const TESTIMONIALS = [
  { id: 1, name: 'Ananya Verma', role: 'Premium Buyer', comment: 'NexCart offers a faster, more beautiful layout than anything I have seen. Shopping feels premium here.', rating: 5, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  { id: 2, name: 'Kabir Dev', role: 'Tech Enthusiast', comment: 'Outstanding checkout speeds and crisp details about product specs. The dark UI is absolute eye candy!', rating: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
  { id: 3, name: 'Shreya Ghoshal', role: 'Fashion Blogger', comment: 'Amazing selection of Nike and Adidas sneakers. Prompt notifications and trackable shipping.', rating: 4, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' }
];

export const SELLER_STATS = {
  revenue: 894500,
  ordersCount: 142,
  customersCount: 98,
  inventoryCount: 450,
  recentOrders: [
    { id: 'ORD1290', customer: 'Deepak Rao', product: 'Apple iPhone 15 Pro Max', amount: 139900, status: 'Shipped', date: '2026-07-17' },
    { id: 'ORD1289', customer: 'Kriti Sen', product: 'Sony WH-1000XM5', amount: 24999, status: 'Processing', date: '2026-07-17' },
    { id: 'ORD1288', customer: 'Manish Verma', product: 'Nike Air Max Pulse', amount: 13999, status: 'Delivered', date: '2026-07-16' },
  ],
  monthlySales: [
    { month: 'Jan', sales: 120000 },
    { month: 'Feb', sales: 150000 },
    { month: 'Mar', sales: 180000 },
    { month: 'Apr', sales: 240000 },
    { month: 'May', sales: 310000 },
    { month: 'Jun', sales: 420000 },
  ]
};

export const ADMIN_STATS = {
  totalUsers: 1420,
  totalProducts: 85,
  totalOrders: 654,
  totalCategories: 13,
  recentUsers: [
    { name: 'Arjun Kapoor', email: 'arjun@gmail.com', role: 'Customer', date: '2026-07-18' },
    { name: 'Megha Gupta', email: 'megha@seller.com', role: 'Seller', date: '2026-07-17' },
    { name: 'Rahul Joshi', email: 'rahul@gmail.com', role: 'Customer', date: '2026-07-16' },
  ],
  categoryShare: [
    { name: 'Mobiles', percentage: 38 },
    { name: 'Laptops', percentage: 24 },
    { name: 'Electronics', percentage: 18 },
    { name: 'Fashion', percentage: 12 },
    { name: 'Gaming', percentage: 8 }
  ]
};
