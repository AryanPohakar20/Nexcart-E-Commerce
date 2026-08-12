import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'node:dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const User = (await import('../src/models/User.js')).default;
  const Seller = (await import('../src/models/Seller.js')).default;
  const Product = (await import('../src/models/Product.js')).default;
  const Order = (await import('../src/models/Order.js')).default;

  const order = await Order.findOne({
    $or: [{ orderId: 'ORD-85159' }, { orderNumber: 'ORD-85159' }]
  }).populate('items.product').lean();

  if (!order) {
    console.log("Order not found");
  } else {
    console.log("Order found:", JSON.stringify(order, null, 2));
  }

  process.exit(0);
}

run().catch(console.error);
