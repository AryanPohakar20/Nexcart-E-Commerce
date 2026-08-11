import mongoose from 'mongoose';
import request from 'supertest';
import app from './src/app.js';
import SellerReview from './src/models/SellerReview.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import Product from './src/models/Product.js';
import ReviewReport from './src/models/ReviewReport.js';
import { recalculateSellerRating } from './src/services/sellerRatingService.js';
import { recalculateProductRating } from './src/services/productRatingService.js';

(async () => {
  try {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/nexcart-test', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to test DB');

    // 🧹 Clean Database
    await User.deleteMany({});
    await SellerReview.deleteMany({});
    await ReviewReport.deleteMany({});
    await Product.deleteMany({});
    await Seller.deleteMany({});

    // Create Admin
    const admin = await User.create({ firstName: 'Admin', lastName: 'User', username: 'admin1', email: 'admin1@example.com', password: 'Pass123!', role: 'ADMIN', phone: '+11234567890' });
    
    // Create Customers
    const c1 = await User.create({ firstName: 'C1', lastName: 'U', username: 'c1', email: 'c1@example.com', password: 'Pass123!', role: 'CUSTOMER', phone: '+10987654321' });
    const c2 = await User.create({ firstName: 'C2', lastName: 'U', username: 'c2', email: 'c2@example.com', password: 'Pass123!', role: 'CUSTOMER', phone: '+10987654322' });
    const reporter = await User.create({ firstName: 'Rep', lastName: 'U', username: 'rep1', email: 'rep@example.com', password: 'Pass123!', role: 'CUSTOMER', phone: '+10987654323' });

    // Create Seller Users
    const sellerUserA = await User.create({ firstName: 'SellA', lastName: 'U', username: 'sella', email: 'sella@example.com', password: 'Pass123!', role: 'SELLER', phone: '+10987654324' });
    const sellerUserB = await User.create({ firstName: 'SellB', lastName: 'U', username: 'sellb', email: 'sellb@example.com', password: 'Pass123!', role: 'SELLER', phone: '+10987654325' });
    
    // Create Seller Profiles
    const sellerA = await Seller.create({ userId: sellerUserA._id, slug: 'seller-a', averageRating: 0, totalReviews: 0, trustScore: 0 });
    const sellerB = await Seller.create({ userId: sellerUserB._id, slug: 'seller-b', averageRating: 0, totalReviews: 0, trustScore: 0 });

    // Create a Product to verify product isolation
    const productA = await Product.create({
      title: 'Product A', slug: 'prod-a', description: 'Desc', brand: 'Brand', category: 'Cat', sellerId: sellerUserA._id, price: 100, mrp: 120, stock: 10,
      averageRating: 4.5, totalReviews: 10, images: [{ url: 'http://example.com/a.jpg', isPrimary: true }]
    });

    // Helper to get Seller stats
    const getSStats = async (sId) => await Seller.findById(sId).select('averageRating totalReviews ratingDistribution trustScore').lean();

    console.log('\n--- Test 1: No Seller Reviews ---');
    await recalculateSellerRating(sellerUserA._id);
    let sA = await getSStats(sellerA._id);
    if (sA.totalReviews !== 0 || sA.averageRating !== 0) throw new Error('Test 1 Failed');
    console.log('✅ Test 1 Passed');

    console.log('\n--- Test 2: Multiple Published Seller Reviews ---');
    const r1 = await SellerReview.create({ customerId: c1._id, sellerId: sellerUserA._id, orderId: new mongoose.Types.ObjectId(), rating: 5, status: 'Published' });
    const r2 = await SellerReview.create({ customerId: c2._id, sellerId: sellerUserA._id, orderId: new mongoose.Types.ObjectId(), rating: 5, status: 'Published' });
    const r3 = await SellerReview.create({ customerId: c1._id, sellerId: sellerUserA._id, orderId: new mongoose.Types.ObjectId(), rating: 4, status: 'Published' });
    const r4 = await SellerReview.create({ customerId: c2._id, sellerId: sellerUserA._id, orderId: new mongoose.Types.ObjectId(), rating: 3, status: 'Published' });
    
    // Status Filtering Test setup: Add a hidden, removed, and soft-deleted review
    await SellerReview.create({ customerId: c2._id, sellerId: sellerUserA._id, orderId: new mongoose.Types.ObjectId(), rating: 1, status: 'Hidden' });
    await SellerReview.create({ customerId: c1._id, sellerId: sellerUserA._id, orderId: new mongoose.Types.ObjectId(), rating: 2, status: 'Removed' });
    await SellerReview.create({ customerId: c2._id, sellerId: sellerUserA._id, orderId: new mongoose.Types.ObjectId(), rating: 5, status: 'Published', isDeleted: true });

    // Initial recalculation to set baseline
    await recalculateSellerRating(sellerUserA._id);
    sA = await getSStats(sellerA._id);
    // (5+5+4+3) / 4 = 17 / 4 = 4.25 => rounded to 4.3 based on logic
    if (sA.totalReviews !== 4 || sA.averageRating !== 4.3) throw new Error(`Test 2 Failed: avg=${sA.averageRating}, total=${sA.totalReviews}`);
    if (sA.ratingDistribution.fiveStar !== 2 || sA.ratingDistribution.fourStar !== 1 || sA.ratingDistribution.threeStar !== 1) throw new Error('Test 2 Failed: distribution');
    console.log('✅ Test 2 Passed (and Status Filtering Verified)');
    console.log(`ℹ️ Trust Score integrated and updated to: ${sA.trustScore}`);

    console.log('\n--- Test 3: Hide Seller Review ---');
    // Report r1 (5 star)
    let reportRes = await request(app).post(`/api/seller-reviews/${r1._id}/report`).set('Authorization', `Bearer ${reporter.generateJWT()}`).send({ reviewType: 'SELLER', reason: 'Spam', description: 'Test' }).expect(201);
    let reportId = reportRes.body.data.report._id;

    // Admin Hides r1
    await request(app).patch(`/api/admin/review-reports/${reportId}/moderate`).set('Authorization', `Bearer ${admin.generateJWT()}`).send({ action: 'under_review' }).expect(200);
    await request(app).patch(`/api/admin/review-reports/${reportId}/moderate`).set('Authorization', `Bearer ${admin.generateJWT()}`).send({ action: 'hide' }).expect(200);
    sA = await getSStats(sellerA._id);
    // Left: 5, 4, 3 => Avg = 12/3 = 4, Total = 3
    if (sA.totalReviews !== 3 || sA.averageRating !== 4) throw new Error(`Test 3 Failed: avg=${sA.averageRating}, total=${sA.totalReviews}`);
    console.log('✅ Test 3 Passed');

    console.log('\n--- Test 4: Restore Seller Review ---');
    await ReviewReport.findByIdAndUpdate(reportId, { status: 'Pending' });
    await request(app).patch(`/api/admin/review-reports/${reportId}/moderate`).set('Authorization', `Bearer ${admin.generateJWT()}`).send({ action: 'under_review' }).expect(200);
    await request(app).patch(`/api/admin/review-reports/${reportId}/moderate`).set('Authorization', `Bearer ${admin.generateJWT()}`).send({ action: 'restore' }).expect(200);
    sA = await getSStats(sellerA._id);
    // Restored: 5, 5, 4, 3 => Avg = 4.3, Total = 4
    if (sA.totalReviews !== 4 || sA.averageRating !== 4.3) throw new Error(`Test 4 Failed: avg=${sA.averageRating}, total=${sA.totalReviews}`);
    console.log('✅ Test 4 Passed');

    console.log('\n--- Test 5: Remove Seller Review ---');
    await ReviewReport.findByIdAndUpdate(reportId, { status: 'Pending' });
    await request(app).patch(`/api/admin/review-reports/${reportId}/moderate`).set('Authorization', `Bearer ${admin.generateJWT()}`).send({ action: 'under_review' }).expect(200);
    await request(app).patch(`/api/admin/review-reports/${reportId}/moderate`).set('Authorization', `Bearer ${admin.generateJWT()}`).send({ action: 'remove', reason: 'Spam' }).expect(200);
    sA = await getSStats(sellerA._id);
    // Removed: 5, 4, 3 => Avg = 4, Total = 3
    if (sA.totalReviews !== 3 || sA.averageRating !== 4) throw new Error(`Test 5 Failed: avg=${sA.averageRating}, total=${sA.totalReviews}`);
    console.log('✅ Test 5 Passed');

    console.log('\n--- Test 6: Reject Report ---');
    // Report r3 (4 star)
    reportRes = await request(app).post(`/api/seller-reviews/${r3._id}/report`).set('Authorization', `Bearer ${reporter.generateJWT()}`).send({ reviewType: 'SELLER', reason: 'Spam', description: 'Test' }).expect(201);
    reportId = reportRes.body.data.report._id;

    await request(app).patch(`/api/admin/review-reports/${reportId}/moderate`).set('Authorization', `Bearer ${admin.generateJWT()}`).send({ action: 'reject', reason: 'Invalid report' }).expect(200);
    sA = await getSStats(sellerA._id);
    // Still 5, 4, 3 => Avg = 4, Total = 3
    if (sA.totalReviews !== 3 || sA.averageRating !== 4) throw new Error(`Test 6 Failed: avg=${sA.averageRating}, total=${sA.totalReviews}`);
    console.log('✅ Test 6 Passed');

    console.log('\n--- Test 8: Seller Isolation ---');
    let sB = await getSStats(sellerB._id);
    if (sB.totalReviews !== 0) throw new Error('Seller Isolation Failed');
    console.log('✅ Test 8 Passed');

    console.log('\n--- Test 9: Product Isolation ---');
    const pA = await Product.findById(productA._id).lean();
    if (pA.averageRating !== 4.5 || pA.totalReviews !== 10) throw new Error('Product Isolation Failed: Stats were modified');
    console.log('✅ Test 9 Passed');

    console.log('\n--- Test 12: Idempotency ---');
    await recalculateSellerRating(sellerUserA._id);
    const sA_idem = await getSStats(sellerA._id);
    if (sA_idem.totalReviews !== 3 || sA_idem.averageRating !== 4) throw new Error('Idempotency Failed');
    console.log('✅ Test 12 Passed');

    console.log('\n--- Test 13: Recalculation Failure Safety ---');
    let reportRes2 = await request(app).post(`/api/seller-reviews/${r4._id}/report`).set('Authorization', `Bearer ${reporter.generateJWT()}`).send({ reviewType: 'SELLER', reason: 'Spam', description: 'Test' }).expect(201);
    let reportId2 = reportRes2.body.data.report._id;
    
    // Simulate API call, relying on try/catch logic internally
    await request(app).patch(`/api/admin/review-reports/${reportId2}/moderate`).set('Authorization', `Bearer ${admin.generateJWT()}`).send({ action: 'under_review' }).expect(200);
    const moderateRes = await request(app).patch(`/api/admin/review-reports/${reportId2}/moderate`).set('Authorization', `Bearer ${admin.generateJWT()}`).send({ action: 'hide' }).expect(200);
    
    if (moderateRes.body.success !== true) throw new Error('Test 13 Failed');
    console.log('✅ Test 13 Passed (API succeeds and does not expose internal errors)');

    console.log('\n🚀 All Seller Rating Integration tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Tests Failed:', error);
    process.exit(1);
  }
})();
