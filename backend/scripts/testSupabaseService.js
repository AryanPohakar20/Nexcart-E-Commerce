import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { uploadImage, replaceImage, getSignedUrl } from '../src/services/supabaseStorageService.js';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function runTest() {
  try {
    console.log('--- STARTING END-TO-END SUPABASE VERIFICATION ---\n');

    // 1. Connect DB
    console.log('1. Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ DB Connected.');

    // 2. Create dummy image buffers
    const imagePath1 = path.join(process.cwd(), 'test-image-1.jpg');
    fs.writeFileSync(imagePath1, 'fake image content 1');
    const imageBuffer1 = fs.readFileSync(imagePath1);

    const imagePath2 = path.join(process.cwd(), 'test-image-2.jpg');
    fs.writeFileSync(imagePath2, 'fake image content 2');
    const imageBuffer2 = fs.readFileSync(imagePath2);

    // 3. Test Supabase Upload Directly (simulating what Multer + service does)
    console.log('\n2. Testing Supabase Upload...');
    const uploadRes1 = await uploadImage(imageBuffer1, 'products/test-e2e', 'test-image-1.jpg');
    
    console.log(`✅ Upload 1 successful.`);
    console.log(`   Image URL: ${uploadRes1.url}`);
    console.log(`   Image Path: ${uploadRes1.path}`);

    if (!uploadRes1.url.includes('supabase.co')) {
        throw new Error('URL is not pointing to Supabase!');
    }

    // 4. Test MongoDB Storage
    console.log('\n3. Testing MongoDB Storage for Product...');
    const product = new Product({
        title: 'E2E Test Product',
        description: 'Testing Supabase integration',
        price: 99,
        category: new mongoose.Types.ObjectId(),
        brand: new mongoose.Types.ObjectId(),
        sellerId: new mongoose.Types.ObjectId(),
        stock: 10,
        images: [{ url: uploadRes1.url, publicId: uploadRes1.path, isPrimary: true, displayOrder: 0 }]
    });

    await product.save();
    console.log(`✅ MongoDB stored the product successfully (ID: ${product._id})`);
    console.log(`   Stored URL: ${product.images[0].url}`);

    // 5. Test Replacement
    console.log('\n4. Testing Image Replacement...');
    const uploadRes2 = await replaceImage(uploadRes1.path, imageBuffer2, 'products/test-e2e', 'test-image-2.jpg');
    
    product.images[0] = { url: uploadRes2.url, publicId: uploadRes2.path, isPrimary: true, displayOrder: 0 };
    await product.save();

    console.log(`✅ Replacement successful.`);
    console.log(`   New Image URL: ${product.images[0].url}`);
    console.log(`   New Image Path: ${product.images[0].publicId}`);

    // Clean up
    console.log('\n5. Cleaning up...');
    await Product.findByIdAndDelete(product._id);
    fs.unlinkSync(imagePath1);
    fs.unlinkSync(imagePath2);
    mongoose.disconnect();

    console.log('\n--- ALL E2E UPLOAD TESTS COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('Test Failed:', error);
    process.exit(1);
  }
}

runTest();
