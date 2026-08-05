import { emitNotificationEvent, getNotificationEmitter } from './notificationEmitter.js';
import { registerNotificationListeners } from './notificationListeners.js';

registerNotificationListeners();

const notificationEventManager = {
  emit: emitNotificationEvent,
  on: (eventName, handler) => getNotificationEmitter().on(eventName, handler),
  off: (eventName, handler) => getNotificationEmitter().off(eventName, handler),
};

export default notificationEventManager;
