import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import * as sellerTrustScoreService from './src/services/sellerTrustScoreService.js';
import * as sellerRatingService from './src/services/sellerRatingService.js';
import * as sellerStatisticsService from './src/services/sellerStatisticsService.js';
import * as sellerReputationService from './src/services/sellerReputationService.js';

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
    username: `jane_trust_user_${Date.now()}`,
    email: `jane_trust_user_${Date.now()}@example.com`,
    role: 'seller',
    provider: 'email',
    isVerified: true,
    phone: '1112223333',
    password: 'password123',
    avatar: 'http://example.com/jane_avatar.jpg',
  });
  await sellerUser.save();

  // Create Seller Document (Verified, but empty statistics initially)
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

  console.log('✅ Mock data seeded. Running trust score engine tests...\n');

  try {
    // ----------------------------------------------------
    // TEST 1: New Seller (Zero stats baseline)
    // ----------------------------------------------------
    console.log('👉 Test 1: Calculating trust score for new seller (0 ratings, 0 orders)...');
    await sellerTrustScoreService.recalculateSellerTrustScore(sellerDocId);
    
    let seller = await Seller.findById(sellerDocId);
    console.log('New Seller Trust Score:', seller.trustScore);
    console.log('Last Updated At:', seller.lastTrustScoreUpdatedAt);

    // Expected calculation:
    // normRating = 0, normCompleted = 0, normCancellation = 100 (0% cancellations), normReviewCount = 0
    // weightedSum = 100 * 20 = 2000
    // denominator = 95
    // expected = 2000 / 95 = 21.1
    if (Math.abs(seller.trustScore - 21.1) > 0.1) {
      throw new Error(`Expected trust score around 21.1, got ${seller.trustScore}`);
    }
    if (!seller.lastTrustScoreUpdatedAt) {
      throw new Error('lastTrustScoreUpdatedAt was not populated');
    }
    console.log('🟢 [PASS] New seller baseline trust score is correct.');

    // ----------------------------------------------------
    // TEST 2: Highly rated seller
    // ----------------------------------------------------
    console.log('\n👉 Test 2: Calculating trust score for highly rated seller with completed orders...');
    seller.averageRating = 4.5;
    seller.totalReviews = 30;
    seller.statistics.completedOrders = 40;
    seller.statistics.cancellationRate = 2.5;
    await seller.save();

    await sellerTrustScoreService.recalculateSellerTrustScore(sellerDocId);
    seller = await Seller.findById(sellerDocId);
    console.log('Highly Rated Seller Trust Score:', seller.trustScore);

    // Expected calculation:
    // normRating = (4.5 / 5) * 100 = 90
    // normCompleted = (40 / 50) * 100 = 80
    // normCancellation = 100 - 2.5 = 97.5
    // normReviewCount = (30 / 100) * 100 = 30
    // weightedSum = (90 * 40) + (80 * 25) + (97.5 * 20) + (30 * 10) = 3600 + 2000 + 1950 + 300 = 7850
    // denominator = 95
    // expected = 7850 / 95 = 82.6
    if (Math.abs(seller.trustScore - 82.6) > 0.1) {
      throw new Error(`Expected trust score around 82.6, got ${seller.trustScore}`);
    }
    console.log('🟢 [PASS] Highly rated seller trust score calculation is correct.');

    // ----------------------------------------------------
    // TEST 3: Poor seller / High cancellations
    // ----------------------------------------------------
    console.log('\n👉 Test 3: Calculating trust score for seller with poor ratings and high cancellations...');
    seller.averageRating = 2.0;
    seller.totalReviews = 10;
    seller.statistics.completedOrders = 5;
    seller.statistics.cancellationRate = 50.0;
    await seller.save();

    await sellerTrustScoreService.recalculateSellerTrustScore(sellerDocId);
    seller = await Seller.findById(sellerDocId);
    console.log('Poor Seller Trust Score:', seller.trustScore);

    // Expected calculation:
    // normRating = (2.0 / 5) * 100 = 40
    // normCompleted = (5 / 50) * 100 = 10
    // normCancellation = 100 - 50 = 50
    // normReviewCount = (10 / 100) * 100 = 10
    // weightedSum = (40 * 40) + (10 * 25) + (50 * 20) + (10 * 10) = 1600 + 250 + 1000 + 100 = 2950
    // denominator = 95
    // expected = 2950 / 95 = 31.1
    if (Math.abs(seller.trustScore - 31.1) > 0.1) {
      throw new Error(`Expected trust score around 31.1, got ${seller.trustScore}`);
    }
    console.log('🟢 [PASS] Poor seller trust score calculation is correct.');

    // ----------------------------------------------------
    // TEST 4: Score Bounds
    // ----------------------------------------------------
    console.log('\n👉 Test 4: Verifying score bounds are strictly between 0 and 100...');
    // Worst possible stats
    seller.averageRating = 0;
    seller.totalReviews = 0;
    seller.statistics.completedOrders = 0;
    seller.statistics.cancellationRate = 100.0;
    await seller.save();

    await sellerTrustScoreService.recalculateSellerTrustScore(sellerDocId);
    seller = await Seller.findById(sellerDocId);
    console.log('Worst possible stats score:', seller.trustScore);
    if (seller.trustScore < 0 || seller.trustScore > 100) {
      throw new Error(`Out of bounds score: ${seller.trustScore}`);
    }

    // Best possible stats
    seller.averageRating = 5.0;
    seller.totalReviews = 150;
    seller.statistics.completedOrders = 100;
    seller.statistics.cancellationRate = 0.0;
    await seller.save();

    await sellerTrustScoreService.recalculateSellerTrustScore(sellerDocId);
    seller = await Seller.findById(sellerDocId);
    console.log('Best possible stats score:', seller.trustScore);
    if (seller.trustScore < 0 || seller.trustScore > 100) {
      throw new Error(`Out of bounds score: ${seller.trustScore}`);
    }
    console.log('🟢 [PASS] Score bounds check passed.');

    // ----------------------------------------------------
    // TEST 5: Deterministic Recalculation (running twice)
    // ----------------------------------------------------
    console.log('\n👉 Test 5: Verifying recalculation is deterministic...');
    await sellerTrustScoreService.recalculateSellerTrustScore(sellerDocId);
    const score1 = (await Seller.findById(sellerDocId)).trustScore;
    await sellerTrustScoreService.recalculateSellerTrustScore(sellerDocId);
    const score2 = (await Seller.findById(sellerDocId)).trustScore;

    if (score1 !== score2) {
      throw new Error('Trust score calculation is non-deterministic');
    }
    console.log('🟢 [PASS] Determinism check passed.');

    // ----------------------------------------------------
    // TEST 6: Rating Service Hook Integration
    // ----------------------------------------------------
    console.log('\n👉 Test 6: Verifying that updating statistics triggers trust score recalculation...');
    // Reset trust score to 0
    seller.trustScore = 0;
    await seller.save();

    // Call recalculateSellerRating (simulating a review change) which triggers recalculateSellerTrustScore
    await sellerRatingService.recalculateSellerRating(sellerUserId.toString());
    
    // Wait a brief moment for async operation
    await new Promise((resolve) => setTimeout(resolve, 100));

    seller = await Seller.findById(sellerDocId);
    console.log('Trust Score after rating recalculation:', seller.trustScore);
    if (seller.trustScore === 0) {
      throw new Error('Trust score was not recalculated after rating update hook');
    }
    console.log('🟢 [PASS] Integration hooks successfully triggered recalculation.');

    // ----------------------------------------------------
    // TEST 7: Reputation API Protection
    // ----------------------------------------------------
    console.log('\n👉 Test 7: Verifying reputation API reflects trustScore if needed, or remains unaffected...');
    const reputation = await sellerReputationService.getSellerReputation(sellerUserId.toString());
    console.log('Reputation DTO:', reputation);
    
    // Check that we didn't break reputation API fields
    if (reputation.sellerId !== seller.sellerId || reputation.averageRating === undefined) {
      throw new Error('Reputation API structure was corrupted by trust score update');
    }
    console.log('🟢 [PASS] Reputation API is unaffected and functions properly.');

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
  console.log('\n🎉 ALL SELLER TRUST SCORE ENGINE TESTS PASSED SUCCESSFULLY!');
};

runTests().catch((err) => {
  console.error('\n🔴 Fatal Test Error:', err);
  mongoose.connection.close();
});
