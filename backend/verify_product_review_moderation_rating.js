import mongoose from 'mongoose';
import request from 'supertest';
import app from './src/app.js';
import ProductReview from './src/models/ProductReview.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import Product from './src/models/Product.js';
import ReviewReport from './src/models/ReviewReport.js';
import { recalculateProductRating } from './src/services/productRatingService.js';
import { recalculateSellerRating } from './src/services/sellerRatingService.js';

(async () => {
  try {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/nexcart-test', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to test DB');

    // 🧹 Clean Database
    await User.deleteMany({});
    await ProductReview.deleteMany({});
    await ReviewReport.deleteMany({});
    await Product.deleteMany({});
    await Seller.deleteMany({});

    // Create Admin
    const admin = await User.create({ firstName: 'Admin', lastName: 'User', username: 'admin1', email: 'admin1@example.com', password: 'Pass123!', role: 'ADMIN', phone: '+11234567890' });
    
    // Create Customers
    const c1 = await User.create({ firstName: 'C1', lastName: 'U', username: 'c1', email: 'c1@example.com', password: 'Pass123!', role: 'CUSTOMER', phone: '+10987654321' });
    const c2 = await User.create({ firstName: 'C2', lastName: 'U', username: 'c2', email: 'c2@example.com', password: 'Pass123!', role: 'CUSTOMER', phone: '+10987654322' });
    const reporter = await User.create({ firstName: 'Rep', lastName: 'U', username: 'rep1', email: 'rep@example.com', password: 'Pass123!', role: 'CUSTOMER', phone: '+10987654323' });

    // Create Seller User and Seller Profile
    const sellerUser = await User.create({ firstName: 'Sell', lastName: 'U', username: 'sell1', email: 'sell1@example.com', password: 'Pass123!', role: 'SELLER', phone: '+10987654324' });
    const sellerProfile = await Seller.create({
      userId: sellerUser._id,
      slug: 'test-seller',
      averageRating: 4.5,
      totalReviews: 10,
      trustScore: 85
    });

    // Create Products
    const productA = await Product.create({
      title: 'Product A', slug: 'prod-a', description: 'Desc', brand: 'Brand', category: 'Cat', sellerId: sellerUser._id, price: 100, mrp: 120, stock: 10,
      averageRating: 0, totalReviews: 0, images: [{ url: 'http://example.com/a.jpg', isPrimary: true }]
    });
    const productB = await Product.create({
      title: 'Product B', slug: 'prod-b', description: 'Desc', brand: 'Brand', category: 'Cat', sellerId: sellerUser._id, price: 100, mrp: 120, stock: 10,
      averageRating: 0, totalReviews: 0, images: [{ url: 'http://example.com/b.jpg', isPrimary: true }]
    });

    // Helper to get Product stats
    const getPStats = async (pId) => await Product.findById(pId).select('averageRating totalReviews ratingDistribution').lean();

    console.log('\n--- Test 1: No Reviews ---');
    await recalculateProductRating(productA._id);
    let pA = await getPStats(productA._id);
    if (pA.totalReviews !== 0 || pA.averageRating !== 0) throw new Error('Test 1 Failed');
    console.log('✅ Test 1 Passed');

    console.log('\n--- Test 2: Multiple Published Reviews ---');
    const r5 = await ProductReview.create({ customerId: c1._id, sellerId: sellerUser._id, productId: productA._id, orderId: new mongoose.Types.ObjectId(), orderItemId: new mongoose.Types.ObjectId(), rating: 5, status: 'Published' });
    const r4 = await ProductReview.create({ customerId: c2._id, sellerId: sellerUser._id, productId: productA._id, orderId: new mongoose.Types.ObjectId(), orderItemId: new mongoose.Types.ObjectId(), rating: 4, status: 'Published' });
    const r3 = await ProductReview.create({ customerId: c1._id, sellerId: sellerUser._id, productId: productA._id, orderId: new mongoose.Types.ObjectId(), orderItemId: new mongoose.Types.ObjectId(), rating: 3, status: 'Published' });
    
    // Status Filtering Test setup: Add a hidden, removed, and soft-deleted review
    await ProductReview.create({ customerId: c2._id, sellerId: sellerUser._id, productId: productA._id, orderId: new mongoose.Types.ObjectId(), orderItemId: new mongoose.Types.ObjectId(), rating: 1, status: 'Hidden' });
    await ProductReview.create({ customerId: c1._id, sellerId: sellerUser._id, productId: productA._id, orderId: new mongoose.Types.ObjectId(), orderItemId: new mongoose.Types.ObjectId(), rating: 2, status: 'Removed' });
    await ProductReview.create({ customerId: c2._id, sellerId: sellerUser._id, productId: productA._id, orderId: new mongoose.Types.ObjectId(), orderItemId: new mongoose.Types.ObjectId(), rating: 5, status: 'Published', isDeleted: true });

    // Initial recalculation to set baseline (simulating what review creation would have done)
    await recalculateProductRating(productA._id);
    pA = await getPStats(productA._id);
    // (5+4+3) / 3 = 4
    if (pA.totalReviews !== 3 || pA.averageRating !== 4) throw new Error(`Test 2 Failed: avg=${pA.averageRating}, total=${pA.totalReviews}`);
    if (pA.ratingDistribution.fiveStar !== 1 || pA.ratingDistribution.fourStar !== 1 || pA.ratingDistribution.threeStar !== 1) throw new Error('Test 2 Failed: distribution');
    console.log('✅ Test 2 Passed (and Status Filtering Verified)');

    console.log('\n--- Test 3: Hide Review ---');
    // Report r5
    let reportRes = await request(app).post(`/api/product-reviews/${r5._id}/report`).set('Authorization', `Bearer ${reporter.generateJWT()}`).send({ reviewType: 'PRODUCT', reason: 'Spam', description: 'Test' }).expect(201);
    let reportId = reportRes.body.data.report._id;

    // Admin Hides r5
    await request(app).patch(`/api/admin/review-reports/${reportId}/moderate`).set('Authorization', `Bearer ${admin.generateJWT()}`).send({ action: 'hide' }).expect(200);
    pA = await getPStats(productA._id);
    // Left: 4, 3 => Avg = 3.5, Total = 2
    if (pA.totalReviews !== 2 || pA.averageRating !== 3.5) throw new Error(`Test 3 Failed: avg=${pA.averageRating}, total=${pA.totalReviews}`);
    console.log('✅ Test 3 Passed');

    console.log('\n--- Test 4: Restore Review ---');
    await ReviewReport.findByIdAndUpdate(reportId, { status: 'Pending' });
    await request(app).patch(`/api/admin/review-reports/${reportId}/moderate`).set('Authorization', `Bearer ${admin.generateJWT()}`).send({ action: 'restore' }).expect(200);
    pA = await getPStats(productA._id);
    // Restored: 5, 4, 3 => Avg = 4, Total = 3
    if (pA.totalReviews !== 3 || pA.averageRating !== 4) throw new Error(`Test 4 Failed: avg=${pA.averageRating}, total=${pA.totalReviews}`);
    console.log('✅ Test 4 Passed');

    console.log('\n--- Test 5: Remove Review ---');
    await ReviewReport.findByIdAndUpdate(reportId, { status: 'Pending' });
    await request(app).patch(`/api/admin/review-reports/${reportId}/moderate`).set('Authorization', `Bearer ${admin.generateJWT()}`).send({ action: 'remove', reason: 'Spam' }).expect(200);
    pA = await getPStats(productA._id);
    // Removed: 4, 3 => Avg = 3.5, Total = 2
    if (pA.totalReviews !== 2 || pA.averageRating !== 3.5) throw new Error(`Test 5 Failed: avg=${pA.averageRating}, total=${pA.totalReviews}`);
    console.log('✅ Test 5 Passed');

    console.log('\n--- Test 6: Reject Report ---');
    // Report r4
    reportRes = await request(app).post(`/api/product-reviews/${r4._id}/report`).set('Authorization', `Bearer ${reporter.generateJWT()}`).send({ reviewType: 'PRODUCT', reason: 'Spam', description: 'Test' }).expect(201);
    reportId = reportRes.body.data.report._id;

    await request(app).patch(`/api/admin/review-reports/${reportId}/moderate`).set('Authorization', `Bearer ${admin.generateJWT()}`).send({ action: 'reject', reason: 'Invalid report' }).expect(200);
    pA = await getPStats(productA._id);
    // Still 4, 3 => Avg = 3.5, Total = 2
    if (pA.totalReviews !== 2 || pA.averageRating !== 3.5) throw new Error(`Test 6 Failed: avg=${pA.averageRating}, total=${pA.totalReviews}`);
    console.log('✅ Test 6 Passed');

    console.log('\n--- Product Isolation Test ---');
    let pB = await getPStats(productB._id);
    if (pB.totalReviews !== 0) throw new Error('Product Isolation Failed');
    console.log('✅ Product Isolation Passed');

    console.log('\n--- Seller Isolation Test ---');
    const seller = await Seller.findById(sellerProfile._id).lean();
    if (seller.averageRating !== 4.5 || seller.totalReviews !== 10) throw new Error('Seller Isolation Failed: Stats were modified');
    console.log('✅ Seller Isolation Passed');

    console.log('\n--- Idempotency Test ---');
    await recalculateProductRating(productA._id);
    const pA_idem = await getPStats(productA._id);
    if (pA_idem.totalReviews !== 2 || pA_idem.averageRating !== 3.5) throw new Error('Idempotency Failed');
    console.log('✅ Idempotency Passed');

    console.log('\n🚀 All Product Rating Integration tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Tests Failed:', error);
    process.exit(1);
  }
})();
