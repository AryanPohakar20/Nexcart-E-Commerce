import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import * as adminOrderService from './src/services/adminOrderService.js';

const runTests = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected.');

    // 1. Setup mock customer, seller, product, and order documents
    const randomSuffix = Math.floor(Math.random() * 100000);
    
    const customer = await User.create({
      firstName: 'AliceCustomer',
      lastName: 'Doe',
      username: `alice_${randomSuffix}`,
      email: `alice.${randomSuffix}@test.com`,
      phone: `99920${randomSuffix}`,
      password: 'password123',
      role: 'customer',
    });

    const sellerUser = await User.create({
      firstName: 'BobSeller',
      lastName: 'Merchant',
      username: `bob_${randomSuffix}`,
      email: `bob.${randomSuffix}@test.com`,
      phone: `99921${randomSuffix}`,
      password: 'password123',
      role: 'seller',
    });

    const sellerProfile = await Seller.create({
      userId: sellerUser._id,
      business: { businessName: `Quantum Store ${randomSuffix}` },
      accountInfo: { displayName: `Quantum Store ${randomSuffix}`, email: sellerUser.email },
      verificationStatus: 'Verified',
      status: 'Active',
    });

    const product = await Product.create({
      title: 'Hyper-Product-Keypad',
      slug: `product-keypad-${randomSuffix}`,
      sku: `KEY-${randomSuffix}`,
      price: 1500,
      stock: 20,
      seller: sellerProfile._id,
      sellerModel: 'Seller',
      category: new mongoose.Types.ObjectId(),
    });

    const order = await Order.create({
      orderNumber: `ORD-TEST-${randomSuffix}`,
      customer: customer._id,
      seller: sellerProfile._id,
      sellerModel: 'Seller',
      items: [{
        product: product._id,
        title: product.title,
        price: product.price,
        quantity: 1,
      }],
      shippingAddress: {
        firstName: 'AliceCustomer',
        lastName: 'Doe',
        street: '789 Admin Lane',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
      },
      payment: {
        paymentMethod: 'Prepaid',
        paymentStatus: 'pending',
      },
      orderStatus: 'Pending',
      timeline: [{
        status: 'Pending',
        title: 'Order Placed',
        description: 'Order placed successfully.',
      }],
    });

    console.log(`\nMock documents created. Order ID: ${order._id}`);

    // ==========================================
    // TEST 1: GET ALL / LIST ORDERS (No query)
    // ==========================================
    console.log('\nRunning Test 1: Fetch all orders...');
    const listRes1 = await adminOrderService.listOrders({});
    if (listRes1.orders && listRes1.pagination) {
      console.log('✅ PASS: Retrieved list and pagination details.');
      console.log('Pagination details:', listRes1.pagination);
    } else {
      console.error('❌ FAIL: Expected orders list and pagination details.');
    }

    // ==========================================
    // TEST 2: LIST ORDERS (Search by Customer Name)
    // ==========================================
    console.log('\nRunning Test 2: Search orders by customer name ("AliceCustomer")...');
    const listRes2 = await adminOrderService.listOrders({ search: 'AliceCustomer' });
    const foundOrder2 = listRes2.orders.find(o => o.orderId.toString() === order._id.toString());
    if (foundOrder2) {
      console.log('✅ PASS: Found order using customer name search.');
    } else {
      console.error('❌ FAIL: Could not search order by customer name.');
    }

    // ==========================================
    // TEST 3: LIST ORDERS (Search by Product Name)
    // ==========================================
    console.log('\nRunning Test 3: Search orders by product name ("Hyper-Product")...');
    const listRes3 = await adminOrderService.listOrders({ search: 'Hyper-Product' });
    const foundOrder3 = listRes3.orders.find(o => o.orderId.toString() === order._id.toString());
    if (foundOrder3) {
      console.log('✅ PASS: Found order using product name search.');
    } else {
      console.error('❌ FAIL: Could not search order by product name.');
    }

    // ==========================================
    // TEST 4: GET DETAILS (Valid Order)
    // ==========================================
    console.log('\nRunning Test 4: Retrieve full order details...');
    const details = await adminOrderService.getOrder(order._id);
    if (
      details.orderNumber === order.orderNumber &&
      details.customerInformation &&
      details.sellerInformation &&
      details.orderedProducts.length === 1 &&
      details.timeline.length === 1
    ) {
      console.log('✅ PASS: Sanitized details returned correctly with all expected properties.');
    } else {
      console.error('❌ FAIL: Sanitized order details format mismatch or missing fields:', details);
    }

    // ==========================================
    // TEST 5: GET DETAILS (Invalid ObjectId)
    // ==========================================
    console.log('\nRunning Test 5: Fetch details with invalid ObjectId (400)...');
    try {
      await adminOrderService.getOrder('invalid-id-here');
      console.error('❌ FAIL: Allowed invalid ObjectId.');
    } catch (err) {
      if (err.statusCode === 400) {
        console.log('✅ PASS: Correctly threw 400 error for invalid ObjectId.');
      } else {
        console.error('❌ FAIL: Expected 400 but got:', err);
      }
    }

    // ==========================================
    // TEST 6: STATUS UPDATE (Duplicate status update)
    // ==========================================
    console.log('\nRunning Test 6: Duplicate status update (Pending -> Pending) (409)...');
    try {
      await adminOrderService.updateOrderStatus(order._id, 'Pending', 'Same status', sellerUser, '127.0.0.1');
      console.error('❌ FAIL: Allowed duplicate status update.');
    } catch (err) {
      if (err.statusCode === 409) {
        console.log('✅ PASS: Correctly threw 409 for duplicate status update.');
      } else {
        console.error('❌ FAIL: Expected 409 but got:', err);
      }
    }

    // ==========================================
    // TEST 7: STATUS UPDATE (Invalid status)
    // ==========================================
    console.log('\nRunning Test 7: Update to invalid status (400)...');
    try {
      await adminOrderService.updateOrderStatus(order._id, 'SuperStatus', 'Invalid status', sellerUser, '127.0.0.1');
      console.error('❌ FAIL: Allowed invalid status.');
    } catch (err) {
      if (err.statusCode === 400) {
        console.log('✅ PASS: Correctly threw 400 for invalid status.');
      } else {
        console.error('❌ FAIL: Expected 400 but got:', err);
      }
    }

    // ==========================================
    // TEST 8: STATUS UPDATE (Valid transition override by Admin)
    // ==========================================
    console.log('\nRunning Test 8: Valid override (Pending -> Processing)...');
    const updateRes = await adminOrderService.updateOrderStatus(order._id, 'Processing', 'Admin override status', sellerUser, '127.0.0.1');
    if (updateRes.orderStatus === 'Processing') {
      console.log('✅ PASS: Correctly updated status and timeline entry added.');
      const adminEvent = updateRes.timeline.find(t => t.updatedBy === 'Admin');
      if (adminEvent && adminEvent.status === 'Processing') {
        console.log('✅ PASS: Admin timeline details match expectations.');
      } else {
        console.error('❌ FAIL: Timeline event update is incorrect:', updateRes.timeline);
      }
    } else {
      console.error('❌ FAIL: Status update failed:', updateRes);
    }

    // ==========================================
    // TEST 9: STATUS UPDATE (Locked on Delivered/Returned status)
    // ==========================================
    console.log('\nRunning Test 9: Locked status transition check (Delivered -> Shipped) (409)...');
    
    // Temporarily set order status to Delivered
    const orderDoc = await Order.findById(order._id);
    orderDoc.orderStatus = 'Delivered';
    await orderDoc.save();

    try {
      await adminOrderService.updateOrderStatus(order._id, 'Shipped', 'Reverse transition', sellerUser, '127.0.0.1');
      console.error('❌ FAIL: Allowed transition on Delivered order.');
    } catch (err) {
      if (err.statusCode === 409) {
        console.log('✅ PASS: Correctly threw 409 when order is already Delivered.');
      } else {
        console.error('❌ FAIL: Expected 409 but got:', err);
      }
    }

    // ==========================================
    // CLEAN UP
    // ==========================================
    console.log('\nCleaning up mock data...');
    await Order.findByIdAndDelete(order._id);
    await Product.findByIdAndDelete(product._id);
    await Seller.findByIdAndDelete(sellerProfile._id);
    await User.findByIdAndDelete(customer._id);
    await User.findByIdAndDelete(sellerUser._id);
    console.log('Clean up complete.');

  } catch (error) {
    console.error('Test run failed with error:', error);
  } finally {
    mongoose.disconnect();
  }
};

runTests();
