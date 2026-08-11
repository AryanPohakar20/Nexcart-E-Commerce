import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import ProductReview from './src/models/ProductReview.js';
import SellerReview from './src/models/SellerReview.js';
import ReviewReport from './src/models/ReviewReport.js';
import * as reviewReportService from './src/services/reviewReportService.js';
import { generateAccessToken } from './src/utils/generateTokens.js';
import app from './src/app.js';

const runTests = async () => {
  console.log('🚀 Connecting to MongoDB...');
  await connectDB();

  // Test ObjectIds
  const buyerId = new mongoose.Types.ObjectId();
  const authorId = new mongoose.Types.ObjectId();
  const sellerUserId = new mongoose.Types.ObjectId();
  const sellerDocId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const orderId = new mongoose.Types.ObjectId();
  
  const eligibleProductReviewId = new mongoose.Types.ObjectId();
  const eligibleSellerReviewId = new mongoose.Types.ObjectId();
  const hiddenReviewId = new mongoose.Types.ObjectId();
  const removedReviewId = new mongoose.Types.ObjectId();
  const softDeletedReviewId = new mongoose.Types.ObjectId();

  const reportIds = [];

  console.log('📦 Seeding test database documents...');

  // Create Mock Reporter (Buyer)
  const buyerUser = new User({
    _id: buyerId,
    firstName: 'John',
    lastName: 'Doe',
    username: `john_report_buyer_rules_${Date.now()}`,
    email: `john_report_buyer_rules_${Date.now()}@example.com`,
    role: 'customer',
    provider: 'email',
    isVerified: true,
    phone: '1234567890',
    password: 'password123',
  });
  await buyerUser.save();

  // Create Mock Author (Other Customer User who wrote reviews)
  const authorUser = new User({
    _id: authorId,
    firstName: 'Author',
    lastName: 'Reviewer',
    username: `author_user_${Date.now()}`,
    email: `author_user_${Date.now()}@example.com`,
    role: 'customer',
    provider: 'email',
    isVerified: true,
    phone: '1111222233',
    password: 'password123',
  });
  await authorUser.save();

  // Create Mock Seller User
  const sellerUser = new User({
    _id: sellerUserId,
    firstName: 'Jane',
    lastName: 'Store',
    username: `jane_report_seller_rules_${Date.now()}`,
    email: `jane_report_seller_rules_${Date.now()}@example.com`,
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

  // Seed Product Review (Published, eligible)
  const eligibleProductReview = new ProductReview({
    _id: eligibleProductReviewId,
    productId,
    sellerId: sellerUserId,
    customerId: authorId,
    orderId,
    orderItemId: new mongoose.Types.ObjectId(),
    rating: 5,
    comment: 'Excellent product!',
    status: 'Published',
  });
  await eligibleProductReview.save();

  // Seed Seller Review (Published, eligible)
  const eligibleSellerReview = new SellerReview({
    _id: eligibleSellerReviewId,
    sellerId: sellerUserId,
    customerId: authorId,
    orderId,
    rating: 4,
    comment: 'Great merchant.',
    status: 'Published',
  });
  await eligibleSellerReview.save();

  // Seed Hidden Review (status = 'Hidden', NOT eligible)
  const hiddenReview = new ProductReview({
    _id: hiddenReviewId,
    productId,
    sellerId: sellerUserId,
    customerId: authorId,
    orderId,
    orderItemId: new mongoose.Types.ObjectId(),
    rating: 3,
    comment: 'Off-topic review.',
    status: 'Hidden',
  });
  await hiddenReview.save();

  // Seed Removed Review (status = 'Removed', NOT eligible)
  const removedReview = new SellerReview({
    _id: removedReviewId,
    sellerId: sellerUserId,
    customerId: authorId,
    orderId,
    rating: 1,
    comment: 'Violating comment.',
    status: 'Removed',
  });
  await removedReview.save();

  // Seed Soft-deleted Review (isDeleted = true, NOT eligible)
  const softDeletedReview = new ProductReview({
    _id: softDeletedReviewId,
    productId,
    sellerId: sellerUserId,
    customerId: authorId,
    orderId,
    orderItemId: new mongoose.Types.ObjectId(),
    rating: 2,
    comment: 'Deleted review.',
    status: 'Published',
    isDeleted: true,
    deletedAt: new Date(),
  });
  await softDeletedReview.save();

  // Start test server
  const testServer = app.listen(5001, () => {
    console.log('⚡ Test server listening on port 5001');
  });

  const tokenBuyer = generateAccessToken(buyerUser);
  const tokenAuthor = generateAccessToken(authorUser);

  console.log('\n✅ Mock data seeded. Running validation & abuse prevention tests...\n');

  try {
    // ----------------------------------------------------
    // TEST 1: Legitimate Report succeeds
    // ----------------------------------------------------
    console.log('👉 Test 1: Reporting another customer\'s published review (should succeed)...');
    const res1 = await fetch(`http://localhost:5001/api/reviews/${eligibleProductReviewId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenBuyer}`,
      },
      body: JSON.stringify({ reason: 'Spam' }),
    });

    const body1 = await res1.json();
    console.log('Test 1 Response:', body1);
    if (res1.status !== 201) {
      throw new Error(`Expected status 201, got ${res1.status}`);
    }
    reportIds.push(body1.data.report._id);
    console.log('🟢 [PASS] Legitimate review report succeeded.');

    // ----------------------------------------------------
    // TEST 2: Reject Self-Reporting
    // ----------------------------------------------------
    console.log('\n👉 Test 2: Attempting to self-report own review (should fail with 400)...');
    const res2 = await fetch(`http://localhost:5001/api/reviews/${eligibleProductReviewId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAuthor}`, // Author tries to report their own review
      },
      body: JSON.stringify({ reason: 'Spam' }),
    });

    const body2 = await res2.json();
    console.log('Test 2 Response:', body2);
    if (res2.status !== 400 || body2.message !== 'You cannot report your own review.') {
      throw new Error(`Expected status 400 with self-report message, got ${res2.status}`);
    }
    console.log('🟢 [PASS] Self-report attempt blocked with 400.');

    // ----------------------------------------------------
    // TEST 3: Reject Duplicate Reporting
    // ----------------------------------------------------
    console.log('\n👉 Test 3: Attempting to submit duplicate report (should fail with 400)...');
    const res3 = await fetch(`http://localhost:5001/api/reviews/${eligibleProductReviewId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenBuyer}`, // Buyer already reported in Test 1
      },
      body: JSON.stringify({ reason: 'Spam' }),
    });

    const body3 = await res3.json();
    console.log('Test 3 Response:', body3);
    if (res3.status !== 400 || body3.message !== 'You have already reported this review.') {
      throw new Error(`Expected status 400 with duplicate report message, got ${res3.status}`);
    }
    console.log('🟢 [PASS] Service-level duplicate check blocked attempt with 400.');

    // ----------------------------------------------------
    // TEST 4: Reject Reporting Hidden Review
    // ----------------------------------------------------
    console.log('\n👉 Test 4: Attempting to report a Hidden review (should fail with 400)...');
    const res4 = await fetch(`http://localhost:5001/api/reviews/${hiddenReviewId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenBuyer}`,
      },
      body: JSON.stringify({ reason: 'Spam' }),
    });

    const body4 = await res4.json();
    console.log('Test 4 Response:', body4);
    if (res4.status !== 400 || body4.message !== 'Only published reviews can be reported.') {
      throw new Error(`Expected status 400 with reportability message, got ${res4.status}`);
    }
    console.log('🟢 [PASS] Reporting hidden review blocked with 400.');

    // ----------------------------------------------------
    // TEST 5: Reject Reporting Removed Review
    // ----------------------------------------------------
    console.log('\n👉 Test 5: Attempting to report a Removed review (should fail with 400)...');
    const res5 = await fetch(`http://localhost:5001/api/seller-reviews/${removedReviewId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenBuyer}`,
      },
      body: JSON.stringify({ reason: 'Spam' }),
    });

    const body5 = await res5.json();
    console.log('Test 5 Response:', body5);
    if (res5.status !== 400 || body5.message !== 'Only published reviews can be reported.') {
      throw new Error(`Expected status 400 with reportability message, got ${res5.status}`);
    }
    console.log('🟢 [PASS] Reporting removed review blocked with 400.');

    // ----------------------------------------------------
    // TEST 6: Reject Reporting Soft-deleted Review
    // ----------------------------------------------------
    console.log('\n👉 Test 6: Attempting to report a soft-deleted review (should fail with 404)...');
    const res6 = await fetch(`http://localhost:5001/api/reviews/${softDeletedReviewId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenBuyer}`,
      },
      body: JSON.stringify({ reason: 'Spam' }),
    });

    const body6 = await res6.json();
    console.log('Test 6 Response:', body6);
    if (res6.status !== 404) {
      throw new Error(`Expected status 404, got ${res6.status}`);
    }
    console.log('🟢 [PASS] Reporting soft-deleted review blocked with 404.');

    // ----------------------------------------------------
    // TEST 7: Concurrency & Database-Level Uniqueness Block
    // ----------------------------------------------------
    console.log('\n👉 Test 7: Simulating concurrent reports to verify database-level constraint safety...');
    // We will bypass duplicate checking by directly inserting into database or executing concurrent service calls
    const buyer2Id = new mongoose.Types.ObjectId();
    const buyer2 = new User({
      _id: buyer2Id,
      firstName: 'Buyer2',
      lastName: 'Reporter',
      username: `buyer2_user_${Date.now()}`,
      email: `buyer2_user_${Date.now()}@example.com`,
      role: 'customer',
      provider: 'email',
      isVerified: true,
      phone: '3333444455',
      password: 'password123',
    });
    await buyer2.save();

    // Call service concurrently (Promise.all)
    let errCaught = null;
    try {
      await Promise.all([
        reviewReportService.createReviewReport(buyer2Id.toString(), eligibleSellerReviewId.toString(), 'SELLER', { reason: 'Spam' }),
        reviewReportService.createReviewReport(buyer2Id.toString(), eligibleSellerReviewId.toString(), 'SELLER', { reason: 'Spam' })
      ]);
    } catch (err) {
      errCaught = err;
    }

    console.log('Concurrency test error thrown:', errCaught?.message, '(Code:', errCaught?.statusCode, ')');
    if (!errCaught || errCaught.statusCode !== 400 || errCaught.message !== 'You have already reported this review.') {
      throw new Error('Concurrency test did not successfully block and handle duplicate reporting key violation');
    }

    // Double check that only 1 report exists in DB for buyer2 + eligibleSellerReviewId
    const dbReports = await ReviewReport.find({ reportedBy: buyer2Id, reviewId: eligibleSellerReviewId });
    console.log('Database reports count for concurrent buyer:', dbReports.length);
    if (dbReports.length !== 1) {
      throw new Error(`Expected exactly 1 report stored, found ${dbReports.length}`);
    }
    reportIds.push(dbReports[0]._id);
    await User.findByIdAndDelete(buyer2Id);
    console.log('🟢 [PASS] Concurrency block and duplicate key resolution verified.');

  } finally {
    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test database documents...');
    testServer.close();

    await User.findByIdAndDelete(buyerId);
    await User.findByIdAndDelete(authorId);
    await User.findByIdAndDelete(sellerUserId);
    await Seller.findByIdAndDelete(sellerDocId);
    await ProductReview.findByIdAndDelete(eligibleProductReviewId);
    await ProductReview.findByIdAndDelete(hiddenReviewId);
    await ProductReview.findByIdAndDelete(softDeletedReviewId);
    await SellerReview.findByIdAndDelete(eligibleSellerReviewId);
    await SellerReview.findByIdAndDelete(removedReviewId);

    for (const id of reportIds) {
      await ReviewReport.findByIdAndDelete(id);
    }
    console.log('✅ Cleanup finished.');
  }

  await mongoose.connection.close();
  console.log('\n🎉 ALL REVIEWS REPORTING VALIDATION & ABUSE PREVENTION TESTS PASSED SUCCESSFULLY!');
};

runTests().catch((err) => {
  console.error('\n🔴 Fatal Test Error:', err);
  mongoose.connection.close();
});
