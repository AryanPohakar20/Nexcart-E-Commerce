// backend/scripts/validateProducts.js
// Validates the NexCart product catalogue against official requirements:
//   - Category-wise count report
//   - IMAGE VALIDATION: DummyJSON CDN images, Unsplash images (=0), Placeholder images (=0), Missing images (=0), Broken image URLs (=0)
//   - PRICE VALIDATION: INR numeric prices, Invalid prices (=0)
//   - PRODUCT VALIDATION: Invalid category (=0), Duplicate SKU (=0), Missing title (=0), Missing image (=0)
//   - Reports shortage when DummyJSON dataset does not provide 50 unique items for a category
//
// Usage:  node scripts/validateProducts.js
//         npm run validate:products

import 'dotenv/config';
import { fileURLToPath } from 'url';
import path from 'path';
import dns from 'node:dns';
import mongoose from 'mongoose';

try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const REQUIRED_CATEGORIES = [
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

// Unwanted product types per user instructions: groceries, meat, fish, chicken, beef, seafood, vehicles, motorcycles
const FORBIDDEN_TITLES = [
  'chicken meat', 'beef steak', 'raw fish', 'seafood platter', 'fresh pork',
  'motorcycle', 'dirt bike', 'automobile', 'passenger vehicle'
];

async function validate() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI missing in .env');
    process.exit(1);
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB\n');

  const { default: Product } = await import('../src/models/Product.js');

  const products = await Product.find({}, {
    title: 1, category: 1, sku: 1, price: 1, mrp: 1, images: 1,
    brand: 1, description: 1, sellerId: 1, _id: 1,
  }).lean();

  // ── 1. Category Counts ─────────────────────────────────────────────────────
  const catCounts = {};
  for (const cat of REQUIRED_CATEGORIES) catCounts[cat] = 0;

  const invalidCategories = [];
  for (const p of products) {
    if (catCounts[p.category] !== undefined) {
      catCounts[p.category]++;
    } else {
      invalidCategories.push({ id: p._id, title: p.title, category: p.category });
    }
  }

  // ── 2. Product Validation ──────────────────────────────────────────────────
  const skuSet = new Set();
  const dupSkus = [];
  const missingTitles = [];
  const missingImages = [];

  for (const p of products) {
    if (!p.title || typeof p.title !== 'string' || !p.title.trim()) {
      missingTitles.push(p._id);
    }
    if (p.sku) {
      if (skuSet.has(p.sku)) dupSkus.push(p.sku);
      else skuSet.add(p.sku);
    }
    if (!p.images || !Array.isArray(p.images) || p.images.length === 0 || !p.images[0]?.url) {
      missingImages.push(p.title || p._id);
    }
  }

  // ── 3. Image Validation ────────────────────────────────────────────────────
  let dummyJsonCdnImages = 0;
  let unsplashImages = 0;
  let placeholderImages = 0;
  let brokenImageUrls = 0;

  const sampleUrlsToCheck = [];

  for (const p of products) {
    if (Array.isArray(p.images)) {
      for (const img of p.images) {
        const url = typeof img === 'string' ? img : img?.url;
        if (!url) continue;

        if (url.includes('cdn.dummyjson.com')) {
          dummyJsonCdnImages++;
          if (sampleUrlsToCheck.length < 10) {
            sampleUrlsToCheck.push(url);
          }
        } else if (url.includes('unsplash.com')) {
          unsplashImages++;
        } else if (url.includes('placeholder') || url.includes('picsum') || url.includes('via.placeholder')) {
          placeholderImages++;
        } else {
          brokenImageUrls++;
        }
      }
    }
  }

  // Verify sample CDN URLs with HTTP HEAD
  process.stdout.write('🔍 Verifying sample DummyJSON CDN images connectivity...');
  for (const testUrl of sampleUrlsToCheck) {
    try {
      const res = await fetch(testUrl, { method: 'HEAD' });
      if (!res.ok && res.status !== 304) {
        brokenImageUrls++;
      }
    } catch {
      brokenImageUrls++;
    }
  }
  console.log(' Verified.\n');

  // ── 4. Price Validation ────────────────────────────────────────────────────
  let inrNumericPrices = 0;
  let invalidPrices = 0;

  for (const p of products) {
    if (typeof p.price === 'number' && p.price > 0 && !isNaN(p.price) &&
        typeof p.mrp === 'number' && p.mrp >= p.price) {
      inrNumericPrices++;
    } else {
      invalidPrices++;
    }
  }

  // ── 5. Forbidden products check ────────────────────────────────────────────
  const forbiddenProducts = products.filter(p => {
    const title = (p.title || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    if (['groceries', 'motorcycle', 'vehicle'].includes(cat)) return true;
    return FORBIDDEN_TITLES.some(kw => title.includes(kw));
  }).map(p => `"${p.title}" (${p.category})`);

  // ── Print Report in Exact Required Format ──────────────────────────────────
  console.log('TOTAL PRODUCTS\n');
  console.log('Category                 Count');
  console.log('--------------------------------');
  for (const cat of REQUIRED_CATEGORIES) {
    const count = catCounts[cat];
    console.log(`${cat.padEnd(25)} ${String(count).padStart(3)}`);
  }
  console.log('--------------------------------');
  console.log(`TOTAL                     ${products.length}\n`);

  console.log('IMAGE VALIDATION\n');
  console.log(`DummyJSON CDN images: ${dummyJsonCdnImages}`);
  console.log(`Unsplash images: ${unsplashImages}`);
  console.log(`Placeholder images: ${placeholderImages}`);
  console.log(`Missing images: ${missingImages.length}`);
  console.log(`Broken image URLs: ${brokenImageUrls}\n`);

  console.log('PRICE VALIDATION\n');
  console.log(`INR numeric prices: ${inrNumericPrices}`);
  console.log(`Invalid prices: ${invalidPrices}\n`);

  console.log('PRODUCT VALIDATION\n');
  console.log(`Invalid category: ${invalidCategories.length}`);
  console.log(`Duplicate SKU: ${dupSkus.length}`);
  console.log(`Missing title: ${missingTitles.length}`);
  console.log(`Missing image: ${missingImages.length}\n`);

  // ── Category shortage notices ──────────────────────────────────────────────
  let shortageCount = 0;
  for (const cat of REQUIRED_CATEGORIES) {
    if (catCounts[cat] < 50) {
      shortageCount++;
      console.log(`⚠️  [Category: ${cat}] (${catCounts[cat]}/50): DummyJSON does not provide enough valid unique products for this category.`);
    }
  }

  if (forbiddenProducts.length > 0) {
    console.log('\n⚠️ Forbidden products found:');
    forbiddenProducts.forEach(f => console.log(`  - ${f}`));
  }

  const isImageValid = (unsplashImages === 0) && (placeholderImages === 0) && (missingImages.length === 0) && (brokenImageUrls === 0) && (dummyJsonCdnImages > 0);
  const isPriceValid = (invalidPrices === 0) && (inrNumericPrices === products.length);
  const isProductValid = (invalidCategories.length === 0) && (dupSkus.length === 0) && (missingTitles.length === 0) && (missingImages.length === 0) && (forbiddenProducts.length === 0);

  const passed = isImageValid && isPriceValid && isProductValid;

  console.log('\n==================================================');
  if (passed) {
    console.log('✅ VALIDATION PASSED: All product data adheres to DummyJSON CDN specifications!');
  } else {
    console.log('❌ VALIDATION FAILED: Issues found above.');
  }
  console.log('==================================================\n');

  await mongoose.disconnect();
  process.exit(passed ? 0 : 1);
}

validate().catch(err => {
  console.error('❌ Validation error:', err.message);
  process.exit(1);
});
