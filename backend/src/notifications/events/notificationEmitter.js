import { EventEmitter } from 'events';
import logger from '../../utils/logger.js';

class NotificationEventEmitter extends EventEmitter {}

const notificationEmitter = new NotificationEventEmitter();

export const emitNotificationEvent = (eventName, payload = {}) => {
  try {
    notificationEmitter.emit(eventName, payload);
    logger.info(`Notification event emitted: ${eventName}`);
    return true;
  } catch (error) {
    logger.error(`Failed to emit notification event ${eventName}: ${error.message}`);
    return false;
  }
};

export const getNotificationEmitter = () => notificationEmitter;

export default notificationEmitter;
