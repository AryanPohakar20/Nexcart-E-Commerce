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
    const admin = await User.create({ firstName: 'Admin', lastName: 'Final', username: 'admin_f', email: 'admin_f@test.com', password: 'Pass123!', role: 'ADMIN', phone: '+1111111111' });
    const author = await User.create({ firstName: 'Author', lastName: 'Final', username: 'auth_f', email: 'auth_f@test.com', password: 'Pass123!', role: 'CUSTOMER', phone: '+2222222222' });
    const reporter = await User.create({ firstName: 'Rep', lastName: 'Final', username: 'rep_f', email: 'rep_f@test.com', password: 'Pass123!', role: 'CUSTOMER', phone: '+3333333333' });
    const sellerUser = await User.create({ firstName: 'Sell', lastName: 'Final', username: 'sell_f', email: 'sell_f@test.com', password: 'Pass123!', role: 'SELLER', phone: '+4444444444' });
    
    // Auth tokens
    const adminToken = admin.generateJWT();
    const reporterToken = reporter.generateJWT();
    const authorToken = author.generateJWT();

    // Setup Product & Seller
    const sellerProfile = await Seller.create({ userId: sellerUser._id, slug: 'final-seller', averageRating: 0, totalReviews: 0, trustScore: 0 });
    const product = await Product.create({
      title: 'Final Product', slug: 'final-prod', description: 'Desc', brand: 'Brand', category: 'Cat', sellerId: sellerUser._id, price: 100, mrp: 120, stock: 10, images: [{ url: 'http://test.com/img.jpg', isPrimary: true }]
    });

    console.log('\n--- Step A & B: Create Valid Reviews ---');
    const pReview = await ProductReview.create({ customerId: author._id, sellerId: sellerUser._id, productId: product._id, orderId: new mongoose.Types.ObjectId(), orderItemId: new mongoose.Types.ObjectId(), rating: 5, status: 'Published' });
    const sReview = await SellerReview.create({ customerId: author._id, sellerId: sellerUser._id, orderId: new mongoose.Types.ObjectId(), rating: 4, status: 'Published' });
    
    // Initial Ratings Recalculation manually to set base state
    await request(app).patch(`/api/admin/review-reports/fake/moderate`).expect(401); // Just to verify auth briefly

    // Set initial product rating logic mock (our service recalculates automatically anyway when review is updated)
    // We update the product manually to have rating
    await Product.findByIdAndUpdate(product._id, { averageRating: 5, totalReviews: 1 });
    await Seller.findOneAndUpdate({ userId: sellerUser._id }, { averageRating: 4, totalReviews: 1, trustScore: 50 });

    console.log('\n--- Step D: Report Reviews ---');
    const reportResP = await request(app).post(`/api/product-reviews/${pReview._id}/report`).set('Authorization', `Bearer ${reporterToken}`).send({ reviewType: 'PRODUCT', reason: 'Spam' }).expect(201);
    const rIdP = reportResP.body.data.report._id;
    
    const reportResS = await request(app).post(`/api/seller-reviews/${sReview._id}/report`).set('Authorization', `Bearer ${reporterToken}`).send({ reviewType: 'SELLER', reason: 'Harassment' }).expect(201);
    const rIdS = reportResS.body.data.report._id;

    console.log('\n--- Step E: Prevent Duplicate & Self Reports ---');
    await request(app).post(`/api/product-reviews/${pReview._id}/report`).set('Authorization', `Bearer ${reporterToken}`).send({ reviewType: 'PRODUCT', reason: 'Spam' }).expect(400);
    await request(app).post(`/api/product-reviews/${pReview._id}/report`).set('Authorization', `Bearer ${authorToken}`).send({ reviewType: 'PRODUCT', reason: 'Spam' }).expect(400);

    console.log('\n--- Step F: Admin Retrieves Queue ---');
    const queueRes = await request(app).get(`/api/admin/review-reports`).set('Authorization', `Bearer ${adminToken}`).expect(200);
    if (queueRes.body.data.reports.length < 2) throw new Error('Queue missing reports');
    
    console.log('\n--- Step G & H: Admin Hides Product Review (Verify Drop) ---');
    await request(app).patch(`/api/admin/review-reports/${rIdP}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'under_review' }).expect(200);
    await request(app).patch(`/api/admin/review-reports/${rIdP}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'hide' }).expect(200);
    
    const hiddenProd = await Product.findById(product._id);
    if (hiddenProd.averageRating !== 0 || hiddenProd.totalReviews !== 0) throw new Error('Product Rating did not drop correctly after hiding review');

    console.log('\n--- Step I & J: Restore Product Review (Verify Return) ---');
    await request(app).patch(`/api/admin/review-reports/${rIdP}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'restore' }).expect(200);
    
    const restoredProd = await Product.findById(product._id);
    if (restoredProd.averageRating !== 5 || restoredProd.totalReviews !== 1) throw new Error('Product Rating did not restore correctly');

    console.log('\n--- Step K, L, M, N: Admin Hides Seller Review (Verify Drops & Badges) ---');
    await request(app).patch(`/api/admin/review-reports/${rIdS}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'under_review' }).expect(200);
    await request(app).patch(`/api/admin/review-reports/${rIdS}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'hide' }).expect(200);
    
    const hiddenSeller = await Seller.findOne({ userId: sellerUser._id });
    if (hiddenSeller.averageRating !== 0 || hiddenSeller.totalReviews !== 0) throw new Error('Seller Rating did not drop correctly');
    if (!hiddenSeller.trustScore || hiddenSeller.trustScore === 50) throw new Error('Seller Trust Score did not recalculate correctly');

    console.log('\n--- Step O & P: Restore Seller Review (Verify Return) ---');
    await request(app).patch(`/api/admin/review-reports/${rIdS}/moderate`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'restore' }).expect(200);
    
    const restoredSeller = await Seller.findOne({ userId: sellerUser._id });
    if (restoredSeller.averageRating !== 4 || restoredSeller.totalReviews !== 1) throw new Error('Seller Rating did not restore correctly');

    console.log('\n--- Step Q: Verify Notifications ---');
    await new Promise(r => setTimeout(r, 100)); // allow async to finish
    let authorNotifs = await Notification.find({ recipientUser: author._id });
    if (authorNotifs.length < 2) throw new Error('Author notifications missing');
    
    console.log('\n--- Step T: Verify Private Fields Protected ---');
    const reportDetails = await request(app).get(`/api/admin/review-reports/${rIdP}`).set('Authorization', `Bearer ${adminToken}`).expect(200);
    const dtoStr = JSON.stringify(reportDetails.body);
    if (dtoStr.includes(reporter.password) || dtoStr.includes(author.password)) throw new Error('CRITICAL LEAK: Passwords exposed in DTO');
    
    console.log('\n🚀 ALL E2E LIFECYCLE TESTS PASSED PERFECTLY!');
    process.exit(0);
  } catch (error) {
    console.error('❌ E2E Final Tests Failed:', error);
    process.exit(1);
  }
})();
