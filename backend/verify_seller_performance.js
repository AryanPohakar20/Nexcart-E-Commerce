import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import Order from './src/models/Order.js';
import SellerReview from './src/models/SellerReview.js';
import Product from './src/models/Product.js';
import * as sellerStatisticsService from './src/services/sellerStatisticsService.js';
import * as adminOrderService from './src/services/adminOrderService.js';

const runTests = async () => {
  console.log('🚀 Connecting to MongoDB...');
  await connectDB();

  // Test ObjectIds
  const buyerId = new mongoose.Types.ObjectId();
  const sellerAUserId = new mongoose.Types.ObjectId();
  const sellerADocId = new mongoose.Types.ObjectId();
  const sellerBUserId = new mongoose.Types.ObjectId();
  const sellerBDocId = new mongoose.Types.ObjectId();
  
  const orderIds = [];

  console.log('📦 Seeding test database documents...');

  // Create Mock Buyer User
  const buyerUser = new User({
    _id: buyerId,
    firstName: 'John',
    lastName: 'Doe',
    username: `john_perf_buyer_${Date.now()}`,
    email: `john_perf_buyer_${Date.now()}@example.com`,
    role: 'customer',
    provider: 'email',
    isVerified: true,
    phone: '1234567890',
    password: 'password123',
  });
  await buyerUser.save();

  // Create Mock Seller A User
  const sellerAUser = new User({
    _id: sellerAUserId,
    firstName: 'Jane',
    lastName: 'StoreA',
    username: `jane_perf_user_a_${Date.now()}`,
    email: `jane_perf_user_a_${Date.now()}@example.com`,
    role: 'seller',
    provider: 'email',
    isVerified: true,
    phone: '1112223333',
    password: 'password123',
  });
  await sellerAUser.save();

  // Create Seller A Document
  const sellerADoc = new Seller({
    _id: sellerADocId,
    userId: sellerAUserId,
    sellerType: 'individual',
    status: 'Approved',
    isActive: true,
    rating: 4.5,
    totalReviews: 12,
    averageRating: 4.5,
    ratingDistribution: { oneStar: 0, twoStar: 1, threeStar: 2, fourStar: 3, fiveStar: 6 },
  });
  await sellerADoc.save();

  // Create Mock Seller B User
  const sellerBUser = new User({
    _id: sellerBUserId,
    firstName: 'Bob',
    lastName: 'StoreB',
    username: `bob_perf_user_b_${Date.now()}`,
    email: `bob_perf_user_b_${Date.now()}@example.com`,
    role: 'seller',
    provider: 'email',
    isVerified: true,
    phone: '4445556666',
    password: 'password123',
  });
  await sellerBUser.save();

  // Create Seller B Document
  const sellerBDoc = new Seller({
    _id: sellerBDocId,
    userId: sellerBUserId,
    sellerType: 'individual',
    status: 'Approved',
    isActive: true,
  });
  await sellerBDoc.save();

  // Helper to create test orders
  const seedOrder = async (sellerId, status, details = {}) => {
    const orderId = new mongoose.Types.ObjectId();
    const order = new Order({
      _id: orderId,
      orderId: `ORD-PERF-${Math.floor(10000 + Math.random() * 90000)}`,
      customer: buyerId,
      seller: sellerId,
      totalAmount: 100.0,
      itemCount: 1,
      orderStatus: status,
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          name: 'Mock Product',
          price: 100.0,
          quantity: 1,
          subtotal: 100.0,
        },
      ],
      ...details,
    });
    await order.save();
    orderIds.push(orderId);
    return orderId;
  };

  // Order 1: delivered (Seller A)
  await seedOrder(sellerADocId, 'delivered');

  // Order 2: cancelled - Attributed to Seller A (reason: "Seller ran out of stock")
  await seedOrder(sellerADocId, 'cancelled', { cancelReason: 'Seller ran out of stock' });

  // Order 3: cancelled - Excluded from Seller A (reason: "Customer changed mind")
  await seedOrder(sellerADocId, 'cancelled', { cancelReason: 'Customer changed mind' });

  // Order 4: cancelled - Excluded from Seller A (reason: "System payment timeout")
  await seedOrder(sellerADocId, 'cancelled', { cancelReason: 'System payment timeout' });

  // Order 5: processing (Seller A)
  const order5Id = await seedOrder(sellerADocId, 'processing');

  // Order 6: delivered (Seller B)
  await seedOrder(sellerBDocId, 'delivered');

  console.log('✅ Mock data seeded. Running performance tests...\n');

  try {
    // ----------------------------------------------------
    // TEST 1: Zero orders seller C
    // ----------------------------------------------------
    console.log('👉 Test 1: Checking stats for seller with 0 orders...');
    const sellerCUserId = new mongoose.Types.ObjectId();
    const sellerCDocId = new mongoose.Types.ObjectId();
    const sellerCDoc = new Seller({
      _id: sellerCDocId,
      userId: sellerCUserId,
      sellerType: 'individual',
      status: 'Approved',
      isActive: true,
    });
    await sellerCDoc.save();

    await sellerStatisticsService.recalculateSellerStatistics(sellerCDocId);
    const sC = await Seller.findById(sellerCDocId);

    console.log('Seller C stats (0 orders):', sC.statistics);
    if (sC.statistics.completedOrders !== 0 || sC.statistics.cancellationRate !== 0) {
      throw new Error('Default stats for 0 orders must be 0');
    }
    console.log('🟢 [PASS] Zero-orders defaults verified.');

    // ----------------------------------------------------
    // TEST 2: Calculate Seller A stats
    // ----------------------------------------------------
    console.log('\n👉 Test 2: Calculating statistics for Seller A...');
    await sellerStatisticsService.recalculateSellerStatistics(sellerADocId);
    const sA = await Seller.findById(sellerADocId);

    console.log('Seller A Stats:', {
      completedOrders: sA.statistics.completedOrders,
      cancellationRate: sA.statistics.cancellationRate,
      responseRate: sA.statistics.responseRate,
    });

    // Completed: Order 1 (1)
    // Denominator (total): Orders 1, 2, 3, 4, 5 (5)
    // Seller cancellations: Order 2 (1)
    // Cancellation rate: (1 / 5) * 100 = 20.0%
    if (sA.statistics.completedOrders !== 1 || sA.statistics.cancellationRate !== 20) {
      throw new Error(`Expected completedOrders = 1 and cancellationRate = 20, got completed = ${sA.statistics.completedOrders}, cancellation = ${sA.statistics.cancellationRate}`);
    }
    console.log('🟢 [PASS] Performance calculations (completed & cancellation rate) correct.');

    // ----------------------------------------------------
    // TEST 3: Deterministic Recalculation (running twice)
    // ----------------------------------------------------
    console.log('\n👉 Test 3: Running recalculation again to verify determinism...');
    await sellerStatisticsService.recalculateSellerStatistics(sellerADocId);
    const sA2 = await Seller.findById(sellerADocId);

    if (sA2.statistics.completedOrders !== 1 || sA2.statistics.cancellationRate !== 20) {
      throw new Error('Stats changed on second run! Recalculation is not deterministic');
    }
    console.log('🟢 [PASS] Recalculation is deterministic.');

    // ----------------------------------------------------
    // TEST 4: Response Rate verification
    // ----------------------------------------------------
    console.log('\n👉 Test 4: Verifying response rate is not fabricated...');
    if (sA.statistics.responseRate !== 0) {
      throw new Error('Response rate must be 0 (unavailable/not yet calculable)');
    }
    console.log('🟢 [PASS] Response rate is correctly 0 and documented.');

    // ----------------------------------------------------
    // TEST 5: Seller Isolation
    // ----------------------------------------------------
    console.log('\n👉 Test 5: Verifying Seller A is isolated from Seller B...');
    await sellerStatisticsService.recalculateSellerStatistics(sellerBDocId);
    
    const sB = await Seller.findById(sellerBDocId);
    const sAIsolation = await Seller.findById(sellerADocId);

    console.log('Seller B Stats:', sB.statistics);
    console.log('Seller A Stats:', sAIsolation.statistics);

    if (sB.statistics.completedOrders !== 1 || sB.statistics.cancellationRate !== 0) {
      throw new Error('Seller B stats incorrect');
    }
    if (sAIsolation.statistics.completedOrders !== 1 || sAIsolation.statistics.cancellationRate !== 20) {
      throw new Error('Seller A stats were modified by Seller B calculations');
    }
    console.log('🟢 [PASS] Seller stats are isolated.');

    // ----------------------------------------------------
    // TEST 6: Order Lifecycle Trigger
    // ----------------------------------------------------
    console.log('\n👉 Test 6: Verifying automated trigger on order status change (processing -> delivered)...');
    
    // Call adminOrderService.updateOrderStatus to transition Order 5 to delivered
    const adminUser = new User({ _id: new mongoose.Types.ObjectId(), role: 'admin', email: 'admin@nexcart.com' });
    await adminOrderService.updateOrderStatus(order5Id, 'delivered', 'Order fulfilled', adminUser, '127.0.0.1');

    // Wait a brief moment to allow statistics recalculation to finish
    await new Promise((resolve) => setTimeout(resolve, 100));

    const sATrigger = await Seller.findById(sellerADocId);
    console.log('Seller A Stats after trigger:', sATrigger.statistics);

    // Order 5 became completed, so completedOrders should now be 2.
    // Denominator remains 5.
    // Seller cancellations remains 1.
    // Rate remains 20%.
    if (sATrigger.statistics.completedOrders !== 2 || sATrigger.statistics.cancellationRate !== 20) {
      throw new Error(`Automated order lifecycle trigger failed. Completed: ${sATrigger.statistics.completedOrders}`);
    }
    console.log('🟢 [PASS] Order lifecycle trigger updates seller performance statistics correctly.');

    // ----------------------------------------------------
    // TEST 7: Rating Aggregation Protection
    // ----------------------------------------------------
    console.log('\n👉 Test 7: Verifying existing Seller Rating Aggregation is unaffected...');
    if (sATrigger.rating !== 4.5 || sATrigger.totalReviews !== 12 || sATrigger.averageRating !== 4.5) {
      throw new Error('Seller review statistics were corrupted by performance statistics update');
    }
    if (sATrigger.ratingDistribution.fiveStar !== 6 || sATrigger.ratingDistribution.twoStar !== 1) {
      throw new Error('Rating distribution counts corrupted');
    }
    console.log('🟢 [PASS] Rating aggregation fields remain fully intact and correct.');

    // Cleanup seller C
    await Seller.findByIdAndDelete(sellerCDocId);

  } finally {
    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test database documents...');
    await User.findByIdAndDelete(buyerId);
    await User.findByIdAndDelete(sellerAUserId);
    await User.findByIdAndDelete(sellerBUserId);
    await Seller.findByIdAndDelete(sellerADocId);
    await Seller.findByIdAndDelete(sellerBDocId);
    for (const id of orderIds) {
      await Order.findByIdAndDelete(id);
    }
    console.log('✅ Cleanup finished.');
  }

  await mongoose.connection.close();
  console.log('\n🎉 ALL SELLER PERFORMANCE TESTS PASSED SUCCESSFULLY!');
};

runTests().catch((err) => {
  console.error('\n🔴 Fatal Test Error:', err);
  mongoose.connection.close();
});
