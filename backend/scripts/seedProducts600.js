// backend/scripts/seedProducts600.js
// Idempotent product seed using authentic DummyJSON products:
//   - Fetches from official https://dummyjson.com/products?limit=0
//   - Excludes groceries, vehicles, motorcycles, sports-accessories
//   - Preserves exact cdn.dummyjson.com image URLs
//   - Converts prices to INR (numeric)
//   - Maps into valid NexCart categories
//   - Deletes ALL existing products before inserting
//
// Usage:  node scripts/seedProducts600.js
//         npm run seed:products

import 'dotenv/config';
import { fileURLToPath } from 'url';
import path from 'path';
import dns from 'node:dns';
import mongoose from 'mongoose';

try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const USD_TO_INR_RATE = 85;

const VALID_NEXCART_CATEGORIES = [
  'Beauty & Personal Care',
  'Home & Living',
  'Gaming',
  'Fashion & Apparel',
  'Home Appliances',
  'Electronics & Audio',
  'Laptops & Computers',
  'Mobile Phones',
  'Electronics',
  'Audio',
  'Wearables',
  'Home & Kitchen',
];

const EXCLUDED_CATEGORIES = [
  'groceries',
  'motorcycle',
  'vehicle',
  'sports-accessories',
];

const slugify = (t) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const pad = (n) => String(n).padStart(3, '0');

/**
 * Validates that the URL belongs to the official DummyJSON CDN
 */
export function isDummyJsonImage(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'cdn.dummyjson.com';
  } catch {
    return false;
  }
}

/**
 * Maps a DummyJSON product to the closest valid NexCart category
 */
function mapToNexCartCategory(product) {
  const djCat = (product.category || '').toLowerCase();
  const title = (product.title || '').toLowerCase();

  if (['beauty', 'fragrances', 'skin-care'].includes(djCat)) {
    return 'Beauty & Personal Care';
  }
  if (['furniture', 'home-decoration'].includes(djCat)) {
    return 'Home & Living';
  }
  if (['mens-shirts', 'mens-shoes', 'womens-dresses', 'womens-shoes', 'womens-bags', 'womens-jewellery', 'tops', 'sunglasses'].includes(djCat)) {
    return 'Fashion & Apparel';
  }
  if (djCat === 'kitchen-accessories') {
    const applianceKeywords = ['blender', 'stove', 'microwave', 'oven'];
    if (applianceKeywords.some(kw => title.includes(kw))) {
      return 'Home Appliances';
    }
    return 'Home & Kitchen';
  }
  if (djCat === 'laptops') {
    return 'Laptops & Computers';
  }
  if (djCat === 'tablets') {
    return 'Laptops & Computers';
  }
  if (djCat === 'smartphones') {
    return 'Mobile Phones';
  }
  if (djCat === 'mens-watches' || djCat === 'womens-watches') {
    return 'Wearables';
  }
  if (djCat === 'mobile-accessories') {
    if (title.includes('watch')) return 'Wearables';
    if (title.includes('airpod') || title.includes('earphone') || title.includes('homepod') || title.includes('echo')) {
      return 'Audio';
    }
    if (title.includes('charger') || title.includes('battery') || title.includes('case')) {
      return 'Mobile Phones';
    }
    return 'Electronics';
  }

  return null;
}

