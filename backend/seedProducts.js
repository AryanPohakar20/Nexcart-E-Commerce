// backend/seedProducts.js
// Script to load the 1,000 unique products dataset into MongoDB.
// Automatically normalizes Category, Subcategory, and Brand values to reference IDs.

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import 'dotenv/config';
import Category from './src/models/Category.js';
import Subcategory from './src/models/Subcategory.js';
import Brand from './src/models/Brand.js';
import Product from './src/models/Product.js';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad', 'Kolkata'];
const CONDITIONS = ['new', 'refurbished', 'used'];

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const getRandomLocation = () => CITIES[Math.floor(Math.random() * CITIES.length)];

const getRandomCondition = () => {
  const rand = Math.random();
  if (rand < 0.8) return 'new'; // 80% New
  if (rand < 0.95) return 'refurbished'; // 15% Refurbished
  return 'used'; // 5% Used
};

// Locate product catalog files under possible locations
const findCatalogPath = () => {
  const paths = [
    'C:/Users/manju/Desktop/Projects/Nexcart product/catalog_1000_products.json',
    'C:/Users/manju/Desktop/Nexcart product/catalog_1000_products.json',
    '../Projects/Nexcart product/catalog_1000_products.json',
    './catalog_1000_products.json',
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
};

const seedProducts = async () => {
  try {
    const catalogPath = findCatalogPath();
    if (!catalogPath) {
      console.error('❌ Could not find catalog_1000_products.json in any check path.');
      process.exit(1);
    }

    console.log(`📖 Found catalog file at: ${catalogPath}`);
    const rawData = fs.readFileSync(catalogPath, 'utf8');
    const catalogData = JSON.parse(rawData);

    // Ensure we have a mock ASUS laptop for verification tests if not present
    const hasAsus = catalogData.some(p => p.brand && p.brand.toLowerCase() === 'asus');
    if (!hasAsus) {
      console.log('📝 Appending mock ASUS Laptop for verification testing...');
      catalogData.push({
        id: "PROD-LAP-0001",
        title: "Asus TUF Gaming A15 Laptop, 16GB RAM, 512GB SSD, RTX 4060, 15.6\" 144Hz FHD",
        brand: "ASUS",
        category: "Laptops & Computers",
        subcategory: "Gaming Laptops",
        price: 75999.0,
        originalPrice: 85999.0,
        currency: "INR",
        inStock: true,
        stockQuantity: 20,
        specifications: {
          "Brand": "ASUS",
          "RAM Memory Installed Size": "16 GB",
          "Memory Storage Capacity": "512 GB",
          "Graphics Card": "RTX 4060",
          "Screen Size": "15.6 Inches"
        }
      });
    }

    console.log(`📦 Loaded ${catalogData.length} products to import.`);

    console.log('📡 Connecting to database...');
    mongoose.set('strictQuery', true);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // Clear existing products
    console.log('🧹 Clearing existing products collection...');
    await Product.deleteMany({});
    console.log('✅ Cleared.');

    // Pre-cache categories and subcategories to avoid DB spam in loops
    console.log('🗂️ Pre-caching categories & subcategories from DB...');
    const allCategories = await Category.find({});
    const allSubcategories = await Subcategory.find({});
    console.log(`✅ Loaded ${allCategories.length} categories and ${allSubcategories.length} subcategories.`);

    const categoryMap = {};
    allCategories.forEach((cat) => {
      categoryMap[cat.name.toLowerCase().trim()] = cat;
      categoryMap[cat.slug] = cat;
    });

    const subcategoryMap = {};
    allSubcategories.forEach((sub) => {
      subcategoryMap[sub.name.toLowerCase().trim()] = sub;
      subcategoryMap[sub.slug] = sub;
    });

    // Map for Brand lookups to avoid duplicate checks in MongoDB
    const brandMap = {};

    const finalProducts = [];
    let count = 0;

    for (const p of catalogData) {
      // 1. Resolve Category
      const catKey = (p.category || '').toLowerCase().trim();
      let categoryDoc = categoryMap[catKey];
      if (!categoryDoc) {
        // Fallback: search slug
        categoryDoc = categoryMap[slugify(p.category)];
      }

      if (!categoryDoc) {
        console.warn(`⚠️ Warning: Category "${p.category}" not found in DB. Creating a placeholder category...`);
        categoryDoc = await Category.create({
          name: p.category,
          slug: slugify(p.category),
          description: `${p.category} auto-created during product seeding.`,
        });
        categoryMap[catKey] = categoryDoc;
      }

      // 2. Resolve Subcategory
      const subKey = (p.subcategory || '').toLowerCase().trim();
      let subcategoryDoc = subcategoryMap[subKey];
      if (!subcategoryDoc) {
        subcategoryDoc = subcategoryMap[slugify(p.subcategory)];
      }

      if (!subcategoryDoc) {
        console.warn(`⚠️ Warning: Subcategory "${p.subcategory}" not found in DB. Creating it...`);
        subcategoryDoc = await Subcategory.create({
          name: p.subcategory,
          slug: slugify(p.subcategory),
          category: categoryDoc._id,
          description: `${p.subcategory} subcategory under ${categoryDoc.name}.`,
        });
        subcategoryMap[subKey] = subcategoryDoc;
      }

      // 3. Resolve Brand (find in cache, find in DB, or create)
      const brandKey = (p.brand || '').toLowerCase().trim();
      let brandDoc = brandMap[brandKey];
      if (!brandDoc) {
        // Query Brand collection
        brandDoc = await Brand.findOne({
          name: { $regex: new RegExp(`^${p.brand.trim()}$`, 'i') },
        });

        if (!brandDoc) {
          console.log(`✨ Creating Brand: "${p.brand}"...`);
          brandDoc = await Brand.create({
            name: p.brand,
            slug: slugify(p.brand),
            description: `${p.brand} brand details.`,
            status: 'active',
          });
        }
        brandMap[brandKey] = brandDoc;
      }

      // 4. Transform specifications to specifications Map (object)
      const specMap = {};
      if (p.specifications && typeof p.specifications === 'object') {
        for (const [key, value] of Object.entries(p.specifications)) {
          specMap[key] = String(value);
        }
      }

      // 5. Structure Product Document
      finalProducts.push({
        id: p.id,
        title: p.title,
        brand: brandDoc._id,
        category: categoryDoc._id,
        subcategory: subcategoryDoc._id,
        price: p.price,
        originalPrice: p.originalPrice || p.price,
        currency: p.currency || 'INR',
        discountPercentage: p.discountPercentage || 0,
        rating: p.rating || 0,
        reviewCount: p.reviewCount || 0,
        inStock: p.inStock !== undefined ? p.inStock : true,
        stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity : 10,
        color: p.color || '',
        colorOptions: p.colorOptions || [],
        variants: p.variants || [],
        topHighlights: p.topHighlights || [],
        specifications: specMap,
        images: p.images || [],
        thumbnail: p.thumbnail || '',
        description: p.description || '',
        tags: p.tags || [],
        seller: p.seller || '',
        warranty: p.warranty || '',
        condition: getRandomCondition(),
        location: getRandomLocation(),
      });

      count++;
      if (count % 100 === 0) {
        console.log(`⚙️ Processed ${count} products...`);
      }
    }

    console.log('💾 Saving normalized products to database...');
    // Use insertMany to perform a single high-performance batch insert
    const inserted = await Product.insertMany(finalProducts);
    console.log(`✅ Success! Successfully seeded ${inserted.length} products to database.`);

    await mongoose.disconnect();
    console.log('📡 Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
};

seedProducts();
