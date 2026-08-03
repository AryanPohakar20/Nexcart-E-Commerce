import Product from '../models/Product.js';
import logger from '../utils/logger.js';

export const DUMMY_PRODUCTS = [
  {
    _id: "p1",
    title: "Apple iPhone 15 Pro Max (256GB, Titanium Black)",
    description: "Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.",
    brand: "Apple",
    category: "mobiles",
    price: 139900,
    mrp: 159900,
    rating: 4.8,
    reviewsCount: 1840,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80",
    stock: 12,
    discount: 13,
    specs: [
      { key: "Display", val: "6.7-inch Super Retina XDR" },
      { key: "Processor", val: "A17 Pro chip with 6-core GPU" },
      { key: "Camera", val: "48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto" },
      { key: "Battery", val: "Up to 29 hours video playback" }
    ]
  },
  {
    _id: "p2",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    description: "Industry-leading noise cancelling wireless headphones with dual processor control, 8 microphones, and Auto NC Optimizer.",
    brand: "Sony",
    category: "electronics",
    price: 24999,
    mrp: 34999,
    rating: 4.6,
    reviewsCount: 3410,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80",
    stock: 8,
    discount: 29,
    specs: [
      { key: "Battery Life", val: "Up to 30 hours" },
      { key: "Bluetooth Version", val: "5.2" },
      { key: "Sound Driver", val: "30mm high-compliance driver unit" },
      { key: "Features", val: "Active Noise Cancelling, Speak-to-chat" }
    ]
  },
  {
    _id: "p3",
    title: "MacBook Pro 16-inch (M3 Max chip, 36GB Unified Memory, 1TB SSD)",
    description: "The ultimate pro laptop. With an 8-core CPU and 10-core GPU, the M3 chip makes editing high-res photos and rendering 4K video exceptionally fast.",
    brand: "Apple",
    category: "laptops",
    price: 349900,
    mrp: 379900,
    rating: 4.9,
    reviewsCount: 780,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
    stock: 4,
    discount: 8,
    specs: [
      { key: "Processor", val: "Apple M3 Max Chip" },
      { key: "RAM", val: "36GB Unified Memory" },
      { key: "Storage", val: "1TB SSD" },
      { key: "Display", val: "16.2-inch Liquid Retina XDR" }
    ]
  },
  {
    _id: "p4",
    title: "Nike Air Max Pulse Lifestyle Sneakers",
    description: "The Air Max Pulse pulls inspiration from the London music scene, bringing an underground touch to the iconic Air Max line.",
    brand: "Nike",
    category: "fashion",
    price: 13999,
    mrp: 14999,
    rating: 4.4,
    reviewsCount: 520,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    stock: 25,
    discount: 7,
    specs: [
      { key: "Sole Material", val: "Rubber sole with Air Max unit" },
      { key: "Outer Material", val: "Breathable textile mesh" },
      { key: "Best For", val: "Casual wear, Running" }
    ]
  },
  {
    _id: "p5",
    title: "Dell XPS 15 9530 Laptop (Intel i9, 32GB RAM, 1TB SSD, RTX 4070)",
    description: "The XPS 15 laptop is the perfect balance of size and performance to fuel your creative projects. Experience studio-quality sound.",
    brand: "Dell",
    category: "laptops",
    price: 264999,
    mrp: 299999,
    rating: 4.5,
    reviewsCount: 340,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80",
    stock: 6,
    discount: 11,
    specs: [
      { key: "Processor", val: "13th Gen Intel Core i9-13900H" },
      { key: "Graphics Card", val: "NVIDIA GeForce RTX 4070 8GB GDDR6" },
      { key: "RAM", val: "32GB DDR5" },
      { key: "Display", val: "15.6-inch OLED Touchscreen" }
    ]
  },
  {
    _id: "p6",
    title: "Samsung Galaxy S24 Ultra 5G (512GB, Titanium Gray)",
    description: "Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity and productivity.",
    brand: "Samsung",
    category: "mobiles",
    price: 129999,
    mrp: 139999,
    rating: 4.7,
    reviewsCount: 1420,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80",
    stock: 15,
    discount: 7,
    specs: [
      { key: "Display", val: "6.8-inch Dynamic AMOLED 2X, QHD+" },
      { key: "Processor", val: "Snapdragon 8 Gen 3 for Galaxy" },
      { key: "Camera", val: "200MP + 50MP + 12MP + 10MP Quad camera" },
      { key: "S-Pen", val: "Included inside chassis" }
    ]
  },
  {
    _id: "p7",
    title: "Sony PlayStation 5 Slim Console (825GB)",
    description: "Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio.",
    brand: "Sony",
    category: "gaming",
    price: 44990,
    mrp: 54990,
    rating: 4.8,
    reviewsCount: 2890,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80",
    stock: 0,
    discount: 18,
    specs: [
      { key: "Processor", val: "Custom AMD Zen 2 CPU" },
      { key: "Storage", val: "825GB SSD" },
      { key: "Output", val: "Supports 4K 120Hz TVs" }
    ]
  },
  {
    _id: "p8",
    title: "Adidas Ultraboost Light Running Shoes",
    description: "Feel the epic energy in the new Ultraboost Light, our lightest Ultraboost ever. The magic lies in the Light BOOST midsole.",
    brand: "Adidas",
    category: "sports",
    price: 18999,
    mrp: 19999,
    rating: 4.3,
    reviewsCount: 460,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80",
    stock: 18,
    discount: 5,
    specs: [
      { key: "Midsole Technology", val: "Light BOOST cushioning" },
      { key: "Outsole", val: "Continental Better Rubber" },
      { key: "Fit", val: "Regular fit, lace closure" }
    ]
  }
];

export const seedDatabase = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      logger.info('🌱 Database is empty. Seeding catalog products...');
      await Product.insertMany(DUMMY_PRODUCTS);
      logger.info(`✅ Successfully seeded ${DUMMY_PRODUCTS.length} catalog products!`);
    } else {
      logger.info(`📦 Product collection already has ${productCount} items. Skipping seeding.`);
    }
  } catch (error) {
    logger.error('❌ Database seeding failed:', error.message || error);
  }
};
