import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const seed = async () => {
  await connectDB();

  console.log('Clearing old test data...');
  // Clear only the seeded customer, seller, and their associated products to prevent loss of other developer data
  await User.deleteMany({ email: { $in: ['customer@example.com', 'seller@example.com'] } });
  await Product.deleteMany({ 
    $or: [
      { title: { $in: ['Test Laptop', 'Inactive Product', 'Out of Stock Product'] } },
      { id: { $in: ['PROD-TEST-0001', 'PROD-TEST-0002', 'PROD-TEST-0003'] } }
    ]
  });

  console.log('Seeding seller...');
  const seller = await User.create({
    firstName: 'Alice',
    lastName: 'Seller',
    username: 'aliceseller',
    email: 'seller@example.com',
    phone: '9999999999',
    password: 'password123',
    role: 'seller',
    isVerified: true,
    shopName: 'Alice Electronics'
  });

  console.log('Seeding customer...');
  const customer = await User.create({
    firstName: 'Bob',
    lastName: 'Customer',
    username: 'bobcustomer',
    email: 'customer@example.com',
    phone: '8888888888',
    password: 'password123',
    role: 'customer',
    isVerified: true
  });

  console.log('Seeding products...');
  const activeProduct = await Product.create({
    id: 'PROD-TEST-0001',
    title: 'Test Laptop',
    description: 'High performance test laptop',
    brand: 'TestBrand',
    category: 'Laptops',
    price: 1200,
    stock: 5,
    isActive: true,
    seller: seller._id,
    thumbnail: 'https://images.unsplash.com/photo-1496181130204-7552cc14ac1b?w=400&q=80'
  });

  const inactiveProduct = await Product.create({
    id: 'PROD-TEST-0002',
    title: 'Inactive Product',
    description: 'An inactive test product',
    brand: 'TestBrand',
    category: 'Laptops',
    price: 500,
    stock: 10,
    isActive: false,
    seller: seller._id,
    thumbnail: 'https://images.unsplash.com/photo-1496181130204-7552cc14ac1b?w=400&q=80'
  });

  const outOfStockProduct = await Product.create({
    id: 'PROD-TEST-0003',
    title: 'Out of Stock Product',
    description: 'An out of stock test product',
    brand: 'TestBrand',
    category: 'Laptops',
    price: 2000,
    stock: 0,
    isActive: true,
    seller: seller._id,
    thumbnail: 'https://images.unsplash.com/photo-1496181130204-7552cc14ac1b?w=400&q=80'
  });

  console.log('Database seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('Use these accounts for testing:');
  console.log(`Customer: customer@example.com / password123`);
  console.log(`Seller: seller@example.com / password123`);
  console.log(`Active Product ID: ${activeProduct._id} (Price: ₹1200, Stock: 5)`);
  console.log(`Inactive Product ID: ${inactiveProduct._id} (Price: ₹500, Stock: 10)`);
  console.log(`Out of Stock Product ID: ${outOfStockProduct._id} (Price: ₹2000, Stock: 0)`);
  console.log('----------------------------------------------------');

  mongoose.connection.close();
};

seed().catch(err => {
  console.error('Seeding failed:', err);
  mongoose.connection.close();
});
