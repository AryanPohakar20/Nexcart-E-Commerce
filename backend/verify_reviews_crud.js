import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import ProductReview from './src/models/ProductReview.js';
import * as productReviewService from './src/services/productReviewService.js';
import * as productReviewRepository from './src/repositories/productReviewRepository.js';

const runTests = async () => {
  console.log('🚀 Connecting to MongoDB...');
  await connectDB();

  // Test ObjectIds
  const buyerId = new mongoose.Types.ObjectId();
  const sellerUserId = new mongoose.Types.ObjectId();
  const orderId = new mongoose.Types.ObjectId();
  const orderItemId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const sellerDocId = new mongoose.Types.ObjectId();

  console.log('📦 Seeding test database documents...');

  // Create Mock User for Buyer (Required for populate)
  const buyerUser = new User({
    _id: buyerId,
    firstName: 'John',
    lastName: 'Doe',
    username: `johndoe_${Date.now()}`,
    email: `johndoe_${Date.now()}@example.com`,
    role: 'customer',
    provider: 'email',
    isVerified: true,
    phone: '1234567890',
    password: 'password123',
  });
  await buyerUser.save();

  // Create Mock User for Seller
  const sellerUser = new User({
    _id: sellerUserId,
    firstName: 'Jane',
    lastName: 'Store',
    username: `janestore_${Date.now()}`,
    email: `janestore_${Date.now()}@example.com`,
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

  // Create Product Document
  const productDoc = new Product({
    _id: productId,
    title: 'Super Reviewable Gadget',
    slug: `super-reviewable-gadget-${Date.now()}`,
    description: 'A mock product designed for review testing.',
    price: 49.99,
    mrp: 59.99,
    category: 'Electronics',
    brand: 'NexCart',
    stock: 100,
    sellerId: sellerUserId,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150',
        publicId: 'test-image-id',
        isPrimary: true,
      }
    ],
  });
  await productDoc.save();

  // Create Order Document (Delivered)
  const orderDoc = new Order({
    _id: orderId,
    orderId: `ORD-TEST-${Math.floor(10000 + Math.random() * 90000)}`,
    customer: buyerId,
    seller: sellerDocId,
    totalAmount: 49.99,
    itemCount: 1,
    orderStatus: 'delivered',
    items: [
      {
        _id: orderItemId,
        product: productId,
        name: 'Super Reviewable Gadget',
        price: 49.99,
        quantity: 1,
        subtotal: 49.99,
      },
    ],
  });
  await orderDoc.save();

  console.log('✅ Mock data seeded. Initiating Service tests...\n');

  let reviewId = null;

  try {
    // ----------------------------------------------------
    // TEST 1: Valid Review Creation
    // ----------------------------------------------------
    console.log('👉 Test 1: Creating a valid product review...');
    const reviewPayload = {
      customerId: buyerId,
      productId,
      orderId,
      orderItemId,
      rating: 5,
      comment: 'Excellent quality product! Highly recommended.',
      images: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
    };

    const createdReview = await productReviewService.createReview(reviewPayload);
    console.log('🟢 [PASS] Review created successfully:', createdReview);
    reviewId = createdReview.id;

    // Verify DTO fields are mapped properly and sensitive fields hidden
    if (!reviewId) throw new Error('Review ID missing in DTO');
    if (createdReview.reviewerName !== 'John Doe') throw new Error(`Reviewer name mismatch: ${createdReview.reviewerName}`);
    if (createdReview.rating !== 5) throw new Error('Rating mismatch');
    if (createdReview.comment !== 'Excellent quality product! Highly recommended.') throw new Error('Comment mismatch');
    if (createdReview.customerId !== undefined || createdReview.isDeleted !== undefined || createdReview.deletedAt !== undefined) {
      throw new Error('Internal fields exposed in DTO');
    }
    console.log('🟢 [PASS] Review DTO conforms to requirements.');

    // ----------------------------------------------------
    // TEST 2: Self-Review Prevention
    // ----------------------------------------------------
    console.log('\n👉 Test 2: Attempting self-review (seller reviewing own product)...');
    // Set product sellerId to buyerId to trigger self-review prevention
    productDoc.sellerId = buyerId;
    await productDoc.save();

    try {
      await productReviewService.createReview({
        customerId: buyerId, // Now the buyer is trying to review their own product
        productId,
        orderId,
        orderItemId,
        rating: 5,
      });
      console.log('🔴 [FAIL] Self-review check failed (it was allowed!)');
      throw new Error('Self-review was allowed');
    } catch (err) {
      if (err.statusCode === 400 && err.message.includes('Self-review')) {
        console.log(`🟢 [PASS] Self-review blocked correctly: ${err.message}`);
      } else {
        throw err;
      }
    } finally {
      // Restore product sellerId
      productDoc.sellerId = sellerUserId;
      await productDoc.save();
    }

    // ----------------------------------------------------
    // TEST 3: Duplicate Review Prevention
    // ----------------------------------------------------
    console.log('\n👉 Test 3: Attempting duplicate review for same order item...');
    try {
      await productReviewService.createReview(reviewPayload);
      console.log('🔴 [FAIL] Duplicate review check failed (it was allowed!)');
      throw new Error('Duplicate review was allowed');
    } catch (err) {
      if (err.statusCode === 400 && err.message.includes('Duplicate review')) {
        console.log(`🟢 [PASS] Duplicate review blocked correctly: ${err.message}`);
      } else {
        throw err;
      }
    }

    // ----------------------------------------------------
    // TEST 4: Invalid Order Status Review Prevention
    // ----------------------------------------------------
    console.log('\n👉 Test 4: Attempting review on cancelled order...');
    orderDoc.orderStatus = 'cancelled';
    await orderDoc.save();

    // Create a new product and order item to prevent duplicate block intercepting this check
    const cancelledOrderItemId = new mongoose.Types.ObjectId();
    const cancelledProductDoc = new Product({
      title: 'Cancelled Test Product',
      slug: `cancelled-test-product-${Date.now()}`,
      description: 'A mock product.',
      price: 10,
      mrp: 12,
      category: 'Electronics',
      brand: 'NexCart',
      stock: 10,
      sellerId: sellerUserId,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150',
          publicId: 'test-image-id',
          isPrimary: true,
        }
      ],
    });
    await cancelledProductDoc.save();

    orderDoc.items.push({
      _id: cancelledOrderItemId,
      product: cancelledProductDoc._id,
      name: 'Cancelled Test Product',
      price: 10,
      quantity: 1,
      subtotal: 10,
    });
    await orderDoc.save();

    try {
      await productReviewService.createReview({
        customerId: buyerId,
        productId: cancelledProductDoc._id,
        orderId,
        orderItemId: cancelledOrderItemId,
        rating: 4,
      });
      console.log('🔴 [FAIL] Cancelled order review check failed (it was allowed!)');
      throw new Error('Review on cancelled order was allowed');
    } catch (err) {
      if (err.statusCode === 400 && err.message.includes('cancelled')) {
        console.log(`🟢 [PASS] Cancelled order review blocked correctly: ${err.message}`);
      } else {
        throw err;
      }
    }

    // Restore orderDoc and cleanup cancelledProductDoc
    orderDoc.orderStatus = 'delivered';
    orderDoc.items = orderDoc.items.filter(item => item._id.toString() !== cancelledOrderItemId.toString());
    await orderDoc.save();
    await Product.findByIdAndDelete(cancelledProductDoc._id);

    // ----------------------------------------------------
    // TEST 5: Update Review (Ownership and Fields validation)
    // ----------------------------------------------------
    console.log('\n👉 Test 5: Updating own review...');
    const updatePayload = {
      rating: 4,
      comment: 'Updated review: Product was good, but delivery was slow.',
      images: ['http://example.com/updated.jpg'],
    };

    const updatedReview = await productReviewService.updateReview(reviewId, buyerId, updatePayload);
    console.log('🟢 [PASS] Review updated successfully:', updatedReview);
    if (updatedReview.rating !== 4 || updatedReview.comment !== 'Updated review: Product was good, but delivery was slow.') {
      throw new Error('Updated fields mismatch');
    }

    // Attempt unauthorized update by sellerUser
    console.log('👉 Attempting unauthorized update (not owner)...');
    try {
      await productReviewService.updateReview(reviewId, sellerUserId, updatePayload);
      console.log('🔴 [FAIL] Unauthorized update check failed (allowed non-owner to update!)');
      throw new Error('Unauthorized update was allowed');
    } catch (err) {
      if (err.statusCode === 403) {
        console.log(`🟢 [PASS] Unauthorized update blocked correctly: ${err.message}`);
      } else {
        throw err;
      }
    }

    // ----------------------------------------------------
    // TEST 6: Get Product Reviews (Sorting & Pagination)
    // ----------------------------------------------------
    console.log('\n👉 Test 6: Seeding additional reviews for pagination/sorting testing...');
    // We need to bypass eligibility checks to seed multiple reviews for the same product from different customer IDs
    const buyer2Id = new mongoose.Types.ObjectId();
    const buyer2User = new User({
      _id: buyer2Id,
      firstName: 'Alice',
      lastName: 'Smith',
      username: `alicesmith_${Date.now()}`,
      email: `alicesmith_${Date.now()}@example.com`,
      role: 'customer',
      provider: 'email',
      isVerified: true,
      phone: '1234567890',
      password: 'password123',
    });
    await buyer2User.save();

    const review2 = new ProductReview({
      productId,
      sellerId: sellerUserId,
      customerId: buyer2Id,
      orderId: new mongoose.Types.ObjectId(),
      orderItemId: new mongoose.Types.ObjectId(),
      rating: 2,
      comment: 'Disappointing product.',
      status: 'Published',
    });
    await review2.save();

    const buyer3Id = new mongoose.Types.ObjectId();
    const buyer3User = new User({
      _id: buyer3Id,
      firstName: 'Bob',
      lastName: 'Johnson',
      username: `bobjohnson_${Date.now()}`,
      email: `bobjohnson_${Date.now()}@example.com`,
      role: 'customer',
      provider: 'email',
      isVerified: true,
      phone: '1234567890',
      password: 'password123',
    });
    await buyer3User.save();

    const review3 = new ProductReview({
      productId,
      sellerId: sellerUserId,
      customerId: buyer3Id,
      orderId: new mongoose.Types.ObjectId(),
      orderItemId: new mongoose.Types.ObjectId(),
      rating: 3,
      comment: 'Average product.',
      status: 'Published',
    });
    await review3.save();

    console.log('👉 Retrieving reviews with default sort (newest)...');
    const reviewsNewest = await productReviewService.getProductReviews(productId, { page: 1, limit: 10, sortBy: 'newest' });
    console.log('🟢 [PASS] Retrieved reviews (newest first):', reviewsNewest.reviews.map(r => ({ name: r.reviewerName, rating: r.rating })));
    if (reviewsNewest.reviews.length !== 3) throw new Error(`Expected 3 reviews, got ${reviewsNewest.reviews.length}`);

    console.log('👉 Retrieving reviews sorted by highest rating...');
    const reviewsHighest = await productReviewService.getProductReviews(productId, { sortBy: 'highest_rating' });
    console.log('🟢 [PASS] Retrieved reviews (highest rating):', reviewsHighest.reviews.map(r => ({ name: r.reviewerName, rating: r.rating })));
    if (reviewsHighest.reviews[0].rating !== 4 || reviewsHighest.reviews[2].rating !== 2) {
      throw new Error('Highest rating sort mismatch');
    }

    console.log('👉 Retrieving reviews sorted by lowest rating...');
    const reviewsLowest = await productReviewService.getProductReviews(productId, { sortBy: 'lowest_rating' });
    console.log('🟢 [PASS] Retrieved reviews (lowest rating):', reviewsLowest.reviews.map(r => ({ name: r.reviewerName, rating: r.rating })));
    if (reviewsLowest.reviews[0].rating !== 2 || reviewsLowest.reviews[2].rating !== 4) {
      throw new Error('Lowest rating sort mismatch');
    }

    console.log('👉 Testing Pagination limits (limit = 2)...');
    const reviewsPaginated = await productReviewService.getProductReviews(productId, { page: 1, limit: 2, sortBy: 'newest' });
    if (reviewsPaginated.reviews.length !== 2) throw new Error(`Expected 2 reviews due to limit, got ${reviewsPaginated.reviews.length}`);
    if (reviewsPaginated.pagination.pages !== 2) throw new Error(`Expected total pages to be 2, got ${reviewsPaginated.pagination.pages}`);
    console.log('🟢 [PASS] Pagination works correctly:', reviewsPaginated.pagination);

    // Clean up buyer2, buyer3 and extra reviews
    await User.deleteMany({ _id: { $in: [buyer2Id, buyer3Id] } });
    await ProductReview.deleteMany({ _id: { $in: [review2._id, review3._id] } });

    // ----------------------------------------------------
    // TEST 7: Soft Delete
    // ----------------------------------------------------
    console.log('\n👉 Test 7: Soft deleting own review...');

    // Attempt unauthorized delete first (while review still exists)
    console.log('👉 Attempting unauthorized delete (not owner)...');
    try {
      await productReviewService.deleteReview(reviewId, sellerUserId);
      console.log('🔴 [FAIL] Unauthorized delete check failed (allowed non-owner to delete!)');
      throw new Error('Unauthorized delete was allowed');
    } catch (err) {
      if (err.statusCode === 403) {
        console.log(`🟢 [PASS] Unauthorized delete blocked correctly: ${err.message}`);
      } else {
        throw err;
      }
    }

    // Now perform the authorized soft delete
    console.log('👉 Performing authorized soft-delete (by owner)...');
    const deleteResult = await productReviewService.deleteReview(reviewId, buyerId);
    console.log('🟢 [PASS] Soft delete call executed successfully:', deleteResult);

    // Verify it is indeed soft deleted in database
    const dbReview = await ProductReview.findById(reviewId);
    if (!dbReview.isDeleted || !dbReview.deletedAt) {
      throw new Error('Soft delete fields not updated in database.');
    }
    console.log('🟢 [PASS] Review isDeleted = true and deletedAt is set.');

    // Verify that soft-deleted reviews do not appear in public product review lists
    const currentReviewsList = await productReviewService.getProductReviews(productId, { page: 1, limit: 10 });
    const containsDeleted = currentReviewsList.reviews.some(r => r.id === reviewId.toString());
    if (containsDeleted) {
      throw new Error('Soft-deleted review appeared in public product reviews listing!');
    }
    console.log('🟢 [PASS] Soft-deleted review is excluded from public lists.');

    // Attempt to retrieve it by findById repo method (should return null because it's deleted)
    const findRepoCheck = await productReviewRepository.findById(reviewId);
    if (findRepoCheck !== null) {
      throw new Error('productReviewRepository.findById returned soft-deleted review.');
    }
    console.log('🟢 [PASS] productReviewRepository.findById filters out soft-deleted reviews.');

  } finally {
    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test database documents...');
    await User.findByIdAndDelete(buyerId);
    await User.findByIdAndDelete(sellerUserId);
    await Seller.findByIdAndDelete(sellerDocId);
    await Product.findByIdAndDelete(productId);
    await Order.findByIdAndDelete(orderId);
    if (reviewId) {
      await ProductReview.findByIdAndDelete(reviewId);
    }
    console.log('✅ Cleanup finished.');
  }

  await mongoose.connection.close();
  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! CRUD APIs are robust and production-ready.');
};

runTests().catch((err) => {
  console.error('\n🔴 Fatal Test Error:', err);
  mongoose.connection.close();
});
