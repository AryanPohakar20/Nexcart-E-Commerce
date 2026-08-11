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

  const Product = (await import('../src/models/Product.js')).default;
  const Order = (await import('../src/models/Order.js')).default;
  const User = (await import('../src/models/User.js')).default;

  const totalProducts = await Product.countDocuments({});
  const dummyJsonProducts = await Product.countDocuments({ tags: 'dummyjson' });
  const nonDummyJsonProducts = await Product.countDocuments({ tags: { $ne: 'dummyjson' } });

  console.log(`Total Products: ${totalProducts}`);
  console.log(`DummyJSON Products: ${dummyJsonProducts}`);
  console.log(`Non-DummyJSON Products: ${nonDummyJsonProducts}`);

  if (nonDummyJsonProducts > 0) {
    const oldProducts = await Product.find({ tags: { $ne: 'dummyjson' } }).limit(5).lean();
    console.log("\nSample Old Products:");
    oldProducts.forEach(p => console.log(`- ${p._id}: ${p.title || p.name} (Source: ${p.source || 'None'})`));

    // Check references
    const oldProductIds = await Product.find({ tags: { $ne: 'dummyjson' } }).select('_id').lean().then(res => res.map(r => r._id));
    
    let ordersWithOld = 0;
    let usersWithCart = 0;
    let usersWithWishlist = 0;

    try { ordersWithOld = await Order.countDocuments({ 'items.product': { $in: oldProductIds } }); } catch(e){}
    try { usersWithCart = await User.countDocuments({ 'cart.product': { $in: oldProductIds } }); } catch(e){}
    try { usersWithWishlist = await User.countDocuments({ wishlist: { $in: oldProductIds } }); } catch(e){}

    console.log("\nReferences to Old Products:");
    console.log(`Orders: ${ordersWithOld}`);
    console.log(`Users (Cart): ${usersWithCart}`);
    console.log(`Users (Wishlist): ${usersWithWishlist}`);
  }

  process.exit(0);
}

run().catch(console.error);
