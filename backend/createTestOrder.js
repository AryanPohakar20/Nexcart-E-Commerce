import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';

const seedTestOrder = async () => {
  try {
    await connectDB();

    console.log('Seeding mock data for testing...');
    const randomSuffix = Math.floor(Math.random() * 100000);

    // 1. Create Customer
    const customer = await User.create({
      firstName: 'BobCustomer',
      lastName: 'Doe',
      username: `bob_${randomSuffix}`,
      email: `bob.${randomSuffix}@test.com`,
      phone: `99933${randomSuffix}`,
      password: 'password123',
      role: 'customer',
    });

    // 2. Create Seller User & Profile
    const sellerUser = await User.create({
      firstName: 'AliceSeller',
      lastName: 'Merchant',
      username: `alice_${randomSuffix}`,
      email: `alice.${randomSuffix}@test.com`,
      phone: `99944${randomSuffix}`,
      password: 'password123',
      role: 'seller',
    });

    const sellerProfile = await Seller.create({
      userId: sellerUser._id,
      business: { businessName: `Nexcart Electronics ${randomSuffix}` },
      accountInfo: { displayName: `Nexcart Electronics ${randomSuffix}`, email: sellerUser.email },
      verificationStatus: 'Verified',
      status: 'Active',
    });

    // 3. Create Product
    const product = await Product.create({
      title: 'Nexcart Premium Laptop',
      slug: `premium-laptop-${randomSuffix}`,
      sku: `LAP-${randomSuffix}`,
      price: 2500,
      stock: 10,
      seller: sellerProfile._id,
      sellerModel: 'Seller',
      category: new mongoose.Types.ObjectId(), // Dummy category ObjectId
    });

    // 4. Create Order
    const order = await Order.create({
      orderNumber: `ORD-SEED-${randomSuffix}`,
      customer: customer._id,
      seller: sellerProfile._id,
      sellerModel: 'Seller',
      items: [{
        product: product._id,
        title: product.title,
        price: product.price,
        quantity: 1,
      }],
      shippingAddress: {
        firstName: 'BobCustomer',
        lastName: 'Doe',
        street: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        fullName: 'BobCustomer Doe',
        phone: '9993300000'
      },
      payment: {
        paymentMethod: 'Prepaid',
        paymentStatus: 'pending',
      },
      orderStatus: 'Pending',
      timeline: [{
        status: 'Pending',
        updatedBy: 'System',
        message: 'Order created successfully.',
        timestamp: new Date()
      }],
    });

    console.log('\n=========================================');
    console.log('✅ Mock Order Created Successfully!');
    console.log(`👉 Order ID (MongoDB ObjectId): ${order._id}`);
    console.log(`👉 Order Number: ${order.orderNumber}`);
    console.log('=========================================\n');

  } catch (error) {
    console.error('Seeding order failed:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedTestOrder();
