import mongoose from 'mongoose';
import Product from './src/models/Product.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const prod = await Product.findOne({ title: /Essence Mascara/i }).lean();
  console.log('--- PRODUCT Essence Mascara ---');
  console.log(JSON.stringify(prod, null, 2));
  
  const anyprod = await Product.findOne({ title: /Oppo/i }).lean();
  console.log('--- PRODUCT Oppo ---');
  console.log(JSON.stringify(anyprod, null, 2));
  process.exit(0);
});
