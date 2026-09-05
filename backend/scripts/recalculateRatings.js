import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Product from '../src/models/Product.js';
import Seller from '../src/models/Seller.js';
import { recalculateProductRating } from '../src/services/productRatingService.js';
import { recalculateSellerReputation } from '../src/services/sellerReputationService.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const recalculateAll = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const products = await Product.find({}, '_id').lean();
    console.log(`Found ${products.length} products to recalculate.`);
    let pCount = 0;
    for (const p of products) {
      await recalculateProductRating(p._id);
      pCount++;
      if (pCount % 10 === 0) console.log(`Recalculated ${pCount}/${products.length} products`);
    }

    const sellers = await Seller.find({}, '_id').lean();
    console.log(`Found ${sellers.length} sellers to recalculate.`);
    let sCount = 0;
    for (const s of sellers) {
      await recalculateSellerReputation(s._id);
      sCount++;
      if (sCount % 10 === 0) console.log(`Recalculated ${sCount}/${sellers.length} sellers`);
    }

    console.log('Finished recalculation.');
    process.exit(0);
  } catch (error) {
    console.error('Recalculation failed:', error);
    process.exit(1);
  }
};

recalculateAll();
