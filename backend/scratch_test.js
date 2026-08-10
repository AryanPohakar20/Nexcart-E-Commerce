// C:\Users\manju\.gemini\antigravity-ide\brain\47b5f62c-7309-4f0a-9d9d-784909f69b21/scratch/test.mjs
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
import * as attributeService from './src/services/attributeService.js';
import Category from './src/models/Category.js';
import Subcategory from './src/models/Subcategory.js';
import Attribute from './src/models/Attribute.js';

async function runTests() {
  console.log('📡 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ MongoDB connected!');

  let tempCategory = null;
  let tempSubcategory = null;
  const createdAttributes = [];

  try {
    // 2. Setup temporary category and subcategory for testing
    console.log('\n⚙️ Setting up temporary Category and Subcategory...');
    tempCategory = await Category.create({
      name: 'Test Category Temp',
      slug: 'test-category-temp',
      description: 'Temporary category for attribute tests',
    });
    console.log(`   Created Category: ${tempCategory._id} (${tempCategory.name})`);

    tempSubcategory = await Subcategory.create({
      name: 'Test Subcategory Temp',
      slug: 'test-subcategory-temp',
      category: tempCategory._id,
      description: 'Temporary subcategory for attribute tests',
    });
    console.log(`   Created Subcategory: ${tempSubcategory._id} (${tempSubcategory.name})`);

    // 3. Test Create Attribute — Success Cases
    console.log('\n🧪 Test Case 1: Create valid text attribute (Category level)');
    const attr1 = await attributeService.createAttribute({
      name: 'Brand Name',
      category: tempCategory._id,
      type: 'text',
      isRequired: true,
    });
    createdAttributes.push(attr1._id);
    console.log(`   Success: Created attribute "${attr1.name}" with slug "${attr1.slug}"`);

    console.log('\n🧪 Test Case 2: Create valid select attribute with options (Subcategory level)');
    const attr2 = await attributeService.createAttribute({
      name: 'Storage Size',
      category: tempCategory._id,
      subcategory: tempSubcategory._id,
      type: 'select',
      options: ['128GB', '256GB', '512GB'],
      defaultValue: '256GB',
      isRequired: false,
    });
    createdAttributes.push(attr2._id);
    console.log(`   Success: Created attribute "${attr2.name}" with options [${attr2.options.join(', ')}]`);

    // 4. Test Create Attribute — Failure / Validation Cases
    console.log('\n🧪 Test Case 3: Create select attribute without options (Should fail)');
    try {
      await attributeService.createAttribute({
        name: 'Failure Select',
        category: tempCategory._id,
        type: 'select',
        options: [],
      });
      console.error('   ❌ Failure: It succeeded but should have failed!');
    } catch (err) {
      console.log(`   ✅ Success: Failed as expected with message: "${err.message}"`);
    }

    console.log('\n🧪 Test Case 4: Create attribute with mismatched category/subcategory (Should fail)');
    // Let's create an independent category to simulate a mismatch
    const externalCategory = await Category.create({
      name: 'External Category Temp',
      slug: 'external-category-temp',
    });
    try {
      await attributeService.createAttribute({
        name: 'Mismatched Attribute',
        category: externalCategory._id, // category ID doesn't match subcategory's category
        subcategory: tempSubcategory._id,
        type: 'text',
      });
      console.error('   ❌ Failure: It succeeded but should have failed!');
    } catch (err) {
      console.log(`   ✅ Success: Failed as expected with message: "${err.message}"`);
    } finally {
      await Category.findByIdAndDelete(externalCategory._id);
    }

    console.log('\n🧪 Test Case 5: Create attribute with invalid defaultValue (Should fail)');
    try {
      await attributeService.createAttribute({
        name: 'Invalid Default',
        category: tempCategory._id,
        type: 'select',
        options: ['Yes', 'No'],
        defaultValue: 'Maybe',
      });
      console.error('   ❌ Failure: It succeeded but should have failed!');
    } catch (err) {
      console.log(`   ✅ Success: Failed as expected with message: "${err.message}"`);
    }

    console.log('\n🧪 Test Case 6: Create duplicate attribute in same scope (Should fail)');
    try {
      await attributeService.createAttribute({
        name: 'Brand Name', // Duplicate of attr1 at tempCategory level
        category: tempCategory._id,
        type: 'text',
      });
      console.error('   ❌ Failure: It succeeded but should have failed!');
    } catch (err) {
      console.log(`   ✅ Success: Failed as expected with message: "${err.message}"`);
    }

    // 5. Test Get and Filter Attributes
    console.log('\n🧪 Test Case 7: Get all attributes and filter by category');
    const allAttrs = await attributeService.getAttributesByCategory(tempCategory._id);
    console.log(`   Success: Found ${allAttrs.length} attributes for category`);
    if (allAttrs.length !== 2) {
      console.error(`   ❌ Failure: Expected 2 attributes, got ${allAttrs.length}`);
    }

    console.log('\n🧪 Test Case 8: Get subcategory specific attributes');
    const subcatAttrs = await attributeService.getAttributesByCategory(tempCategory._id, tempSubcategory._id);
    console.log(`   Success: Found ${subcatAttrs.length} attributes for category + subcategory filter`);
    if (subcatAttrs.length !== 1) {
      console.error(`   ❌ Failure: Expected 1 attribute, got ${subcatAttrs.length}`);
    }

    // 6. Test Update Attribute
    console.log('\n🧪 Test Case 9: Update attribute (valid type & options change)');
    const updatedAttr = await attributeService.updateAttribute(attr1._id, {
      name: 'Brand Brand Name',
      type: 'select',
      options: ['Apple', 'Samsung', 'Google'],
      defaultValue: 'Google',
    });
    console.log(`   Success: Updated attribute. New name: "${updatedAttr.name}", type: "${updatedAttr.type}", options: [${updatedAttr.options.join(', ')}], default: "${updatedAttr.defaultValue}"`);

    console.log('\n🧪 Test Case 10: Update attribute with invalid options (Should fail)');
    try {
      await attributeService.updateAttribute(attr1._id, {
        type: 'select',
        options: [],
      });
      console.error('   ❌ Failure: It succeeded but should have failed!');
    } catch (err) {
      console.log(`   ✅ Success: Failed as expected with message: "${err.message}"`);
    }

    // 7. Test Delete Attribute
    console.log('\n🧪 Test Case 11: Delete attribute');
    await attributeService.deleteAttribute(attr1._id);
    console.log('   Success: Deleted attr1 successfully');
    try {
      await attributeService.getAttributeById(attr1._id);
      console.error('   ❌ Failure: Retrieved deleted attribute!');
    } catch (err) {
      console.log(`   ✅ Success: Querying deleted attribute failed with 404: "${err.message}"`);
    }

  } catch (error) {
    console.error('\n💥 Unexpected error during test execution:', error);
  } finally {
    // 8. Clean up
    console.log('\n🧹 Cleaning up temporary test data...');
    if (tempCategory) {
      await Category.findByIdAndDelete(tempCategory._id);
      console.log(`   Deleted temporary Category: ${tempCategory._id}`);
    }
    if (tempSubcategory) {
      await Subcategory.findByIdAndDelete(tempSubcategory._id);
      console.log(`   Deleted temporary Subcategory: ${tempSubcategory._id}`);
    }
    for (const id of createdAttributes) {
      await Attribute.findByIdAndDelete(id);
    }
    console.log('   Deleted any remaining attributes created during tests.');

    await mongoose.disconnect();
    console.log('📡 Mongoose disconnected.');
    console.log('\n✨ Testing Completed!');
  }
}

runTests();
