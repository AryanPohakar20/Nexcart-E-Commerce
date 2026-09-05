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

// Brand/Product Image Mapping
// These URLs use stable Unsplash photos that visually match the products
const MAPPINGS = [
  {
    keywords: ['apple', 'iphone'],
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80', // iPhone
      'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&auto=format&fit=crop&q=80', // iPhone
      'https://images.unsplash.com/photo-1605236453806-6ff368528243?w=500&auto=format&fit=crop&q=80'  // iPhone
    ]
  },
  {
    keywords: ['macbook', 'mac', 'apple laptop'],
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80', // MacBook
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&auto=format&fit=crop&q=80', // MacBook
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&auto=format&fit=crop&q=80'  // MacBook
    ]
  },
  {
    keywords: ['google', 'pixel'],
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351cb315?w=500&auto=format&fit=crop&q=80', // Google Pixel-like
      'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&auto=format&fit=crop&q=80'  // Pixel-like
    ]
  },
  {
    keywords: ['samsung', 'galaxy'],
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop&q=80', // Samsung phone
      'https://images.unsplash.com/photo-1583573636246-18cb2246697f?w=500&auto=format&fit=crop&q=80', // Samsung
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80'  // Samsung
    ]
  },
  {
    keywords: ['oneplus'],
    images: [
      'https://images.unsplash.com/photo-1678957814323-8d022b72459b?w=500&auto=format&fit=crop&q=80', // Android/OnePlus look
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=80'
    ]
  },
  {
    keywords: ['oppo', 'reno'],
    images: [
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500&auto=format&fit=crop&q=80', // Sleek phone
      'https://images.unsplash.com/photo-1533228876829-65c94e7b5025?w=500&auto=format&fit=crop&q=80'
    ]
  },
  {
    keywords: ['sony', 'playstation', 'ps5'],
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=80', // PS5 controller
      'https://images.unsplash.com/photo-1607453998774-a53665f58a52?w=500&auto=format&fit=crop&q=80'
    ]
  },
  {
    keywords: ['nike', 'jordan', 'air max'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80', // Nike shoe
      'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=500&auto=format&fit=crop&q=80', // Sneaker
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&auto=format&fit=crop&q=80'  // Jordan
    ]
  },
  {
    keywords: ['adidas', 'yeezy'],
    images: [
      'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=500&auto=format&fit=crop&q=80', // Adidas sneaker
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=500&auto=format&fit=crop&q=80'  // Yeezy style
    ]
  },
  
  // CATEGORY FALLBACKS (Must be generic but accurate to the product type)
  {
    keywords: ['smartphone', 'mobile', 'phone'],
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351cb315?w=500&auto=format&fit=crop&q=80'
    ]
  },
  {
    keywords: ['laptop', 'notebook', 'computer'],
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1531297172868-9f140cece067?w=500&auto=format&fit=crop&q=80'
    ]
  },
  {
    keywords: ['headphone', 'earphone', 'airpods', 'buds', 'audio'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop&q=80'
    ]
  },
  {
    keywords: ['camera', 'dslr', 'lens'],
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&auto=format&fit=crop&q=80'
    ]
  },
  {
    keywords: ['watch', 'smartwatch'],
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'
    ]
  },
  {
    keywords: ['shoe', 'sneaker', 'footwear'],
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop&q=80'
    ]
  },
  {
    keywords: ['shirt', 't-shirt', 'clothing', 'fashion', 'apparel', 'dress'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80'
    ]
  }
];

// Fallback pool if NO keywords match
const FALLBACK_POOL = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80', // Headphones
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80', // Watch
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80'  // Polaroid
];

// Generic previous images that should be replaced because they were randomly assigned
const PREVIOUS_GENERIC_IMAGES = new Set([
  'https://images.unsplash.com/photo-1598327105666-5b89351cb315?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1533228876829-65c94e7b5025?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531297172868-9f140cece067?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550009158-9ebf6d973144?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1434389678369-183f31eb4270?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80'
]);

