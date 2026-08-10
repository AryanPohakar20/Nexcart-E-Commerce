// backend/seedCategories.js
// Script to automatically populate categories and subcategories into the MongoDB database.

import mongoose from 'mongoose';
import 'dotenv/config';
import Category from './src/models/Category.js';
import Subcategory from './src/models/Subcategory.js';

const CATEGORIES_DATA = {
  "Mobile Phones": {
    "description": "Smartphones, budget devices, flagship models, and foldables.",
    "subcategories": ["Smartphones", "Flagship Phones", "Budget Smartphones", "Gaming Phones", "Foldable Phones"],
    "image": {
      "public_id": "nexcart/categories/mobile_phones",
      "url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
    }
  },
  "Laptops & Computers": {
    "description": "Gaming laptops, ultrabooks, work machines, and computing powerhouses.",
    "subcategories": ["Gaming Laptops", "Ultrabooks", "Business Laptops", "2-in-1 Touchscreen", "MacBooks", "Workstations"],
    "image": {
      "public_id": "nexcart/categories/laptops_computers",
      "url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
    }
  },
  "Electronics & Audio": {
    "description": "Headphones, wireless earbuds, speakers, cameras, and wearable devices.",
    "subcategories": ["Wireless Headphones", "TWS Earbuds", "Bluetooth Speakers", "Soundbars", "DSLR Cameras", "Smartwatches"],
    "image": {
      "public_id": "nexcart/categories/electronics_audio",
      "url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
    }
  },
  "Home Appliances": {
    "description": "Smart TVs, refrigerators, washers, and other helpful home gadgets.",
    "subcategories": ["Smart TVs", "Refrigerators", "Washing Machines", "Air Conditioners", "Microwave Ovens", "Air Fryers", "Robot Vacuums"],
    "image": {
      "public_id": "nexcart/categories/home_appliances",
      "url": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80"
    }
  },
  "Fashion & Apparel": {
    "description": "Trending clothes, footwear, luxury watches, and styling accessories.",
    "subcategories": ["Men's Jackets", "Sneakers & Athletic Shoes", "Luxury Watches", "Handbags & Backpacks", "Casual Shirts", "Women's Dresses"],
    "image": {
      "public_id": "nexcart/categories/fashion_apparel",
      "url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
    }
  },
  "Gaming": {
    "description": "Consoles, controllers, gaming mice, and VR setups.",
    "subcategories": ["Consoles", "Gaming Mice", "Mechanical Keyboards", "Gaming Headsets", "VR Headsets", "Gaming Chairs"],
    "image": {
      "public_id": "nexcart/categories/gaming",
      "url": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80"
    }
  },
  "Home & Living": {
    "description": "Comfortable home layouts, smart bulbs, coffee tables, and lifestyle products.",
    "subcategories": ["Ergonomic Desk Chairs", "Smart Lighting", "Coffee Tables", "Bedding Sets", "Air Purifiers", "Cookware Sets"],
    "image": {
      "public_id": "nexcart/categories/home_living",
      "url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
    }
  },
  "Beauty & Personal Care": {
    "description": "Trimmers, styling tools, perfumes, and skin care kits.",
    "subcategories": ["Electric Trimmers", "Hair Dryers", "Face Serums", "Luxury Perfumes", "Electric Toothbrushes", "Skincare Sets"],
    "image": {
      "public_id": "nexcart/categories/beauty_personal_care",
      "url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
    }
  }
};

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

const seed = async () => {
  try {
    console.log('Connecting to database...');
    // Strict query setting
    mongoose.set('strictQuery', true);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database.');

    // Clear existing categories and subcategories to avoid duplicate conflicts
    console.log('Clearing existing categories and subcategories...');
    await Category.deleteMany({});
    await Subcategory.deleteMany({});
    console.log('Cleared successfully.');

    for (const [catName, catDetails] of Object.entries(CATEGORIES_DATA)) {
      console.log(`Creating category: ${catName}...`);
      const category = await Category.create({
        name: catName,
        slug: slugify(catName),
        description: catDetails.description,
        image: catDetails.image
      });
      console.log(`Category created: ${category.name} with ID: ${category._id}`);

      for (const subName of catDetails.subcategories) {
        console.log(`  Creating subcategory: ${subName}...`);
        await Subcategory.create({
          name: subName,
          slug: slugify(subName),
          category: category._id,
          description: `${subName} under ${catName} category.`
        });
        console.log(`  Subcategory created: ${subName}`);
      }
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seed();
