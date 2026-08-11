import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import ProductReview from './src/models/ProductReview.js';
import SellerReview from './src/models/SellerReview.js';
import ReviewReport from './src/models/ReviewReport.js';
import { generateAccessToken } from './src/utils/generateTokens.js';
import app from './src/app.js';

const runTests = async () => {
  console.log('🚀 Connecting to MongoDB...');
  await connectDB();

  // Test ObjectIds
  const buyerId = new mongoose.Types.ObjectId();
  const sellerUserId = new mongoose.Types.ObjectId();
  const sellerDocId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const orderId = new mongoose.Types.ObjectId();
  
  const productReviewId = new mongoose.Types.ObjectId();
  const sellerReviewId = new mongoose.Types.ObjectId();
  const softDeletedReviewId = new mongoose.Types.ObjectId();
  const removedReviewId = new mongoose.Types.ObjectId();

  const reportIds = [];

  console.log('📦 Seeding test database documents...');

  // Create Mock Buyer
  const buyerUser = new User({
    _id: buyerId,
    firstName: 'John',
    lastName: 'Doe',
    username: `john_report_buyer_${Date.now()}`,
    email: `john_report_buyer_${Date.now()}@example.com`,
    role: 'customer',
    provider: 'email',
    isVerified: true,
    phone: '1234567890',
    password: 'password123',
  });
  await buyerUser.save();

  // Create Mock Seller User
  const sellerUser = new User({
    _id: sellerUserId,
    firstName: 'Jane',
    lastName: 'Store',
    username: `jane_report_seller_${Date.now()}`,
    email: `jane_report_seller_${Date.now()}@example.com`,
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
  const productReview = new ProductReview({
    _id: productReviewId,
    productId,
    sellerId: sellerUserId,
    customerId: buyerId,
    orderId,
    orderItemId: new mongoose.Types.ObjectId(),
    rating: 5,
    comment: 'Excellent product!',
    status: 'Published',
  });
  await productReview.save();

  // Seed Seller Review (Published, eligible)
  const sellerReview = new SellerReview({
    _id: sellerReviewId,
    sellerId: sellerUserId,
    customerId: buyerId,
    orderId,
    rating: 4,
    comment: 'Great merchant.',
    status: 'Published',
  });
  await sellerReview.save();

  // Seed Soft-deleted Review (isDeleted = true, NOT eligible)
  const softDeletedReview = new ProductReview({
    _id: softDeletedReviewId,
    productId,
    sellerId: sellerUserId,
    customerId: buyerId,
    orderId,
    orderItemId: new mongoose.Types.ObjectId(),
    rating: 2,
    comment: 'Deleted review.',
    status: 'Published',
    isDeleted: true,
    deletedAt: new Date(),
  });
  await softDeletedReview.save();

  // Seed Removed Review (status = 'Removed', NOT eligible)
  const removedReview = new SellerReview({
    _id: removedReviewId,
    sellerId: sellerUserId,
    customerId: buyerId,
    orderId,
    rating: 1,
    comment: 'Violating comment.',
    status: 'Removed',
  });
  await removedReview.save();

  // Generate valid Bearer Token for authorization
  const token = generateAccessToken(buyerUser);

  // Start test server
  const testServer = app.listen(5001, () => {
    console.log('⚡ Test server listening on port 5001');
  });

  console.log('\n✅ Mock data seeded. Running reporting API tests...\n');

  try {
    // ----------------------------------------------------
    // TEST 1: Report Product Review successfully
    // ----------------------------------------------------
    console.log('👉 Test 1: Reporting a valid product review...');
    const res1 = await fetch(`http://localhost:5001/api/reviews/${productReviewId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reason: 'Spam',
        description: 'This is advertising links spam',
      }),
    });

    const body1 = await res1.json();
    console.log('Test 1 Response:', body1);

    if (res1.status !== 201 || !body1.success) {
      throw new Error(`Expected status 201, got ${res1.status}`);
    }
    const reportId1 = body1.data.report._id;
    reportIds.push(reportId1);

    // Verify DB
    const dbReport1 = await ReviewReport.findById(reportId1);
    if (!dbReport1 || dbReport1.reviewType !== 'PRODUCT' || dbReport1.reason !== 'Spam') {
      throw new Error('Report not persisted correctly in database');
    }
    console.log('🟢 [PASS] Product review report saved successfully.');

    // ----------------------------------------------------
    // TEST 2: Report Seller Review successfully
    // ----------------------------------------------------
    console.log('\n👉 Test 2: Reporting a valid seller review...');
    const res2 = await fetch(`http://localhost:5001/api/seller-reviews/${sellerReviewId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reason: 'Harassment',
        description: 'Personally offensive comments',
      }),
    });

    const body2 = await res2.json();
    console.log('Test 2 Response:', body2);

    if (res2.status !== 201 || !body2.success) {
      throw new Error(`Expected status 201, got ${res2.status}`);
    }
    const reportId2 = body2.data.report._id;
    reportIds.push(reportId2);

    // Verify DB
    const dbReport2 = await ReviewReport.findById(reportId2);
    if (!dbReport2 || dbReport2.reviewType !== 'SELLER' || dbReport2.reason !== 'Harassment') {
      throw new Error('Report not persisted correctly in database');
    }
    console.log('🟢 [PASS] Seller review report saved successfully.');

    // ----------------------------------------------------
    // TEST 3: Invalid reviewId format (should throw 400)
    // ----------------------------------------------------
    console.log('\n👉 Test 3: Reporting with invalid reviewId format (should throw 400)...');
    const res3 = await fetch('http://localhost:5001/api/reviews/invalid_mongo_id/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason: 'Spam' }),
    });

    const body3 = await res3.json();
    console.log('Test 3 Response:', body3);
    if (res3.status !== 400) {
      throw new Error(`Expected status 400, got ${res3.status}`);
    }
    console.log('🟢 [PASS] Invalid reviewId format rejected with 400.');

    // ----------------------------------------------------
    // TEST 4: Unknown review ID (should throw 404)
    // ----------------------------------------------------
    console.log('\n👉 Test 4: Reporting an unknown review ID (should throw 404)...');
    const unknownId = new mongoose.Types.ObjectId();
    const res4 = await fetch(`http://localhost:5001/api/reviews/${unknownId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason: 'Spam' }),
    });

    const body4 = await res4.json();
    console.log('Test 4 Response:', body4);
    if (res4.status !== 404) {
      throw new Error(`Expected status 404, got ${res4.status}`);
    }
    console.log('🟢 [PASS] Unknown review ID rejected with 404.');

    // ----------------------------------------------------
    // TEST 5: Soft-deleted review (should throw 404)
    // ----------------------------------------------------
    console.log('\n👉 Test 5: Reporting a soft-deleted review (should throw 404)...');
    const res5 = await fetch(`http://localhost:5001/api/reviews/${softDeletedReviewId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason: 'Spam' }),
    });

    const body5 = await res5.json();
    console.log('Test 5 Response:', body5);
    if (res5.status !== 404) {
      throw new Error(`Expected status 404, got ${res5.status}`);
    }
    console.log('🟢 [PASS] Soft-deleted review rejected with 404.');

    // ----------------------------------------------------
    // TEST 6: Moderated / Removed review (should throw 404)
    // ----------------------------------------------------
    console.log('\n👉 Test 6: Reporting a review already removed by moderation (should throw 404)...');
    const res6 = await fetch(`http://localhost:5001/api/seller-reviews/${removedReviewId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason: 'Spam' }),
    });

    const body6 = await res6.json();
    console.log('Test 6 Response:', body6);
    if (res6.status !== 404) {
      throw new Error(`Expected status 404, got ${res6.status}`);
    }
    console.log('🟢 [PASS] Moderated/removed review rejected with 404.');

    // ----------------------------------------------------
    // TEST 7: Invalid Report Reason (should throw 400)
    // ----------------------------------------------------
    console.log('\n👉 Test 7: Reporting with an invalid reason category (should throw 400)...');
    const res7 = await fetch(`http://localhost:5001/api/reviews/${productReviewId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason: 'InvalidReason' }),
    });

    const body7 = await res7.json();
    console.log('Test 7 Response:', body7);
    if (res7.status !== 400) {
      throw new Error(`Expected status 400, got ${res7.status}`);
    }
    console.log('🟢 [PASS] Invalid report reason rejected with 400.');

    // ----------------------------------------------------
    // TEST 8: Unauthenticated Request (should throw 401)
    // ----------------------------------------------------
    console.log('\n👉 Test 8: Sending request without authentication (should throw 401)...');
    const res8 = await fetch(`http://localhost:5001/api/reviews/${productReviewId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: 'Spam' }),
    });

    const body8 = await res8.json();
    console.log('Test 8 Response:', body8);
    if (res8.status !== 401) {
      throw new Error(`Expected status 401, got ${res8.status}`);
    }
    console.log('🟢 [PASS] Unauthenticated request blocked with 401.');

  } finally {
    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test database documents...');
    testServer.close();

    await User.findByIdAndDelete(buyerId);
    await User.findByIdAndDelete(sellerUserId);
    await Seller.findByIdAndDelete(sellerDocId);
    await ProductReview.findByIdAndDelete(productReviewId);
    await ProductReview.findByIdAndDelete(softDeletedReviewId);
    await SellerReview.findByIdAndDelete(sellerReviewId);
    await SellerReview.findByIdAndDelete(removedReviewId);

    for (const id of reportIds) {
      await ReviewReport.findByIdAndDelete(id);
    }
    console.log('✅ Cleanup finished.');
  }

  await mongoose.connection.close();
  console.log('\n🎉 ALL REVIEWS REPORTING TESTS PASSED SUCCESSFULLY!');
};

runTests().catch((err) => {
  console.error('\n🔴 Fatal Test Error:', err);
  mongoose.connection.close();
});
