import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import * as sellerBadgeService from './src/services/sellerBadgeService.js';
import * as sellerReputationService from './src/services/sellerReputationService.js';
import { BADGE_RULES } from './src/constants/sellerBadgeRules.js';

const runTests = async () => {
  console.log('🚀 Connecting to MongoDB...');
  await connectDB();

  // Test ObjectIds
  const sellerUserId = new mongoose.Types.ObjectId();
  const sellerDocId = new mongoose.Types.ObjectId();

  console.log('📦 Seeding test database documents...');

  // Create Mock Seller User
  const sellerUser = new User({
    _id: sellerUserId,
    firstName: 'Jane',
    lastName: 'StoreA',
    username: `jane_evaluation_user_${Date.now()}`,
    email: `jane_evaluation_user_${Date.now()}@example.com`,
    role: 'seller',
    provider: 'email',
    isVerified: true,
    phone: '1112223333',
    password: 'password123',
    avatar: 'http://example.com/jane_avatar.jpg',
  });
  await sellerUser.save();

  // Create Seller Document (Verified, but empty badges/stats initially)
  const sellerDoc = new Seller({
    _id: sellerDocId,
    userId: sellerUserId,
    sellerType: 'individual',
    status: 'Approved',
    isActive: true,
    verificationStatus: 'Verified',
    individual: {
      fullName: 'Jane StoreA',
    },
  });
  await sellerDoc.save();

  console.log('✅ Mock data seeded. Running badge evaluation engine tests...\n');

  try {
    // ----------------------------------------------------
    // TEST 1: New Seller (Should receive 0 badges)
    // ----------------------------------------------------
    console.log('👉 Test 1: Evaluating badges for new seller (0 ratings, 0 orders)...');
    await sellerBadgeService.evaluateSellerBadges(sellerDocId.toString());

    let rep = await sellerReputationService.getSellerReputation(sellerUserId.toString());
    console.log('Active Badges for new seller:', rep.badges);
    if (rep.badges.length !== 0) {
      throw new Error('New seller should not meet any badge thresholds');
    }
    console.log('🟢 [PASS] New seller receives no badges.');

    // ----------------------------------------------------
    // TEST 2: Top Rated Seller Badge Awarded
    // ----------------------------------------------------
    console.log('\n👉 Test 2: Verifying Top Rated Seller badge is awarded when averageRating and review count meet thresholds...');
    // Seeding values to meet rules: MIN_AVERAGE_RATING = 4.0, MIN_REVIEW_COUNT = 5
    await Seller.findByIdAndUpdate(sellerDocId, {
      $set: {
        averageRating: BADGE_RULES.TopRatedSeller.MIN_AVERAGE_RATING,
        totalReviews: BADGE_RULES.TopRatedSeller.MIN_REVIEW_COUNT,
      }
    });

    await sellerBadgeService.evaluateSellerBadges(sellerDocId.toString());
    rep = await sellerReputationService.getSellerReputation(sellerUserId.toString());
    console.log('Reputation API Badges after ratings boost:', rep.badges);

    if (rep.badges.length !== 1 || rep.badges[0].badgeType !== 'TopRatedSeller') {
      throw new Error('Expected TopRatedSeller badge to be awarded');
    }
    console.log('🟢 [PASS] Top Rated Seller badge awarded correctly.');

    // ----------------------------------------------------
    // TEST 3: Trusted Seller Badge Awarded
    // ----------------------------------------------------
    console.log('\n👉 Test 3: Verifying Trusted Seller badge is awarded when trustScore, completedOrders, and cancellationRate meet thresholds...');
    // Seeding values: trustScore = 75, completedOrders = 15, cancellationRate = 2.0%
    await Seller.findByIdAndUpdate(sellerDocId, {
      $set: {
        trustScore: BADGE_RULES.TrustedSeller.MIN_TRUST_SCORE,
        'statistics.completedOrders': BADGE_RULES.TrustedSeller.MIN_COMPLETED_ORDERS,
        'statistics.cancellationRate': BADGE_RULES.TrustedSeller.MAX_CANCELLATION_RATE - 1,
      }
    });

    await sellerBadgeService.evaluateSellerBadges(sellerDocId.toString());
    rep = await sellerReputationService.getSellerReputation(sellerUserId.toString());
    console.log('Reputation API Badges after stats boost:', rep.badges);

    if (rep.badges.length !== 2) {
      throw new Error(`Expected 2 badges (TopRatedSeller, TrustedSeller), got ${rep.badges.length}`);
    }
    console.log('🟢 [PASS] Trusted Seller badge awarded correctly.');

    // ----------------------------------------------------
    // TEST 4: Badge Removal
    // ----------------------------------------------------
    console.log('\n👉 Test 4: Verifying Trusted Seller badge is revoked when cancellationRate exceeds threshold...');
    // Exceed MAX_CANCELLATION_RATE
    await Seller.findByIdAndUpdate(sellerDocId, {
      $set: {
        'statistics.cancellationRate': BADGE_RULES.TrustedSeller.MAX_CANCELLATION_RATE + 5,
      }
    });

    await sellerBadgeService.evaluateSellerBadges(sellerDocId.toString());
    rep = await sellerReputationService.getSellerReputation(sellerUserId.toString());
    console.log('Reputation API Badges after cancellation surge:', rep.badges);

    // Only TopRatedSeller should remain active
    if (rep.badges.length !== 1 || rep.badges[0].badgeType !== 'TopRatedSeller') {
      throw new Error('TrustedSeller badge was not deactivated or removed from DTO results');
    }
    console.log('🟢 [PASS] Badge revoked successfully when stats fall below thresholds.');

    // ----------------------------------------------------
    // TEST 5: Idempotency & Timestamp Retention
    // ----------------------------------------------------
    console.log('\n👉 Test 5: Verifying evaluation idempotency and original awardedAt timestamp retention...');
    let dbSellerBefore = await Seller.findById(sellerDocId).lean();
    const topRatedBefore = dbSellerBefore.badges.find((b) => b.badgeType === 'TopRatedSeller');
    const timestampBefore = topRatedBefore.awardedAt.getTime();

    // Run evaluation again with NO statistics changes
    await sellerBadgeService.evaluateSellerBadges(sellerDocId.toString());

    let dbSellerAfter = await Seller.findById(sellerDocId).lean();
    const topRatedAfter = dbSellerAfter.badges.find((b) => b.badgeType === 'TopRatedSeller');
    const timestampAfter = topRatedAfter.awardedAt.getTime();

    if (timestampBefore !== timestampAfter) {
      throw new Error('awardedAt timestamp changed on consecutive evaluations without stat updates');
    }
    if (dbSellerAfter.badges.length !== dbSellerBefore.badges.length) {
      throw new Error('Unwanted duplicate badge entries were appended');
    }
    console.log('🟢 [PASS] Badge evaluation is fully idempotent.');

    // ----------------------------------------------------
    // TEST 6: Manual Badge Retention
    // ----------------------------------------------------
    console.log('\n👉 Test 6: Verifying manual / static badges (IdentityVerified) are preserved and not wiped out...');
    // Seed IdentityVerified manually
    await Seller.findByIdAndUpdate(sellerDocId, {
      $push: {
        badges: {
          badgeType: 'IdentityVerified',
          isActive: true,
          awardedAt: new Date(Date.now() - 500000),
        }
      }
    });

    // Run evaluation
    await sellerBadgeService.evaluateSellerBadges(sellerDocId.toString());
    rep = await sellerReputationService.getSellerReputation(sellerUserId.toString());
    console.log('Reputation API Badges after manual badge evaluation:', rep.badges);

    const hasIdentityVerified = rep.badges.some((b) => b.badgeType === 'IdentityVerified');
    const hasTopRated = rep.badges.some((b) => b.badgeType === 'TopRatedSeller');

    if (!hasIdentityVerified || !hasTopRated) {
      throw new Error('Manual badge or Top Rated Seller badge was lost during evaluation');
    }
    console.log('🟢 [PASS] Manual and static badges are successfully preserved.');

  } finally {
    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test database documents...');
    await User.findByIdAndDelete(sellerUserId);
    await Seller.findByIdAndDelete(sellerDocId);
    console.log('✅ Cleanup finished.');
  }

  await mongoose.connection.close();
  console.log('\n🎉 ALL SELLER BADGE EVALUATION TESTS PASSED SUCCESSFULLY!');
};

runTests().catch((err) => {
  console.error('\n🔴 Fatal Test Error:', err);
  mongoose.connection.close();
});
