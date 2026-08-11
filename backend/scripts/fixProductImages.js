import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'node:dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore
}

// Setup environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Category Image Pool
const IMAGE_POOL = {
  'Mobile Phones': [
    'https://images.unsplash.com/photo-1598327105666-5b89351cb315?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1533228876829-65c94e7b5025?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=80'
  ],
  'Laptops': [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531297172868-9f140cece067?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80'
  ],
  'Electronics': [
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550009158-9ebf6d973144?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=500&auto=format&fit=crop&q=80'
  ],
  'Headphones': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80'
  ],
  'Cameras': [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&auto=format&fit=crop&q=80'
  ],
  'Fashion': [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1434389678369-183f31eb4270?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=80'
  ],
  'Shoes': [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&auto=format&fit=crop&q=80'
  ],
  'Watches': [
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&auto=format&fit=crop&q=80'
  ],
  'Home': [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&auto=format&fit=crop&q=80'
  ],
  'Furniture': [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=80'
  ],
  'Accessories': [
    'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500&auto=format&fit=crop&q=80'
  ],
  'General': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80'
  ]
};

// Deterministic hash to map strings to an index
function getStringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; 
  }
  return Math.abs(hash);
}

// Get an image for a product
function getValidImage(category, sku, id) {
  let pool = IMAGE_POOL[category];
  
  if (!pool || pool.length === 0) {
    // try partial matching
    const catLower = String(category || '').toLowerCase();
    const matchedKey = Object.keys(IMAGE_POOL).find(key => catLower.includes(key.toLowerCase()));
    
    if (matchedKey) {
      pool = IMAGE_POOL[matchedKey];
    } else {
      pool = IMAGE_POOL['General'];
    }
  }

  const hashKey = sku || id.toString();
  const index = getStringHash(hashKey) % pool.length;
  return pool[index];
}

async function runMigration() {
  const isRunMode = process.argv.includes('--run');
  console.log(`Starting Image Migration in ${isRunMode ? 'EXECUTION' : 'DRY-RUN'} mode...\n`);

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in .env file');
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get the Product model (or define it temporarily for migration)
    const Product = (await import('../src/models/Product.js')).default;
    
    // Find all products
    const products = await Product.find({}).lean();
    const totalProducts = products.length;
    
    let validCount = 0;
    let missingCount = 0;
    let placeholderCount = 0;
    const affectedProducts = [];
    
    for (const p of products) {
      if (!p.images || p.images.length === 0 || !p.images[0] || !p.images[0].url) {
        missingCount++;
        affectedProducts.push(p);
      } else if (p.images[0].url.includes('placeholder.com')) {
        placeholderCount++;
        affectedProducts.push(p);
      } else {
        validCount++;
      }
    }
    
    console.log('\n--- STATISTICS ---');
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Valid Images: ${validCount}`);
    console.log(`Missing Images: ${missingCount}`);
    console.log(`Placeholder Images: ${placeholderCount}`);
    console.log(`Affected Products: ${affectedProducts.length}`);
    
    if (affectedProducts.length === 0) {
      console.log('\nNo products require migration. Exiting.');
      process.exit(0);
    }

    console.log('\n--- PREVIEW OF CHANGES ---');
    const previewCount = Math.min(5, affectedProducts.length);
    for (let i = 0; i < previewCount; i++) {
      const p = affectedProducts[i];
      const newUrl = getValidImage(p.category, p.sku, p._id);
      console.log(`[Preview] ${p.sku || p._id} (${p.category || 'No Category'}):`);
      console.log(`   Old: ${(p.images && p.images.length > 0) ? p.images[0].url : 'MISSING'}`);
      console.log(`   New: ${newUrl}`);
    }
    
    if (!isRunMode) {
      console.log('\nMigration script finished in DRY-RUN mode.');
      console.log('Run with --run flag to execute updates in the database.');
      process.exit(0);
    }
    
    console.log('\n--- EXECUTING UPDATES ---');
    let updatedCount = 0;
    let failedCount = 0;
    
    for (const p of affectedProducts) {
      const newUrl = getValidImage(p.category, p.sku, p._id);
      try {
        const altText = p.title || p.name || '';
        
        let imagesUpdate = p.images;
        
        if (!imagesUpdate || imagesUpdate.length === 0) {
          imagesUpdate = [{
            url: newUrl,
            publicId: null,
            alt: altText,
            isPrimary: true,
            displayOrder: 0
          }];
        } else {
          imagesUpdate = imagesUpdate.map((img, idx) => {
            if (typeof img === 'string') {
              return {
                url: idx === 0 ? newUrl : img,
                publicId: null,
                alt: altText,
                isPrimary: idx === 0,
                displayOrder: idx
              };
            }
            if (idx === 0) {
              img.url = newUrl;
              if (!img.alt) img.alt = altText;
            }
            return img;
          });
        }
        
        await Product.updateOne({ _id: p._id }, { $set: { images: imagesUpdate } });
        updatedCount++;
      } catch (err) {
        console.error(`Failed to update product ${p._id}: ${err.message}`);
        failedCount++;
      }
    }
    
    console.log('\n--- FINAL REPORT ---');
    console.log(`Products scanned: ${totalProducts}`);
    console.log(`Products updated: ${updatedCount}`);
    console.log(`Products skipped: ${validCount}`);
    console.log(`Products failed: ${failedCount}`);
    
    console.log('\nMigration completed successfully.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

runMigration();
