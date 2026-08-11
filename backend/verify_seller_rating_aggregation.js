import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import Order from './src/models/Order.js';
import SellerReview from './src/models/SellerReview.js';
import * as sellerReviewService from './src/services/sellerReviewService.js';
import { recalculateSellerRating } from './src/services/sellerRatingService.js';

const runTests = async () => {
  console.log('🚀 Connecting to MongoDB...');
  await connectDB();

  // Test ObjectIds
  const buyerId = new mongoose.Types.ObjectId();
  const sellerAUserId = new mongoose.Types.ObjectId();
  const sellerADocId = new mongoose.Types.ObjectId();
  const sellerBUserId = new mongoose.Types.ObjectId();
  const sellerBDocId = new mongoose.Types.ObjectId();
  const orderAId = new mongoose.Types.ObjectId();
  const orderBId = new mongoose.Types.ObjectId();

  console.log('📦 Seeding test database documents...');

  // Create Mock Buyer User
  const buyerUser = new User({
    _id: buyerId,
    firstName: 'John',
    lastName: 'Doe',
    username: `john_seller_agg_buyer_${Date.now()}`,
    email: `john_seller_agg_buyer_${Date.now()}@example.com`,
    role: 'customer',
    provider: 'email',
    isVerified: true,
    phone: '1234567890',
    password: 'password123',
  });
  await buyerUser.save();

  // Create Mock Seller A User
  const sellerAUser = new User({
    _id: sellerAUserId,
    firstName: 'Jane',
    lastName: 'StoreA',
    username: `jane_seller_user_a_${Date.now()}`,
    email: `jane_seller_user_a_${Date.now()}@example.com`,
    role: 'seller',
    provider: 'email',
    isVerified: true,
    phone: '1112223333',
    password: 'password123',
  });
  await sellerAUser.save();

  // Create Seller A Document
  const sellerADoc = new Seller({
    _id: sellerADocId,
    userId: sellerAUserId,
    sellerType: 'individual',
    status: 'Approved',
    isActive: true,
  });
  await sellerADoc.save();

  // Create Mock Seller B User
  const sellerBUser = new User({
    _id: sellerBUserId,
    firstName: 'Bob',
    lastName: 'StoreB',
    username: `bob_seller_user_b_${Date.now()}`,
    email: `bob_seller_user_b_${Date.now()}@example.com`,
    role: 'seller',
    provider: 'email',
    isVerified: true,
    phone: '4445556666',
    password: 'password123',
  });
  await sellerBUser.save();

  // Create Seller B Document
  const sellerBDoc = new Seller({
    _id: sellerBDocId,
    userId: sellerBUserId,
    sellerType: 'individual',
    status: 'Approved',
    isActive: true,
  });
  await sellerBDoc.save();

  // Create Completed Order for Seller A
  const orderA = new Order({
    _id: orderAId,
    orderId: `ORD-SELA-${Math.floor(10000 + Math.random() * 90000)}`,
    customer: buyerId,
    seller: sellerADocId,
    totalAmount: 100.0,
    itemCount: 1,
    orderStatus: 'delivered',
    items: [
      {
        product: new mongoose.Types.ObjectId(),
        name: 'Product A',
        price: 100.0,
        quantity: 1,
        subtotal: 100.0,
      },
    ],
  });
  await orderA.save();

  // Create Completed Order for Seller B
  const orderB = new Order({
    _id: orderBId,
    orderId: `ORD-SELB-${Math.floor(10000 + Math.random() * 90000)}`,
    customer: buyerId,
    seller: sellerBDocId,
    totalAmount: 150.0,
    itemCount: 1,
    orderStatus: 'delivered',
    items: [
      {
        product: new mongoose.Types.ObjectId(),
        name: 'Product B',
        price: 150.0,
        quantity: 1,
        subtotal: 150.0,
      },
    ],
  });
  await orderB.save();

  console.log('✅ Mock data seeded. Running aggregation tests...\n');

  let review1Id = null;
  let review2Id = null;
  let reviewBId = null;

  try {
    // ----------------------------------------------------
    // TEST 1: Zero Reviews Case
    // ----------------------------------------------------
    console.log('👉 Test 1: Verifying default ratings for seller with 0 reviews...');
    await recalculateSellerRating(sellerAUserId);
    const s1 = await Seller.findById(sellerADocId);

    console.log('Seller A Stats (0 reviews):', {
      rating: s1.rating,
      totalReviews: s1.totalReviews,
      averageRating: s1.averageRating,
      ratingDistribution: s1.ratingDistribution,
    });

    if (s1.averageRating !== 0 || s1.totalReviews !== 0) {
      throw new Error('Default stats with 0 reviews must be 0');
    }
    if (s1.ratingDistribution.fiveStar !== 0 || s1.ratingDistribution.oneStar !== 0) {
      throw new Error('All rating distribution counts must be 0');
    }
    console.log('🟢 [PASS] Default stats are correct.');

    // ----------------------------------------------------
    // TEST 2: First Review (5 stars)
    // ----------------------------------------------------
    console.log('\n👉 Test 2: Creating first review (5 stars)...');
    const r1 = await sellerReviewService.createReview({
      customerId: buyerId,
      sellerId: sellerAUserId,
      orderId: orderAId,
      rating: 5,
      comment: 'Excellent seller!',
    });
    review1Id = r1.id;

    const s2 = await Seller.findById(sellerADocId);
    console.log('Seller A Stats (1 review):', {
      rating: s2.rating,
      totalReviews: s2.totalReviews,
      averageRating: s2.averageRating,
      ratingDistribution: s2.ratingDistribution,
    });

    if (s2.averageRating !== 5 || s2.totalReviews !== 1) {
      throw new Error('Stats did not update correctly for first 5-star review');
    }
    if (s2.ratingDistribution.fiveStar !== 1 || s2.ratingDistribution.fourStar !== 0) {
      throw new Error('Rating distribution incorrect for first 5-star review');
    }
    console.log('🟢 [PASS] First review updates stats correctly.');

    // ----------------------------------------------------
    // TEST 3: Multiple Reviews
    // ----------------------------------------------------
    console.log('\n👉 Test 3: Seeding second review (3 stars)...');
    const buyer2Id = new mongoose.Types.ObjectId();
    const buyer2User = new User({
      _id: buyer2Id,
      firstName: 'Alice',
      lastName: 'Smith',
      username: `alice_seller_agg_${Date.now()}`,
      email: `alice_seller_agg_${Date.now()}@example.com`,
      role: 'customer',
      provider: 'email',
      isVerified: true,
      phone: '1122334455',
      password: 'password123',
    });
    await buyer2User.save();

    // Bypass eligibility to force a second review
    const review2 = new SellerReview({
      customerId: buyer2Id,
      sellerId: sellerAUserId,
      orderId: new mongoose.Types.ObjectId(),
      rating: 3,
      comment: 'Average seller.',
      status: 'Published',
    });
    await review2.save();
    review2Id = review2._id;

    // Trigger recalculation
    await recalculateSellerRating(sellerAUserId);

    const s3 = await Seller.findById(sellerADocId);
    console.log('Seller A Stats (2 reviews):', {
      rating: s3.rating,
      totalReviews: s3.totalReviews,
      averageRating: s3.averageRating,
      ratingDistribution: s3.ratingDistribution,
    });

    if (s3.averageRating !== 4.0 || s3.totalReviews !== 2) {
      throw new Error('Average rating should be 4.0 (5 + 3 / 2)');
    }
    if (s3.ratingDistribution.fiveStar !== 1 || s3.ratingDistribution.threeStar !== 1) {
      throw new Error('Star distribution incorrect');
    }
    console.log('🟢 [PASS] Multiple reviews update average to 4.0.');

    // ----------------------------------------------------
    // TEST 4: Rating Update (3 stars -> 1 star)
    // ----------------------------------------------------
    console.log('\n👉 Test 4: Updating second review (3 stars -> 1 star)...');
    await sellerReviewService.updateReview(review2Id, buyer2Id, { rating: 1 });

    const s4 = await Seller.findById(sellerADocId);
    console.log('Seller A Stats (after review update):', {
      rating: s4.rating,
      totalReviews: s4.totalReviews,
      averageRating: s4.averageRating,
      ratingDistribution: s4.ratingDistribution,
    });

    if (s4.averageRating !== 3.0 || s4.totalReviews !== 2) {
      throw new Error('Average rating should be 3.0 (5 + 1 / 2)');
    }
    if (s4.ratingDistribution.fiveStar !== 1 || s4.ratingDistribution.oneStar !== 1) {
      throw new Error('Star distribution incorrect after rating update');
    }
    console.log('🟢 [PASS] Rating update recalculates stats correctly.');

    // ----------------------------------------------------
    // TEST 5: Comment-Only Update (no aggregation trigger)
    // ----------------------------------------------------
    console.log('\n👉 Test 5: Updating comment only (should NOT trigger aggregation update timestamp)...');
    const sBefore = await Seller.findById(sellerADocId);
    const beforeTimestamp = sBefore.lastRatingUpdatedAt.getTime();

    // Small delay to ensure timestamp has room to change
    await new Promise((resolve) => setTimeout(resolve, 50));

    await sellerReviewService.updateReview(review2Id, buyer2Id, { comment: 'No rating change comment' });

    const sAfter = await Seller.findById(sellerADocId);
    const afterTimestamp = sAfter.lastRatingUpdatedAt.getTime();

    if (beforeTimestamp !== afterTimestamp) {
      throw new Error('Aggregation was unnecessarily run on a comment-only update!');
    }
    console.log('🟢 [PASS] Comment-only updates do not trigger unnecessary aggregation.');

    // ----------------------------------------------------
    // TEST 6: Soft Deletion
    // ----------------------------------------------------
    console.log('\n👉 Test 6: Soft-deleting first review (5 stars)...');
    await sellerReviewService.deleteReview(review1Id, buyerId);

    const s6 = await Seller.findById(sellerADocId);
    console.log('Seller A Stats (after soft-delete):', {
      rating: s6.rating,
      totalReviews: s6.totalReviews,
      averageRating: s6.averageRating,
      ratingDistribution: s6.ratingDistribution,
    });

    if (s6.averageRating !== 1.0 || s6.totalReviews !== 1) {
      throw new Error('Stats did not recalculate correctly after soft delete');
    }
    if (s6.ratingDistribution.fiveStar !== 0 || s6.ratingDistribution.oneStar !== 1) {
      throw new Error('Distribution counts incorrect after soft delete');
    }
    console.log('🟢 [PASS] Soft deletion recalculates statistics correctly.');

    // ----------------------------------------------------
    // TEST 7: Status Exclusion (Exclude non-published reviews)
    // ----------------------------------------------------
    console.log('\n👉 Test 7: Verifying non-published reviews are excluded...');
    // Seed a Pending review
    const pendingReview = new SellerReview({
      customerId: buyer2Id,
      sellerId: sellerAUserId,
      orderId: new mongoose.Types.ObjectId(),
      rating: 5,
      comment: 'Pending feedback',
      status: 'Pending',
    });
    await pendingReview.save();

    await recalculateSellerRating(sellerAUserId);

    const s7 = await Seller.findById(sellerADocId);
    console.log('Seller A Stats (with Pending review):', {
      rating: s7.rating,
      totalReviews: s7.totalReviews,
      averageRating: s7.averageRating,
      ratingDistribution: s7.ratingDistribution,
    });

    if (s7.averageRating !== 1.0 || s7.totalReviews !== 1) {
      throw new Error('Pending review was incorrectly included in aggregation');
    }

    await SellerReview.findByIdAndDelete(pendingReview._id);
    console.log('🟢 [PASS] Pending reviews are correctly excluded.');

    // ----------------------------------------------------
    // TEST 8: Seller Isolation
    // ----------------------------------------------------
    console.log('\n👉 Test 8: Verifying seller isolation...');
    // Seed a 5-star review for Seller B
    const rB = await sellerReviewService.createReview({
      customerId: buyerId,
      sellerId: sellerBUserId,
      orderId: orderBId,
      rating: 5,
      comment: 'Seller B is gold!',
    });
    reviewBId = rB.id;

    const sB = await Seller.findById(sellerBDocId);
    const sA = await Seller.findById(sellerADocId);

    console.log('Seller B Stats:', {
      rating: sB.rating,
      totalReviews: sB.totalReviews,
    });
    console.log('Seller A Stats:', {
      rating: sA.rating,
      totalReviews: sA.totalReviews,
    });

    if (sB.averageRating !== 5 || sB.totalReviews !== 1) {
      throw new Error('Seller B stats did not update correctly');
    }
    if (sA.averageRating !== 1.0 || sA.totalReviews !== 1) {
      throw new Error('Seller A stats were affected by Seller B review!');
    }
    console.log('🟢 [PASS] Sellers are isolated and do not conflict.');

    // Clean up buyer2
    await User.findByIdAndDelete(buyer2Id);
    await SellerReview.findByIdAndDelete(review2Id);

  } finally {
    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test database documents...');
    await User.findByIdAndDelete(buyerId);
    await User.findByIdAndDelete(sellerAUserId);
    await User.findByIdAndDelete(sellerBUserId);
    await Seller.findByIdAndDelete(sellerADocId);
    await Seller.findByIdAndDelete(sellerBDocId);
    await Order.findByIdAndDelete(orderAId);
    await Order.findByIdAndDelete(orderBId);
    if (review1Id) await SellerReview.findByIdAndDelete(review1Id);
    if (reviewBId) await SellerReview.findByIdAndDelete(reviewBId);
    console.log('✅ Cleanup finished.');
  }

  await mongoose.connection.close();
  console.log('\n🎉 ALL SELLER RATING AGGREGATION TESTS PASSED SUCCESSFULLY!');
};

runTests().catch((err) => {
  console.error('\n🔴 Fatal Test Error:', err);
  mongoose.connection.close();
});
