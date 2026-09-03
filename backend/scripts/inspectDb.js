import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'node:dns';

try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}

async function main() {
  const mongoUri = process.env.MONGO_URI;
  await mongoose.connect(mongoUri);

  const Category = (await import('../src/models/Category.js')).default;
  const Product = (await import('../src/models/Product.js')).default;
  const Seller = (await import('../src/models/Seller.js')).default;
  const User = (await import('../src/models/User.js')).default;

  console.log('=== CATEGORY DATABASE CHECK ===');
  const cats = await Category.find({ isDeleted: { $ne: true } }).lean();
  for (const c of cats) {
    const pCountByName = await Product.countDocuments({ category: c.name, isDeleted: { $ne: true } });
    const pCountBySlug = await Product.countDocuments({ category: c.slug, isDeleted: { $ne: true } });
    const pCountById = await Product.countDocuments({ category: c._id.toString(), isDeleted: { $ne: true } });
    console.log(`${c.name} -> ${c._id} (slug: ${c.slug}) -> byName: ${pCountByName}, bySlug: ${pCountBySlug}, byId: ${pCountById}`);
  }

  const allCount = await Product.countDocuments({});
  console.log('\nTotal Product documents in DB:', allCount);

  const distinctCats = await Product.distinct('category');
  console.log('\nDistinct Product category field values:');
  for (const dc of distinctCats) {
    const count = await Product.countDocuments({ category: dc });
    console.log(`  "${dc}": ${count}`);
  }

  console.log('\n=== SELLERS CHECK ===');
  const sellers = await Seller.find({}).lean();
  console.log('Total Sellers:', sellers.length);
  const sellerUsers = await User.find({ role: 'seller' }).lean();
  console.log('Total Seller Users:', sellerUsers.length);
  for (const su of sellerUsers) {
    console.log(`  Seller User: ${su._id} (${su.email})`);
  }

  console.log('\n=== SAMPLE PRODUCT PER CATEGORY (CHECK IMAGES) ===');
  for (const catName of distinctCats) {
    const sample = await Product.findOne({ category: catName }).lean();
    if (sample) {
      console.log(`[${catName}]`);
      console.log(`  title: ${sample.title}`);
      console.log(`  price: ${sample.price}, mrp: ${sample.mrp}`);
      console.log(`  sku: ${sample.sku}`);
      console.log(`  images:`, JSON.stringify(sample.images));
    }
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
