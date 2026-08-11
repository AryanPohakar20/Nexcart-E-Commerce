import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import * as sellerBadgeService from './src/services/sellerBadgeService.js';
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
    username: `jane_badge_user_${Date.now()}`,
    email: `jane_badge_user_${Date.now()}@example.com`,
    role: 'seller',
    provider: 'email',
    isVerified: true,
    phone: '1112223333',
    password: 'password123',
    avatar: 'http://example.com/jane_avatar.jpg',
  });
  await sellerUser.save();

  // Create Seller Document (Verified, but empty badges initially)
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

  console.log('✅ Mock data seeded. Running badge framework tests...\n');

  try {
    // ----------------------------------------------------
    // TEST 1: Default Empty Badges
    // ----------------------------------------------------
    console.log('👉 Test 1: Verifying default empty badge collection...');
    const repEmpty = await sellerReputationService.getSellerReputation(sellerUserId.toString());
    console.log('Default badges array:', repEmpty.badges);

    if (!Array.isArray(repEmpty.badges) || repEmpty.badges.length !== 0) {
      throw new Error('Default badges collection must be an empty array');
    }
    console.log('🟢 [PASS] Default empty badge collection verified.');

    // ----------------------------------------------------
    // TEST 2: Badge Persistence via syncSellerBadges
    // ----------------------------------------------------
    console.log('\n👉 Test 2: Synchronizing and persisting seller badge states...');
    const seedBadges = [
      { badgeType: 'TrustedSeller', isActive: true, awardedAt: new Date(Date.now() - 86400000) },
      { badgeType: 'TopRatedSeller', isActive: true, awardedAt: new Date() },
      { badgeType: 'FastResponder', isActive: false, awardedAt: new Date() },
    ];

    const savedBadges = await sellerBadgeService.syncSellerBadges(sellerDocId.toString(), seedBadges);
    console.log('Persisted badges state in database:', savedBadges);

    if (savedBadges.length !== 3) {
      throw new Error(`Expected 3 badges saved, got ${savedBadges.length}`);
    }
    // Verify that metadata like displayName is NOT stored in database
    const dbSeller = await Seller.findById(sellerDocId).lean();
    console.log('Raw database document badges:', dbSeller.badges);

    dbSeller.badges.forEach((b) => {
      if (b.displayName !== undefined || b.description !== undefined || b.iconKey !== undefined) {
        throw new Error(`Security/Storage violation: Metadata field was found persisted in the database for badge type '${b.badgeType}'`);
      }
    });
    console.log('🟢 [PASS] Badge state persistence and dynamic metadata exclusion verified.');

    // ----------------------------------------------------
    // TEST 3: Metadata Mapping & Active Filtering
    // ----------------------------------------------------
    console.log('\n👉 Test 3: Verifying dynamic metadata mapping and active filtering in reputation API...');
    const repWithBadges = await sellerReputationService.getSellerReputation(sellerUserId.toString());
    console.log('Reputation API Badges:', repWithBadges.badges);

    // Should only contain TrustedSeller and TopRatedSeller (isActive = true)
    if (repWithBadges.badges.length !== 2) {
      throw new Error(`Expected exactly 2 active badges, got ${repWithBadges.badges.length}`);
    }

    const trusted = repWithBadges.badges.find((b) => b.badgeType === 'TrustedSeller');
    const topRated = repWithBadges.badges.find((b) => b.badgeType === 'TopRatedSeller');
    const fastResponder = repWithBadges.badges.find((b) => b.badgeType === 'FastResponder');

    if (!trusted || !topRated) {
      throw new Error('Active badges were not returned in DTO list');
    }
    if (fastResponder) {
      throw new Error('Inactive badge was incorrectly returned in DTO list');
    }

    // Verify metadata resolution
    if (trusted.displayName !== 'Trusted Seller' || trusted.iconKey !== 'trusted-seller') {
      throw new Error('TrustedSeller metadata resolved incorrectly');
    }
    if (topRated.displayName !== 'Top Rated Seller' || topRated.iconKey !== 'top-rated-seller') {
      throw new Error('TopRatedSeller metadata resolved incorrectly');
    }
    console.log('🟢 [PASS] Dynamic metadata mapping and active filtering verified.');

    // ----------------------------------------------------
    // TEST 4: Backward Compatibility
    // ----------------------------------------------------
    console.log('\n👉 Test 4: Verifying backward compatibility (all legacy fields are intact)...');
    if (repWithBadges.sellerName !== 'Jane StoreA' || repWithBadges.averageRating !== 0) {
      throw new Error('Legacy reputation fields were corrupted by badge integration');
    }
    console.log('🟢 [PASS] Backward compatibility verified.');

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
  console.log('\n🎉 ALL SELLER BADGE FRAMEWORK TESTS PASSED SUCCESSFULLY!');
};

runTests().catch((err) => {
  console.error('\n🔴 Fatal Test Error:', err);
  mongoose.connection.close();
});
