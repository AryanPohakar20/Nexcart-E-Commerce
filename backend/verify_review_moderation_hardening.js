import mongoose from 'mongoose';
import request from 'supertest';
import app from './src/app.js';
import ProductReview from './src/models/ProductReview.js';
import SellerReview from './src/models/SellerReview.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import Product from './src/models/Product.js';
import ReviewReport from './src/models/ReviewReport.js';
import ReviewModerationLog from './src/models/ReviewModerationLog.js';

(async () => {
  try {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/nexcart-test', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to test DB');

    // Clean DB
    await User.deleteMany({});
    await ProductReview.deleteMany({});
    await SellerReview.deleteMany({});
    await ReviewReport.deleteMany({});
    await ReviewModerationLog.deleteMany({});
    await Product.deleteMany({});
    await Seller.deleteMany({});

    // Setup Users
    const admin = await User.create({ firstName: 'Admin', lastName: 'U', username: 'admin1', email: 'admin1@test.com', password: 'Pass123!', role: 'ADMIN', phone: '+11234567890' });
    const customer = await User.create({ firstName: 'Cust', lastName: 'U', username: 'cust1', email: 'cust1@test.com', password: 'Pass123!', role: 'CUSTOMER', phone: '+10987654321' });
    const reporter = await User.create({ firstName: 'Rep', lastName: 'U', username: 'rep1', email: 'rep1@test.com', password: 'Pass123!', role: 'CUSTOMER', phone: '+10987654322' });
    const sellerUser = await User.create({ firstName: 'Sell', lastName: 'U', username: 'sell1', email: 'sell1@test.com', password: 'Pass123!', role: 'SELLER', phone: '+10987654323' });
    
    // Auth tokens
    const adminToken = admin.generateJWT();
    const customerToken = customer.generateJWT();
    const reporterToken = reporter.generateJWT();

    // Setup Product & Seller
    const sellerProfile = await Seller.create({ userId: sellerUser._id, slug: 'test-seller', averageRating: 0, totalReviews: 0, trustScore: 0 });
    const product = await Product.create({
      title: 'Product A', slug: 'prod-a', description: 'Desc', brand: 'Brand', category: 'Cat', sellerId: sellerUser._id, price: 100, mrp: 120, stock: 10, images: [{ url: 'http://test.com/img.jpg', isPrimary: true }]
    });

    // Create Reviews
    const pReview = await ProductReview.create({ customerId: customer._id, sellerId: sellerUser._id, productId: product._id, orderId: new mongoose.Types.ObjectId(), orderItemId: new mongoose.Types.ObjectId(), rating: 5, status: 'Published' });
    const sReview = await SellerReview.create({ customerId: customer._id, sellerId: sellerUser._id, orderId: new mongoose.Types.ObjectId(), rating: 5, status: 'Published' });

    console.log('\n--- Test 1: Unauthorized & Non-Admin Request ---');
    const reportRes1 = await request(app).post(`/api/product-reviews/${pReview._id}/report`).set('Authorization', `Bearer ${reporterToken}`).send({ reviewType: 'PRODUCT', reason: 'Spam' }).expect(201);
    const rId1 = reportRes1.body.data.report._id;

    await request(app).patch(`/api/admin/review-reports/${rId1}/moderate`).send({ action: 'under_review' }).expect(401);
    await request(app).patch(`/api/admin/review-reports/${rId1}/moderate`).set('Authorization', `Bearer ${customerToken}`).send({ action: 'under_review' }).expect(403);
    console.log('✅ Test 1 Passed');

    console.log('\n--- Test 2: Invalid Report Transitions ---');
    // Cannot resolve a pending report directly
    let res = await request(app).patch(`/api/admin/review-reports/${rId1}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'hide' }).expect(400);
    if (!res.body.message.includes('Report must be UnderReview')) throw new Error('Failed to block pending->resolved transition');
    console.log('✅ Test 2 Passed');

    console.log('\n--- Test 3: Valid Report Transitions (Pending -> UnderReview -> Resolved) ---');
    await request(app).patch(`/api/admin/review-reports/${rId1}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'under_review' }).expect(200);
    let updatedReport = await ReviewReport.findById(rId1);
    if (updatedReport.status !== 'UnderReview') throw new Error('Failed to transition to UnderReview');
    
    await request(app).patch(`/api/admin/review-reports/${rId1}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'hide' }).expect(200);
    updatedReport = await ReviewReport.findById(rId1);
    if (updatedReport.status !== 'Resolved') throw new Error('Failed to transition to Resolved');
    let updatedReview = await ProductReview.findById(pReview._id);
    if (updatedReview.status !== 'Hidden') throw new Error('Failed to transition review to Hidden');
    console.log('✅ Test 3 Passed');

    console.log('\n--- Test 4: Idempotency (Repeated Moderation) ---');
    const logCountBefore = await ReviewModerationLog.countDocuments({ reportId: rId1 });
    const idemRes = await request(app).patch(`/api/admin/review-reports/${rId1}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'hide' }).expect(200);
    const logCountAfter = await ReviewModerationLog.countDocuments({ reportId: rId1 });
    if (logCountBefore !== logCountAfter) throw new Error('Duplicate audit log created during idempotent request');
    if (idemRes.body.data.newReportStatus !== 'Resolved') throw new Error('Idempotent response invalid');
    console.log('✅ Test 4 Passed');

    console.log('\n--- Test 5: Invalid Review Transitions ---');
    // We need to test the moderation engine blocking an invalid review state transition.
    // Create a new review, report it normally (to get a valid report), then artificially change the review status.
    const pReview2 = await ProductReview.create({ customerId: customer._id, sellerId: sellerUser._id, productId: product._id, orderId: new mongoose.Types.ObjectId(), orderItemId: new mongoose.Types.ObjectId(), rating: 1, status: 'Published' });
    let reportRes2 = await request(app).post(`/api/product-reviews/${pReview2._id}/report`).set('Authorization', `Bearer ${reporterToken}`).send({ reviewType: 'PRODUCT', reason: 'Spam' }).expect(201);
    let rId2 = reportRes2.body.data.report._id;
    
    // Artificially remove the review
    await ProductReview.findByIdAndUpdate(pReview2._id, { status: 'Removed' });

    // Now try to move the report to UnderReview (this should succeed)
    await request(app).patch(`/api/admin/review-reports/${rId2}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'under_review' }).expect(200);
    
    // Now try to HIDE the review (invalid transition from Removed -> Hidden)
    let invRes = await request(app).patch(`/api/admin/review-reports/${rId2}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'hide' }).expect(400);
    if (!invRes.body.message.includes('Cannot perform')) throw new Error('Invalid review transition was allowed');
    console.log('✅ Test 5 Passed');

    console.log('\n--- Test 6: Multiple Reports for the Same Review (Isolation) ---');
    // rId1 is Resolved. rId2 is UnderReview. Let's ensure rId1 is untouched when we moderate rId2.
    const r1State = await ReviewReport.findById(rId1);
    await request(app).patch(`/api/admin/review-reports/${rId2}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'reject', reason: 'dup' }).expect(200);
    const r2State = await ReviewReport.findById(rId2);
    const r1StateAfter = await ReviewReport.findById(rId1);
    if (r2State.status !== 'Rejected' || r1StateAfter.status !== 'Resolved' || r1State.updatedAt.toString() !== r1StateAfter.updatedAt.toString()) {
      throw new Error('Report isolation failed');
    }
    console.log('✅ Test 6 Passed');

    console.log('\n--- Test 7: Audit Field Persistence ---');
    const log = await ReviewModerationLog.findOne({ reportId: rId2, action: 'reject' });
    if (!log || log.action !== 'reject' || log.adminId.toString() !== admin._id.toString() || log.reason !== 'dup') {
      throw new Error('Audit fields not persisted correctly');
    }
    console.log('✅ Test 7 Passed');

    console.log('\n--- Test 8: Seller Moderation Regression ---');
    // Ensure the new transitions work for Seller Reviews as well
    let sReportRes = await request(app).post(`/api/seller-reviews/${sReview._id}/report`).set('Authorization', `Bearer ${reporterToken}`).send({ reviewType: 'SELLER', reason: 'Spam' }).expect(201);
    let srId = sReportRes.body.data.report._id;
    await request(app).patch(`/api/admin/review-reports/${srId}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'under_review' }).expect(200);
    await request(app).patch(`/api/admin/review-reports/${srId}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'hide' }).expect(200);
    let sReviewAfter = await SellerReview.findById(sReview._id);
    if (sReviewAfter.status !== 'Hidden') throw new Error('Seller moderation regression');
    console.log('✅ Test 8 Passed');

    console.log('\n🚀 All Review Moderation Hardening tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Tests Failed:', error);
    process.exit(1);
  }
})();
