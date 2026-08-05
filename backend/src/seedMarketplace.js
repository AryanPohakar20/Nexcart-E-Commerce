import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Seller from './models/Seller.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Settings from './models/Settings.js';
import Notification from './models/Notification.js';
import Report from './models/Report.js';

const seedMarketplace = async () => {
  try {
    await connectDB();
    console.log('Connected to database. Starting seed process...');

    // Drop any legacy/stale indexes
    try {
      await mongoose.connection.collection('products').dropIndex('id_1');
    } catch (e) {}
    try {
      await mongoose.connection.collection('orders').dropIndex('orderNumber_1');
    } catch (e) {}

    // 1. Get or create a sample seller & customer
    let sampleUser = await User.findOne({ email: 'john.customer@nexcart.com' });
    if (!sampleUser) {
      sampleUser = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.customer@nexcart.com',
        phone: '9876543210',
        password: 'Password@123',
        role: 'customer',
        status: 'Active',
      });
    }

    let sellerUser = await User.findOne({ email: 'merchant.prime@nexcart.com' });
    if (!sellerUser) {
      sellerUser = await User.create({
        firstName: 'Apex',
        lastName: 'Merchant',
        email: 'merchant.prime@nexcart.com',
        phone: '9876543211',
        password: 'Password@123',
        role: 'seller',
        status: 'Active',
      });
    }

    let sampleSeller = await Seller.findOne({ userId: sellerUser._id });
    if (!sampleSeller) {
      sampleSeller = await Seller.create({
        userId: sellerUser._id,
        business: {
          businessName: 'Apex Electronics Pvt Ltd',
          taxDetails: {
            gstNumber: '27AAAAA0000A1Z5',
          },
        },
        accountInfo: {
          displayName: 'Apex Official Store',
          email: 'merchant.prime@nexcart.com',
        },
        verificationStatus: 'Verified',
        status: 'Active',
      });
    }

    // 2. Categories
    const categoriesData = [
      { name: 'Electronics', slug: 'electronics', description: 'Gadgets, phones, audio & computing', order: 1 },
      { name: 'Audio', slug: 'audio', description: 'Headphones, earbuds, and speakers', order: 2 },
      { name: 'Wearables', slug: 'wearables', description: 'Smart watches and fitness trackers', order: 3 },
      { name: 'Gaming', slug: 'gaming', description: 'Consoles, mice, keyboards and gaming gear', order: 4 },
      { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Modern living essentials', order: 5 },
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      let doc = await Category.findOne({ slug: cat.slug });
      if (!doc) {
        doc = await Category.create(cat);
      }
      categoryMap[cat.slug] = doc._id;
    }

    // Set parent hierarchy for Audio & Wearables under Electronics
    await Category.updateOne({ slug: 'audio' }, { parent: categoryMap['electronics'] });
    await Category.updateOne({ slug: 'wearables' }, { parent: categoryMap['electronics'] });

    // 3. Products
    const productsData = [
      {
        name: 'Quantum SoundPro ANC Wireless Earbuds',
        slug: 'quantum-soundpro-anc-wireless-earbuds',
        sku: 'QSP-ANC-01',
        description: 'Flagship Active Noise Cancellation earbuds with 40-hour battery life and Hi-Res spatial audio.',
        category: categoryMap['audio'],
        seller: sampleSeller._id,
        price: 3499,
        compareAtPrice: 5999,
        stock: 85,
        status: 'Approved',
        featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80', isDefault: true }],
        ratings: { average: 4.8, count: 128 },
      },
      {
        name: 'Apex Precision Pro Optical Gaming Mouse',
        slug: 'apex-precision-pro-optical-gaming-mouse',
        sku: 'APX-MSE-02',
        description: '26K DPI optical sensor, ultra-lightweight 58g honeycomb shell with customizable RGB lighting.',
        category: categoryMap['gaming'],
        seller: sampleSeller._id,
        price: 1899,
        compareAtPrice: 2999,
        stock: 42,
        status: 'Approved',
        featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80', isDefault: true }],
        ratings: { average: 4.6, count: 94 },
      },
      {
        name: 'PulseTrack v4 AMOLED Smart Watch',
        slug: 'pulsetrack-v4-amoled-smart-watch',
        sku: 'PTR-WAT-03',
        description: '1.43-inch Always-on AMOLED display, Bluetooth calling, heart rate, SpO2 and GPS tracking.',
        category: categoryMap['wearables'],
        seller: sampleSeller._id,
        price: 4299,
        compareAtPrice: 7999,
        stock: 28,
        status: 'Approved',
        featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', isDefault: true }],
        ratings: { average: 4.9, count: 215 },
      },
      {
        name: 'NovaStrike Mechanical Keyboard (Hot-swappable)',
        slug: 'novastrike-mechanical-keyboard',
        sku: 'NVS-KB-04',
        description: '75% layout, pre-lubed linear switches, gasket mounted structure with PBT double-shot keycaps.',
        category: categoryMap['gaming'],
        seller: sampleSeller._id,
        price: 4999,
        compareAtPrice: 6999,
        stock: 15,
        status: 'Approved',
        featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80', isDefault: true }],
        ratings: { average: 4.7, count: 67 },
      },
      {
        name: 'HyperCharge 65W GaN Fast Wall Charger',
        slug: 'hypercharge-65w-gan-fast-wall-charger',
        sku: 'HYP-GAN-05',
        description: 'Triple port USB-C & USB-A fast charging adapter compatible with laptops and smartphones.',
        category: categoryMap['electronics'],
        seller: sampleSeller._id,
        price: 1499,
        compareAtPrice: 2499,
        stock: 0,
        status: 'Approved',
        featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80', isDefault: true }],
        ratings: { average: 4.4, count: 41 },
      }
    ];

    const seededProducts = [];
    for (const p of productsData) {
      let doc = await Product.findOne({ sku: p.sku });
      if (!doc) {
        doc = await Product.create(p);
      }
      seededProducts.push(doc);
    }

    // 4. Sample Orders
    const sampleOrderData = [
      {
        orderId: 'ORD-98214',
        customer: sampleUser._id,
        seller: sampleSeller._id,
        items: [
          {
            product: seededProducts[0]._id,
            name: seededProducts[0].name,
            quantity: 1,
            price: seededProducts[0].price,
            subtotal: seededProducts[0].price,
          }
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+91 9876543210',
          addressLine1: '402 Cyber Heights, Tech City',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
        paymentInfo: {
          method: 'Credit Card',
          status: 'paid',
          transactionId: 'TXN_99812401',
        },
        orderStatus: 'delivered',
        totalAmount: 3499,
        itemCount: 1,
        statusHistory: [
          { status: 'pending', timestamp: new Date(Date.now() - 4 * 86400000) },
          { status: 'processing', timestamp: new Date(Date.now() - 3 * 86400000) },
          { status: 'shipped', timestamp: new Date(Date.now() - 2 * 86400000) },
          { status: 'delivered', timestamp: new Date(Date.now() - 1 * 86400000) },
        ],
      },
      {
        orderId: 'ORD-98215',
        customer: sampleUser._id,
        seller: sampleSeller._id,
        items: [
          {
            product: seededProducts[2]._id,
            name: seededProducts[2].name,
            quantity: 1,
            price: seededProducts[2].price,
            subtotal: seededProducts[2].price,
          }
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+91 9876543210',
          addressLine1: '402 Cyber Heights, Tech City',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
        paymentInfo: {
          method: 'UPI',
          status: 'paid',
          transactionId: 'TXN_99812402',
        },
        orderStatus: 'processing',
        totalAmount: 4299,
        itemCount: 1,
        statusHistory: [
          { status: 'pending', timestamp: new Date(Date.now() - 12 * 3600000) },
          { status: 'processing', timestamp: new Date() },
        ],
      }
    ];

    for (const ord of sampleOrderData) {
      const exists = await Order.findOne({ orderId: ord.orderId });
      if (!exists) {
        await Order.create(ord);
      }
    }

    // 5. Seed Platform Settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        general: {
          siteName: 'NexCart Marketplace',
          tagline: 'Shop Limitless',
          contactEmail: 'support@nexcart.in',
          supportPhone: '+91 1800 123 4567',
          currency: 'INR (₹)',
        },
        marketplace: {
          commissionRate: 10,
          minPayout: 1000,
          autoApproveSellers: false,
          minTrustScore: 70,
        },
        security: {
          require2FA: true,
          sessionTimeout: 60,
        },
        email: {
          smtpHost: 'smtp.sendgrid.net',
          smtpPort: 587,
          senderName: 'NexCart Admin',
          replyEmail: 'no-reply@nexcart.in',
        },
        branding: {
          primaryColor: '#FFC107',
          secondaryColor: '#10B981',
          platformName: 'NexCart Marketplace',
          razorpayKey: 'rzp_live_9948291048102',
        },
      });
      console.log('Seeded Platform Settings.');
    }

    // 6. Seed Notifications
    const sampleNotifications = [
      {
        type: 'verification',
        title: 'New Seller KYC Submitted',
        message: 'Apex Electronics Pvt Ltd submitted GST and business verification documents.',
        priority: 'high',
        read: false,
        link: '/admin/verification',
      },
      {
        type: 'report',
        title: 'Counterfeit Product Claim',
        message: 'Dispute DSP-88410 filed against TechZone Electronics regarding serial mismatch.',
        priority: 'critical',
        read: false,
        link: '/admin/reports',
      },
      {
        type: 'order',
        title: 'High-Value Order Placed',
        message: 'Order #ORD-98431 total ₹48,200 placed and confirmed via UPI.',
        priority: 'normal',
        read: true,
        link: '/admin/orders',
      },
      {
        type: 'alert',
        title: 'Platform Maintenance Scheduled',
        message: 'Database optimization window scheduled for this weekend 2:00 AM UTC.',
        priority: 'low',
        read: true,
        link: '/admin/settings',
      },
    ];

    for (const notif of sampleNotifications) {
      const exists = await Notification.findOne({ title: notif.title });
      if (!exists) {
        await Notification.create(notif);
      }
    }
    console.log('Seeded Notifications.');

    // 7. Seed Dispute Reports
    const sampleDisputes = [
      {
        reportId: 'DSP-88410',
        type: 'counterfeit',
        target: 'TechZone Electronics',
        targetType: 'Seller',
        reason: 'Customer reported receiving duplicate copy of Sony WH-1000XM5 headphones with serial number mismatch.',
        reporter: 'Arjun Kapoor',
        priority: 'critical',
        status: 'open',
      },
      {
        reportId: 'DSP-88411',
        type: 'payment',
        target: 'FashionHive',
        targetType: 'Seller',
        reason: 'Merchant cancelled order without initiating refund processing in system backend.',
        reporter: 'Meghna Sharma',
        priority: 'high',
        status: 'open',
      },
      {
        reportId: 'DSP-88412',
        type: 'abuse',
        target: 'SportElite',
        targetType: 'Seller',
        reason: 'Inappropriate responses to customer queries in chat portal using offensive language.',
        reporter: 'Rahul Joshi',
        priority: 'medium',
        status: 'resolved',
        resolutionAction: 'resolve',
        adminRemarks: 'Merchant warned and issue resolved with customer.',
      },
    ];

    for (const dsp of sampleDisputes) {
      const exists = await Report.findOne({ reportId: dsp.reportId });
      if (!exists) {
        await Report.create(dsp);
      }
    }
    console.log('Seeded Dispute Reports.');

    console.log('✅ Marketplace successfully seeded with Categories, Products, Orders, Settings, Notifications, and Reports.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedMarketplace();
