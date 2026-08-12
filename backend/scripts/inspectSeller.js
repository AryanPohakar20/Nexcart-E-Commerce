import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const p = await Product.findOne({ title: /Huawei Matebook X Pro/i }).lean();
  console.log('Product.seller raw:', p.seller);
  console.log('Product ID:', p._id);
  process.exit(0);
};
run();
