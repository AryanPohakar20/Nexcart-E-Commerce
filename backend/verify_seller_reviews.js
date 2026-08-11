import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import Order from './src/models/Order.js';
import SellerReview from './src/models/SellerReview.js';
import * as sellerReviewService from './src/services/sellerReviewService.js';
import { generateAccessToken } from './src/utils/generateTokens.js';

const runTests = async () => {
  console.log('🚀 Connecting to MongoDB...');
  await connectDB();

  // Test ObjectIds
  const buyerId = new mongoose.Types.ObjectId();
  const sellerUserId = new mongoose.Types.ObjectId();
  const orderId = new mongoose.Types.ObjectId();
  const manualOrderId = new mongoose.Types.ObjectId();
  const sellerDocId = new mongoose.Types.ObjectId();

  console.log('📦 Seeding test database documents...');

  // Create Mock Buyer
  const buyerUser = new User({
    _id: buyerId,
    firstName: 'John',
    lastName: 'Doe',
    username: `john_seller_buyer_${Date.now()}`,
    email: `john_seller_buyer_${Date.now()}@example.com`,
    role: 'customer',
    provider: 'email',
    isVerified: true,
    phone: '1234567890',
    password: 'password123',
    avatar: 'http://example.com/johndoe_avatar.jpg',
  });
  await buyerUser.save();

  // Create Mock Seller User
  const sellerUser = new User({
    _id: sellerUserId,
    firstName: 'Jane',
    lastName: 'Store',
    username: `jane_seller_user_${Date.now()}`,
    email: `jane_seller_user_${Date.now()}@example.com`,
    role: 'seller',
    provider: 'email',
    isVerified: true,
    phone: '0987654321',
    password: 'password123',
  });
  await sellerUser.save();

  // Create Seller Document
  const sellerDoc = new Seller({
    _id: sellerDocId,
    userId: sellerUserId,
    sellerType: 'individual',
    status: 'Approved',
    isActive: true,
  });
  await sellerDoc.save();

  // Create Order Document (Delivered)
  const orderDoc = new Order({
    _id: orderId,
    orderId: `ORD-SEL-${Math.floor(10000 + Math.random() * 90000)}`,
    customer: buyerId,
    seller: sellerDocId,
    totalAmount: 150.0,
    itemCount: 1,
    orderStatus: 'delivered',
    items: [
      {
        product: new mongoose.Types.ObjectId(),
        name: 'Generic Product',
        price: 150.0,
        quantity: 1,
        subtotal: 150.0,
      },
    ],
  });
  await orderDoc.save();

  // Create another Delivered Order for manual testing
  const manualOrderDoc = new Order({
    _id: manualOrderId,
    orderId: `ORD-SEL-MAN-${Math.floor(10000 + Math.random() * 90000)}`,
    customer: buyerId,
    seller: sellerDocId,
    totalAmount: 250.0,
    itemCount: 1,
    orderStatus: 'delivered',
    items: [
      {
        product: new mongoose.Types.ObjectId(),
        name: 'Manual Test Product',
        price: 250.0,
        quantity: 1,
        subtotal: 250.0,
      },
    ],
  });
  await manualOrderDoc.save();

  console.log('✅ Mock data seeded. Initiating Seller Review tests...\n');

  let reviewId = null;

  try {
    // ----------------------------------------------------
    // TEST 1: Creating a valid seller review
    // ----------------------------------------------------
    console.log('👉 Test 1: Creating a valid seller review...');
    const r1 = await sellerReviewService.createReview({
      customerId: buyerId,
      sellerId: sellerUserId,
      orderId,
      rating: 5,
      comment: 'Fantastic seller! Recommended.',
      images: ['http://example.com/img1.jpg', 'http://example.com/img2.jpg'],
    });

    console.log('🟢 [PASS] Seller review created successfully:', r1);
    reviewId = r1.id;

    // Verify DTO layout
    const expectedKeys = ['id', 'reviewerName', 'reviewerProfileImage', 'rating', 'comment', 'images', 'createdAt', 'updatedAt'];
    const invalidKeys = ['customerId', 'sellerId', 'orderId', 'isDeleted', 'deletedAt', '__v'];
    
    expectedKeys.forEach(k => {
      if (r1[k] === undefined) throw new Error(`DTO is missing key: ${k}`);
    });
    invalidKeys.forEach(k => {
      if (r1[k] !== undefined) throw new Error(`DTO should not contain internal key: ${k}`);
    });
    if (r1.reviewerName !== 'John Doe') throw new Error('Reviewer name mapping failed');
    if (r1.reviewerProfileImage !== 'http://example.com/johndoe_avatar.jpg') throw new Error('Reviewer profile image mapping failed');
    console.log('🟢 [PASS] Review DTO conforms to requirements.');

    // ----------------------------------------------------
    // TEST 2: Attempting duplicate review (same order/seller)
    // ----------------------------------------------------
    console.log('\n👉 Test 2: Attempting duplicate seller review...');
    try {
      await sellerReviewService.createReview({
        customerId: buyerId,
        sellerId: sellerUserId,
        orderId,
        rating: 4,
        comment: 'Trying to duplicate',
      });
      throw new Error('Duplicate seller review should have been blocked');
    } catch (error) {
      if (error.statusCode !== 400 || !error.message.includes('Duplicate')) {
        throw error;
      }
      console.log(`🟢 [PASS] Duplicate review blocked successfully. Message: "${error.message}"`);
    }

    // ----------------------------------------------------
    // TEST 3: Attempting self-review
    // ----------------------------------------------------
    console.log('\n👉 Test 3: Attempting self-review...');
    const selfOrderId = new mongoose.Types.ObjectId();
    const selfOrderDoc = new Order({
      _id: selfOrderId,
      orderId: `ORD-SEL-SELF-${Math.floor(10000 + Math.random() * 90000)}`,
      customer: sellerUserId, // jane_seller_user is the customer
      seller: sellerDocId,
      totalAmount: 150.0,
      itemCount: 1,
      orderStatus: 'delivered',
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          name: 'Self Purchased Product',
          price: 150.0,
          quantity: 1,
          subtotal: 150.0,
        },
      ],
    });
    await selfOrderDoc.save();

    try {
      await sellerReviewService.createReview({
        customerId: sellerUserId, // Jane Store attempts to review Jane Store
        sellerId: sellerUserId,
        orderId: selfOrderId,
        rating: 5,
        comment: 'I am a great seller!',
      });
      throw new Error('Self-review should have been blocked');
    } catch (error) {
      if (error.statusCode !== 400 || !error.message.toLowerCase().includes('self-review')) {
        throw error;
      }
      console.log(`🟢 [PASS] Self-review blocked successfully. Message: "${error.message}"`);
    } finally {
      await Order.findByIdAndDelete(selfOrderId);
    }

    // ----------------------------------------------------
    // TEST 4: Unauthorized Update (Reviewer mismatch)
    // ----------------------------------------------------
    console.log('\n👉 Test 4: Attempting unauthorized update (other customer)...');
    const attackerId = new mongoose.Types.ObjectId();
    try {
      await sellerReviewService.updateReview(reviewId, attackerId, { rating: 2 });
      throw new Error('Unauthorized review update should have been blocked');
    } catch (error) {
      if (error.statusCode !== 403) {
        throw error;
      }
      console.log(`🟢 [PASS] Unauthorized update blocked successfully. Message: "${error.message}"`);
    }

    // ----------------------------------------------------
    // TEST 5: Unauthorized Delete (Reviewer mismatch)
    // ----------------------------------------------------
    console.log('\n👉 Test 5: Attempting unauthorized delete (other customer)...');
    try {
      await sellerReviewService.deleteReview(reviewId, attackerId);
      throw new Error('Unauthorized review deletion should have been blocked');
    } catch (error) {
      if (error.statusCode !== 403) {
        throw error;
      }
      console.log(`🟢 [PASS] Unauthorized delete blocked successfully. Message: "${error.message}"`);
    }

    // ----------------------------------------------------
    // TEST 6: Successful Update
    // ----------------------------------------------------
    console.log('\n👉 Test 6: Performing valid review update...');
    const updated = await sellerReviewService.updateReview(reviewId, buyerId, {
      rating: 4,
      comment: 'Updated: Seller was good, but delivery got delayed.',
      images: ['http://example.com/updated.jpg'],
    });

    console.log('🟢 [PASS] Seller review updated successfully:', updated);
    if (updated.rating !== 4) throw new Error('Updated rating was not stored');
    if (!updated.comment.includes('Updated')) throw new Error('Updated comment was not stored');
    if (updated.images[0] !== 'http://example.com/updated.jpg') throw new Error('Updated images were not stored');

    // ----------------------------------------------------
    // TEST 7: Successful Soft-Delete
    // ----------------------------------------------------
    console.log('\n👉 Test 7: Performing soft delete...');
    const deleted = await sellerReviewService.deleteReview(reviewId, buyerId);
    console.log('🟢 [PASS] Soft delete returned:', deleted);

    // Verify it is flagged in db
    const rawInDb = await SellerReview.findById(reviewId);
    if (!rawInDb || !rawInDb.isDeleted || !rawInDb.deletedAt) {
      throw new Error('Review was not soft deleted in the database');
    }
    console.log('🟢 [PASS] Soft delete flag verified in database.');

    // ----------------------------------------------------
    // TEST 8: Update soft-deleted review
    // ----------------------------------------------------
    console.log('\n👉 Test 8: Attempting to update soft-deleted review...');
    try {
      await sellerReviewService.updateReview(reviewId, buyerId, { rating: 5 });
      throw new Error('Updating a soft-deleted review should have been blocked');
    } catch (error) {
      if (error.statusCode !== 404) {
        throw error;
      }
      console.log(`🟢 [PASS] Update rejected with 404. Message: "${error.message}"`);
    }

    // ----------------------------------------------------
    // TEST 9: Delete soft-deleted review
    // ----------------------------------------------------
    console.log('\n👉 Test 9: Attempting to delete soft-deleted review...');
    try {
      await sellerReviewService.deleteReview(reviewId, buyerId);
      throw new Error('Deleting a soft-deleted review should have been blocked');
    } catch (error) {
      if (error.statusCode !== 404) {
        throw error;
      }
      console.log(`🟢 [PASS] Delete rejected with 404. Message: "${error.message}"`);
    }

  } finally {
    // ----------------------------------------------------
    // CLEANUP (Disabled to persist test data for manual testing)
    // ----------------------------------------------------
    console.log('\n🧹 Skipped cleaning up test database documents so you can see them in Atlas.');
    // await User.findByIdAndDelete(buyerId);
    // await User.findByIdAndDelete(sellerUserId);
    // await Seller.findByIdAndDelete(sellerDocId);
    // await Order.findByIdAndDelete(orderId);
    // await Order.findByIdAndDelete(manualOrderId);
    // if (reviewId) {
    //   await SellerReview.findByIdAndDelete(reviewId);
    // }
    console.log('✅ Cleanup skipped.');
  }

  // Generate real JWT token for manual testing
  const token = generateAccessToken(buyerId.toString(), 'customer');

  console.log('\n==================================================');
  console.log('🔑 MANUAL TESTING DETAILS (COPY AND PASTE TO POSTMAN/THUNDER CLIENT):');
  console.log('==================================================');
  console.log(`JWT ACCESS TOKEN (Include in Authorization Header):\nBearer ${token}`);
  console.log(`\nBUYER USER ID: ${buyerId}`);
  console.log(`SELLER USER ID (sellerId param): ${sellerUserId}`);
  console.log(`ORDER ID (Unreviewed - use this for creation): ${manualOrderId}`);
  console.log(`CREATED REVIEW ID (Soft-deleted during tests): ${reviewId}`);
  console.log('\n👉 1. CREATE SELLER REVIEW:');
  console.log(`URL: POST http://localhost:5000/api/sellers/${sellerUserId}/reviews`);
  console.log('Headers:');
  console.log(`  Authorization: Bearer ${token}`);
  console.log('Body (JSON):');
  console.log(JSON.stringify({
    orderId: manualOrderId.toString(),
    rating: 5,
    comment: "Excellent experience with the seller!",
    images: ["http://example.com/delivery.jpg"]
  }, null, 2));
  console.log('\n==================================================\n');

  await mongoose.connection.close();
  console.log('\n🎉 ALL SELLER REVIEW CRUD TESTS PASSED SUCCESSFULLY!');
};

runTests().catch((err) => {
  console.error('\n🔴 Fatal Test Error:', err);
  mongoose.connection.close();
});
