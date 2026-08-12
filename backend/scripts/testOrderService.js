import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const orderService = await import('../src/services/orderService.js');
  const Order = (await import('../src/models/Order.js')).default;
  const Product = (await import('../src/models/Product.js')).default;

  const order = await Order.findOne({ orderId: 'ORD-85159' }).lean();
  if (order) {
    const formatted = await orderService.getCustomerOrderDetails('ORD-85159', order.customer);
    console.log(JSON.stringify(formatted, null, 2));
  } else {
    console.log('Not found');
  }

  process.exit(0);
}

run().catch(console.error);
