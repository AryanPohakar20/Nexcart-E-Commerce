import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';

const reset = async () => {
  await connectDB();

  console.log('Resetting product stocks for testing...');
  
  // Reset stock of PROD-TEST-0001 (Test Laptop) to 5
  await Product.updateOne(
    { id: 'PROD-TEST-0001' },
    { $set: { stock: 5 } }
  );

  // Ensure PROD-TEST-0003 (Out of stock) is at 0
  await Product.updateOne(
    { id: 'PROD-TEST-0003' },
    { $set: { stock: 0 } }
  );

  console.log('Stock levels reset successfully!');
  mongoose.connection.close();
};

reset().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
