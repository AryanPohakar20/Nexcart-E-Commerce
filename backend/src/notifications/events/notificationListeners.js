import logger from '../../utils/logger.js';
import { createNotificationService } from '../services/notificationService.js';
import { getNotificationEmitter } from './notificationEmitter.js';
import NOTIFICATION_TYPES from '../constants/notificationTypes.js';
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
} from '../constants/notificationEnums.js';

const emitter = getNotificationEmitter();

const safeHandle = async (eventName, payload, handler) => {
  try {
    await handler(payload);
  } catch (error) {
    logger.error(`Notification listener failed for ${eventName}: ${error.message}`);
  }
};

const buildNotificationPayload = (eventName, payload) => ({
  receiver: payload.receiver,
  sender: payload.sender || null,
  receiverRole: payload.receiverRole || 'customer',
  title: payload.title || 'New notification',
  message: payload.message || '',
  type: payload.type || eventName,
  category: payload.category || NOTIFICATION_CATEGORIES.GENERAL,
  priority: payload.priority || NOTIFICATION_PRIORITIES.MEDIUM,
  relatedEntityRef: payload.relatedEntityRef || null,
  relatedEntityType: payload.relatedEntityType || null,
  metadata: payload.metadata || {},
  actionUrl: payload.actionUrl || null,
  icon: payload.icon || 'bell',
  expiresAt: payload.expiresAt || null,
});

export const registerNotificationListeners = () => {
  emitter.on('order.created', (payload) => {
    safeHandle('order.created', payload, async (eventPayload) => {
      await createNotificationService(buildNotificationPayload('order.created', {
        ...eventPayload,
        title: eventPayload.title || 'Order placed',
        message: eventPayload.message || 'Your order has been placed successfully.',
        type: NOTIFICATION_TYPES.ORDER_CREATED,
        category: NOTIFICATION_CATEGORIES.ORDER,
        priority: NOTIFICATION_PRIORITIES.HIGH,
      }));
    });
  });

  emitter.on('order.updated', (payload) => {
    safeHandle('order.updated', payload, async (eventPayload) => {
      await createNotificationService(buildNotificationPayload('order.updated', {
        ...eventPayload,
        title: eventPayload.title || 'Order updated',
        message: eventPayload.message || 'Your order status has changed.',
        type: NOTIFICATION_TYPES.ORDER_UPDATED,
        category: NOTIFICATION_CATEGORIES.ORDER,
        priority: NOTIFICATION_PRIORITIES.HIGH,
      }));
    });
  });

  emitter.on('seller.verification.updated', (payload) => {
    safeHandle('seller.verification.updated', payload, async (eventPayload) => {
      await createNotificationService(buildNotificationPayload('seller.verification.updated', {
        ...eventPayload,
        title: eventPayload.title || 'Seller verification status updated',
        message: eventPayload.message || 'Your seller verification status has changed.',
        type: eventPayload.isApproved
          ? NOTIFICATION_TYPES.SELLER_VERIFICATION_APPROVED
          : NOTIFICATION_TYPES.SELLER_VERIFICATION_REJECTED,
        category: NOTIFICATION_CATEGORIES.SELLER,
        priority: NOTIFICATION_PRIORITIES.HIGH,
      }));
    });
  });

  emitter.on('product.approved', (payload) => {
    safeHandle('product.approved', payload, async (eventPayload) => {
      await createNotificationService(buildNotificationPayload('product.approved', {
        ...eventPayload,
        title: eventPayload.title || 'Product approved',
        message: eventPayload.message || 'Your product has been approved.',
        type: NOTIFICATION_TYPES.PRODUCT_APPROVED,
        category: NOTIFICATION_CATEGORIES.PRODUCT,
        priority: NOTIFICATION_PRIORITIES.MEDIUM,
      }));
    });
  });

  emitter.on('product.rejected', (payload) => {
    safeHandle('product.rejected', payload, async (eventPayload) => {
      await createNotificationService(buildNotificationPayload('product.rejected', {
        ...eventPayload,
        title: eventPayload.title || 'Product rejected',
        message: eventPayload.message || 'Your product requires changes before approval.',
        type: NOTIFICATION_TYPES.PRODUCT_REJECTED,
        category: NOTIFICATION_CATEGORIES.PRODUCT,
        priority: NOTIFICATION_PRIORITIES.HIGH,
      }));
    });
  });

  emitter.on('account.alert', (payload) => {
    safeHandle('account.alert', payload, async (eventPayload) => {
      await createNotificationService(buildNotificationPayload('account.alert', {
        ...eventPayload,
        title: eventPayload.title || 'Account alert',
        message: eventPayload.message || 'Your account requires attention.',
        type: NOTIFICATION_TYPES.ACCOUNT_ALERT,
        category: NOTIFICATION_CATEGORIES.ACCOUNT,
        priority: NOTIFICATION_PRIORITIES.HIGH,
      }));
    });
  });

  emitter.on('security.alert', (payload) => {
    safeHandle('security.alert', payload, async (eventPayload) => {
      await createNotificationService(buildNotificationPayload('security.alert', {
        ...eventPayload,
        title: eventPayload.title || 'Security alert',
        message: eventPayload.message || 'A security-related event was detected.',
        type: NOTIFICATION_TYPES.SECURITY_ALERT,
        category: NOTIFICATION_CATEGORIES.SECURITY,
        priority: NOTIFICATION_PRIORITIES.URGENT,
      }));
    });
  });

  emitter.on('system.broadcast', (payload) => {
    safeHandle('system.broadcast', payload, async (eventPayload) => {
      await createNotificationService(buildNotificationPayload('system.broadcast', {
        ...eventPayload,
        title: eventPayload.title || 'System update',
        message: eventPayload.message || 'A system announcement has been published.',
        type: NOTIFICATION_TYPES.SYSTEM_BROADCAST,
        category: NOTIFICATION_CATEGORIES.SYSTEM,
        priority: NOTIFICATION_PRIORITIES.MEDIUM,
      }));
    });
  });

  logger.info('Notification listeners registered');
};

export default registerNotificationListeners;