async function fetchDummyJsonProducts() {
  console.log('📡 Fetching official DummyJSON products from https://dummyjson.com/products?limit=0 ...');
  const res = await fetch('https://dummyjson.com/products?limit=0');
  if (!res.ok) {
    throw new Error(`Failed to fetch DummyJSON products: HTTP ${res.status}`);
  }
  const data = await res.json();
  console.log(`✅ Received ${data.products?.length || 0} products from DummyJSON (Total in API: ${data.total})\n`);
  return data.products || [];
}

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI missing in .env');
    process.exit(1);
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB\n');

  const { default: Product } = await import('../src/models/Product.js');
  const { default: User }    = await import('../src/models/User.js');
  const { default: Seller }  = await import('../src/models/Seller.js');

  // 1. Fetch DummyJSON raw products
  const rawProducts = await fetchDummyJsonProducts();

  // 2. Filter out excluded categories
  const validProducts = rawProducts.filter(p => {
    const cat = (p.category || '').toLowerCase();
    return !EXCLUDED_CATEGORIES.includes(cat);
  });

  console.log(`🔍 Filtered out excluded categories (groceries, vehicles, motorcycles, sports-accessories).`);
  console.log(`   Valid products remaining: ${validProducts.length}\n`);

  // 3. Resolve seller IDs
  let sellerUser = await User.findOne({ email: 'seed.seller@nexcart.com' }).lean();
  if (!sellerUser) {
    const created = await User.create({
      firstName: 'NexCart',
      lastName:  'Seed Seller',
      email:     'seed.seller@nexcart.com',
      phone:     '9876543299',
      password:  'SeedPassword@123',
      role:      'seller',
      status:    'Active',
    });
    sellerUser = created.toObject();
    console.log('  ➕ Created seed seller user: seed.seller@nexcart.com');
  }

  const existingSellers = await Seller.find({ status: 'Active', verificationStatus: 'Verified' }).lean();
  const sellerUserIds = existingSellers.length > 0
    ? existingSellers.map(s => s.userId)
    : [sellerUser._id];
  if (!sellerUserIds.some(id => id.toString() === sellerUser._id.toString())) {
    sellerUserIds.push(sellerUser._id);
  }

  // 4. Delete all existing products (removes Unsplash products)
  console.log('🗑️  Deleting all existing products to purge old Unsplash documents...');
  const delResult = await Product.deleteMany({});
  console.log(`   Deleted ${delResult.deletedCount} existing products.\n`);

  // 5. Transform and validate each product
  const categoryCounts = {};
  VALID_NEXCART_CATEGORIES.forEach(c => { categoryCounts[c] = 0; });

  const productsToInsert = [];
  let skippedCount = 0;

  for (let i = 0; i < validProducts.length; i++) {
    const dj = validProducts[i];
    const category = mapToNexCartCategory(dj);

    if (!category || !VALID_NEXCART_CATEGORIES.includes(category)) {
      console.warn(`⚠️ Skipping unmapped product ID ${dj.id}: "${dj.title}" (category: ${dj.category})`);
      skippedCount++;
      continue;
    }

    // Prepare images array
    const rawImageUrls = [];
    if (Array.isArray(dj.images)) {
      dj.images.forEach(imgUrl => {
        if (typeof imgUrl === 'string' && imgUrl.trim()) {
          rawImageUrls.push(imgUrl.trim());
        }
      });
    }
    if (dj.thumbnail && !rawImageUrls.includes(dj.thumbnail)) {
      rawImageUrls.push(dj.thumbnail);
    }

    // Validate images belong to cdn.dummyjson.com
    const validImages = rawImageUrls.filter(url => isDummyJsonImage(url));
    if (validImages.length === 0) {
      console.warn(`⚠️ Skipping product ID ${dj.id}: "${dj.title}" - no valid cdn.dummyjson.com images found.`);
      skippedCount++;
      continue;
    }

    const nexImages = validImages.map((url, idx) => ({
      url,
      publicId: null,
      alt: idx === 0 ? dj.title : `${dj.title} - Alternate view`,
      isPrimary: idx === 0,
      displayOrder: idx,
    }));

    // Convert price to INR
    const usdPrice = typeof dj.price === 'number' ? dj.price : 10;
    const inrPrice = Math.max(99, Math.round(usdPrice * USD_TO_INR_RATE));

    // Calculate MRP & Discount
    const discPct = Math.min(80, Math.max(5, Math.round(dj.discountPercentage || 15)));
    const inrMrp = Math.max(inrPrice + 50, Math.round(inrPrice / (1 - discPct / 100)));
    const finalDiscount = Math.round(((inrMrp - inrPrice) / inrMrp) * 100);

    const code = category.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3);
    const sku = dj.sku || `NC-${code}-${pad(dj.id)}`;
    const slug = `${slugify(dj.title)}-${code.toLowerCase()}-${pad(dj.id)}`;
    const sellerId = sellerUserIds[i % sellerUserIds.length];

    const brand = dj.brand || 'NexCart Essentials';
    const rating = +(dj.rating || 4.5).toFixed(1);
    const stock = typeof dj.stock === 'number' ? dj.stock : 50;

    const specs = [
      { key: 'Brand', val: brand },
      { key: 'Category', val: category },
      { key: 'Source', val: 'Official DummyJSON CDN' },
    ];
    if (dj.weight) specs.push({ key: 'Weight', val: `${dj.weight} kg` });
    if (dj.dimensions) {
      specs.push({
        key: 'Dimensions',
        val: `${dj.dimensions.width} x ${dj.dimensions.height} x ${dj.dimensions.depth} cm`,
      });
    }

    productsToInsert.push({
      title: dj.title,
      slug,
      description: dj.description || `${dj.title} by ${brand}`,
      brand,
      category,
      sellerId,
      sellerType: 'seller',
      condition: 'New',
      status: 'Active',
      visibility: true,
      price: inrPrice,
      mrp: inrMrp,
      discount: finalDiscount,
      stock,
      sku,
      tags: Array.isArray(dj.tags) && dj.tags.length > 0 ? dj.tags : [brand.toLowerCase(), 'nexcart'],
      images: nexImages,
      specs,
      rating,
      reviewsCount: Array.isArray(dj.reviews) ? dj.reviews.length : 12,
      averageRating: rating,
      totalReviews: Array.isArray(dj.reviews) ? dj.reviews.length : 12,
      isFeatured: i % 8 === 0,
      isTrending: i % 5 === 0,
      delivery: dj.shippingInformation || 'Free Express Delivery by Tomorrow',
      warrantyAvailable: Boolean(dj.warrantyInformation),
      warrantyRemaining: dj.warrantyInformation || '1 Year Manufacturer Warranty',
      originalBillAvailable: true,
    });

    categoryCounts[category]++;
  }

  console.log(`📦 Inserting ${productsToInsert.length} validated products into MongoDB...`);
  await Product.insertMany(productsToInsert, { ordered: false });
  console.log('✅ Insertion complete!\n');

  // 6. Print Report
  console.log('═══════════════════════════════════════════════════');
  console.log('  OFFICIAL DUMMYJSON SEED REPORT');
  console.log('═══════════════════════════════════════════════════');
  for (const cat of VALID_NEXCART_CATEGORIES) {
    const count = categoryCounts[cat];
    const status = count >= 50 ? '✓' : '⚠️ Shortage (DummyJSON has fewer products)';
    console.log(`  ${cat.padEnd(26)} : ${String(count).padStart(3)} products  ${status}`);
  }
  console.log('───────────────────────────────────────────────────');
  console.log(`  TOTAL PRODUCTS INSERTED    : ${productsToInsert.length}`);
  console.log(`  SKIPPED PRODUCTS           : ${skippedCount}`);
  console.log('═══════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB. Done.\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
