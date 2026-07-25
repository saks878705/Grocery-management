const Notification = require("../models/mongo/notification.model");

exports.getUserNotifications = async (userId, { page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;

    const [total, data] = await Promise.all([
        Notification.countDocuments({ userId }),
        Notification.find({ userId })
            .sort({ createdAt: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit)),
    ]);

    return {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        data,
    };
};

exports.markAsRead = async (notificationId, userId) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
    );

    if (!notification) throw new Error("Notification not found");

    return notification;
};