// Deterministic hash
function getStringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; 
  }
  return Math.abs(hash);
}

// Find appropriate product-aware image pool
function getValidImage(title, brand, category, hashKey) {
  const searchString = `${title || ''} ${brand || ''} ${category || ''}`.toLowerCase();
  
  let selectedPool = null;
  
  for (const mapping of MAPPINGS) {
    // Check if any keyword in the mapping matches the search string
    const isMatch = mapping.keywords.some(kw => searchString.includes(kw));
    if (isMatch) {
      selectedPool = mapping.images;
      break;
    }
  }
  
  if (!selectedPool) {
    selectedPool = FALLBACK_POOL;
  }
  
  const index = getStringHash(hashKey) % selectedPool.length;
  return selectedPool[index];
}

async function runMigration() {
  const isApplyMode = process.argv.includes('--apply');
  console.log(`Starting Product-Aware Image Mapping in ${isApplyMode ? 'APPLY (EXECUTION)' : 'DRY RUN'} mode...\n`);

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in .env file');
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const Product = (await import('../src/models/Product.js')).default;
    const products = await Product.find({}).lean();
    
    let validExistingCount = 0;
    let placeholderCount = 0;
    let incorrectCount = 0;
    const affectedProducts = [];
    
    for (const p of products) {
      const url = p.images && p.images.length > 0 && typeof p.images[0] === 'object' ? p.images[0].url : (typeof p.images?.[0] === 'string' ? p.images[0] : null);
      
      if (!url || url.includes('placeholder.com')) {
        placeholderCount++;
        affectedProducts.push(p);
      } else if (PREVIOUS_GENERIC_IMAGES.has(url)) {
        incorrectCount++;
        affectedProducts.push(p);
      } else {
        // Assume this is a valid image uniquely set by a user
        validExistingCount++;
      }
    }
    
    console.log('\n--- STATISTICS ---');
    console.log(`Total Products: ${products.length}`);
    console.log(`Products with correct/valid existing images: ${validExistingCount}`);
    console.log(`Products with placeholder/missing images: ${placeholderCount}`);
    console.log(`Products with incorrect generic images: ${incorrectCount}`);
    console.log(`Total Products to update: ${affectedProducts.length}`);
    
    if (affectedProducts.length === 0) {
      console.log('\nNo products require updates. Exiting.');
      process.exit(0);
    }

    console.log('\n--- PREVIEW OF MAPPINGS (First 10) ---');
    const previewCount = Math.min(10, affectedProducts.length);
    for (let i = 0; i < previewCount; i++) {
      const p = affectedProducts[i];
      const newUrl = getValidImage(p.title, p.brand, p.category, p.sku || p._id.toString());
      const oldUrl = (p.images && p.images.length > 0) ? (typeof p.images[0] === 'object' ? p.images[0].url : p.images[0]) : 'MISSING';
      
      console.log(`\nProduct: ${p.title} (${p.brand} | ${p.category})`);
      console.log(`   OLD → ${oldUrl}`);
      console.log(`   NEW → ${newUrl}`);
    }
    
    if (!isApplyMode) {
      console.log('\nMigration script finished in DRY RUN mode.');
      console.log('Run with --apply flag to execute actual updates in the database.');
      process.exit(0);
    }
    
    console.log('\n--- EXECUTING UPDATES ---');
    let updatedCount = 0;
    let failedCount = 0;
    
    for (const p of affectedProducts) {
      const newUrl = getValidImage(p.title, p.brand, p.category, p.sku || p._id.toString());
      
      try {
        const altText = p.title || p.name || '';
        let imagesUpdate = p.images || [];
        
        if (imagesUpdate.length === 0) {
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
    console.log(`Products scanned: ${products.length}`);
    console.log(`Products updated: ${updatedCount}`);
    console.log(`Products skipped (valid images): ${validExistingCount}`);
    console.log(`Products failed: ${failedCount}`);
    
    console.log('\nMigration completed successfully.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

runMigration();
