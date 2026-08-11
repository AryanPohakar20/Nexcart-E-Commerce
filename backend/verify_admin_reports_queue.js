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
  const adminId = new mongoose.Types.ObjectId();
  const customerId = new mongoose.Types.ObjectId();
  const reporterId = new mongoose.Types.ObjectId();
  const sellerUserId = new mongoose.Types.ObjectId();
  const sellerDocId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const orderId = new mongoose.Types.ObjectId();
  
  const productReviewId1 = new mongoose.Types.ObjectId();
  const productReviewId2 = new mongoose.Types.ObjectId();
  
  const sellerReviewId1 = new mongoose.Types.ObjectId();
  const sellerReviewId2 = new mongoose.Types.ObjectId();
  const sellerReviewId3 = new mongoose.Types.ObjectId();

  const reportIds = [];
  const reviewIds = [];

  console.log('🧹 Clearing pre-existing reports for test isolation...');
  await ReviewReport.deleteMany({});

  console.log('📦 Seeding test database documents...');

  // Create Mock Admin
  const adminUser = new User({
    _id: adminId,
    firstName: 'Admin',
    lastName: 'User',
    username: `admin_queue_${Date.now()}`,
    email: `admin_queue_${Date.now()}@example.com`,
    role: 'admin',
    provider: 'email',
    isVerified: true,
    phone: '1231231234',
    password: 'password123',
  });
  await adminUser.save();

  // Create Mock Customer
  const customerUser = new User({
    _id: customerId,
    firstName: 'Customer',
    lastName: 'User',
    username: `customer_queue_${Date.now()}`,
    email: `customer_queue_${Date.now()}@example.com`,
    role: 'customer',
    provider: 'email',
    isVerified: true,
    phone: '2223334444',
    password: 'password123',
  });
  await customerUser.save();

  // Create Mock Reporter
  const reporterUser = new User({
    _id: reporterId,
    firstName: 'Reporter',
    lastName: 'User',
    username: `reporter_queue_${Date.now()}`,
    email: `reporter_queue_${Date.now()}@example.com`,
    role: 'customer',
    provider: 'email',
    isVerified: true,
    phone: '5556667777',
    password: 'password123',
  });
  await reporterUser.save();

  // Create Mock Seller User
  const sellerUser = new User({
    _id: sellerUserId,
    firstName: 'Jane',
    lastName: 'Store',
    username: `jane_seller_queue_${Date.now()}`,
    email: `jane_seller_queue_${Date.now()}@example.com`,
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

  // Seed Product Reviews
  const pr1 = new ProductReview({ _id: productReviewId1, productId, sellerId: sellerUserId, customerId, orderId, orderItemId: new mongoose.Types.ObjectId(), rating: 5, comment: 'Excellent product 1!', status: 'Published' });
  await pr1.save();
  reviewIds.push(productReviewId1);

  const pr2 = new ProductReview({ _id: productReviewId2, productId, sellerId: sellerUserId, customerId, orderId, orderItemId: new mongoose.Types.ObjectId(), rating: 4, comment: 'Excellent product 2!', status: 'Published' });
  await pr2.save();
  reviewIds.push(productReviewId2);

  // Seed Seller Reviews
  const sr1 = new SellerReview({ _id: sellerReviewId1, sellerId: sellerUserId, customerId, orderId, rating: 4, comment: 'Great merchant 1.', status: 'Published' });
  await sr1.save();
  reviewIds.push(sellerReviewId1);

  const sr2 = new SellerReview({ _id: sellerReviewId2, sellerId: sellerUserId, customerId, orderId, rating: 3, comment: 'Great merchant 2.', status: 'Published' });
  await sr2.save();
  reviewIds.push(sellerReviewId2);

  const sr3 = new SellerReview({ _id: sellerReviewId3, sellerId: sellerUserId, customerId, orderId, rating: 2, comment: 'Great merchant 3.', status: 'Published' });
  await sr3.save();
  reviewIds.push(sellerReviewId3);

  // Seed 5 Reports (Delayed timestamps to control newest-first ordering)
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  console.log('Seeding report documents (this will take 1-2 seconds for distinct timestamps)...');
  
  // Report 1: Product Review 1, status = 'Pending', reason = 'Spam'
  const rep1 = new ReviewReport({ reviewId: productReviewId1, reviewType: 'PRODUCT', reportedBy: reporterId, reason: 'Spam', description: 'desc 1', status: 'Pending' });
  await rep1.save();
  reportIds.push(rep1._id);
  await wait(200);

  // Report 2: Product Review 2, status = 'UnderReview', reason = 'FakeReview'
  const rep2 = new ReviewReport({ reviewId: productReviewId2, reviewType: 'PRODUCT', reportedBy: reporterId, reason: 'FakeReview', description: 'desc 2', status: 'UnderReview' });
  await rep2.save();
  reportIds.push(rep2._id);
  await wait(200);

  // Report 3: Seller Review 1, status = 'Resolved', reason = 'Harassment'
  const rep3 = new ReviewReport({ reviewId: sellerReviewId1, reviewType: 'SELLER', reportedBy: reporterId, reason: 'Harassment', description: 'desc 3', status: 'Resolved' });
  await rep3.save();
  reportIds.push(rep3._id);
  await wait(200);

  // Report 4: Seller Review 2, status = 'Rejected', reason = 'OffensiveContent'
  const rep4 = new ReviewReport({ reviewId: sellerReviewId2, reviewType: 'SELLER', reportedBy: reporterId, reason: 'OffensiveContent', description: 'desc 4', status: 'Rejected' });
  await rep4.save();
  reportIds.push(rep4._id);
  await wait(200);

  // Report 5: Seller Review 3, status = 'Pending', reason = 'Other'
  const rep5 = new ReviewReport({ reviewId: sellerReviewId3, reviewType: 'SELLER', reportedBy: reporterId, reason: 'Other', description: 'desc 5', status: 'Pending' });
  await rep5.save();
  reportIds.push(rep5._id);

  // Start test server
  const testServer = app.listen(5001, () => {
    console.log('⚡ Test server listening on port 5001');
  });

  const tokenAdmin = generateAccessToken(adminUser);
  const tokenCustomer = generateAccessToken(customerUser);

  console.log('\n✅ Mock data seeded. Running admin queue API tests...\n');

  try {
    // ----------------------------------------------------
    // TEST 1: Empty queue with non-existent filters
    // ----------------------------------------------------
    console.log('👉 Test 1: Testing filtering where no reports match...');
    const res1 = await fetch('http://localhost:5001/api/admin/review-reports?reason=Other&status=Resolved', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });

    const body1 = await res1.json();
    console.log('Test 1 Response:', body1);
    if (res1.status !== 200 || body1.data.reports.length !== 0) {
      throw new Error('Expected 0 reports');
    }
    const pag1 = body1.data.pagination;
    if (pag1.total !== 0 || pag1.totalPages !== 0 || pag1.hasNextPage !== false || pag1.hasPreviousPage !== false) {
      throw new Error('Standard pagination metadata is incorrect for empty queue');
    }
    console.log('🟢 [PASS] Empty queue and standardized pagination metadata verified.');

    // ----------------------------------------------------
    // TEST 2: Retrieve full queue (newest first by default)
    // ----------------------------------------------------
    console.log('\n👉 Test 2: Retrieving full report queue (should be newest first by default)...');
    const res2 = await fetch('http://localhost:5001/api/admin/review-reports', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });

    const body2 = await res2.json();
    console.log('Total reports retrieved:', body2.data.reports.length);
    if (res2.status !== 200 || body2.data.reports.length !== 5) {
      throw new Error(`Expected 5 reports, got ${body2.data.reports.length}`);
    }

    // Verify ordering: newest first (Report 5 should be index 0)
    if (body2.data.reports[0].reportId !== rep5._id.toString()) {
      throw new Error('Sorting is not newest-first by default');
    }
    console.log('🟢 [PASS] Full queue retrieved and default newest-first ordering verified.');

    // ----------------------------------------------------
    // TEST 3: Pagination check
    // ----------------------------------------------------
    console.log('\n👉 Test 3: Verifying page and limit pagination offsets...');
    const res3 = await fetch('http://localhost:5001/api/admin/review-reports?page=2&limit=2', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });

    const body3 = await res3.json();
    console.log('Test 3 Response:', body3);
    if (res3.status !== 200 || body3.data.reports.length !== 2) {
      throw new Error(`Expected 2 reports for page 2, got ${body3.data.reports.length}`);
    }

    const pag3 = body3.data.pagination;
    if (pag3.page !== 2 || pag3.limit !== 2 || pag3.total !== 5 || pag3.totalPages !== 3 || pag3.hasNextPage !== true || pag3.hasPreviousPage !== true) {
      throw new Error('Standardized pagination metadata returned invalid parameters');
    }
    console.log('🟢 [PASS] Pagination limits, offsets, and metadata verified.');

    // ----------------------------------------------------
    // TEST 4: Filter by Status
    // ----------------------------------------------------
    console.log('\n👉 Test 4: Filtering reports by status (UnderReview)...');
    const res4 = await fetch('http://localhost:5001/api/admin/review-reports?status=UnderReview', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });

    const body4 = await res4.json();
    console.log('Filtered report status list:', body4.data.reports.map(r => `${r.reportReason}: ${r.status}`));
    if (res4.status !== 200 || body4.data.reports.length !== 1 || body4.data.reports[0].status !== 'UnderReview') {
      throw new Error('Status filtering failed');
    }
    console.log('🟢 [PASS] Status filtering verified.');

    // ----------------------------------------------------
    // TEST 5: Filter by Review Type
    // ----------------------------------------------------
    console.log('\n👉 Test 5: Filtering reports by reviewType (SELLER)...');
    const res5 = await fetch('http://localhost:5001/api/admin/review-reports?reviewType=SELLER', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });

    const body5 = await res5.json();
    console.log('Filtered reviewType count:', body5.data.reports.length);
    if (res5.status !== 200 || body5.data.reports.length !== 3) {
      throw new Error('ReviewType filtering failed');
    }
    body5.data.reports.forEach(r => {
      if (r.reviewType !== 'SELLER') throw new Error('Incorrect reviewType in filtered response');
    });
    console.log('🟢 [PASS] ReviewType filtering verified.');

    // ----------------------------------------------------
    // TEST 6: Filter by Reason
    // ----------------------------------------------------
    console.log('\n👉 Test 6: Filtering reports by reason (Harassment)...');
    const res6 = await fetch('http://localhost:5001/api/admin/review-reports?reason=Harassment', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });

    const body6 = await res6.json();
    console.log('Filtered reason count:', body6.data.reports.length);
    if (res6.status !== 200 || body6.data.reports.length !== 1 || body6.data.reports[0].reportReason !== 'Harassment') {
      throw new Error('Reason filtering failed');
    }
    console.log('🟢 [PASS] Reason filtering verified.');

    // ----------------------------------------------------
    // TEST 7: Retrieve single report details
    // ----------------------------------------------------
    console.log('\n👉 Test 7: Retrieving full report details (should map author details and shield PII)...');
    const res7 = await fetch(`http://localhost:5001/api/admin/review-reports/${rep1._id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });

    const body7 = await res7.json();
    console.log('Enriched Report details DTO:', body7.data.report);

    if (res7.status !== 200 || !body7.success) {
      throw new Error(`Expected status 200, got ${res7.status}`);
    }

    const detail = body7.data.report;
    // Assert review fields populated
    if (detail.reviewRating !== 5 || detail.reviewComment !== 'Excellent product 1!') {
      throw new Error('Review details were not mapped correctly');
    }

    // Assert reporter details populated
    if (detail.reportedBy.username !== reporterUser.username) {
      throw new Error('Reporter details were not populated');
    }

    // Assert review author details populated
    if (detail.reviewAuthor.username !== customerUser.username) {
      throw new Error('Review author details were not populated');
    }

    // Security/PII check
    const piiFields = ['email', 'phone', 'password'];
    piiFields.forEach(f => {
      if (detail.reportedBy[f] !== undefined || detail.reviewAuthor[f] !== undefined) {
        throw new Error(`Security Violation: Sensitive PII field '${f}' leaked in admin DTO`);
      }
    });
    console.log('🟢 [PASS] Detail retrieval, bulk lookup, and PII protection verified.');

    // ----------------------------------------------------
    // TEST 8: Reject invalid ID format (should throw 400)
    // ----------------------------------------------------
    console.log('\n👉 Test 8: Requesting details with invalid ID format (should throw 400)...');
    const res8 = await fetch('http://localhost:5001/api/admin/review-reports/invalid_id', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });

    const body8 = await res8.json();
    console.log('Test 8 Response:', body8.message);
    if (res8.status !== 400) {
      throw new Error(`Expected status 400, got ${res8.status}`);
    }
    console.log('🟢 [PASS] Invalid report ID format rejected.');

    // ----------------------------------------------------
    // TEST 9: Reject unknown report ID (should throw 404)
    // ----------------------------------------------------
    console.log('\n👉 Test 9: Requesting details with unknown ID (should throw 404)...');
    const unknownReportId = new mongoose.Types.ObjectId();
    const res9 = await fetch(`http://localhost:5001/api/admin/review-reports/${unknownReportId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });

    const body9 = await res9.json();
    console.log('Test 9 Response:', body9.message);
    if (res9.status !== 404) {
      throw new Error(`Expected status 404, got ${res9.status}`);
    }
    console.log('🟢 [PASS] Unknown report ID rejected.');

    // ----------------------------------------------------
    // TEST 10: Reject unauthorized non-admin access (should throw 403)
    // ----------------------------------------------------
    console.log('\n👉 Test 10: Requesting admin queue as a standard customer (should fail with 403)...');
    const res10 = await fetch('http://localhost:5001/api/admin/review-reports', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenCustomer}` },
    });

    const body10 = await res10.json();
    console.log('Test 10 Response:', body10.message);
    if (res10.status !== 403) {
      throw new Error(`Expected status 403, got ${res10.status}`);
    }
    console.log('🟢 [PASS] Non-admin access blocked.');

    // ----------------------------------------------------
    // TEST 11: Reject unauthenticated access (should throw 401)
    // ----------------------------------------------------
    console.log('\n👉 Test 11: Requesting admin queue without headers (should fail with 401)...');
    const res11 = await fetch('http://localhost:5001/api/admin/review-reports', {
      method: 'GET',
    });

    const body11 = await res11.json();
    console.log('Test 11 Response:', body11.message);
    if (res11.status !== 401) {
      throw new Error(`Expected status 401, got ${res11.status}`);
    }
    console.log('🟢 [PASS] Unauthenticated access blocked.');

  } finally {
    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test database documents...');
    testServer.close();

    await User.findByIdAndDelete(adminId);
    await User.findByIdAndDelete(customerId);
    await User.findByIdAndDelete(reporterId);
    await User.findByIdAndDelete(sellerUserId);
    await Seller.findByIdAndDelete(sellerDocId);
    
    for (const rId of reviewIds) {
      await ProductReview.findByIdAndDelete(rId);
      await SellerReview.findByIdAndDelete(rId);
    }

    for (const id of reportIds) {
      await ReviewReport.findByIdAndDelete(id);
    }
    console.log('✅ Cleanup finished.');
  }

  await mongoose.connection.close();
  console.log('\n🎉 ALL ADMIN REVIEW REPORTS QUEUE TESTS PASSED SUCCESSFULLY!');
};

runTests().catch((err) => {
  console.error('\n🔴 Fatal Test Error:', err);
  mongoose.connection.close();
});
