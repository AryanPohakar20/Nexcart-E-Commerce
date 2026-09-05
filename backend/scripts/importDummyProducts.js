import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'node:dns';
import fetch from 'node-fetch'; // fetch is globally available in Node >= 18

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const CATEGORY_MAPPING = {
  'smartphones': 'Mobile Phones',
  'laptops': 'Laptops & Computers',
  'tablets': 'Laptops & Computers',
  'mobile-accessories': 'Electronics & Audio',
  'sports-accessories': 'Electronics & Audio',
  'kitchen-accessories': 'Home Appliances',
  'mens-shirts': 'Fashion & Apparel',
  'mens-shoes': 'Fashion & Apparel',
  'mens-watches': 'Fashion & Apparel',
  'sunglasses': 'Fashion & Apparel',
  'tops': 'Fashion & Apparel',
  'womens-bags': 'Fashion & Apparel',
  'womens-dresses': 'Fashion & Apparel',
  'womens-jewellery': 'Fashion & Apparel',
  'womens-shoes': 'Fashion & Apparel',
  'womens-watches': 'Fashion & Apparel',
  'home-decoration': 'Home & Living',
  'furniture': 'Home & Living',
  'beauty': 'Beauty & Personal Care',
  'fragrances': 'Beauty & Personal Care',
  'skin-care': 'Beauty & Personal Care',
  'vehicle': 'Uncategorized',
  'motorcycle': 'Uncategorized',
  'groceries': 'Uncategorized'
};

