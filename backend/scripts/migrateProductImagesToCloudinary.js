import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import Product from '../src/models/Product.js';
import { uploadImage, deleteImage } from '../src/services/cloudinaryService.js';

const isDryRun = process.argv.includes('--dry-run');
const isApply = process.argv.includes('--apply');

if (!isDryRun && !isApply) {
  console.log('Please specify --dry-run or --apply');
  process.exit(1);
}

const fetchDummyProducts = async () => {
  const res = await fetch('https://dummyjson.com/products?limit=200');
  const data = await res.json();
  return data.products || [];
};

const migrateProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('Fetching products from DummyJSON...');
    const dummyProducts = await fetchDummyProducts();
    console.log(`Found ${dummyProducts.length} products from DummyJSON API.`);

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (const dummy of dummyProducts) {
      // Find the corresponding product in our database by exact title
      const product = await Product.findOne({ title: dummy.title });
      
      if (!product) {
        console.log(`[SKIP] Could not find product in DB: "${dummy.title}"`);
        skippedCount++;
        continue;
      }

      // Check if it already has a valid Cloudinary image
      const primaryImage = product.images && product.images.find(img => img.isPrimary);
      if (primaryImage && primaryImage.url.includes('res.cloudinary.com') && primaryImage.publicId) {
        console.log(`[SKIP] Product already has Cloudinary image: "${dummy.title}"`);
        skippedCount++;
        continue;
      }

      const sourceImageUrl = dummy.thumbnail || dummy.images?.[0];
      if (!sourceImageUrl) {
        console.log(`[SKIP] No valid source image for: "${dummy.title}"`);
        skippedCount++;
        continue;
      }

      console.log(`[PROCESS] Migrating image for: "${dummy.title}" -> ${sourceImageUrl}`);
      
      if (isDryRun) {
        successCount++;
        continue;
      }

      try {
        // Download image from DummyJSON
        const imgRes = await fetch(sourceImageUrl);
        if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.statusText}`);
        
        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary
        const uploaded = await uploadImage(buffer, 'nexcart/products');

        // Delete old Cloudinary image if it exists but was incorrect (just in case)
        if (primaryImage && primaryImage.publicId) {
          await deleteImage(primaryImage.publicId).catch(err => console.error('Error deleting old image:', err.message));
        }

        // Update MongoDB product
        product.images = [{
          url: uploaded.secure_url,
          publicId: uploaded.public_id,
          isPrimary: true,
          alt: dummy.title
        }];

        await product.save();
        console.log(`[SUCCESS] Migrated "${dummy.title}"`);
        successCount++;
      } catch (err) {
        console.error(`[ERROR] Failed to migrate "${dummy.title}":`, err.message);
        failCount++;
      }
    }

    console.log('\n--- Migration Summary ---');
    console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'APPLY'}`);
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Skipped: ${skippedCount}`);

    process.exit(0);
  } catch (err) {
    console.error('Fatal Error:', err);
    process.exit(1);
  }
};

migrateProducts();
