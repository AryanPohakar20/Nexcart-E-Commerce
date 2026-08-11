import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import ProductReview from './src/models/ProductReview.js';
import * as productReviewService from './src/services/productReviewService.js';
import { recalculateProductRating } from './src/services/productRatingService.js';

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

  // Create Mock Buyer
  const buyerUser = new User({
    _id: buyerId,
    firstName: 'John',
    lastName: 'Doe',
    username: `johndoe_agg_${Date.now()}`,
    email: `johndoe_agg_${Date.now()}@example.com`,
    role: 'customer',
    provider: 'email',
    isVerified: true,
    phone: '1234567890',
    password: 'password123',
  });
  await buyerUser.save();

  // Create Mock Seller
  const sellerUser = new User({
    _id: sellerUserId,
    firstName: 'Jane',
    lastName: 'Store',
    username: `janestore_agg_${Date.now()}`,
    email: `janestore_agg_${Date.now()}@example.com`,
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

  // Create Product Document with initial defaults
  const productDoc = new Product({
    _id: productId,
    title: 'Aggregatable Widget',
    slug: `aggregatable-widget-${Date.now()}`,
    description: 'A mock product designed for rating aggregation testing.',
    price: 99.99,
    mrp: 120.0,
    category: 'Electronics',
    brand: 'NexCart',
    stock: 50,
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
    orderId: `ORD-AGG-${Math.floor(10000 + Math.random() * 90000)}`,
    customer: buyerId,
    seller: sellerDocId,
    totalAmount: 99.99,
    itemCount: 1,
    orderStatus: 'delivered',
    items: [
      {
        _id: orderItemId,
        product: productId,
        name: 'Aggregatable Widget',
        price: 99.99,
        quantity: 1,
        subtotal: 99.99,
      },
    ],
  });
  await orderDoc.save();

  console.log('✅ Mock data seeded. Initiating rating aggregation tests...\n');

  try {
    // ----------------------------------------------------
    // TEST 1: Default ratings for product with 0 reviews
    // ----------------------------------------------------
    console.log('👉 Test 1: Verifying default ratings for product with 0 reviews...');
    // Manually run recalculate to check default behaviour
    await recalculateProductRating(productId);
    const p1 = await Product.findById(productId);

    console.log('Product rating stats (0 reviews):', {
      rating: p1.rating,
      reviewsCount: p1.reviewsCount,
      averageRating: p1.averageRating,
      totalReviews: p1.totalReviews,
      ratingDistribution: p1.ratingDistribution,
    });

    if (p1.averageRating !== 0 || p1.totalReviews !== 0) {
      throw new Error('Default stats with 0 reviews must be 0');
    }
    if (
      p1.ratingDistribution.oneStar !== 0 ||
      p1.ratingDistribution.fiveStar !== 0
    ) {
      throw new Error('Rating distribution counts must all be 0');
    }
    console.log('🟢 [PASS] Default stats are correct.');

    // ----------------------------------------------------
    // TEST 2: Create first review (5 stars)
    // ----------------------------------------------------
    console.log('\n👉 Test 2: Creating first review (5 stars)...');
    const r1 = await productReviewService.createReview({
      customerId: buyerId,
      productId,
      orderId,
      orderItemId,
      rating: 5,
      comment: 'Excellent widget!',
    });

    const p2 = await Product.findById(productId);
    console.log('Product rating stats (1 review):', {
      rating: p2.rating,
      reviewsCount: p2.reviewsCount,
      averageRating: p2.averageRating,
      totalReviews: p2.totalReviews,
      ratingDistribution: p2.ratingDistribution,
    });

    if (p2.averageRating !== 5 || p2.totalReviews !== 1) {
      throw new Error('Stats did not update correctly for first 5-star review');
    }
    if (p2.ratingDistribution.fiveStar !== 1 || p2.ratingDistribution.fourStar !== 0) {
      throw new Error('Rating distribution incorrect for first 5-star review');
    }
    console.log('🟢 [PASS] First review update works.');

    // ----------------------------------------------------
    // TEST 3: Create second review (3 stars)
    // ----------------------------------------------------
    console.log('\n👉 Test 3: Seeding second review (3 stars)...');
    // Bypass eligibility to insert second review for same product using another customer
    const buyer2Id = new mongoose.Types.ObjectId();
    const buyer2User = new User({
      _id: buyer2Id,
      firstName: 'Alice',
      lastName: 'Smith',
      username: `alicesmith_agg_${Date.now()}`,
      email: `alicesmith_agg_${Date.now()}@example.com`,
      role: 'customer',
      provider: 'email',
      isVerified: true,
      phone: '1122334455',
      password: 'password123',
    });
    await buyer2User.save();

    const review2 = new ProductReview({
      productId,
      sellerId: sellerUserId,
      customerId: buyer2Id,
      orderId: new mongoose.Types.ObjectId(),
      orderItemId: new mongoose.Types.ObjectId(),
      rating: 3,
      comment: 'Decent widget.',
      status: 'Published',
    });
    await review2.save();

    // Trigger recalculation manually (since we bypassed service createReview)
    await recalculateProductRating(productId);

    const p3 = await Product.findById(productId);
    console.log('Product rating stats (2 reviews):', {
      rating: p3.rating,
      reviewsCount: p3.reviewsCount,
      averageRating: p3.averageRating,
      totalReviews: p3.totalReviews,
      ratingDistribution: p3.ratingDistribution,
    });

    if (p3.averageRating !== 4.0 || p3.totalReviews !== 2) {
      throw new Error('Stats did not update correctly for 2 reviews (expected 4.0 average)');
    }
    if (p3.ratingDistribution.fiveStar !== 1 || p3.ratingDistribution.threeStar !== 1 || p3.ratingDistribution.oneStar !== 0) {
      throw new Error('Rating distribution incorrect for 2 reviews');
    }
    console.log('🟢 [PASS] Second review updates averages to 4.0.');

    // ----------------------------------------------------
    // TEST 4: Update second review (Change from 3 stars to 1 star)
    // ----------------------------------------------------
    console.log('\n👉 Test 4: Updating second review (3 stars -> 1 star)...');
    await productReviewService.updateReview(review2._id, buyer2Id, { rating: 1 });

    const p4 = await Product.findById(productId);
    console.log('Product rating stats (after review update):', {
      rating: p4.rating,
      reviewsCount: p4.reviewsCount,
      averageRating: p4.averageRating,
      totalReviews: p4.totalReviews,
      ratingDistribution: p4.ratingDistribution,
    });

    if (p4.averageRating !== 3.0 || p4.totalReviews !== 2) {
      throw new Error('Stats did not update correctly after review update (expected 3.0 average)');
    }
    if (p4.ratingDistribution.fiveStar !== 1 || p4.ratingDistribution.threeStar !== 0 || p4.ratingDistribution.oneStar !== 1) {
      throw new Error('Rating distribution incorrect after review update');
    }
    console.log('🟢 [PASS] Review update recalculates average and distribution correctly.');

    // ----------------------------------------------------
    // TEST 5: Soft delete first review
    // ----------------------------------------------------
    console.log('\n👉 Test 5: Soft-deleting first review (5 stars)...');
    await productReviewService.deleteReview(r1.id, buyerId);

    const p5 = await Product.findById(productId);
    console.log('Product rating stats (after soft-delete):', {
      rating: p5.rating,
      reviewsCount: p5.reviewsCount,
      averageRating: p5.averageRating,
      totalReviews: p5.totalReviews,
      ratingDistribution: p5.ratingDistribution,
    });

    if (p5.averageRating !== 1.0 || p5.totalReviews !== 1) {
      throw new Error('Stats did not update correctly after soft-delete (expected 1.0 average)');
    }
    if (p5.ratingDistribution.fiveStar !== 0 || p5.ratingDistribution.oneStar !== 1) {
      throw new Error('Rating distribution incorrect after soft-delete');
    }
    console.log('🟢 [PASS] Soft delete recalculates averages correctly.');

    // ----------------------------------------------------
    // TEST 6: Exclude non-published reviews
    // ----------------------------------------------------
    console.log('\n👉 Test 6: Verifying non-published reviews are excluded...');
    // Make second review status 'Hidden' instead of 'Published'
    review2.status = 'Hidden';
    await review2.save();

    await recalculateProductRating(productId);

    const p6 = await Product.findById(productId);
    console.log('Product rating stats (with review Hidden):', {
      rating: p6.rating,
      reviewsCount: p6.reviewsCount,
      averageRating: p6.averageRating,
      totalReviews: p6.totalReviews,
      ratingDistribution: p6.ratingDistribution,
    });

    if (p6.averageRating !== 0 || p6.totalReviews !== 0) {
      throw new Error('Hidden review was included in calculations!');
    }
    console.log('🟢 [PASS] Non-published reviews are correctly ignored.');

    // Clean up buyer2
    await User.findByIdAndDelete(buyer2Id);
    await ProductReview.findByIdAndDelete(review2._id);

  } finally {
    // ----------------------------------------------------
    // CLEANUP (Temporarily commented out to let you see data in Atlas)
    // ----------------------------------------------------
    console.log('\n🧹 Skipped cleaning up test database documents so you can see them in Atlas.');
    // await User.findByIdAndDelete(buyerId);
    // await User.findByIdAndDelete(sellerUserId);
    // await Seller.findByIdAndDelete(sellerDocId);
    // await Product.findByIdAndDelete(productId);
    // await Order.findByIdAndDelete(orderId);
    console.log('✅ Cleanup skipped.');
  }

  await mongoose.connection.close();
  console.log('\n🎉 ALL RATING AGGREGATION TESTS PASSED SUCCESSFULLY!');
};

runTests().catch((err) => {
  console.error('\n🔴 Fatal Test Error:', err);
  mongoose.connection.close();
});
