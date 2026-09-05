import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Review from '../src/models/Review.js';
import SellerReview from '../src/models/SellerReview.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const migrate = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const oldReviews = await Review.find().lean();
    console.log(`Found ${oldReviews.length} old reviews to migrate.`);

    let migrated = 0;
    for (const old of oldReviews) {
      // Check if already migrated
      const existing = await SellerReview.findOne({
        sellerId: old.seller,
        customerId: old.buyer,
        comment: old.comment,
        createdAt: old.createdAt,
      });

      if (!existing) {
        await SellerReview.create({
          sellerId: old.seller,
          customerId: old.buyer,
          rating: old.rating,
          comment: old.comment,
          status: 'PUBLISHED',
          createdAt: old.createdAt,
          updatedAt: old.updatedAt,
          // orderId is left undefined since old reviews didn't track it
        });
        migrated++;
      }
    }

    console.log(`Migrated ${migrated} new reviews.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
