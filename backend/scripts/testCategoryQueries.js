import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'node:dns';

try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const { searchProducts } = await import('../src/services/productService.js');
  const Category = (await import('../src/models/Category.js')).default;
  const cats = await Category.find({ isDeleted: { $ne: true } }).lean();
  
  console.log('--- TESTING searchProducts FOR ALL 12 CATEGORIES ---');
  for (const c of cats) {
    const resByName = await searchProducts({ category: c.name, limit: 100 });
    const resBySlug = await searchProducts({ category: c.slug, limit: 100 });
    const resById = await searchProducts({ category: c._id.toString(), limit: 100 });
    console.log(
      c.name.padEnd(25),
      'slug:', c.slug.padEnd(22),
      'byName:', String(resByName.products.length).padStart(2),
      'bySlug:', String(resBySlug.products.length).padStart(2),
      'byId:', String(resById.products.length).padStart(2)
    );
  }

  // Also test what frontend queries when clicking navbar or dummy categories
  console.log('\n--- TESTING WHAT FRONTEND NAVBAR / DUMMY DATA QUERIES ---');
  const frontendKeys = [
    'electronics', 'mobiles', 'laptops', 'fashion', 'beauty', 'sports',
    'home', 'furniture', 'books', 'grocery', 'accessories', 'vehicles', 'gaming', 'wearables'
  ];
  for (const key of frontendKeys) {
    const res = await searchProducts({ category: key, limit: 100 });
    console.log(`Key "${key.padEnd(14)}" -> returned: ${res.products.length} products`);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
