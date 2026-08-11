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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Helper to fetch all products from DummyJSON
async function fetchDummyProducts() {
  console.log('Fetching products from DummyJSON...');
  try {
    const response = await fetch('https://dummyjson.com/products?limit=0');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data || !data.products || !Array.isArray(data.products)) {
      throw new Error('Invalid JSON structure from DummyJSON');
    }
    return data.products;
  } catch (error) {
    console.error('Error fetching DummyJSON products:', error.message);
    process.exit(1);
  }
}

// Capitalize category properly
function formatCategory(categorySlug) {
  if (!categorySlug) return 'Uncategorized';
  return categorySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function runImporter() {
  const isApplyMode = process.argv.includes('--apply');
  const isDryRun = process.argv.includes('--dry-run') || !isApplyMode; // Default to dry-run
  
  console.log(`Starting DummyJSON Importer in ${isApplyMode ? 'APPLY (EXECUTION)' : 'DRY RUN'} mode...\n`);

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in .env file');
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Dynamic import to avoid top-level issues if run outside standard context
    const Product = (await import('../src/models/Product.js')).default;
    const User = (await import('../src/models/User.js')).default;
    const Seller = (await import('../src/models/Seller.js')).default;

    // We need a default seller to attach to products
    let defaultSeller = await Seller.findOne({ isDeleted: { $ne: true } }).lean();
    let defaultSellerId = defaultSeller ? defaultSeller._id : null;
    
    if (!defaultSellerId) {
      const adminUser = await User.findOne({ role: { $in: ['admin', 'superadmin'] } }).lean();
      defaultSellerId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();
    }

    const dummyProducts = await fetchDummyProducts();
    const existingProductsCount = await Product.countDocuments({});
    
    // We can pre-calculate some stats by checking DB beforehand if needed, but let's do it in the loop
    let validCount = 0;
    let invalidCount = 0;
    let newProductsCount = 0;
    let alreadyImportedCount = 0;

    const operations = [];

    for (const dummy of dummyProducts) {
      // Transformation
      const price = dummy.price || 0;
      const discountPercentage = dummy.discountPercentage || 0;
      
      let mrp = price;
      if (discountPercentage > 0 && discountPercentage < 100) {
        mrp = Math.round((price / (1 - discountPercentage / 100)) * 100) / 100;
      } else if (discountPercentage === 0) {
        mrp = Math.round(price * 1.2 * 100) / 100;
      }

      const nexcartImages = [];
      const sourceImages = dummy.images && dummy.images.length > 0 ? dummy.images : (dummy.thumbnail ? [dummy.thumbnail] : []);
      
      if (sourceImages.length > 0) {
        sourceImages.forEach((imgUrl, index) => {
          nexcartImages.push({
            url: imgUrl,
            publicId: null,
            alt: dummy.title || 'Product Image',
            isPrimary: index === 0,
            displayOrder: index
          });
        });
      } else {
        nexcartImages.push({
          url: 'https://via.placeholder.com/150',
          isPrimary: true
        });
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
        category: formatCategory(dummy.category),
        price: price,
        mrp: mrp,
        discount: discountPercentage,
        stock: dummy.stock || 0,
        sku: `SKU-DJ-${dummy.id}-${dummy.sku || Date.now()}`,
        tags: dummy.tags ? [...dummy.tags, 'dummyjson'] : ['dummyjson'],
        images: nexcartImages,
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

      try {
        const productDoc = new Product(transformedData);
        await productDoc.validate();
        validCount++;

        const exists = await Product.exists({ 
          $or: [
            { sku: transformedData.sku },
            { title: transformedData.title }
          ]
        });

        if (exists) {
          alreadyImportedCount++;
        } else {
          newProductsCount++;
          if (isApplyMode) {
             operations.push({
                insertOne: {
                   document: transformedData
                }
             });
          }
        }
      } catch (validationError) {
        invalidCount++;
        console.warn(`Invalid record [${dummy.title}]:`, validationError.message);
      }
    }

    console.log(`\nExisting Products: ${existingProductsCount}`);
    console.log(`DummyJSON Products Found: ${dummyProducts.length}`);
    console.log(`Already Imported: ${alreadyImportedCount}`);
    console.log(`New Products: ${newProductsCount}`);
    console.log(`Invalid Products: ${invalidCount}\n`);

    if (isApplyMode && operations.length > 0) {
      console.log('--- EXECUTING DATABASE WRITE ---');
      try {
        const result = await Product.bulkWrite(operations, { ordered: false });
        
        console.log(`\nInserted: ${result.insertedCount}`);
        console.log(`Skipped: ${alreadyImportedCount}`);
        console.log(`Updated: 0`); // We only do inserts based on rules
        console.log(`Failed: 0`);
        
      } catch (writeErr) {
        console.log(`\nInserted: ${writeErr.result ? writeErr.result.nInserted : 0}`);
        console.log(`Skipped: ${alreadyImportedCount}`);
        console.log(`Updated: 0`);
        console.log(`Failed: ${writeErr.writeErrors ? writeErr.writeErrors.length : 'Unknown'}`);
      }
      
      const newTotalCount = await Product.countDocuments({});
      console.log(`\nFinal MongoDB Product count: ${newTotalCount}`);
    } else if (isApplyMode && operations.length === 0) {
       console.log('--- EXECUTING DATABASE WRITE ---');
       console.log('No new products to insert. All fetched products are duplicates or invalid.');
       console.log(`\nInserted: 0`);
       console.log(`Skipped: ${alreadyImportedCount}`);
       console.log(`Updated: 0`);
       console.log(`Failed: 0`);
       console.log(`\nFinal MongoDB Product count: ${existingProductsCount}`);
    } else {
       console.log('\nRun with --apply to execute insertion.');
    }

  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

runImporter();
