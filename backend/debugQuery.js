// backend/debugQuery.js
import fs from 'fs';
import mongoose from 'mongoose';
import Product from './src/models/Product.js';
import Attribute from './src/models/Attribute.js';
import Category from './src/models/Category.js';
import Subcategory from './src/models/Subcategory.js';

// Load env variables
const envContent = fs.readFileSync('.env', 'utf8');
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

async function debug() {
  console.log('📡 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected.');

  // 1. Find the ASUS laptop in DB
  const laptop = await Product.findOne({ title: /asus/i })
    .populate('category')
    .populate('subcategory');

  if (!laptop) {
    console.log('❌ No ASUS laptop found in the database. Please run node seedProducts.js first!');
    await mongoose.disconnect();
    return;
  }

  console.log('\n📦 Seeded Laptop Details:');
  console.log(`   ID: ${laptop._id}`);
  console.log(`   Title: ${laptop.title}`);
  console.log(`   Category ID: ${laptop.category?._id} (${laptop.category?.name})`);
  console.log(`   Subcategory ID: ${laptop.subcategory?._id} (${laptop.subcategory?.name})`);
  console.log(`   Specifications:`, JSON.stringify(laptop.specifications));

  // 2. Perform matches on Specifications
  const specs = laptop.specifications;
  const ramVal = "16GB";
  const gpuVal = "RTX 4060";

  // Build RAM regex
  const ramRegexStr = ramVal.replace(/\s+/g, '').replace(/([0-9]+)([a-zA-Z]+)/g, '$1\\s*$2').replace(/([a-zA-Z]+)([0-9]+)/g, '$1\\s*$2');
  const ramRegex = new RegExp(`^${ramRegexStr}$`, 'i');

  // Build GPU regex
  const gpuRegexStr = gpuVal.replace(/\s+/g, '').replace(/([0-9]+)([a-zA-Z]+)/g, '$1\\s*$2').replace(/([a-zA-Z]+)([0-9]+)/g, '$1\\s*$2');
  const gpuRegex = new RegExp(`^${gpuRegexStr}$`, 'i');

  console.log('\n🧪 Regex check on Specs:');
  console.log(`   RAM regex: ${ramRegex} matching "16 GB" -> ${ramRegex.test("16 GB")}`);
  console.log(`   GPU regex: ${gpuRegex} matching "RTX 4060" -> ${gpuRegex.test("RTX 4060")}`);

  // Check actual keys in Specs map
  const hasRamKeyMatch = ramRegex.test(specs.get('RAM Memory Installed Size') || specs.get('RAM'));
  const hasGpuKeyMatch = gpuRegex.test(specs.get('Graphics Card') || specs.get('graphics-card'));

  console.log(`   Matches laptop specifications RAM? ${hasRamKeyMatch}`);
  console.log(`   Matches laptop specifications GPU? ${hasGpuKeyMatch}`);

  // 3. Test MongoDB queries
  const q1 = {
    category: laptop.category._id,
    subcategory: laptop.subcategory._id,
    $and: [
      {
        $or: [
          { "specifications.Graphics Card": gpuRegex },
          { "specifications.graphics-card": gpuRegex }
        ]
      },
      {
        $or: [
          { "specifications.RAM Memory Installed Size": ramRegex },
          { "specifications.RAM": ramRegex }
        ]
      }
    ]
  };

  const count = await Product.countDocuments(q1);
  console.log(`\n🔍 Mongoose query count documents result: ${count}`);

  await mongoose.disconnect();
}

debug();
