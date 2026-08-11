import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import ProductReview from './src/models/ProductReview.js';
import SellerReview from './src/models/SellerReview.js';
import * as reviewEligibilityService from './src/services/reviewEligibilityService.js';

const runTests = async () => {
  console.log('🚀 Connecting to MongoDB Atlas...');
  await connectDB();

  // Temporary test IDs
  const customerUserId = new mongoose.Types.ObjectId();
  const sellerUserId = new mongoose.Types.ObjectId();
  const orderId = new mongoose.Types.ObjectId();
  const orderItemId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const sellerDocId = new mongoose.Types.ObjectId();

  console.log('📦 Seeding temporary test documents...');

  // 1. Create Seller Document
  const sellerDoc = new Seller({
    _id: sellerDocId,
    userId: sellerUserId,
    sellerType: 'individual',
    status: 'Approved',
    isActive: true,
  });
  await sellerDoc.save();

  // 2. Create Product Document
  const productDoc = new Product({
    _id: productId,
    title: 'Review Test Product',
    slug: `test-product-${Date.now()}`,
    description: 'A mock product for review verification testing.',
    price: 99.99,
    mrp: 129.99,
    category: 'Electronics',
    brand: 'NexCart',
    stock: 50,
    sellerId: sellerUserId, // Owned by the mock seller
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150',
        publicId: 'test-image-id',
        isPrimary: true,
      }
    ],
  });
  await productDoc.save();

  // 3. Create Order Document (Delivered)
  const orderDoc = new Order({
    _id: orderId,
    orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    customer: customerUserId,
    seller: sellerDocId,
    totalAmount: 99.99,
    itemCount: 1,
    orderStatus: 'delivered', // Delivered order
    items: [
      {
        _id: orderItemId,
        product: productId,
        name: 'Review Test Product',
        price: 99.99,
        quantity: 1,
        subtotal: 99.99,
      },
    ],
  });
  await orderDoc.save();

  console.log('✅ Mock data seeded. Executing eligibility checks...\n');

  // Helper to run check and log outcome
  const checkEligibility = async (name, fn) => {
    try {
      const result = await fn();
      console.log(`🟢 [PASS] ${name}: Eligible!`);
      return result;
    } catch (err) {
      console.log(`🔴 [BLOCKED] ${name}: ${err.message} (HTTP Status: ${err.statusCode || 500})`);
    }
  };

  // --- PRODUCT REVIEW TESTS ---

  // Test 1: Standard Valid Review
  await checkEligibility('Test 1: Valid Product Review (Delivered & Purchased)', () =>
    reviewEligibilityService.canReviewProduct({
      customerId: customerUserId,
      productId,
      orderId,
      orderItemId,
    })
  );

  // Test 2: Incomplete Order Status
  orderDoc.orderStatus = 'processing';
  await orderDoc.save();
  await checkEligibility('Test 2: Incomplete Order Status (processing)', () =>
    reviewEligibilityService.canReviewProduct({
      customerId: customerUserId,
      productId,
      orderId,
      orderItemId,
    })
  );

  // Test 3: Cancelled Order Status
  orderDoc.orderStatus = 'cancelled';
  await orderDoc.save();
  await checkEligibility('Test 3: Cancelled Order Status', () =>
    reviewEligibilityService.canReviewProduct({
      customerId: customerUserId,
      productId,
      orderId,
      orderItemId,
    })
  );

  // Restore order to Delivered for subsequent tests
  orderDoc.orderStatus = 'delivered';
  await orderDoc.save();

  // Test 4: Access Denied (Not Buyer)
  const wrongCustomerId = new mongoose.Types.ObjectId();
  await checkEligibility('Test 4: Access Denied (Non-buyer attempting review)', () =>
    reviewEligibilityService.canReviewProduct({
      customerId: wrongCustomerId,
      productId,
      orderId,
      orderItemId,
    })
  );

  // Test 5: Self-Review Prevention (Seller reviewing own product)
  productDoc.sellerId = customerUserId;
  await productDoc.save();

  await checkEligibility('Test 5: Self-Review Prevention (Seller reviewing own product)', () =>
    reviewEligibilityService.canReviewProduct({
      customerId: customerUserId, // Buyer and seller are the same user ID
      productId,
      orderId,
      orderItemId,
    })
  );

  // Restore product sellerId
  productDoc.sellerId = sellerUserId;
  await productDoc.save();

  // Test 6: Duplicate Review Prevention
  const mockReview = new ProductReview({
    productId,
    sellerId: sellerUserId,
    customerId: customerUserId,
    orderId,
    orderItemId,
    rating: 5,
    comment: 'Great product!',
  });
  await mockReview.save();

  await checkEligibility('Test 6: Duplicate Review Prevention', () =>
    reviewEligibilityService.canReviewProduct({
      customerId: customerUserId,
      productId,
      orderId,
      orderItemId,
    })
  );

  // Clean up duplicate review
  await ProductReview.deleteMany({ orderItemId });


  // --- SELLER REVIEW TESTS ---

  // Test 7: Valid Seller Review
  await checkEligibility('Test 7: Valid Seller Review', () =>
    reviewEligibilityService.canReviewSeller({
      customerId: customerUserId,
      sellerId: sellerUserId,
      orderId,
    })
  );

  // Test 7b: Self-Review Prevention (Seller reviewing themselves)
  sellerDoc.userId = customerUserId;
  await sellerDoc.save();

  await checkEligibility('Test 7b: Self-Review Prevention (Seller reviewing themselves)', () =>
    reviewEligibilityService.canReviewSeller({
      customerId: customerUserId,
      sellerId: customerUserId,
      orderId,
    })
  );

  // Restore seller userId
  sellerDoc.userId = sellerUserId;
  await sellerDoc.save();

  // Test 8: Duplicate Seller Review
  const mockSellerReview = new SellerReview({
    sellerId: sellerUserId,
    customerId: customerUserId,
    orderId,
    rating: 4,
    comment: 'Good seller!',
  });
  await mockSellerReview.save();

  await checkEligibility('Test 8: Duplicate Seller Review Prevention', () =>
    reviewEligibilityService.canReviewSeller({
      customerId: customerUserId,
      sellerId: sellerUserId,
      orderId,
    })
  );

  // Clean up duplicate seller review
  await SellerReview.deleteMany({ orderId });


  // --- CLEANUP ---
  console.log('\n🧹 Cleaning up test documents...');
  await Seller.findByIdAndDelete(sellerDocId);
  await Product.findByIdAndDelete(productId);
  await Order.findByIdAndDelete(orderId);
  console.log('✅ Cleanup finished.');

  await mongoose.connection.close();
  console.log('🔌 Disconnected from MongoDB.');
};

runTests().catch((err) => {
  console.error('Fatal Test Error:', err);
  mongoose.connection.close();
});
