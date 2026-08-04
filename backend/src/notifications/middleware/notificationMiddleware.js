export const attachNotificationContext = (req, res, next) => {
  req.notificationContext = {
    actorId: req.user?.id ?? null,
    actorRole: req.user?.role ?? 'customer',
  };
  next();
};

export default attachNotificationContext;
