import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Notification from './models/Notification.js';
import { NOTIFICATION_TYPES } from './constants/notificationTypes.js';
import { NOTIFICATION_CATEGORIES, NOTIFICATION_PRIORITIES } from './constants/notificationEnums.js';

dotenv.config();

const sampleNotifications = [
  {
    receiver: '64f0b9c8f1b2c3d4e5f67890',
    sender: '64f0b9c8f1b2c3d4e5f67891',
    receiverRole: 'customer',
    title: 'Order shipped',
    message: 'Your order has been shipped and is on the way.',
    type: NOTIFICATION_TYPES.ORDER_UPDATED,
    category: NOTIFICATION_CATEGORIES.ORDER,
    priority: NOTIFICATION_PRIORITIES.HIGH,
    actionUrl: '/orders/123',
    icon: 'truck',
    isRead: false,
  },
  {
    receiver: '64f0b9c8f1b2c3d4e5f67890',
    sender: '64f0b9c8f1b2c3d4e5f67892',
    receiverRole: 'customer',
    title: 'Payment received',
    message: 'Your payment for the latest order was received successfully.',
    type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
    category: NOTIFICATION_CATEGORIES.PAYMENT,
    priority: NOTIFICATION_PRIORITIES.MEDIUM,
    actionUrl: '/payments/456',
    icon: 'credit-card',
    isRead: true,
    readAt: new Date(),
  },
  {
    receiver: '64f0b9c8f1b2c3d4e5f67890',
    sender: null,
    receiverRole: 'customer',
    title: 'Welcome to NexCart',
    message: 'Thanks for joining NexCart. Explore our latest offerings.',
    type: NOTIFICATION_TYPES.WELCOME,
    category: NOTIFICATION_CATEGORIES.GENERAL,
    priority: NOTIFICATION_PRIORITIES.LOW,
    actionUrl: '/products',
    icon: 'sparkles',
    isRead: false,
  },
];

const seedNotifications = async () => {
  try {
    await connectDB();
    await Notification.deleteMany({});
    const created = await Notification.insertMany(sampleNotifications);
    console.log(`Seeded ${created.length} sample notifications`);
    process.exit(0);
  } catch (error) {
    console.error('Notification seeding failed:', error.message);
    process.exit(1);
  }
};

seedNotifications();
