import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'node:dns';

try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const isApplyMode = process.argv.includes('--apply');
console.log(`Mode: ${isApplyMode ? 'APPLY (will delete)' : 'DRY RUN (no changes)'}\n`);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB\n");

  const Product = (await import('../src/models/Product.js')).default;
  const Order = (await import('../src/models/Order.js')).default;

  // Identify old products
  const oldProducts = await Product.find({ tags: { $ne: 'dummyjson' } }).select('_id title name').lean();
  const oldProductIds = oldProducts.map(p => p._id);
  console.log(`Old products found: ${oldProducts.length}`);

  // Identify orders referencing old products
  const affectedOrders = await Order.find({ 'items.product': { $in: oldProductIds } }).select('_id').lean();
  const affectedOrderIds = affectedOrders.map(o => o._id);
  console.log(`Orders referencing old products: ${affectedOrders.length}`);

  // Pre-cleanup stats
  const beforeTotal = await Product.countDocuments({});
  const beforeDummy = await Product.countDocuments({ tags: 'dummyjson' });
  const beforeOld = await Product.countDocuments({ tags: { $ne: 'dummyjson' } });
  console.log(`\n--- BEFORE ---`);
  console.log(`Total Products: ${beforeTotal}`);
  console.log(`DummyJSON Products: ${beforeDummy}`);
  console.log(`Non-DummyJSON Products: ${beforeOld}`);

  if (isApplyMode) {
    // Delete affected orders
    if (affectedOrderIds.length > 0) {
      const orderResult = await Order.deleteMany({ _id: { $in: affectedOrderIds } });
      console.log(`\nDeleted ${orderResult.deletedCount} orders referencing old products.`);
    }

    // Delete old products
    const productResult = await Product.deleteMany({ tags: { $ne: 'dummyjson' } });
    console.log(`Deleted ${productResult.deletedCount} old products.`);

    // Post-cleanup verification
    const afterTotal = await Product.countDocuments({});
    const afterDummy = await Product.countDocuments({ tags: 'dummyjson' });
    const afterOld = await Product.countDocuments({ tags: { $ne: 'dummyjson' } });
    console.log(`\n--- AFTER ---`);
    console.log(`Total Products: ${afterTotal}`);
    console.log(`DummyJSON Products: ${afterDummy}`);
    console.log(`Non-DummyJSON Products: ${afterOld}`);

    if (afterOld === 0 && afterDummy === afterTotal) {
      console.log('\n✅ SUCCESS: Database now contains ONLY DummyJSON products.');
    } else {
      console.log('\n⚠️ WARNING: Some unexpected products remain.');
    }
  } else {
    console.log('\nRun with --apply to execute the cleanup.');
  }

  process.exit(0);
}

run().catch(console.error);
