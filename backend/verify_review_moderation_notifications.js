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
import Notification from './src/models/Notification.js';
import * as notificationService from './src/services/notificationService.js';

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
    await Notification.deleteMany({});
    await Product.deleteMany({});
    await Seller.deleteMany({});

    // Setup Users
    const admin = await User.create({ firstName: 'Admin', lastName: 'U', username: 'admin1', email: 'admin1@test.com', password: 'Pass123!', role: 'ADMIN', phone: '+11234567890' });
    const author = await User.create({ firstName: 'Author', lastName: 'U', username: 'auth1', email: 'auth1@test.com', password: 'Pass123!', role: 'CUSTOMER', phone: '+10987654321' });
    const reporter = await User.create({ firstName: 'Rep', lastName: 'U', username: 'rep1', email: 'rep1@test.com', password: 'Pass123!', role: 'CUSTOMER', phone: '+10987654322' });
    const sellerUser = await User.create({ firstName: 'Sell', lastName: 'U', username: 'sell1', email: 'sell1@test.com', password: 'Pass123!', role: 'SELLER', phone: '+10987654323' });
    
    // Auth tokens
    const adminToken = admin.generateJWT();
    const reporterToken = reporter.generateJWT();

    // Setup Product & Seller
    const sellerProfile = await Seller.create({ userId: sellerUser._id, slug: 'test-seller', averageRating: 0, totalReviews: 0, trustScore: 0 });
    const product = await Product.create({
      title: 'Product A', slug: 'prod-a', description: 'Desc', brand: 'Brand', category: 'Cat', sellerId: sellerUser._id, price: 100, mrp: 120, stock: 10, images: [{ url: 'http://test.com/img.jpg', isPrimary: true }]
    });

    // Create Reviews
    const pReview = await ProductReview.create({ customerId: author._id, sellerId: sellerUser._id, productId: product._id, orderId: new mongoose.Types.ObjectId(), orderItemId: new mongoose.Types.ObjectId(), rating: 5, status: 'Published' });
    const sReview = await SellerReview.create({ customerId: author._id, sellerId: sellerUser._id, orderId: new mongoose.Types.ObjectId(), rating: 5, status: 'Published' });

    console.log('\n--- Test 1: Report Submission Notification ---');
    const reportRes1 = await request(app).post(`/api/product-reviews/${pReview._id}/report`).set('Authorization', `Bearer ${reporterToken}`).send({ reviewType: 'PRODUCT', reason: 'Spam' }).expect(201);
    const rId1 = reportRes1.body.data.report._id;

    let adminNotifications = await Notification.find({ recipientRole: 'admin' });
    adminNotifications = adminNotifications.filter(n => n.metadata && n.metadata.reportId && n.metadata.reportId.toString() === rId1.toString());
    if (adminNotifications.length !== 1 || adminNotifications[0].title !== 'New Review Report') throw new Error('Admin notification not created on report submission');
    console.log('✅ Test 1 Passed');

    console.log('\n--- Test 2: Report Rejection Notification ---');
    await request(app).patch(`/api/admin/review-reports/${rId1}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'under_review' }).expect(200);
    await request(app).patch(`/api/admin/review-reports/${rId1}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'reject', reason: 'False alarm' }).expect(200);
    
    // Need to give async notifications a moment to process since they are fire-and-forget Promise.allSettled
    await new Promise(r => setTimeout(r, 100));

    let reporterNotifs = await Notification.find({ recipientUser: reporter._id });
    reporterNotifs = reporterNotifs.filter(n => n.metadata && n.metadata.reportId && n.metadata.reportId.toString() === rId1.toString());
    if (reporterNotifs.length !== 1 || reporterNotifs[0].title !== 'Report Rejected' || reporterNotifs[0].metadata.action !== 'rejected') {
      throw new Error('Reporter rejection notification missing or invalid');
    }
    // Author should NOT get a notification if it was just rejected
    let authorNotifs = await Notification.find({ recipientUser: author._id });
    if (authorNotifs.length > 0) throw new Error('Author should not be notified on report rejection');
    console.log('✅ Test 2 Passed');

    console.log('\n--- Test 3: Report Resolution & Privacy Enforcement (Hide) ---');
    // We will test Hide on the Seller Review to ensure cross-type works too
    const reportRes2 = await request(app).post(`/api/seller-reviews/${sReview._id}/report`).set('Authorization', `Bearer ${reporterToken}`).send({ reviewType: 'SELLER', reason: 'Harassment' }).expect(201);
    const rId2 = reportRes2.body.data.report._id;
    await request(app).patch(`/api/admin/review-reports/${rId2}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'under_review' }).expect(200);
    await request(app).patch(`/api/admin/review-reports/${rId2}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'hide' }).expect(200);
    await new Promise(r => setTimeout(r, 100));

    // Check reporter
    reporterNotifs = await Notification.find({ recipientUser: reporter._id });
    reporterNotifs = reporterNotifs.filter(n => n.metadata && n.metadata.reportId && n.metadata.reportId.toString() === rId2.toString());
    if (reporterNotifs.length !== 1 || reporterNotifs[0].title !== 'Report Resolved') throw new Error('Reporter resolution notification missing');

    // Check author
    authorNotifs = await Notification.find({ recipientUser: author._id });
    authorNotifs = authorNotifs.filter(n => n.metadata && n.metadata.reviewId && n.metadata.reviewId.toString() === sReview._id.toString());
    if (authorNotifs.length !== 1 || authorNotifs[0].title !== 'Review Moderation Alert' || authorNotifs[0].metadata.action !== 'hide') {
      throw new Error('Author moderation alert missing or invalid');
    }
    // Check Privacy!
    const authorNotifStr = JSON.stringify(authorNotifs[0]);
    if (authorNotifStr.includes(reporter._id.toString())) {
      throw new Error('CRITICAL PRIVACY BREACH: Reporter ID leaked to Review Author!');
    }
    console.log('✅ Test 3 Passed');

    console.log('\n--- Test 4: Idempotency (No Duplicate Notifications) ---');
    await request(app).patch(`/api/admin/review-reports/${rId2}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'hide' }).expect(200);
    await new Promise(r => setTimeout(r, 100));
    
    // Counts should remain exactly 1
    const authorNotifsCountCheck = await Notification.find({ recipientUser: author._id });
    const authorNotifCount = authorNotifsCountCheck.filter(n => n.metadata && n.metadata.reviewId && n.metadata.reviewId.toString() === sReview._id.toString()).length;
    if (authorNotifCount !== 1) throw new Error('Duplicate notifications generated on idempotent request');
    console.log('✅ Test 4 Passed');

    console.log('\n--- Test 5: Failure Isolation ---');
    // Stub the Notification model to throw an error
    const originalCreate = Notification.create;
    Notification.create = async () => { throw new Error('Mocked notification failure'); };
    
    // Create new review and report to test Remove
    const pReview3 = await ProductReview.create({ customerId: author._id, sellerId: sellerUser._id, productId: product._id, orderId: new mongoose.Types.ObjectId(), orderItemId: new mongoose.Types.ObjectId(), rating: 2, status: 'Published' });
    // Note: createReviewReport will also fail to notify admin, but should succeed and return 201
    const reportRes3 = await request(app).post(`/api/product-reviews/${pReview3._id}/report`).set('Authorization', `Bearer ${reporterToken}`).send({ reviewType: 'PRODUCT', reason: 'Spam' }).expect(201);
    const rId3 = reportRes3.body.data.report._id;

    await request(app).patch(`/api/admin/review-reports/${rId3}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'under_review' }).expect(200);
    
    // Moderate: This should SUCCEED (200 OK) even though createNotification will throw
    const removeRes = await request(app).patch(`/api/admin/review-reports/${rId3}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'remove', reason: 'Violates TOS' }).expect(200);
    if (removeRes.body.data.newReportStatus !== 'Resolved') throw new Error('Moderation failed because of notification failure');
    
    // Verify database actually updated
    const updatedRev3 = await ProductReview.findById(pReview3._id);
    if (updatedRev3.status !== 'Removed') throw new Error('Review status not updated because of notification failure');

    Notification.create = originalCreate;
    console.log('✅ Test 5 Passed');

    console.log('\n🚀 All Review Moderation Notification tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Tests Failed:', error);
    process.exit(1);
  }
})();
