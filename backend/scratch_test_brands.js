// backend/scratch_test_brands.js
import fs from 'fs';
import mongoose from 'mongoose';

// 1. Manually load environment variables from backend/.env
const envPath = 'c:/Users/manju/Desktop/Nexcart-E-Commerce/backend/.env';
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      process.env[key] = val;
    }
  });
  console.log('✅ Loaded environment variables from backend/.env');
} catch (err) {
  console.error('❌ Failed to load .env file:', err.message);
  process.exit(1);
}

// Import services and models using relative paths
import * as brandService from './src/services/brandService.js';
import Brand from './src/models/Brand.js';

async function runTests() {
  console.log('📡 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ MongoDB connected!');

  const createdBrands = [];

  try {
    // Clean up any old test data just in case
    await Brand.deleteMany({ name: { $regex: /Test Brand Temp/i } });

    // 2. Test Create Brand — Success Case
    console.log('\n🧪 Test Case 1: Create valid active Brand');
    const brand1 = await brandService.createBrand({
      name: 'Test Brand Temp One',
      description: 'A temporary test brand for CRUD validation',
      logo: {
        public_id: 'brands/test_one',
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      },
      status: 'active',
    });
    createdBrands.push(brand1._id);
    console.log(`   Success: Created brand "${brand1.name}" with slug "${brand1.slug}"`);

    // 3. Test Create Brand — Duplicate Case (Case-Insensitive)
    console.log('\n🧪 Test Case 2: Create duplicate Brand name (Should fail)');
    try {
      await brandService.createBrand({
        name: 'test brand temp one', // case variant
        description: 'Should reject duplicate',
      });
      console.error('   ❌ Failure: It succeeded but should have failed!');
    } catch (err) {
      console.log(`   ✅ Success: Failed as expected with message: "${err.message}"`);
    }

    // 4. Test Create Brand — Invalid Logo Structure
    console.log('\n🧪 Test Case 3: Create Brand with invalid logo (Should fail when model validates)');
    try {
      // Model validation will trigger if we try to save incomplete logo object
      await Brand.create({
        name: 'Test Brand Temp Logo Fail',
        slug: 'test-brand-temp-logo-fail',
        logo: {
          public_id: 'only_id_no_url',
        },
      });
      console.error('   ❌ Failure: It succeeded but should have failed!');
    } catch (err) {
      console.log(`   ✅ Success: Failed as expected with message: "${err.message}"`);
    }

    // 5. Test Get and Filter Brands
    console.log('\n🧪 Test Case 4: Get all brands');
    const allBrands = await brandService.getAllBrands();
    console.log(`   Success: Found ${allBrands.length} brands total.`);

    console.log('\n🧪 Test Case 5: Get brand by ID');
    const fetchedBrand = await brandService.getBrandById(brand1._id);
    console.log(`   Success: Fetched brand name is "${fetchedBrand.name}"`);

    console.log('\n🧪 Test Case 6: Get brand by slug');
    const brandBySlug = await brandService.getBrandBySlug(brand1.slug);
    console.log(`   Success: Fetched brand by slug is "${brandBySlug.name}"`);

    // 6. Test Update Brand
    console.log('\n🧪 Test Case 7: Update brand name and description');
    const updatedBrand = await brandService.updateBrand(brand1._id, {
      name: 'Test Brand Temp One Updated',
      description: 'Updated description details',
      status: 'inactive',
    });
    console.log(`   Success: Updated brand name is "${updatedBrand.name}" (slug: "${updatedBrand.slug}", status: "${updatedBrand.status}")`);

    // 7. Test Update Brand — Name Conflict Check
    console.log('\n🧪 Test Case 8: Create a second brand and try to update its name to a duplicate');
    const brand2 = await brandService.createBrand({
      name: 'Test Brand Temp Two',
      description: 'Second brand',
    });
    createdBrands.push(brand2._id);

    try {
      await brandService.updateBrand(brand2._id, {
        name: 'Test Brand Temp One Updated', // Duplicate of brand1's updated name
      });
      console.error('   ❌ Failure: It succeeded but should have failed!');
    } catch (err) {
      console.log(`   ✅ Success: Failed as expected with message: "${err.message}"`);
    }

    // 8. Test Delete Brand
    console.log('\n🧪 Test Case 9: Delete brand');
    await brandService.deleteBrand(brand1._id);
    console.log('   Success: Deleted brand1 successfully');
    
    try {
      await brandService.getBrandById(brand1._id);
      console.error('   ❌ Failure: Retrieved deleted brand!');
    } catch (err) {
      console.log(`   ✅ Success: Querying deleted brand failed with 404: "${err.message}"`);
    }

  } catch (error) {
    console.error('\n💥 Unexpected error during test execution:', error);
  } finally {
    // 9. Clean up
    console.log('\n🧹 Cleaning up temporary test data...');
    for (const id of createdBrands) {
      await Brand.findByIdAndDelete(id);
    }
    console.log('   Deleted any remaining brands created during tests.');

    await mongoose.disconnect();
    console.log('📡 Mongoose disconnected.');
    console.log('\n✨ Testing Completed!');
  }
}

runTests();
