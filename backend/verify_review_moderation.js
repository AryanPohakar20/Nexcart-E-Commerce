import request from 'supertest';
import app from './src/app.js'; // fixed path
import mongoose from 'mongoose';
import ReviewReport from './src/models/ReviewReport.js'; // fixed path
import ProductReview from './src/models/ProductReview.js'; // fixed path
import User from './src/models/User.js'; // fixed path
import ReviewModerationLog from './src/models/ReviewModerationLog.js'; // fixed path

/**
 * End‑to‑end verification for admin review moderation actions.
 * Prerequisite: test database URI is set in process.env.MONGO_URI_TEST.
 */
(async () => {
  try {
    // Inject a dummy JWT secret for the token generation
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';

    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/nexcart-test', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to test DB');

    // 🧹 Clear collections to avoid duplicate key errors on re-runs
    await User.deleteMany({});
    await ProductReview.deleteMany({});
    await ReviewReport.deleteMany({});
    await ReviewModerationLog.deleteMany({});

    // 1️⃣ Create users
    const admin = await User.create({ firstName: 'Admin', lastName: 'User', username: 'admin1', email: 'admin1@example.com', password: 'Pass123!', role: 'ADMIN', phone: '+11234567890' });
    const reviewCreator = await User.create({ firstName: 'Creator', lastName: 'User', username: 'creator1', email: 'creator1@example.com', password: 'Pass123!', role: 'CUSTOMER', phone: '+10987654321' });
    const reporter = await User.create({ firstName: 'Reporter', lastName: 'User', username: 'reporter1', email: 'reporter1@example.com', password: 'Pass123!', role: 'CUSTOMER', phone: '+11111111111' });

    // 2️⃣ Create a product review (published)
    const review = await ProductReview.create({
      customerId: reviewCreator._id,
      sellerId: admin._id,
      orderId: new mongoose.Types.ObjectId(),
      orderItemId: new mongoose.Types.ObjectId(),
      productId: new mongoose.Types.ObjectId(),
      rating: 4,
      comment: 'Nice',
      status: 'Published'
    });

    // 3️⃣ Reporter files a report
    const reportRes = await request(app)
      .post(`/api/product-reviews/${review._id}/report`) // corrected endpoint
      .set('Authorization', `Bearer ${reporter.generateJWT()}`)
      .send({ reviewType: 'PRODUCT', reason: 'Spam', description: 'This is spam' }) // remove reviewId since it's in URL params
      .expect(201);
    const reportId = reportRes.body.data.report._id;

    // 4️⃣ Admin moderates – hide
    await request(app)
      .patch(`/api/admin/review-reports/${reportId}/moderate`)
      .set('Authorization', `Bearer ${admin.generateJWT()}`)
      .send({ action: 'hide' })
      .expect(200);

    // Verify review status
    const updatedReview = await ProductReview.findById(review._id).lean();
    if (updatedReview.status !== 'Hidden') throw new Error('Review not hidden');

    // 5️⃣ Admin tries invalid transition (hide again) – should fail
    await request(app)
      .patch(`/api/admin/review-reports/${reportId}/moderate`)
      .set('Authorization', `Bearer ${admin.generateJWT()}`)
      .send({ action: 'hide' })
      .expect(400);

    // 6️⃣ Admin remove the hidden review
    // The previous successful action marked the report as RESOLVED, so we reset it to test another action
    await ReviewReport.findByIdAndUpdate(reportId, { status: 'Pending' });

    await request(app)
      .patch(`/api/admin/review-reports/${reportId}/moderate`)
      .set('Authorization', `Bearer ${admin.generateJWT()}`)
      .send({ action: 'remove', reason: 'Inappropriate content' })
      .expect(200);
    const removedReview = await ProductReview.findById(review._id).lean();
    if (removedReview.status !== 'Removed') throw new Error('Review not removed');

    // 7️⃣ Verify audit log entry exists
    const log = await ReviewModerationLog.findOne({ reviewId: review._id }).lean();
    if (!log) throw new Error('Audit log missing');

    console.log('🟢 All moderation scenarios passed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed', err);
    process.exit(1);
  }
})();
