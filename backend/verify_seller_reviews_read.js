import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import SellerReview from './src/models/SellerReview.js';
import * as sellerReviewService from './src/services/sellerReviewService.js';

const runTests = async () => {
  console.log('🚀 Connecting to MongoDB...');
  await connectDB();

  // Test ObjectIds
  const buyerId = new mongoose.Types.ObjectId();
  const sellerUserId = new mongoose.Types.ObjectId();
  const sellerDocId = new mongoose.Types.ObjectId();

  console.log('📦 Seeding test database documents...');

  // Create Mock Buyer
  const buyerUser = new User({
    _id: buyerId,
    firstName: 'John',
    lastName: 'Doe',
    username: `john_read_buyer_${Date.now()}`,
    email: `john_read_buyer_${Date.now()}@example.com`,
    role: 'customer',
    provider: 'email',
    isVerified: true,
    phone: '1234567890',
    password: 'password123',
    avatar: 'http://example.com/johndoe_avatar.jpg',
  });
  await buyerUser.save();

  // Create Mock Seller User
  const sellerUser = new User({
    _id: sellerUserId,
    firstName: 'Jane',
    lastName: 'Store',
    username: `jane_read_user_${Date.now()}`,
    email: `jane_read_user_${Date.now()}@example.com`,
    role: 'seller',
    provider: 'email',
    isVerified: true,
    phone: '0987654321',
    password: 'password123',
  });
  await sellerUser.save();

  // Create Seller Document
  const sellerDoc = new Seller({
    _id: sellerDocId,
    userId: sellerUserId,
    sellerType: 'individual',
    status: 'Approved',
    isActive: true,
  });
  await sellerDoc.save();

  const now = new Date();

  // Seed multiple reviews
  const reviewIds = [];

  // Helper to construct reviews with different created times
  const seedReview = async (data) => {
    const review = new SellerReview({
      customerId: buyerId,
      sellerId: sellerUserId,
      orderId: new mongoose.Types.ObjectId(),
      ...data,
    });
    await review.save();
    reviewIds.push(review._id);
  };

  // Review 1: rating 5, Published, created 10 days ago
  await seedReview({
    rating: 5,
    comment: 'Excellent 10 days ago',
    status: 'Published',
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
  });

  // Review 2: rating 3, Published, created 5 days ago
  await seedReview({
    rating: 3,
    comment: 'Decent 5 days ago',
    status: 'Published',
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
  });

  // Review 3: rating 1, Published, created 1 day ago
  await seedReview({
    rating: 1,
    comment: 'Bad 1 day ago',
    status: 'Published',
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  });

  // Review 4: rating 5, Pending (Exclude)
  await seedReview({
    rating: 5,
    comment: 'Pending review',
    status: 'Pending',
    createdAt: now,
  });

  // Review 5: rating 5, Published, soft-deleted (Exclude)
  await seedReview({
    rating: 5,
    comment: 'Deleted review',
    status: 'Published',
    isDeleted: true,
    deletedAt: now,
    createdAt: now,
  });

  // Review 6: rating 5, Hidden (Exclude)
  await seedReview({
    rating: 5,
    comment: 'Hidden review',
    status: 'Hidden',
    createdAt: now,
  });

  // Review 7: rating 5, Reported (Exclude)
  await seedReview({
    rating: 5,
    comment: 'Reported review',
    status: 'Reported',
    createdAt: now,
  });

  // Review 8: rating 5, Removed (Exclude)
  await seedReview({
    rating: 5,
    comment: 'Removed review',
    status: 'Removed',
    createdAt: now,
  });

  console.log('✅ Mock data seeded. Initiating Seller Review read tests...\n');

  try {
    // ----------------------------------------------------
    // TEST 1: Retrieve reviews for seller with no reviews
    // ----------------------------------------------------
    console.log('👉 Test 1: Retrieving reviews for a seller with no reviews...');
    const emptySellerId = new mongoose.Types.ObjectId();
    const res1 = await sellerReviewService.getSellerReviews(emptySellerId.toString());

    if (res1.reviews.length !== 0 || res1.pagination.total !== 0) {
      throw new Error('Expected empty reviews array and 0 total reviews');
    }
    console.log('🟢 [PASS] Empty reviews returned correctly.');

    // ----------------------------------------------------
    // TEST 2: Default retrieval (page 1, limit 10, newest)
    // ----------------------------------------------------
    console.log('\n👉 Test 2: Retrieving default page (excluding pending/deleted/reported)...');
    const res2 = await sellerReviewService.getSellerReviews(sellerUserId.toString());
    console.log('Default retrieval results count:', res2.reviews.length);

    if (res2.reviews.length !== 3) {
      throw new Error(`Expected exactly 3 public reviews, got ${res2.reviews.length}`);
    }
    if (res2.pagination.total !== 3 || res2.pagination.totalPages !== 1) {
      throw new Error('Default pagination metadata incorrect');
    }
    console.log('🟢 [PASS] Default retrieval filters work perfectly.');

    // ----------------------------------------------------
    // TEST 3: Pagination constraints (limit 2)
    // ----------------------------------------------------
    console.log('\n👉 Test 3: Pagination checks (limit = 2)...');
    const res3 = await sellerReviewService.getSellerReviews(sellerUserId.toString(), { limit: 2 });

    if (res3.reviews.length !== 2) {
      throw new Error(`Expected limit of 2 reviews, got ${res3.reviews.length}`);
    }
    if (res3.pagination.totalPages !== 2 || !res3.pagination.hasNextPage || res3.pagination.hasPreviousPage) {
      throw new Error('Page 1 pagination metadata incorrect under limit 2');
    }

    // Check page 2
    const res3Page2 = await sellerReviewService.getSellerReviews(sellerUserId.toString(), { limit: 2, page: 2 });
    if (res3Page2.reviews.length !== 1) {
      throw new Error(`Expected 1 review on page 2, got ${res3Page2.reviews.length}`);
    }
    if (res3Page2.pagination.hasNextPage || !res3Page2.pagination.hasPreviousPage) {
      throw new Error('Page 2 pagination metadata incorrect under limit 2');
    }
    console.log('🟢 [PASS] Pagination limit and offsets work correctly.');

    // ----------------------------------------------------
    // TEST 4: Sorting by Newest
    // ----------------------------------------------------
    console.log('\n👉 Test 4: Sorting by newest...');
    const res4 = await sellerReviewService.getSellerReviews(sellerUserId.toString(), { sort: 'newest' });
    console.log('Newest Order (Comments):', res4.reviews.map(r => r.comment));

    if (res4.reviews[0].comment !== 'Bad 1 day ago' || res4.reviews[2].comment !== 'Excellent 10 days ago') {
      throw new Error('Sorting by newest failed');
    }
    console.log('🟢 [PASS] Sorting by newest works.');

    // ----------------------------------------------------
    // TEST 5: Sorting by Highest rating
    // ----------------------------------------------------
    console.log('\n👉 Test 5: Sorting by highest rating...');
    const res5 = await sellerReviewService.getSellerReviews(sellerUserId.toString(), { sort: 'highest' });
    console.log('Highest Order (Ratings):', res5.reviews.map(r => r.rating));

    if (res5.reviews[0].rating !== 5 || res5.reviews[2].rating !== 1) {
      throw new Error('Sorting by highest rating failed');
    }
    console.log('🟢 [PASS] Sorting by highest works.');

    // ----------------------------------------------------
    // TEST 6: Sorting by Lowest rating
    // ----------------------------------------------------
    console.log('\n👉 Test 6: Sorting by lowest rating...');
    const res6 = await sellerReviewService.getSellerReviews(sellerUserId.toString(), { sort: 'lowest' });
    console.log('Lowest Order (Ratings):', res6.reviews.map(r => r.rating));

    if (res6.reviews[0].rating !== 1 || res6.reviews[2].rating !== 5) {
      throw new Error('Sorting by lowest rating failed');
    }
    console.log('🟢 [PASS] Sorting by lowest works.');

    // ----------------------------------------------------
    // TEST 7: Filtering by Rating (5 Stars)
    // ----------------------------------------------------
    console.log('\n👉 Test 7: Filtering by rating (5 stars)...');
    const res7 = await sellerReviewService.getSellerReviews(sellerUserId.toString(), { rating: 5 });

    if (res7.reviews.length !== 1 || res7.reviews[0].rating !== 5) {
      throw new Error('Rating filter for 5 stars failed');
    }
    console.log('🟢 [PASS] Rating filter (5 stars) works.');

    // ----------------------------------------------------
    // TEST 8: Security and DTO fields
    // ----------------------------------------------------
    console.log('\n👉 Test 8: Verifying DTO fields and security properties...');
    const checkDto = res2.reviews[0];

    const expectedKeys = ['id', 'reviewerName', 'reviewerProfileImage', 'rating', 'comment', 'images', 'createdAt', 'updatedAt'];
    const forbiddenKeys = ['customerId', 'sellerId', 'orderId', 'isDeleted', 'deletedAt', 'email', 'phone', 'password', '__v'];

    expectedKeys.forEach(k => {
      if (checkDto[k] === undefined) throw new Error(`DTO is missing key: ${k}`);
    });
    forbiddenKeys.forEach(k => {
      if (checkDto[k] !== undefined) throw new Error(`Security breach: DTO leaks internal key: ${k}`);
    });

    if (checkDto.reviewerName !== 'John Doe' || checkDto.reviewerProfileImage !== 'http://example.com/johndoe_avatar.jpg') {
      throw new Error('Reviewer mapping on read DTO failed');
    }
    console.log('🟢 [PASS] Security properties and DTO filters conform to specifications.');

  } finally {
    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test database documents...');
    await User.findByIdAndDelete(buyerId);
    await User.findByIdAndDelete(sellerUserId);
    await Seller.findByIdAndDelete(sellerDocId);
    for (const id of reviewIds) {
      await SellerReview.findByIdAndDelete(id);
    }
    console.log('✅ Cleanup finished.');
  }

  await mongoose.connection.close();
  console.log('\n🎉 ALL SELLER REVIEW READ TESTS PASSED SUCCESSFULLY!');
};

runTests().catch((err) => {
  console.error('\n🔴 Fatal Test Error:', err);
  mongoose.connection.close();
});
