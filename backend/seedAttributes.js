// backend/seedAttributes.js
// Script to seed sample dynamic product attributes into the database.

import mongoose from 'mongoose';
import 'dotenv/config';
import Category from './src/models/Category.js';
import Subcategory from './src/models/Subcategory.js';
import Attribute from './src/models/Attribute.js';

const seedAttributes = async () => {
  try {
    console.log('📡 Connecting to database...');
    mongoose.set('strictQuery', true);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database.');

    // 1. Find or create a parent Category
    let category = await Category.findOne({ name: 'Laptops & Computers' });
    if (!category) {
      console.log('📝 "Laptops & Computers" category not found. Creating it...');
      category = await Category.create({
        name: 'Laptops & Computers',
        slug: 'laptops-computers',
        description: 'Laptops and accessories',
      });
    }
    console.log(`📂 Using Category: "${category.name}" (ID: ${category._id})`);

    // 2. Find or create a Subcategory
    let subcategory = await Subcategory.findOne({ name: 'Gaming Laptops', category: category._id });
    if (!subcategory) {
      console.log('📝 "Gaming Laptops" subcategory not found. Creating it...');
      subcategory = await Subcategory.create({
        name: 'Gaming Laptops',
        slug: 'gaming-laptops',
        category: category._id,
        description: 'High performance gaming laptops',
      });
    }
    console.log(`📁 Using Subcategory: "${subcategory.name}" (ID: ${subcategory._id})`);

    // 3. Clear existing attributes to avoid duplicates
    console.log('🧹 Clearing existing attributes...');
    await Attribute.deleteMany({});
    console.log('✅ Cleared.');

    // 4. Create sample Category-level attributes
    console.log('✨ Creating Category-level attributes...');
    const attr1 = await Attribute.create({
      name: 'Brand',
      slug: 'brand',
      category: category._id,
      type: 'text',
      isRequired: true,
    });
    console.log(`   Created: Brand (Text)`);

    // 5. Create sample Subcategory-specific attributes
    console.log('✨ Creating Subcategory-specific attributes...');
    
    const attr2 = await Attribute.create({
      name: 'RAM',
      slug: 'ram',
      category: category._id,
      subcategory: subcategory._id,
      type: 'select',
      options: ['8GB', '16GB', '32GB', '64GB'],
      defaultValue: '16GB',
      isRequired: true,
    });
    console.log(`   Created: RAM (Select: [8GB, 16GB, 32GB, 64GB])`);

    const attr3 = await Attribute.create({
      name: 'Graphics Card',
      slug: 'graphics-card',
      category: category._id,
      subcategory: subcategory._id,
      type: 'select',
      options: ['RTX 4060', 'RTX 4070', 'RTX 4080', 'RTX 4090'],
      isRequired: false,
    });
    console.log(`   Created: Graphics Card (Select)`);

    const attr4 = await Attribute.create({
      name: 'Screen Size (Inches)',
      slug: 'screen-size-inches',
      category: category._id,
      subcategory: subcategory._id,
      type: 'number',
      isRequired: false,
    });
    console.log(`   Created: Screen Size (Number)`);

    console.log('\n🎉 Attributes seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedAttributes();
