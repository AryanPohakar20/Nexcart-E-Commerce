import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
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
    username: `jane_reputation_user_${Date.now()}`,
    email: `jane_reputation_user_${Date.now()}@example.com`,
    role: 'seller',
    provider: 'email',
    isVerified: true,
    phone: '1112223333',
    password: 'password123',
    avatar: 'http://example.com/jane_avatar.jpg',
  });
  await sellerUser.save();

  // Create Seller Document
  const sellerDoc = new Seller({
    _id: sellerDocId,
    userId: sellerUserId,
    sellerType: 'individual',
    status: 'Approved',
    isActive: true,
    individual: {
      fullName: 'Jane StoreA',
    },
    averageRating: 4.6,
    totalReviews: 25,
    ratingDistribution: {
      oneStar: 1,
      twoStar: 0,
      threeStar: 2,
      fourStar: 5,
      fiveStar: 17,
    },
    statistics: {
      completedOrders: 15,
      cancellationRate: 5.5,
      responseRate: 0,
    },
    trustScore: 85,
  });
  await sellerDoc.save();

  console.log('✅ Mock data seeded. Running reputation API service tests...\n');

  try {
    // ----------------------------------------------------
    // TEST 1: Retrieve reputation for a valid seller
    // ----------------------------------------------------
    console.log('👉 Test 1: Retrieving reputation for a valid seller...');
    const reputation = await sellerReputationService.getSellerReputation(sellerUserId.toString());
    console.log('Returned DTO:', reputation);

    // Validate expected fields
    const expectedKeys = [
      'sellerId',
      'sellerName',
      'profileImage',
      'memberSince',
      'averageRating',
      'totalReviews',
      'ratingDistribution',
      'completedOrders',
      'cancellationRate',
      'responseRate',
    ];

    expectedKeys.forEach((key) => {
      if (reputation[key] === undefined) {
        throw new Error(`Reputation DTO is missing required key: ${key}`);
      }
    });

    if (reputation.sellerName !== 'Jane StoreA') {
      throw new Error(`Expected sellerName to be 'Jane StoreA', got '${reputation.sellerName}'`);
    }
    if (reputation.profileImage !== 'http://example.com/jane_avatar.jpg') {
      throw new Error(`Expected profileImage to be 'http://example.com/jane_avatar.jpg', got '${reputation.profileImage}'`);
    }
    if (reputation.averageRating !== 4.6 || reputation.totalReviews !== 25) {
      throw new Error('Rating statistics mapped incorrectly');
    }
    if (reputation.completedOrders !== 15 || reputation.cancellationRate !== 5.5) {
      throw new Error('Performance statistics mapped incorrectly');
    }
    console.log('🟢 [PASS] Valid reputation retrieval verified.');

    // ----------------------------------------------------
    // TEST 2: Security checks (sensitive fields must not leak)
    // ----------------------------------------------------
    console.log('\n👉 Test 2: Verifying sensitive and internal fields never leak...');
    const forbiddenKeys = [
      'email',
      'phone',
      'trustScore',
      'isSuspended',
      'sellerLevel',
      'userId',
      '_id',
      '__v',
    ];

    forbiddenKeys.forEach((key) => {
      if (reputation[key] !== undefined) {
        throw new Error(`Security Breach: Sensitive field '${key}' was exposed in the public reputation response!`);
      }
    });
    console.log('🟢 [PASS] Public security constraints verified.');

    // ----------------------------------------------------
    // TEST 3: Invalid sellerUserId format
    // ----------------------------------------------------
    console.log('\n👉 Test 3: Querying with invalid sellerId format (should throw 400)...');
    try {
      await sellerReputationService.getSellerReputation('invalid_id');
      throw new Error('Allowed invalid sellerId format without throwing');
    } catch (err) {
      if (err.statusCode !== 400) {
        throw new Error(`Expected status code 400, got ${err.statusCode}`);
      }
      console.log('🟢 [PASS] Invalid format rejected with 400.');
    }

    // ----------------------------------------------------
    // TEST 4: Unknown seller User ID
    // ----------------------------------------------------
    console.log('\n👉 Test 4: Querying with non-existent seller User ID (should throw 404)...');
    try {
      const unknownId = new mongoose.Types.ObjectId();
      await sellerReputationService.getSellerReputation(unknownId.toString());
      throw new Error('Allowed querying non-existent seller without throwing');
    } catch (err) {
      if (err.statusCode !== 404) {
        throw new Error(`Expected status code 404, got ${err.statusCode}`);
      }
      console.log('🟢 [PASS] Unknown seller rejected with 404.');
    }

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
  console.log('\n🎉 ALL SELLER REPUTATION API TESTS PASSED SUCCESSFULLY!');
};

runTests().catch((err) => {
  console.error('\n🔴 Fatal Test Error:', err);
  mongoose.connection.close();
});