async function fetchAllDummyProducts() {
  const allProducts = [];
  let skip = 0;
  const limit = 100;
  let hasMore = true;

  process.stdout.write('Fetching products from DummyJSON (paginated)...');
  while (hasMore) {
    try {
      const response = await fetch(`https://dummyjson.com/products?limit=${limit}&skip=${skip}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (!data || !data.products || data.products.length === 0) {
        hasMore = false;
        break;
      }
      
      allProducts.push(...data.products);
      skip += limit;
      process.stdout.write('.');
      
      if (skip >= data.total) {
        hasMore = false;
      }
    } catch (error) {
      console.error('\nError fetching DummyJSON products:', error.message);
      break;
    }
  }
  console.log(`\nFound ${allProducts.length} total products on DummyJSON.`);
  return allProducts;
}

function mapCategory(djCategory) {
  if (!djCategory) return 'Uncategorized';
  return CATEGORY_MAPPING[djCategory.toLowerCase()] || 'Uncategorized';
}

async function downloadAndUploadImage(url, title, index, sku, uploadImageFn) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image from ${url} (${res.status})`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let ext = '.jpg';
    if (url.includes('.png')) ext = '.png';
    else if (url.includes('.webp')) ext = '.webp';
    else if (url.includes('.gif')) ext = '.gif';
    
    const folder = `dummyjson_imports/${sku}`;
    const filename = `img_${index}${ext}`;
    
    const result = await uploadImageFn(buffer, folder, filename);
    return result.url;
  } catch (error) {
    console.error(`  [Image Error] Failed to upload image for ${title}:`, error.message);
    return null;
  }
}

async function runImporter() {
  const args = process.argv.slice(2);
  const isApplyMode = args.includes('--apply');
  const isDryRun = args.includes('--dry-run') || !isApplyMode;
  const isAll = args.includes('--all');
  
  let targetCategory = null;
  let limitPerCategory = 100;

  args.forEach(arg => {
    if (arg.startsWith('--category=')) {
      targetCategory = arg.split('=')[1];
    }
    if (arg.startsWith('--limit=')) {
      limitPerCategory = parseInt(arg.split('=')[1], 10) || 100;
    }
  });
  
  console.log(`=======================================================`);
  console.log(` DummyJSON Product Importer`);
  console.log(` Mode: ${isApplyMode ? 'APPLY (EXECUTION)' : 'DRY RUN'}`);
  if (targetCategory) console.log(` Target Category: ${targetCategory}`);
  console.log(` Limit Per Category: ${limitPerCategory}`);
  console.log(`=======================================================\n`);

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in .env file');
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const Product = (await import('../src/models/Product.js')).default;
    const User = (await import('../src/models/User.js')).default;
    const Seller = (await import('../src/models/Seller.js')).default;
    const Category = (await import('../src/models/Category.js')).default;
    const { uploadImage } = await import('../src/services/supabaseStorageService.js');

    let defaultSeller = await Seller.findOne({ isDeleted: { $ne: true } }).lean();
    let defaultSellerId = defaultSeller ? defaultSeller._id : null;
    if (!defaultSellerId) {
      const adminUser = await User.findOne({ role: { $in: ['admin', 'superadmin'] } }).lean();
      defaultSellerId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();
    }

    const dummyProducts = await fetchAllDummyProducts();
    
    const categoryGroups = {};
    dummyProducts.forEach(dummy => {
      let nexCategory = mapCategory(dummy.category);
      if (targetCategory && nexCategory !== targetCategory) return;
      
      if (!categoryGroups[nexCategory]) {
        categoryGroups[nexCategory] = [];
      }
      categoryGroups[nexCategory].push(dummy);
    });

    const categoryStats = [];
    let totalImagesUploaded = 0;
    let totalImagesFailed = 0;

    for (const [catName, productsInCat] of Object.entries(categoryGroups)) {
      console.log(`\nProcessing Category: ${catName} (Available: ${productsInCat.length})`);
      
      const selectedProducts = productsInCat.slice(0, limitPerCategory);
      
      let imported = 0;
      let existing = 0;
      let failed = 0;

      for (const dummy of selectedProducts) {
        const sku = `SKU-DJ-${dummy.id}`;
        
        const alreadyExists = await Product.exists({ sku: sku });
        if (alreadyExists) {
          existing++;
          continue;
        }

        const price = dummy.price || 0;
        const discountPercentage = dummy.discountPercentage || 0;
        let mrp = price;
        if (discountPercentage > 0 && discountPercentage < 100) {
          mrp = Math.round((price / (1 - discountPercentage / 100)) * 100) / 100;
        } else if (discountPercentage === 0) {
          mrp = Math.round(price * 1.2 * 100) / 100;
        }

        const specs = [];
        if (dummy.weight) specs.push({ key: 'Weight', val: `${dummy.weight} kg` });
        if (dummy.dimensions) {
          specs.push({ key: 'Dimensions', val: `${dummy.dimensions.width}x${dummy.dimensions.height}x${dummy.dimensions.depth} cm` });
        }
        if (dummy.warrantyInformation) specs.push({ key: 'Warranty', val: dummy.warrantyInformation });
        if (dummy.shippingInformation) specs.push({ key: 'Shipping', val: dummy.shippingInformation });
        if (dummy.returnPolicy) specs.push({ key: 'Return Policy', val: dummy.returnPolicy });

        const transformedData = {
          title: dummy.title,
          slug: `${dummy.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${dummy.id}`,
          description: dummy.description || dummy.title,
          brand: dummy.brand || dummy.title.split(' ')[0] || 'Generic',
          category: catName,
          price: price,
          mrp: mrp,
          discount: discountPercentage,
          stock: dummy.stock >= 0 ? dummy.stock : 0,
          sku: sku,
          tags: dummy.tags ? [...dummy.tags, 'dummyjson'] : ['dummyjson'],
          images: [],
          specs: specs,
          rating: dummy.rating || 0,
          reviewsCount: dummy.reviews ? dummy.reviews.length : 0,
          sellerId: defaultSellerId,
          sellerType: 'marketplace_seller',
          condition: 'New',
          status: 'Active',
          visibility: true,
          delivery: 'Free Express Delivery by Tomorrow'
        };

        if (isApplyMode) {
          try {
            const sourceImages = dummy.images && dummy.images.length > 0 ? dummy.images : (dummy.thumbnail ? [dummy.thumbnail] : []);
            const nexcartImages = [];
            
            for (let i = 0; i < sourceImages.length; i++) {
              const uploadUrl = await downloadAndUploadImage(sourceImages[i], dummy.title, i, sku, uploadImage);
              if (uploadUrl) {
                nexcartImages.push({
                  url: uploadUrl,
                  publicId: null,
                  alt: dummy.title || 'Product Image',
                  isPrimary: nexcartImages.length === 0,
                  displayOrder: i
                });
                totalImagesUploaded++;
              } else {
                totalImagesFailed++;
              }
            }
            
            if (nexcartImages.length === 0) {
              nexcartImages.push({
                url: 'https://via.placeholder.com/150',
                isPrimary: true
              });
            }
            
            transformedData.images = nexcartImages;
            
            const productDoc = new Product(transformedData);
            await productDoc.validate();
            await productDoc.save();
            imported++;
          } catch (err) {
            console.error(`  [Insert Error] ${dummy.title}:`, err.message);
            failed++;
          }
        } else {
          imported++;
        }
      }
      
      categoryStats.push({
        'NexCart Category': catName,
        'Available': productsInCat.length,
        'Selected': selectedProducts.length,
        'Imported': imported,
        'Existing': existing,
        'Failed': failed
      });
    }

    console.log(`\n=======================================================`);
    console.log(` FINAL IMPORT REPORT`);
    console.log(`=======================================================`);
    console.table(categoryStats);

    if (isApplyMode) {
      console.log(`\nImage Uploads Successful: ${totalImagesUploaded}`);
      console.log(`Image Uploads Failed: ${totalImagesFailed}`);
      
      const newTotalCount = await Product.countDocuments({});
      console.log(`\nFinal MongoDB Product count: ${newTotalCount}`);
    } else {
      console.log(`\nDRY RUN COMPLETE. No products were inserted into MongoDB.`);
      console.log(`Run with --apply to execute insertion and upload images.`);
    }

  } catch (error) {
    console.error('Import script failed:', error);
  } finally {
    mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

runImporter();
