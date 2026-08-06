import fs from 'fs';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Seller from './src/models/Seller.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import Return from './src/models/Return.js';
import * as returnService from './src/services/returnService.js';

export const runTests = async () => {
  const logFile = './test_output.log';
  fs.writeFileSync(logFile, '--- Starting Return/Refund API Tests ---\n');

  const log = (msg) => {
    fs.appendFileSync(logFile, msg + '\n');
  };

  const errLog = (msg, err = '') => {
    fs.appendFileSync(logFile, `[ERROR] ${msg} ${err?.message || err || ''}\n`);
  };

  let createdDocs = [];

  try {
    log('Starting tests...');
    const suffix = Math.floor(Math.random() * 1000000);

    // Create Customer
    const customer = await User.create({
      firstName: 'CustFirstName',
      lastName: 'CustLastName',
      username: `cust_${suffix}`,
      email: `cust_${suffix}@test.com`,
      phone: `90000${suffix}`.substring(0, 10),
      password: 'password123',
      role: 'customer',
    });
    createdDocs.push(customer);

    // Create another Customer
    const otherCustomer = await User.create({
      firstName: 'OtherCustFirstName',
      lastName: 'OtherCustLastName',
      username: `othercust_${suffix}`,
      email: `othercust_${suffix}@test.com`,
      phone: `90001${suffix}`.substring(0, 10),
      password: 'password123',
      role: 'customer',
    });
    createdDocs.push(otherCustomer);

    // Create Seller
    const sellerUser = await User.create({
      firstName: 'SellFirstName',
      lastName: 'SellLastName',
      username: `sell_${suffix}`,
      email: `sell_${suffix}@test.com`,
      phone: `90002${suffix}`.substring(0, 10),
      password: 'password123',
      role: 'seller',
    });
    createdDocs.push(sellerUser);

    const sellerProfile = await Seller.create({
      userId: sellerUser._id,
      business: { businessName: `Shop_${suffix}` },
      accountInfo: { displayName: `Shop_${suffix}`, email: sellerUser.email },
      verificationStatus: 'Verified',
      status: 'Active',
    });
    createdDocs.push(sellerProfile);

    // Create Product
    const product = await Product.create({
      title: `Returnable Product ${suffix}`,
      slug: `returnable-prod-${suffix}`,
      sku: `SKU-${suffix}`,
      price: 999,
      stock: 50,
      seller: sellerProfile._id,
      sellerModel: 'Seller',
      category: new mongoose.Types.ObjectId(),
    });
    createdDocs.push(product);

    // Create delivered order
    const orderDelivered = await Order.create({
      orderNumber: `ORD-DEL-${suffix}`,
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
        firstName: 'CustFirstName',
        lastName: 'CustLastName',
        street: '123 Delivery St',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
      },
      payment: {
        paymentMethod: 'UPI',
        paymentStatus: 'completed',
      },
      orderStatus: 'Delivered',
      timeline: [{
        status: 'Delivered',
        title: 'Delivered',
        description: 'Order delivered successfully.',
      }],
    });
    createdDocs.push(orderDelivered);

    // Create pending order
    const orderPending = await Order.create({
      orderNumber: `ORD-PEND-${suffix}`,
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
        firstName: 'CustFirstName',
        lastName: 'CustLastName',
        street: '123 Delivery St',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
      },
      payment: {
        paymentMethod: 'COD',
        paymentStatus: 'pending',
      },
      orderStatus: 'Pending',
      timeline: [{
        status: 'Pending',
        title: 'Order Placed',
        description: 'Order placed.',
      }],
    });
    createdDocs.push(orderPending);

    log('Mock setup complete.');

    // --- TEST 1: Request Return for another user's order ---
    log('Test 1: Request return for another user\'s order...');
    try {
      await returnService.requestReturn(orderDelivered._id, otherCustomer._id, { reason: 'Wrong size' });
      errLog('FAIL: Expected 404 error but requestReturn succeeded.');
    } catch (error) {
      if (error.statusCode === 404) {
        log('✅ PASS: Correctly blocked with 404.');
      } else {
        errLog('FAIL: Expected 404 but got:', error);
      }
    }

    // --- TEST 2: Request Return for order not delivered ---
    log('Test 2: Request return for order in Pending status...');
    try {
      await returnService.requestReturn(orderPending._id, customer._id, { reason: 'Defective' });
      errLog('FAIL: Expected 409 error but requestReturn succeeded.');
    } catch (error) {
      if (error.statusCode === 409) {
        log('✅ PASS: Correctly blocked with 409.');
      } else {
        errLog('FAIL: Expected 409 but got:', error);
      }
    }

    // --- TEST 3: Request Return for delivered order ---
    log('Test 3: Request return for Delivered order...');
    const returnReq = await returnService.requestReturn(orderDelivered._id, customer._id, {
      reason: 'Color mismatch',
      description: 'Ordered blue but received black.'
    });
    log('✅ PASS: Return requested successfully. returnId: ' + returnReq.returnId);

    // Verify order flag and timeline
    const updatedOrder = await Order.findById(orderDelivered._id);
    if (updatedOrder.returnRequested === true) {
      log('✅ PASS: Order returnRequested marked true.');
    } else {
      errLog('FAIL: Order returnRequested is not true.');
    }
    const lastTimelineEvent = updatedOrder.timeline[updatedOrder.timeline.length - 1];
    if (lastTimelineEvent.title === 'Return Requested') {
      log('✅ PASS: Order timeline updated correctly.');
    } else {
      errLog('FAIL: Last timeline event is not "Return Requested".', lastTimelineEvent);
    }

    // --- TEST 4: Duplicate Return Request ---
    log('Test 4: Duplicate return request...');
    try {
      await returnService.requestReturn(orderDelivered._id, customer._id, { reason: 'Duplicate test' });
      errLog('FAIL: Expected 409 error but duplicate requestReturn succeeded.');
    } catch (error) {
      if (error.statusCode === 409) {
        log('✅ PASS: Correctly blocked with 409.');
      } else {
        errLog('FAIL: Expected 409 but got:', error);
      }
    }

    // --- TEST 5: Admin list returns ---
    log('Test 5: List return requests...');
    const listRes = await returnService.listReturns({ status: 'Pending' });
    if (listRes.returns.length > 0 && listRes.pagination) {
      log('✅ PASS: Admin successfully fetched list with pagination.');
    } else {
      errLog('FAIL: Failed to list returns.');
    }

    // --- TEST 6: Admin fetch return details ---
    log('Test 6: Get return request details...');
    const details = await returnService.getReturnDetails(returnReq.returnId);
    if (details && details.returnId === returnReq.returnId && details.order && details.customer && details.seller && details.products.length > 0) {
      log('✅ PASS: Admin successfully fetched return details with full populate.');
    } else {
      errLog('FAIL: Return details population failed.', details);
    }

    // --- TEST 7: Invalid transitions ---
    log('Test 7: Verify invalid transition (Completing refund directly from Pending status)...');
    try {
      await returnService.reviewReturn(returnReq.returnId, { refundStatus: 'Refund Completed' });
      errLog('FAIL: Expected 409 error for invalid transition.');
    } catch (error) {
      if (error.statusCode === 409) {
        log('✅ PASS: Correctly blocked with 409.');
      } else {
        errLog('FAIL: Expected 409 but got:', error);
      }
    }

    // --- TEST 8: Admin approve return request ---
    log('Test 8: Admin approves return request...');
    const approvedRequest = await returnService.reviewReturn(returnReq.returnId, { status: 'Approved' });
    if (approvedRequest.status === 'Approved') {
      log('✅ PASS: Return status updated to Approved.');
    } else {
      errLog('FAIL: Status is not Approved.', approvedRequest);
    }
    const lastRetTimelineEvent = approvedRequest.timeline[approvedRequest.timeline.length - 1];
    if (lastRetTimelineEvent.description === 'Administrator approved return request.') {
      log('✅ PASS: Return timeline updated with approval.');
    } else {
      errLog('FAIL: Return request timeline event mismatch.', lastRetTimelineEvent);
    }

    // --- TEST 9: Admin completes refund ---
    log('Test 9: Admin completes refund...');
    const completedRequest = await returnService.reviewReturn(returnReq.returnId, { refundStatus: 'Refund Completed' });
    if (completedRequest.refundStatus === 'Refund Completed') {
      log('✅ PASS: Refund status updated to Refund Completed.');
    } else {
      errLog('FAIL: refundStatus is not Refund Completed.', completedRequest);
    }

    // Verify order update status and refund details
    const refundedOrder = await Order.findById(orderDelivered._id);
    if (refundedOrder.orderStatus === 'Returned' && refundedOrder.paymentInfo.status === 'refunded' && refundedOrder.refundInfo.status === 'refunded') {
      log('✅ PASS: Order status, paymentInfo status, and refundInfo status marked refunded/returned.');
    } else {
      errLog('FAIL: Order refund details not synced.', refundedOrder);
    }

    // --- TEST 10: Transition after completion should fail ---
    log('Test 10: Try to reject or re-refund a completed refund request...');
    try {
      await returnService.reviewReturn(returnReq.returnId, { status: 'Rejected' });
      errLog('FAIL: Expected 409 error after completion.');
    } catch (error) {
      if (error.statusCode === 409) {
        log('✅ PASS: Correctly blocked further updates with 409.');
      } else {
        errLog('FAIL: Expected 409 but got:', error);
      }
    }

    // --- TEST 11: Rejection flow ---
    log('Test 11: Verify Rejection status flow...');
    const orderDelivered2 = await Order.create({
      orderNumber: `ORD-DEL2-${suffix}`,
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
        firstName: 'CustFirstName',
        lastName: 'CustLastName',
        street: '123 Delivery St',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
      },
      payment: {
        paymentMethod: 'UPI',
        paymentStatus: 'completed',
      },
      orderStatus: 'Delivered',
      timeline: [{
        status: 'Delivered',
        title: 'Delivered',
        description: 'Order delivered successfully.',
      }],
    });
    createdDocs.push(orderDelivered2);

    const returnReq2 = await returnService.requestReturn(orderDelivered2._id, customer._id, {
      reason: 'Damaged item'
    });

    const rejectedRequest = await returnService.reviewReturn(returnReq2.returnId, {
      status: 'Rejected',
      rejectionReason: 'Product was not damaged according to pictures.'
    });

    if (rejectedRequest.status === 'Rejected' && rejectedRequest.rejectionReason === 'Product was not damaged according to pictures.') {
      log('✅ PASS: Return request rejected successfully with rejection reason stored.');
    } else {
      errLog('FAIL: Return rejection failed.', rejectedRequest);
    }

    try {
      await returnService.reviewReturn(returnReq2.returnId, { refundStatus: 'Refund Completed' });
      errLog('FAIL: Expected 409 trying to complete refund on rejected return.');
    } catch (error) {
      if (error.statusCode === 409) {
        log('✅ PASS: Correctly blocked refund completion on rejected request.');
      } else {
        errLog('FAIL: Expected 409 but got:', error);
      }
    }

    log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (err) {
    errLog('TEST SUITE FATAL EXCEPTION:', err);
  } finally {
    log('Cleaning up database mock documents...');
    // Clean up
    for (const doc of createdDocs) {
      try {
        await doc.deleteOne();
      } catch (e) {
        errLog('Error cleaning up doc', e);
      }
    }
    try {
      await Return.deleteMany({ customerId: { $in: createdDocs.map(d => d._id) } });
    } catch (e) {
      errLog('Error cleaning up Return requests', e);
    }
    log('Clean up done.');
  }
};
